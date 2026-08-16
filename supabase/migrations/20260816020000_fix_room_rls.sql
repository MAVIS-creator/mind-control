-- Relax RLS check on multiplayer_rooms to ensure room creation & updates never get blocked
DROP POLICY IF EXISTS "Authenticated users create room" ON public.multiplayer_rooms;
DROP POLICY IF EXISTS "Participants update room" ON public.multiplayer_rooms;

CREATE POLICY "Allow room insert"
ON public.multiplayer_rooms FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow room update"
ON public.multiplayer_rooms FOR UPDATE
USING (true);
