import type {
  AuthSession,
  LeaderboardEntry,
  LoginPayload,
  PlayerProfile,
  RegisterPayload,
} from "../types";
import { avatarOptions } from "../data/avatars";
import { calculateRank, normalizeUsername, uid, usernameToEmail } from "./utils";
import {
  loadLeaderboard,
  loadSession,
  loadUsers,
  saveLeaderboard,
  saveSession,
  saveUsers,
} from "./storage";
import { hasSupabase, supabase } from "./supabase";

const ensureValidUsername = (username: string) => {
  const normalized = normalizeUsername(username);
  if (normalized.length < 3) {
    throw new Error("Username must be at least 3 characters using letters, numbers, or underscores.");
  }
  return normalized;
};

const createProfile = (payload: RegisterPayload): PlayerProfile => ({
  id: uid(),
  username: ensureValidUsername(payload.username),
  avatarId: payload.avatarId,
  xp: 0,
  rank: "Neural Rookie",
  createdAt: new Date().toISOString(),
});

const mapRemoteProfile = (row: Partial<PlayerProfile> | null, fallbackUsername: string): PlayerProfile => ({
  id: row?.id ?? uid(),
  username: row?.username ?? fallbackUsername,
  avatarId: row?.avatarId ?? avatarOptions[0].id,
  xp: row?.xp ?? 0,
  rank: row?.rank ?? "Neural Rookie",
  createdAt: row?.createdAt ?? new Date().toISOString(),
});

const sortLeaderboard = (entries: LeaderboardEntry[]) =>
  [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.duration - b.duration;
  });

export const authApi = {
  async bootstrap(): Promise<AuthSession | null> {
    if (!hasSupabase || !supabase) {
      return loadSession();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("id, username, avatar_id, xp, rank, created_at")
      .eq("id", session.user.id)
      .maybeSingle();

    const profile = mapRemoteProfile(
      profileRow
        ? {
            id: profileRow.id,
            username: profileRow.username,
            avatarId: profileRow.avatar_id,
            xp: profileRow.xp,
            rank: profileRow.rank,
            createdAt: profileRow.created_at,
          }
        : null,
      session.user.email?.split("@")[0] ?? "pilot",
    );
    const currentSession = { profile, accessToken: session.access_token };
    saveSession(currentSession);
    return currentSession;
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const normalized = ensureValidUsername(payload.username);

    if (!hasSupabase || !supabase) {
      const users = loadUsers();
      if (users.some((item) => item.profile.username === normalized)) {
        throw new Error("That username is already linked to an active neural pilot.");
      }
      const profile = createProfile({ ...payload, username: normalized });
      users.push({ profile, password: payload.password });
      saveUsers(users);
      const session = { profile };
      saveSession(session);
      return session;
    }

    const email = usernameToEmail(normalized);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error("Registration did not return a player account.");
    }

    const profile = createProfile({ ...payload, username: normalized });
    profile.id = data.user.id;

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: profile.id,
      username: profile.username,
      avatar_id: profile.avatarId,
      xp: profile.xp,
      rank: profile.rank,
      created_at: profile.createdAt,
    });

    if (profileError) throw profileError;

    const session = { profile, accessToken: data.session?.access_token };
    saveSession(session);
    return session;
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    const normalized = ensureValidUsername(payload.username);

    if (!hasSupabase || !supabase) {
      const users = loadUsers();
      const user = users.find((item) => item.profile.username === normalized);
      if (!user || user.password !== payload.password) {
        throw new Error("Signal mismatch. Check your username and password.");
      }
      const session = { profile: user.profile };
      saveSession(session);
      return session;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(normalized),
      password: payload.password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error("Login did not return an active player.");
    }

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_id, xp, rank, created_at")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const profile = mapRemoteProfile(
      profileRow
        ? {
            id: profileRow.id,
            username: profileRow.username,
            avatarId: profileRow.avatar_id,
            xp: profileRow.xp,
            rank: profileRow.rank,
            createdAt: profileRow.created_at,
          }
        : null,
      normalized,
    );
    const session = { profile, accessToken: data.session?.access_token };
    saveSession(session);
    return session;
  },

  async logout() {
    if (hasSupabase && supabase) {
      await supabase.auth.signOut();
    }
    saveSession(null);
  },

  async submitRun(
    session: AuthSession,
    entry: Omit<LeaderboardEntry, "id" | "playedAt" | "userId" | "username" | "avatarId">,
  ) {
    const completeEntry: LeaderboardEntry = {
      ...entry,
      id: uid(),
      userId: session.profile.id,
      username: session.profile.username,
      avatarId: session.profile.avatarId,
      playedAt: new Date().toISOString(),
    };

    const gainedXp = Math.max(140, Math.round(entry.score * 0.12));
    const updatedProfile: PlayerProfile = {
      ...session.profile,
      xp: session.profile.xp + gainedXp,
      rank: calculateRank(session.profile.xp + gainedXp),
    };

    if (!hasSupabase || !supabase) {
      const users = loadUsers().map((stored) =>
        stored.profile.id === updatedProfile.id
          ? { ...stored, profile: updatedProfile }
          : stored,
      );
      saveUsers(users);
      const entries = sortLeaderboard([completeEntry, ...loadLeaderboard()]).slice(0, 20);
      saveLeaderboard(entries);
      const nextSession = { profile: updatedProfile };
      saveSession(nextSession);
      return { entry: completeEntry, session: nextSession, leaderboard: entries };
    }

    const { error: runError } = await supabase.from("game_runs").insert({
      id: completeEntry.id,
      user_id: completeEntry.userId,
      username: completeEntry.username,
      avatar_id: completeEntry.avatarId,
      mode: completeEntry.mode,
      score: completeEntry.score,
      accuracy: completeEntry.accuracy,
      max_combo: completeEntry.maxCombo,
      duration: completeEntry.duration,
      played_at: completeEntry.playedAt,
    });
    if (runError) throw runError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        xp: updatedProfile.xp,
        rank: updatedProfile.rank,
        avatar_id: updatedProfile.avatarId,
      })
      .eq("id", updatedProfile.id);
    if (profileError) throw profileError;

    const { data: leaderboardRows, error: leaderboardError } = await supabase
      .from("game_runs")
      .select("id, user_id, username, avatar_id, mode, score, accuracy, max_combo, duration, played_at")
      .order("score", { ascending: false })
      .order("duration", { ascending: true })
      .limit(20);

    if (leaderboardError) throw leaderboardError;

    const leaderboard = (leaderboardRows ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      avatarId: row.avatar_id,
      mode: row.mode,
      score: row.score,
      accuracy: row.accuracy,
      maxCombo: row.max_combo,
      duration: row.duration,
      playedAt: row.played_at,
    })) satisfies LeaderboardEntry[];

    const nextSession = { profile: updatedProfile };
    saveSession(nextSession);
    saveLeaderboard(leaderboard);
    return { entry: completeEntry, session: nextSession, leaderboard };
  },

  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!hasSupabase || !supabase) {
      return loadLeaderboard();
    }

    const { data, error } = await supabase
      .from("game_runs")
      .select("id, user_id, username, avatar_id, mode, score, accuracy, max_combo, duration, played_at")
      .order("score", { ascending: false })
      .order("duration", { ascending: true })
      .limit(20);

    if (error) throw error;

    const leaderboard = (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username,
      avatarId: row.avatar_id,
      mode: row.mode,
      score: row.score,
      accuracy: row.accuracy,
      maxCombo: row.max_combo,
      duration: row.duration,
      playedAt: row.played_at,
    })) satisfies LeaderboardEntry[];
    saveLeaderboard(leaderboard);
    return leaderboard;
  },
};
