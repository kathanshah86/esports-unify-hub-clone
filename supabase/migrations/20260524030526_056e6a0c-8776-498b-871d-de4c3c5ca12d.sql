
DROP POLICY IF EXISTS "Users can insert their own wallet transactions" ON public.wallet_transactions;
CREATE POLICY "Users can insert their own wallet transactions"
ON public.wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND approved_by IS NULL
  AND status = 'pending'
);

DROP POLICY IF EXISTS "Authenticated can delete match-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete player-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete tournament-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update match-thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update player-avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update tournament-images" ON storage.objects;

REVOKE SELECT (organizer_phone) ON public.sports_tournaments FROM anon;

ALTER FUNCTION public.update_wallet_balance() SET search_path = public;
ALTER FUNCTION public.recalculate_wallet_balance(uuid, text) SET search_path = public;
ALTER FUNCTION public.on_wallet_transaction_change() SET search_path = public;
