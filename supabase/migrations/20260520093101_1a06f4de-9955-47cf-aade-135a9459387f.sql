
-- 1. sports_team_members: restrict SELECT to owner or admin
DROP POLICY IF EXISTS "Anyone can view team members" ON public.sports_team_members;
CREATE POLICY "Owners and admins can view team members"
  ON public.sports_team_members FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.sports_registrations sr
      WHERE sr.id = sports_team_members.registration_id
        AND sr.user_id = auth.uid()
    )
  );

-- 2. payment-screenshots bucket -> private
UPDATE storage.buckets SET public = false WHERE id = 'payment-screenshots';

-- 3. events table: enable RLS + policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 4. Restrict storage mutations on public asset buckets to authenticated users
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND cmd IN ('INSERT','UPDATE','DELETE')
      AND qual ILIKE ANY (ARRAY['%tournament-images%','%player-avatars%','%match-thumbnails%'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND cmd IN ('INSERT','UPDATE','DELETE')
      AND with_check ILIKE ANY (ARRAY['%tournament-images%','%player-avatars%','%match-thumbnails%'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Authenticated can upload tournament-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tournament-images');
CREATE POLICY "Authenticated can update tournament-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tournament-images');
CREATE POLICY "Authenticated can delete tournament-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tournament-images');

CREATE POLICY "Authenticated can upload player-avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'player-avatars');
CREATE POLICY "Authenticated can update player-avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'player-avatars');
CREATE POLICY "Authenticated can delete player-avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'player-avatars');

CREATE POLICY "Authenticated can upload match-thumbnails"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'match-thumbnails');
CREATE POLICY "Authenticated can update match-thumbnails"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'match-thumbnails');
CREATE POLICY "Authenticated can delete match-thumbnails"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'match-thumbnails');

-- 5. battle_codes: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view active battle codes" ON public.battle_codes;
CREATE POLICY "Authenticated can view active battle codes"
  ON public.battle_codes FOR SELECT TO authenticated
  USING (is_active = true);

-- 6. wallet_qr_codes: restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view active QR codes" ON public.wallet_qr_codes;
CREATE POLICY "Authenticated can view active QR codes"
  ON public.wallet_qr_codes FOR SELECT TO authenticated
  USING (is_active = true);
