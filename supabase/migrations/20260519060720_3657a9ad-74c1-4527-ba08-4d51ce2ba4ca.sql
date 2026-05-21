
-- 1. Profiles: add unique referral_code (Battle Code)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generator function
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    v_code := upper(substring(md5(random()::text || clock_timestamp()::text || gen_random_uuid()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Trigger to auto-assign on insert
CREATE OR REPLACE FUNCTION public.set_profile_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := public.generate_unique_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_profile_referral_code ON public.profiles;
CREATE TRIGGER trg_set_profile_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_profile_referral_code();

-- Backfill existing profiles
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles SET referral_code = public.generate_unique_referral_code() WHERE id = r.id;
  END LOOP;
END $$;

-- Make required going forward
ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;

-- 2. Tournaments: referral toggle + discount %
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS referral_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS referral_discount_percent integer NOT NULL DEFAULT 0;

-- 3. Registrations: track which referral was used
ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS referral_code_used text,
  ADD COLUMN IF NOT EXISTS referrer_user_id uuid;

-- 4. Public validator function (RLS-safe lookup of code -> referrer user_id)
CREATE OR REPLACE FUNCTION public.validate_referral_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.profiles
  WHERE upper(trim(referral_code)) = upper(trim(_code))
  LIMIT 1;
$$;
