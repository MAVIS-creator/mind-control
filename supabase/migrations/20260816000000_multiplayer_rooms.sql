-- Create Enum types for Multiplayer
DO $$ BEGIN
    CREATE TYPE multiplayer_game_mode AS ENUM ('turn_based', 'speed_sprint', 'coop');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE room_status AS ENUM ('waiting', 'playing', 'finished');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create multiplayer_rooms table
CREATE TABLE IF NOT EXISTS public.multiplayer_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    game_mode multiplayer_game_mode NOT NULL DEFAULT 'turn_based',
    grid_size VARCHAR(10) NOT NULL DEFAULT '4x4',
    theme VARCHAR(20) NOT NULL DEFAULT 'icons',
    seed INT NOT NULL DEFAULT floor(random() * 1000000)::int,
    status room_status NOT NULL DEFAULT 'waiting',
    current_turn_id UUID,
    host_ready BOOLEAN NOT NULL DEFAULT false,
    guest_ready BOOLEAN NOT NULL DEFAULT false,
    scores JSONB NOT NULL DEFAULT '{"host": 0, "guest": 0}'::jsonb,
    winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.multiplayer_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read open rooms"
ON public.multiplayer_rooms FOR SELECT
USING (true);

CREATE POLICY "Authenticated users create room"
ON public.multiplayer_rooms FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Participants update room"
ON public.multiplayer_rooms FOR UPDATE
USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Host delete room"
ON public.multiplayer_rooms FOR DELETE
USING (auth.uid() = host_id);

-- Helper function to generate room code
CREATE OR REPLACE FUNCTION generate_multiplayer_room_code()
RETURNS TRIGGER AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    new_code TEXT := '';
    i INT;
BEGIN
    IF NEW.room_code IS NULL OR NEW.room_code = '' THEN
        LOOP
            new_code := '';
            FOR i IN 1..6 LOOP
                new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
            END LOOP;
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.multiplayer_rooms WHERE room_code = new_code);
        END LOOP;
        NEW.room_code := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_multiplayer_room_code ON public.multiplayer_rooms;
CREATE TRIGGER ensure_multiplayer_room_code
BEFORE INSERT ON public.multiplayer_rooms
FOR EACH ROW EXECUTE FUNCTION generate_multiplayer_room_code();

-- Enable Supabase Realtime for multiplayer_rooms database changes
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.multiplayer_rooms;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;

