-- 1) Add referral tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS battle_code_referrer_user_id uuid,
  ADD COLUMN IF NOT EXISTS battle_code_referrer_rewarded boolean NOT NULL DEFAULT false;

-- 2) Update redeem_battle_code: do NOT pay creator on redemption; just record referrer
CREATE OR REPLACE FUNCTION public.redeem_battle_code(_code text, _mode text DEFAULT 'esports'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_code public.battle_codes%ROWTYPE;
  v_recent integer;
  v_existing uuid;
  v_existing_referrer uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  SELECT COUNT(*) INTO v_recent
  FROM public.battle_code_attempts
  WHERE user_id = v_user AND mode = _mode
    AND attempted_at >= now() - interval '1 hour';
  IF v_recent >= 5 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Too many attempts. Please try again later.');
  END IF;

  SELECT * INTO v_code FROM public.battle_codes
  WHERE upper(trim(code)) = upper(trim(_code))
    AND is_active = true
    AND mode = _mode
  LIMIT 1;

  INSERT INTO public.battle_code_attempts(user_id, code_attempted, mode, success)
  VALUES (v_user, upper(trim(_code)), _mode, v_code.id IS NOT NULL);

  IF v_code.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired code for this mode');
  END IF;

  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'message', 'This code has expired');
  END IF;

  IF v_code.current_uses >= v_code.max_uses THEN
    RETURN jsonb_build_object('success', false, 'message', 'This code has reached its usage limit');
  END IF;

  SELECT id INTO v_existing FROM public.battle_code_redemptions
  WHERE code_id = v_code.id AND user_id = v_user LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'You have already redeemed this code');
  END IF;

  INSERT INTO public.battle_code_redemptions(code_id, user_id, amount, mode)
  VALUES (v_code.id, v_user, v_code.bonus_amount, _mode);

  UPDATE public.battle_codes
  SET current_uses = current_uses + 1, updated_at = now()
  WHERE id = v_code.id;

  -- Credit redeemer
  INSERT INTO public.wallet_transactions(
    user_id, transaction_type, amount, status, payment_method,
    transaction_reference, mode, approved_at
  ) VALUES (
    v_user, 'battle_code', v_code.bonus_amount, 'approved', 'Battle Code',
    'Battle Code: ' || v_code.code, _mode, now()
  );

  -- Record referrer on redeemer's profile (only if not self and not already set)
  IF v_code.created_by_user_id IS NOT NULL AND v_code.created_by_user_id <> v_user THEN
    SELECT battle_code_referrer_user_id INTO v_existing_referrer
      FROM public.profiles WHERE user_id = v_user;
    IF v_existing_referrer IS NULL THEN
      UPDATE public.profiles
        SET battle_code_referrer_user_id = v_code.created_by_user_id,
            battle_code_referrer_rewarded = false
        WHERE user_id = v_user;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'amount', v_code.bonus_amount,
    'message', 'Successfully redeemed! ₹' || v_code.bonus_amount || ' added to your wallet.'
  );
END;
$function$;

-- 3) Trigger function: pay referrer ₹10 when this user's tournament registration is approved
CREATE OR REPLACE FUNCTION public.reward_battle_code_referrer_on_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_referrer uuid;
  v_rewarded boolean;
  v_reward numeric := 10;
BEGIN
  -- Only act when payment_status transitions into approved/completed
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     AND NEW.payment_status IN ('approved', 'completed') THEN

    SELECT battle_code_referrer_user_id, battle_code_referrer_rewarded
      INTO v_referrer, v_rewarded
      FROM public.profiles WHERE user_id = NEW.user_id;

    IF v_referrer IS NOT NULL AND v_referrer <> NEW.user_id AND v_rewarded = false THEN
      INSERT INTO public.wallet_transactions(
        user_id, transaction_type, amount, status, payment_method,
        transaction_reference, mode, approved_at
      ) VALUES (
        v_referrer, 'battle_code', v_reward, 'approved', 'Refer & Earn',
        'Refer & Earn: friend registered for tournament', 'esports', now()
      );

      UPDATE public.profiles
        SET battle_code_referrer_rewarded = true
        WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_reward_battle_code_referrer ON public.tournament_registrations;
CREATE TRIGGER trg_reward_battle_code_referrer
AFTER UPDATE ON public.tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION public.reward_battle_code_referrer_on_approval();