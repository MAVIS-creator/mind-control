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
      const { data: authData } = await supabase.auth.getUser();
      const hostUserId = authData?.user?.id || hostProfile.id;

      // Upsert profile first so foreign key constraint never fails
      await supabase.from("profiles").upsert(
        {
          id: hostUserId,
          username: hostProfile.username || "Agent",
          email: hostProfile.email || "",
          avatar_id: hostProfile.avatarId || "cyber_grid",
          xp: hostProfile.xp || 0,
          rank: hostProfile.rank || "Neural Rookie",
        },
        { onConflict: "id" },
      );

      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .insert({
          room_code: roomCode,
          host_id: hostUserId,
          game_mode: options.gameMode,
          grid_size: options.gridSize,
          theme: options.theme,
          seed,
          status: "waiting",
          host_ready: true,
          guest_ready: false,
          scores: { host: 0, guest: 0 },
        })
        .select("*")
        .maybeSingle();

      if (error) {
        console.error("Supabase create room DB error:", error.message);
      } else if (data) {
        return mapRowToRoomWithProfiles(data, { [hostUserId]: { ...hostProfile, id: hostUserId } });
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
    hostReady: true,
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

export const isRoomExpired = (room: { createdAt: string; status: string }): boolean => {
  if (room.status !== "waiting") return false;
  const createdTime = new Date(room.createdAt).getTime();
  if (isNaN(createdTime)) return false;
  return Date.now() - createdTime > 10 * 60 * 1000;
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
        const createdTime = new Date(data.created_at).getTime();
        // Check 10-minute inactivity timeout
        if (data.status === "waiting" && Date.now() - createdTime > 10 * 60 * 1000) {
          await supabase.from("multiplayer_rooms").delete().eq("id", data.id);
          return null;
        }

        const userIds = [data.host_id, data.guest_id].filter(Boolean);
        const profilesMap = await fetchProfilesForIds(userIds);
        return mapRowToRoomWithProfiles(data, profilesMap);
      }
    } catch (err) {
      console.warn("Supabase fetch room error, fallback:", err);
    }
  }

  const local = localRoomsMemory.get(roomIdOrCode) || localRoomsMemory.get(roomIdOrCode.toUpperCase());
  if (local && isRoomExpired(local)) {
    localRoomsMemory.delete(local.id);
    localRoomsMemory.delete(local.roomCode);
    return null;
  }
  return local || null;
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

      // Check 10-minute timeout
      const createdTime = new Date(existing.created_at).getTime();
      if (existing.status === "waiting" && Date.now() - createdTime > 10 * 60 * 1000) {
        await supabase.from("multiplayer_rooms").delete().eq("id", existing.id);
        throw new Error("This 6-digit room code has expired after 10 minutes of inactivity.");
      }

      if (existing.host_id === guestProfile.id) {
        // Host rejoining their own room
        const roomDetails = await fetchRoomDetails(existing.id);
        if (roomDetails) return roomDetails;
      }

      if (existing.guest_id && existing.guest_id !== guestProfile.id) {
        throw new Error("Room is already full.");
      }

      const { data: authData } = await supabase.auth.getUser();
      const guestUserId = authData?.user?.id || guestProfile.id;

      await supabase.from("profiles").upsert(
        {
          id: guestUserId,
          username: guestProfile.username || "Agent",
          email: guestProfile.email || "",
          avatar_id: guestProfile.avatarId || "cyber_grid",
          xp: guestProfile.xp || 0,
          rank: guestProfile.rank || "Neural Rookie",
        },
        { onConflict: "id" },
      );

      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .update({
          guest_id: guestUserId,
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
      if (err.message && (err.message.includes("Room") || err.message.includes("expired"))) {
        throw err;
      }
      console.warn("Supabase join room error, fallback to local:", err);
    }
  }

  const room = localRoomsMemory.get(code);
  if (!room) {
    throw new Error("Room not found. Check your 6-digit code.");
  }

  if (isRoomExpired(room)) {
    localRoomsMemory.delete(room.id);
    localRoomsMemory.delete(code);
    throw new Error("This 6-digit room code has expired after 10 minutes of inactivity.");
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
        .limit(20);

      if (!error && data) {
        const now = Date.now();
        const validRows = data.filter((row) => {
          const createdTime = new Date(row.created_at).getTime();
          return now - createdTime <= 10 * 60 * 1000;
        });

        const hostIds = validRows.map((r) => r.host_id).filter(Boolean);
        const profilesMap = await fetchProfilesForIds(hostIds);
        return validRows.map((row) => mapRowToRoomWithProfiles(row, profilesMap));
      }
    } catch (err) {
      console.warn("Supabase fetch public rooms error:", err);
    }
  }

  return Array.from(localRoomsMemory.values()).filter((r) => !isRoomExpired(r));
};

const MP_STORAGE_KEY = "mindgrid.multiplayer_rooms";

export const loadStoredFinishedRooms = (): any[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveFinishedRoomToStorage = (roomData: any) => {
  if (typeof window === "undefined") return;
  try {
    const existing = loadStoredFinishedRooms();
    const filtered = existing.filter((r) => r.id !== roomData.id);
    filtered.push(roomData);
    window.localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(filtered.slice(-100)));
  } catch {
    // ignore
  }
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
    winner_id: string | null;
    scores: any;
    seed?: number;
    createdAt?: string;
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
  if (updates.winner_id !== undefined) dbUpdates.winner_id = updates.winner_id;
  if (updates.scores) dbUpdates.scores = updates.scores;
  if (updates.seed !== undefined) dbUpdates.seed = updates.seed;
  if (updates.createdAt) dbUpdates.created_at = updates.createdAt;
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

    if (updated.status === "finished" && updated.hostId && updated.guestId && updated.hostId !== updated.guestId) {
      saveFinishedRoomToStorage({
        id: updated.id,
        room_code: updated.roomCode,
        host_id: updated.hostId,
        guest_id: updated.guestId,
        game_mode: updated.gameMode,
        grid_size: updated.gridSize,
        theme: updated.theme,
        status: updated.status,
        winner_id: updated.winnerId,
        scores: updated.scores,
        created_at: updated.createdAt,
        updated_at: updated.updatedAt,
      });
    }
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

export type MultiplayerModeStats = {
  wins: number;
  losses: number;
  total: number;
  points: number;
  winRate: number;
};

export type MultiplayerLeaderboardEntry = {
  userId: string;
  username: string;
  avatarId: string;
  rank: string;
  xp: number;
  isAdmin?: boolean;
  isBetaTester?: boolean;
  multiplayerWins: number;
  multiplayerLosses: number;
  totalBattles: number;
  winRate: number;
  coopClears: number;
  totalPoints: number;
  turnBasedPoints: number;
  speedSprintPoints: number;
  coopPoints: number;
  modeStats: Record<MultiplayerGameMode, MultiplayerModeStats>;
};

const parseAdminUsernames = () =>
  ((import.meta.env.VITE_ADMIN_USERNAMES as string | undefined) ?? "akint,admin,creator")
    .split(",")
    .map((name: string) => name.trim().toLowerCase())
    .filter(Boolean);

const isUserAdmin = (username?: string, isAdminFlag?: boolean) => {
  if (isAdminFlag) return true;
  if (!username) return false;
  return parseAdminUsernames().includes(username.toLowerCase());
};

export const fetchMultiplayerLeaderboard = async (): Promise<MultiplayerLeaderboardEntry[]> => {
  try {
    let profiles: any[] = [];
    let mpRooms: any[] = [];

    if (supabase) {
      const [{ data: pData }, { data: rData }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("multiplayer_rooms").select("*").eq("status", "finished"),
      ]);
      if (pData) profiles = pData;
      if (rData) mpRooms = rData;
    }

    if (!profiles.length && typeof window !== "undefined") {
      try {
        const rawUsers = window.localStorage.getItem("mindgrid.users");
        if (rawUsers) {
          const parsed = JSON.parse(rawUsers);
          profiles = parsed.map((u: any) => ({
            id: u.profile.id,
            username: u.profile.username,
            avatar_id: u.profile.avatarId,
            rank: u.profile.rank,
            xp: u.profile.xp,
          }));
        }
      } catch {
        // ignore
      }
    }

    const localRooms = loadStoredFinishedRooms();
    const allRoomsMap = new Map<string, any>();
    mpRooms.forEach((r) => allRoomsMap.set(r.id, r));
    localRooms.forEach((r) => {
      if (!allRoomsMap.has(r.id)) allRoomsMap.set(r.id, r);
    });

    const validRooms = Array.from(allRoomsMap.values()).filter(
      (r) => r.status === "finished" && r.host_id && r.guest_id && r.host_id !== r.guest_id,
    );

    const initialModeStats = (): MultiplayerModeStats => ({
      wins: 0,
      losses: 0,
      total: 0,
      points: 0,
      winRate: 0,
    });

    const statsMap: Record<
      string,
      {
        turn_based: MultiplayerModeStats;
        speed_sprint: MultiplayerModeStats;
        coop: MultiplayerModeStats;
        coopClears: number;
      }
    > = {};

    profiles.forEach((p) => {
      statsMap[p.id] = {
        turn_based: initialModeStats(),
        speed_sprint: initialModeStats(),
        coop: initialModeStats(),
        coopClears: 0,
      };
    });

    validRooms.forEach((r) => {
      const hostId = r.host_id;
      const guestId = r.guest_id;
      const mode = (r.game_mode || "turn_based") as MultiplayerGameMode;
      const winnerId = r.winner_id;
      const rawScores = typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores || {};

      if (!statsMap[hostId]) {
        statsMap[hostId] = {
          turn_based: initialModeStats(),
          speed_sprint: initialModeStats(),
          coop: initialModeStats(),
          coopClears: 0,
        };
      }
      if (!statsMap[guestId]) {
        statsMap[guestId] = {
          turn_based: initialModeStats(),
          speed_sprint: initialModeStats(),
          coop: initialModeStats(),
          coopClears: 0,
        };
      }

      const hostScore = Number(rawScores[hostId] ?? rawScores.host ?? 600) || 600;
      const guestScore = Number(rawScores[guestId] ?? rawScores.guest ?? 600) || 600;

      if (mode === "coop") {
        statsMap[hostId].coop.total += 1;
        statsMap[hostId].coop.wins += 1;
        statsMap[hostId].coop.points += Math.max(0, hostScore) + 350;
        statsMap[hostId].coopClears += 1;

        statsMap[guestId].coop.total += 1;
        statsMap[guestId].coop.wins += 1;
        statsMap[guestId].coop.points += Math.max(0, guestScore) + 350;
        statsMap[guestId].coopClears += 1;
      } else {
        const victoryBonus = mode === "speed_sprint" ? 300 : 250;
        const targetMode = mode === "speed_sprint" ? "speed_sprint" : "turn_based";

        statsMap[hostId][targetMode].total += 1;
        statsMap[guestId][targetMode].total += 1;

        if (winnerId === hostId) {
          statsMap[hostId][targetMode].wins += 1;
          statsMap[hostId][targetMode].points += Math.max(0, hostScore) + victoryBonus;

          statsMap[guestId][targetMode].losses += 1;
          statsMap[guestId][targetMode].points += Math.max(0, guestScore);
        } else if (winnerId === guestId) {
          statsMap[guestId][targetMode].wins += 1;
          statsMap[guestId][targetMode].points += Math.max(0, guestScore) + victoryBonus;

          statsMap[hostId][targetMode].losses += 1;
          statsMap[hostId][targetMode].points += Math.max(0, hostScore);
        } else {
          statsMap[hostId][targetMode].points += Math.max(0, hostScore);
          statsMap[guestId][targetMode].points += Math.max(0, guestScore);
        }
      }
    });

    const entries: MultiplayerLeaderboardEntry[] = profiles.map((p) => {
      const st = statsMap[p.id] || {
        turn_based: initialModeStats(),
        speed_sprint: initialModeStats(),
        coop: initialModeStats(),
        coopClears: 0,
      };

      const tbWinRate = st.turn_based.total > 0 ? (st.turn_based.wins / st.turn_based.total) * 100 : 0;
      const spWinRate = st.speed_sprint.total > 0 ? (st.speed_sprint.wins / st.speed_sprint.total) * 100 : 0;
      const coopWinRate = st.coop.total > 0 ? 100 : 0;

      const modeStats: Record<MultiplayerGameMode, MultiplayerModeStats> = {
        turn_based: { ...st.turn_based, winRate: tbWinRate },
        speed_sprint: { ...st.speed_sprint, winRate: spWinRate },
        coop: { ...st.coop, winRate: coopWinRate },
      };

      const turnBasedPoints = st.turn_based.points;
      const speedSprintPoints = st.speed_sprint.points;
      const coopPoints = st.coop.points;
      const totalPoints = turnBasedPoints + speedSprintPoints + coopPoints;

      const multiplayerWins = st.turn_based.wins + st.speed_sprint.wins;
      const multiplayerLosses = st.turn_based.losses + st.speed_sprint.losses;
      const compTotal = st.turn_based.total + st.speed_sprint.total;
      const totalBattles = compTotal + st.coop.total;
      const winRate = compTotal > 0 ? (multiplayerWins / compTotal) * 100 : 0;

      const isAdmin = isUserAdmin(p.username, p.is_admin || p.isAdmin);
      const isBetaTester =
        Boolean(p.is_beta_tester || p.isBetaTester) ||
        (new Date(p.created_at || p.createdAt || Date.now()).getTime() <= new Date("2026-08-16T04:30:00.000Z").getTime());

      return {
        userId: p.id,
        username: p.username || "Agent",
        avatarId: p.avatar_id || p.avatarId || "cyber_grid",
        rank: p.rank || "Neural Rookie",
        xp: p.xp || 0,
        isAdmin,
        isBetaTester,
        multiplayerWins,
        multiplayerLosses,
        totalBattles,
        winRate,
        coopClears: st.coopClears,
        totalPoints,
        turnBasedPoints,
        speedSprintPoints,
        coopPoints,
        modeStats,
      };
    });

    return entries.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.multiplayerWins !== a.multiplayerWins) return b.multiplayerWins - a.multiplayerWins;
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.xp - a.xp;
    });
  } catch (err) {
    console.warn("Error fetching multiplayer leaderboard:", err);
    return [];
  }
};

export const cleanupCorruptMultiplayerRooms = async (): Promise<{ removed: number; sanitized: number }> => {
  let removed = 0;
  let sanitized = 0;

  if (supabase) {
    try {
      const { data: allRooms } = await supabase.from("multiplayer_rooms").select("*");
      if (allRooms) {
        for (const r of allRooms) {
          const isOrphan = !r.host_id || !r.guest_id || r.host_id === r.guest_id;
          const isCorruptWinner = r.winner_id && r.winner_id !== r.host_id && r.winner_id !== r.guest_id;

          if (isOrphan) {
            await supabase.from("multiplayer_rooms").delete().eq("id", r.id);
            removed += 1;
          } else if (isCorruptWinner) {
            await supabase.from("multiplayer_rooms").update({ winner_id: null }).eq("id", r.id);
            sanitized += 1;
          }
        }
      }
    } catch (err) {
      console.warn("Supabase cleanup error:", err);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const localRooms = loadStoredFinishedRooms();
      const valid = localRooms.filter((r) => {
        const isOrphan = !r.host_id || !r.guest_id || r.host_id === r.guest_id;
        const isCorruptWinner = r.winner_id && r.winner_id !== r.host_id && r.winner_id !== r.guest_id;
        if (isOrphan) {
          removed += 1;
          return false;
        }
        if (isCorruptWinner) {
          r.winner_id = null;
          sanitized += 1;
        }
        return true;
      });
      window.localStorage.setItem(MP_STORAGE_KEY, JSON.stringify(valid));
    } catch {
      // ignore
    }
  }

  return { removed, sanitized };
};
