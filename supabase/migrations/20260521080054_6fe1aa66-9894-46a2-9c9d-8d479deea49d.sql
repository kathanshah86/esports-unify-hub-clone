
-- Attach trigger for referral reward on tournament registration approval
DROP TRIGGER IF EXISTS trg_reward_battle_code_referrer ON public.tournament_registrations;
CREATE TRIGGER trg_reward_battle_code_referrer
AFTER UPDATE ON public.tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION public.reward_battle_code_referrer_on_approval();

-- Also trigger on INSERT (e.g. wallet payment auto-completes with payment_status='completed')
CREATE OR REPLACE FUNCTION public.reward_battle_code_referrer_on_insert()
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
  IF NEW.payment_status IN ('approved', 'completed') THEN
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

DROP TRIGGER IF EXISTS trg_reward_battle_code_referrer_insert ON public.tournament_registrations;
CREATE TRIGGER trg_reward_battle_code_referrer_insert
AFTER INSERT ON public.tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION public.reward_battle_code_referrer_on_insert();

-- Backfill: reward any existing approved/completed registrations whose referrer was never paid
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tr.user_id, p.battle_code_referrer_user_id
    FROM public.tournament_registrations tr
    JOIN public.profiles p ON p.user_id = tr.user_id
    WHERE tr.payment_status IN ('approved','completed')
      AND p.battle_code_referrer_user_id IS NOT NULL
      AND p.battle_code_referrer_rewarded = false
      AND p.battle_code_referrer_user_id <> tr.user_id
  LOOP
    INSERT INTO public.wallet_transactions(
      user_id, transaction_type, amount, status, payment_method,
      transaction_reference, mode, approved_at
    ) VALUES (
      r.battle_code_referrer_user_id, 'battle_code', 10, 'approved', 'Refer & Earn',
      'Refer & Earn: friend registered for tournament (backfill)', 'esports', now()
    );
    UPDATE public.profiles SET battle_code_referrer_rewarded = true WHERE user_id = r.user_id;
  END LOOP;
END $$;
