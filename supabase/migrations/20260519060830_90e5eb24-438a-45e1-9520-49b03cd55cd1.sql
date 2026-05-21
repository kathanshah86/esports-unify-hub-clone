
ALTER TABLE public.profiles
  ALTER COLUMN referral_code SET DEFAULT public.generate_unique_referral_code();
