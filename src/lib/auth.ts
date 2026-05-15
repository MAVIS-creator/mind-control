import type {
  AuthSession,
  LeaderboardEntry,
  LoginPayload,
  PlayerProfile,
  RegisterPayload,
} from "../types";
import { avatarOptions } from "../data/avatars";
import { createEmptyAudit, normalizeAudit } from "./audit";
import {
  calculateRank,
  normalizeUsername,
  parseAdminUsernames,
  uid,
  usernameToEmail,
} from "./utils";
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
  isAdmin: parseAdminUsernames().includes(ensureValidUsername(payload.username)),
});

const mapRemoteProfile = (
  row: Partial<PlayerProfile> | null,
  fallbackUsername: string,
  isAdmin: boolean,
): PlayerProfile => ({
  id: row?.id ?? uid(),
  username: row?.username ?? fallbackUsername,
  avatarId: row?.avatarId ?? avatarOptions[0].id,
  xp: row?.xp ?? 0,
  rank: row?.rank ?? "Neural Rookie",
  createdAt: row?.createdAt ?? new Date().toISOString(),
  isAdmin,
});

const sortLeaderboard = (entries: LeaderboardEntry[]) =>
  [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.duration - b.duration;
  });

const canBeAdminFromEnv = (username: string) =>
  parseAdminUsernames().includes(normalizeUsername(username));

const resolveAdminState = async (userId: string, username: string) => {
  if (canBeAdminFromEnv(username)) return true;
  if (!hasSupabase || !supabase) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data?.user_id);
};

export const authApi = {
  async bootstrap(): Promise<AuthSession | null> {
    if (!hasSupabase || !supabase) {
      const session = loadSession();
      if (!session) return null;
      return {
        ...session,
        profile: {
          ...session.profile,
          isAdmin: canBeAdminFromEnv(session.profile.username) || session.profile.isAdmin || false,
        },
      };
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

    const fallbackUsername = session.user.email?.split("@")[0] ?? "player";
    const isAdmin = await resolveAdminState(
      session.user.id,
      profileRow?.username ?? fallbackUsername,
    );

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
      fallbackUsername,
      isAdmin,
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
        throw new Error("That username is already taken.");
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
      const session = {
        profile: {
          ...user.profile,
          isAdmin: canBeAdminFromEnv(user.profile.username) || user.profile.isAdmin || false,
        },
      };
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

    const isAdmin = await resolveAdminState(data.user.id, normalized);

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
      isAdmin,
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
      audit: normalizeAudit(entry.audit),
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
      const entries = sortLeaderboard([
        completeEntry,
        ...loadLeaderboard().map((row) => ({ ...row, audit: normalizeAudit(row.audit) })),
      ]).slice(0, 20);
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
      suspicion_score: completeEntry.audit.suspicionScore,
      suspicion_reasons: completeEntry.audit.suspicionReasons,
      automation_flag: completeEntry.audit.automationFlag,
      fast_input_flag: completeEntry.audit.fastInputFlag,
      hidden_tab_flag: completeEntry.audit.hiddenTabFlag,
      rapid_sequence_count: completeEntry.audit.rapidSequenceCount,
      reviewed_status: completeEntry.audit.reviewedStatus,
      reviewed_note: completeEntry.audit.reviewedNote,
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
      .select("id, user_id, username, avatar_id, mode, score, accuracy, max_combo, duration, played_at, suspicion_score, suspicion_reasons, automation_flag, fast_input_flag, hidden_tab_flag, rapid_sequence_count, reviewed_status, reviewed_note")
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
      audit: normalizeAudit({
        suspicionScore: row.suspicion_score,
        suspicionReasons: row.suspicion_reasons,
        automationFlag: row.automation_flag,
        fastInputFlag: row.fast_input_flag,
        hiddenTabFlag: row.hidden_tab_flag,
        rapidSequenceCount: row.rapid_sequence_count,
        reviewedStatus: row.reviewed_status,
        reviewedNote: row.reviewed_note,
      }),
    })) satisfies LeaderboardEntry[];

    const nextSession = { profile: updatedProfile };
    saveSession(nextSession);
    saveLeaderboard(leaderboard);
    return { entry: completeEntry, session: nextSession, leaderboard };
  },

  async fetchLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!hasSupabase || !supabase) {
      return loadLeaderboard().map((row) => ({
        ...row,
        audit: normalizeAudit(row.audit),
      }));
    }

    const { data, error } = await supabase
      .from("game_runs")
      .select("id, user_id, username, avatar_id, mode, score, accuracy, max_combo, duration, played_at, suspicion_score, suspicion_reasons, automation_flag, fast_input_flag, hidden_tab_flag, rapid_sequence_count, reviewed_status, reviewed_note")
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
      audit: normalizeAudit({
        suspicionScore: row.suspicion_score,
        suspicionReasons: row.suspicion_reasons,
        automationFlag: row.automation_flag,
        fastInputFlag: row.fast_input_flag,
        hiddenTabFlag: row.hidden_tab_flag,
        rapidSequenceCount: row.rapid_sequence_count,
        reviewedStatus: row.reviewed_status,
        reviewedNote: row.reviewed_note,
      }),
    })) satisfies LeaderboardEntry[];
    saveLeaderboard(leaderboard);
    return leaderboard;
  },

  async updateRun(session: AuthSession, updatedEntry: LeaderboardEntry) {
    if (!session.profile.isAdmin) {
      throw new Error("Admin access is required.");
    }

    const nextEntry = { ...updatedEntry, audit: normalizeAudit(updatedEntry.audit) };

    if (!hasSupabase || !supabase) {
      const nextEntries = loadLeaderboard().map((entry) =>
        entry.id === nextEntry.id ? nextEntry : entry,
      );
      saveLeaderboard(nextEntries);
      return nextEntry;
    }

    const { error } = await supabase
      .from("game_runs")
      .update({
        score: nextEntry.score,
        accuracy: nextEntry.accuracy,
        max_combo: nextEntry.maxCombo,
        duration: nextEntry.duration,
        reviewed_status: nextEntry.audit.reviewedStatus,
        reviewed_note: nextEntry.audit.reviewedNote,
      })
      .eq("id", nextEntry.id);

    if (error) throw error;
    return nextEntry;
  },

  async deleteRun(session: AuthSession, runId: string) {
    if (!session.profile.isAdmin) {
      throw new Error("Admin access is required.");
    }

    if (!hasSupabase || !supabase) {
      const nextEntries = loadLeaderboard().filter((entry) => entry.id !== runId);
      saveLeaderboard(nextEntries);
      return nextEntries;
    }

    const { error } = await supabase.from("game_runs").delete().eq("id", runId);
    if (error) throw error;
    return this.fetchLeaderboard();
  },
};
