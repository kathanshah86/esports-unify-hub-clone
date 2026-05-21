
-- 1. wallet_transactions: force user-inserted rows to status='pending'
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "Users can create their own wallet transactions" ON public.wallet_transactions;

CREATE POLICY "Users can insert their own pending transactions"
ON public.wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND approved_at IS NULL
  AND approved_by IS NULL
);

CREATE POLICY "Admins can insert any wallet transaction"
ON public.wallet_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 2. battle_codes: prevent enumeration; allow lookup by exact code only via RPC
DROP POLICY IF EXISTS "Authenticated can view active battle codes" ON public.battle_codes;

CREATE OR REPLACE FUNCTION public.lookup_battle_code(_code text)
RETURNS TABLE (
  id uuid,
  code text,
  bonus_amount numeric,
  mode text,
  is_active boolean,
  max_uses integer,
  current_uses integer,
  expires_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, code, bonus_amount, mode, is_active, max_uses, current_uses, expires_at
  FROM public.battle_codes
  WHERE upper(trim(code)) = upper(trim(_code))
    AND is_active = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.lookup_battle_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.lookup_battle_code(text) TO authenticated;

-- 3. Storage bucket ownership for shared public buckets
DO $$
DECLARE
  b text;
BEGIN
  FOREACH b IN ARRAY ARRAY['tournament-images','player-avatars','match-thumbnails']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can upload to %1$s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update %1$s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can delete from %1$s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Owners can update %1$s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Owners can delete %1$s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Owners can upload to %1$s" ON storage.objects', b);

    EXECUTE format($p$CREATE POLICY "Owners can upload to %1$s"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = %1$L AND auth.uid()::text = (storage.foldername(name))[1])$p$, b);

    EXECUTE format($p$CREATE POLICY "Owners can update %1$s"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = %1$L AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)))
      WITH CHECK (bucket_id = %1$L AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)))$p$, b);

    EXECUTE format($p$CREATE POLICY "Owners can delete %1$s"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = %1$L AND (auth.uid()::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)))$p$, b);
  END LOOP;
END $$;

-- 4. Realtime channel subscription policies
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- tournament_rooms: only participants/admins can subscribe to its topic
DROP POLICY IF EXISTS "tournament_rooms participants can subscribe" ON realtime.messages;
CREATE POLICY "tournament_rooms participants can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() LIKE 'tournament_rooms:%' AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.tournament_registrations tr
      WHERE tr.tournament_id::text = split_part(realtime.topic(), ':', 2)
        AND tr.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.tournament_team_members tm
      JOIN public.tournament_teams tt ON tt.id = tm.team_id
      WHERE tt.tournament_id::text = split_part(realtime.topic(), ':', 2)
        AND tm.user_id = auth.uid()
    )
  ))
);

-- support: only conversation owner / admin can subscribe
DROP POLICY IF EXISTS "support conversation owners can subscribe" ON realtime.messages;
CREATE POLICY "support conversation owners can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() LIKE 'support_conversations:%' OR realtime.topic() LIKE 'support_messages:%')
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.support_conversations sc
      WHERE sc.id::text = split_part(realtime.topic(), ':', 2)
        AND sc.user_id = auth.uid()
    )
  )
);

-- Default deny everything else by allowing only owner/admin patterns above
-- (Other topics now require a matching policy; add a generic authenticated-allow
-- for non-sensitive topics so existing features keep working.)
DROP POLICY IF EXISTS "authenticated can subscribe to non-sensitive topics" ON realtime.messages;
CREATE POLICY "authenticated can subscribe to non-sensitive topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() NOT LIKE 'tournament_rooms:%'
  AND realtime.topic() NOT LIKE 'support_conversations:%'
  AND realtime.topic() NOT LIKE 'support_messages:%'
);
