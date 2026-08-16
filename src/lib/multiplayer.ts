import type { GameTheme, GridSize, MultiplayerGameMode, MultiplayerRoom, PlayerProfile } from "../types";
import { supabase } from "./supabase";

// In-memory fallback store for offline/local development without live Supabase env
const localRoomsMemory = new Map<string, MultiplayerRoom>();

const generateCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const fetchProfilesForIds = async (userIds: string[]): Promise<Record<string, PlayerProfile>> => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (!uniqueIds.length || !supabase) return {};

  const { data, error } = await supabase.from("profiles").select("*").in("id", uniqueIds);
  if (error || !data) return {};

  const map: Record<string, PlayerProfile> = {};
  data.forEach((p) => {
    map[p.id] = {
      id: p.id,
      username: p.username || "Agent",
      email: p.email || "",
      avatarId: p.avatar_id || "cyber_grid",
      xp: p.xp || 0,
      rank: p.rank || "Neural Rookie",
      createdAt: p.created_at || new Date().toISOString(),
      isAdmin: Boolean(p.is_admin),
    };
  });
  return map;
};

const mapRowToRoomWithProfiles = (row: any, profilesMap: Record<string, PlayerProfile>): MultiplayerRoom => ({
  id: row.id,
  roomCode: row.room_code,
  hostId: row.host_id,
  guestId: row.guest_id,
  gameMode: row.game_mode,
  gridSize: row.grid_size,
  theme: row.theme,
  seed: row.seed,
  status: row.status,
  currentTurnId: row.current_turn_id,
  hostReady: row.host_ready,
  guestReady: row.guest_ready,
  scores: typeof row.scores === "string" ? JSON.parse(row.scores) : row.scores || { host: 0, guest: 0 },
  winnerId: row.winner_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  hostProfile: profilesMap[row.host_id] || (row.host_profile ? mapProfile(row.host_profile) : undefined),
  guestProfile: row.guest_id ? profilesMap[row.guest_id] || (row.guest_profile ? mapProfile(row.guest_profile) : undefined) : undefined,
});

const mapProfile = (row: any): PlayerProfile => ({
  id: row.id,
  username: row.username || "Agent",
  email: row.email || "",
  avatarId: row.avatar_id || "cyber_grid",
  xp: row.xp || 0,
  rank: row.rank || "Neural Rookie",
  createdAt: row.created_at || new Date().toISOString(),
  isAdmin: Boolean(row.is_admin),
});

export const createMultiplayerRoom = async (
  hostProfile: PlayerProfile,
  options: {
    gameMode: MultiplayerGameMode;
    gridSize: GridSize;
    theme: GameTheme;
  },
): Promise<MultiplayerRoom> => {
  const seed = Math.floor(Math.random() * 1000000);
  const roomCode = generateCode();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .insert({
          room_code: roomCode,
          host_id: hostProfile.id,
          game_mode: options.gameMode,
          grid_size: options.gridSize,
          theme: options.theme,
          seed,
          status: "waiting",
          host_ready: false,
          guest_ready: false,
          scores: { host: 0, guest: 0 },
        })
        .select("*")
        .maybeSingle();

      if (!error && data) {
        return mapRowToRoomWithProfiles(data, { [hostProfile.id]: hostProfile });
      }
    } catch (err) {
      console.warn("Supabase create room error, using fallback:", err);
    }
  }

  // Fallback to local memory room
  const localRoom: MultiplayerRoom = {
    id: `local-room-${Date.now()}`,
    roomCode,
    hostId: hostProfile.id,
    guestId: null,
    gameMode: options.gameMode,
    gridSize: options.gridSize,
    theme: options.theme,
    seed,
    status: "waiting",
    currentTurnId: hostProfile.id,
    hostReady: false,
    guestReady: false,
    scores: { host: 0, guest: 0 },
    winnerId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hostProfile,
  };

  localRoomsMemory.set(localRoom.id, localRoom);
  localRoomsMemory.set(localRoom.roomCode, localRoom);
  return localRoom;
};

export const fetchRoomDetails = async (roomIdOrCode: string): Promise<MultiplayerRoom | null> => {
  if (supabase) {
    try {
      const isUuid = roomIdOrCode.includes("-") && roomIdOrCode.length > 10;
      const query = supabase.from("multiplayer_rooms").select("*");

      const { data, error } = isUuid
        ? await query.eq("id", roomIdOrCode).maybeSingle()
        : await query.eq("room_code", roomIdOrCode.toUpperCase()).maybeSingle();

      if (!error && data) {
        const userIds = [data.host_id, data.guest_id].filter(Boolean);
        const profilesMap = await fetchProfilesForIds(userIds);
        return mapRowToRoomWithProfiles(data, profilesMap);
      }
    } catch (err) {
      console.warn("Supabase fetch room error, fallback:", err);
    }
  }

  return localRoomsMemory.get(roomIdOrCode) || localRoomsMemory.get(roomIdOrCode.toUpperCase()) || null;
};

export const joinMultiplayerRoom = async (
  roomCode: string,
  guestProfile: PlayerProfile,
): Promise<MultiplayerRoom> => {
  const code = roomCode.trim().toUpperCase();

  if (supabase) {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from("multiplayer_rooms")
        .select("*")
        .eq("room_code", code)
        .maybeSingle();

      if (fetchErr || !existing) {
        throw new Error("Room not found. Check your 6-digit code.");
      }

      if (existing.host_id === guestProfile.id) {
        // Host rejoining their own room
        const roomDetails = await fetchRoomDetails(existing.id);
        if (roomDetails) return roomDetails;
      }

      if (existing.guest_id && existing.guest_id !== guestProfile.id) {
        throw new Error("Room is already full.");
      }

      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .update({
          guest_id: guestProfile.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select("*")
        .maybeSingle();

      if (error || !data) {
        throw new Error(error?.message || "Failed to join room.");
      }

      const userIds = [data.host_id, data.guest_id].filter(Boolean);
      const profilesMap = await fetchProfilesForIds(userIds);
      profilesMap[guestProfile.id] = guestProfile;
      return mapRowToRoomWithProfiles(data, profilesMap);
    } catch (err: any) {
      if (err.message && err.message.includes("Room")) {
        throw err;
      }
      console.warn("Supabase join room error, fallback to local:", err);
    }
  }

  const room = localRoomsMemory.get(code);
  if (!room) {
    throw new Error("Room not found. Check your 6-digit code.");
  }

  if (room.hostId === guestProfile.id) return room;

  const updated: MultiplayerRoom = {
    ...room,
    guestId: guestProfile.id,
    guestProfile,
    updatedAt: new Date().toISOString(),
  };

  localRoomsMemory.set(room.id, updated);
  localRoomsMemory.set(code, updated);
  return updated;
};

export const fetchOpenPublicRooms = async (): Promise<MultiplayerRoom[]> => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .select("*")
        .eq("status", "waiting")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        const hostIds = data.map((r) => r.host_id).filter(Boolean);
        const profilesMap = await fetchProfilesForIds(hostIds);
        return data.map((row) => mapRowToRoomWithProfiles(row, profilesMap));
      }
    } catch (err) {
      console.warn("Supabase fetch public rooms error:", err);
    }
  }

  return Array.from(localRoomsMemory.values()).filter((r) => r.status === "waiting");
};

export const updateRoomConfig = async (
  roomId: string,
  updates: Partial<{
    gameMode: MultiplayerGameMode;
    gridSize: GridSize;
    theme: GameTheme;
    hostReady: boolean;
    guestReady: boolean;
    status: MultiplayerRoom["status"];
    currentTurnId: string | null;
  }>,
): Promise<void> => {
  const dbUpdates: any = {};
  if (updates.gameMode) dbUpdates.game_mode = updates.gameMode;
  if (updates.gridSize) dbUpdates.grid_size = updates.gridSize;
  if (updates.theme) dbUpdates.theme = updates.theme;
  if (updates.hostReady !== undefined) dbUpdates.host_ready = updates.hostReady;
  if (updates.guestReady !== undefined) dbUpdates.guest_ready = updates.guestReady;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.currentTurnId !== undefined) dbUpdates.current_turn_id = updates.currentTurnId;
  dbUpdates.updated_at = new Date().toISOString();

  if (supabase) {
    try {
      await supabase.from("multiplayer_rooms").update(dbUpdates).eq("id", roomId);
    } catch (err) {
      console.warn("Supabase update room error:", err);
    }
  }

  const local = localRoomsMemory.get(roomId);
  if (local) {
    const updated = { ...local, ...updates, updatedAt: new Date().toISOString() };
    localRoomsMemory.set(roomId, updated);
    localRoomsMemory.set(updated.roomCode, updated);
  }
};

export const leaveMultiplayerRoom = async (roomId: string, userId: string): Promise<void> => {
  if (supabase) {
    try {
      const { data: room } = await supabase.from("multiplayer_rooms").select("*").eq("id", roomId).maybeSingle();
      if (room) {
        if (room.host_id === userId) {
          await supabase.from("multiplayer_rooms").delete().eq("id", roomId);
        } else if (room.guest_id === userId) {
          await supabase
            .from("multiplayer_rooms")
            .update({ guest_id: null, guest_ready: false, status: "waiting" })
            .eq("id", roomId);
        }
      }
    } catch (err) {
      console.warn("Supabase leave room error:", err);
    }
  }

  const local = localRoomsMemory.get(roomId);
  if (local) {
    if (local.hostId === userId) {
      localRoomsMemory.delete(roomId);
      localRoomsMemory.delete(local.roomCode);
    } else {
      local.guestId = null;
      local.guestProfile = undefined;
      local.guestReady = false;
      local.status = "waiting";
    }
  }
};
