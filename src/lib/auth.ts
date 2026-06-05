import type {
  AuthSession,
  MatchType,
  LeaderboardEntry,
  LoginPayload,
  PlayerProfile,
  RegisterResult,
  RegisterPayload,
} from "../types";
import { avatarOptions } from "../data/avatars";
import { createEmptyAudit, normalizeAudit } from "./audit";
import {
  calculateRank,
  isValidEmail,
  normalizeEmail,
  normalizeUsername,
  parseAdminUsernames,
  uid,
  usernameToLegacyEmail,
} from "./utils";
import {
  loadAccountLeaderboard,
  loadLeaderboard,
  loadSession,
  loadUsers,
  saveAccountLeaderboard,
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

const ensureValidEmail = (email: string) => {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    throw new Error("Enter a valid email address.");
  }
  return normalized;
};

const createProfile = (payload: RegisterPayload): PlayerProfile => ({
  id: uid(),
  username: ensureValidUsername(payload.username),
  email: ensureValidEmail(payload.email),
  avatarId: payload.avatarId,
  xp: 0,
  rank: "Neural Rookie",
  createdAt: new Date().toISOString(),
  isAdmin: parseAdminUsernames().includes(ensureValidUsername(payload.username)),
});

const mapUserMetaProfile = (user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) => ({
  id: user.id,
  username:
    typeof user.user_metadata?.username === "string"
      ? ensureValidUsername(user.user_metadata.username)
      : (user.email?.split("@")[0] ?? "player"),
  email: user.email ?? "",
  avatarId:
    typeof user.user_metadata?.avatar_id === "string"
      ? user.user_metadata.avatar_id
      : avatarOptions[0].id,
  xp: 0,
  rank: "Neural Rookie" as const,
  createdAt: new Date().toISOString(),
  isAdmin: false,
});

const mapRemoteProfile = (
  row: Partial<PlayerProfile> | null,
  fallbackUsername: string,
  fallbackEmail: string,
  isAdmin: boolean,
): PlayerProfile => ({
  id: row?.id ?? uid(),
  username: row?.username ?? fallbackUsername,
  email: row?.email ?? fallbackEmail,
  avatarId: row?.avatarId ?? avatarOptions[0].id,
  xp: row?.xp ?? 0,
  rank: row?.rank ?? "Neural Rookie",
  createdAt: row?.createdAt ?? new Date().toISOString(),
  isAdmin,
});

const normalizeLeaderboardEntry = (entry: LeaderboardEntry): LeaderboardEntry => ({
  ...entry,
  email: entry.email ?? "",
  matchType: entry.matchType ?? "standard",
  rating:
    typeof entry.rating === "number" && !Number.isNaN(entry.rating)
      ? entry.rating
      : computeRating(entry.score, entry.accuracy, entry.maxCombo, entry.duration),
  totalPoints:
    typeof entry.totalPoints === "number" && !Number.isNaN(entry.totalPoints)
      ? entry.totalPoints
      : entry.score,
  audit: normalizeAudit(entry.audit ?? createEmptyAudit()),
});

const compareLeaderboardEntries = (a: LeaderboardEntry, b: LeaderboardEntry) => {
  if (b.rating !== a.rating) return b.rating - a.rating;
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  if (b.score !== a.score) return b.score - a.score;
  if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
  if (b.maxCombo !== a.maxCombo) return b.maxCombo - a.maxCombo;
  return a.duration - b.duration;
};

const sortLeaderboard = (entries: LeaderboardEntry[]) =>
  entries.map(normalizeLeaderboardEntry).sort(compareLeaderboardEntries);

const computeRating = (score: number, accuracy: number, maxCombo: number, duration: number) =>
  Math.max(0, Math.round(score + accuracy * 20 + maxCombo * 120 - duration * 2));

const toStoredMatchType = (matchType: string | null | undefined): MatchType =>
  matchType === "numbers" || matchType === "icons" || matchType === "standard"
    ? matchType
    : "standard";

const mapLeaderboardRow = (row: any): LeaderboardEntry => ({
  id: row.id,
  userId: row.user_id,
  username: row.username,
  email: row.email ?? "",
  avatarId: row.avatar_id,
  mode: row.mode,
  matchType: toStoredMatchType(row.match_type),
  gridSize: row.grid_size ?? "4x4",
  score: row.score,
  rating: row.rating ?? computeRating(row.score, row.accuracy, row.max_combo, row.duration),
  totalPoints: row.total_points ?? row.score,
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
});

const mapAccountLeaderboardRow = (row: any): LeaderboardEntry => ({
  id: `account-${row.user_id}`,
  userId: row.user_id,
  username: row.username,
  email: row.email ?? "",
  avatarId: row.avatar_id,
  mode: row.mode ?? "classic",
  matchType: toStoredMatchType(row.match_type),
  gridSize: row.grid_size ?? "4x4",
  score: row.best_score,
  rating: row.best_rating ?? computeRating(row.best_score, row.best_accuracy, row.best_max_combo, row.best_duration),
  totalPoints: row.total_points ?? row.best_score,
  accuracy: row.best_accuracy,
  maxCombo: row.best_max_combo,
  duration: row.best_duration,
  playedAt: row.best_played_at,
  audit: createEmptyAudit(),
});

const canBeAdminFromEnv = (username: string) =>
  parseAdminUsernames().includes(normalizeUsername(username));

const isBetterRun = (candidate: LeaderboardEntry, current: LeaderboardEntry) =>
  compareLeaderboardEntries(candidate, current) < 0;

const mergeLocalLeaderboard = (entries: LeaderboardEntry[], nextEntry: LeaderboardEntry) => {
  const currentEntries = sortLeaderboard(entries);
  const userEntries = currentEntries.filter((entry) => entry.userId === nextEntry.userId);
  const currentTotalPoints = userEntries[0]?.totalPoints ?? 0;
  const nextTotalPoints = currentTotalPoints + nextEntry.score;

  const rebasedEntries = currentEntries.map((entry) =>
    entry.userId === nextEntry.userId ? { ...entry, totalPoints: nextTotalPoints } : entry,
  );

  const normalizedNextEntry = normalizeLeaderboardEntry({
    ...nextEntry,
    totalPoints: nextTotalPoints,
  });

  const existingBestIndex = rebasedEntries.findIndex(
    (entry) =>
      entry.userId === normalizedNextEntry.userId &&
      entry.mode === normalizedNextEntry.mode &&
      entry.matchType === normalizedNextEntry.matchType &&
      entry.gridSize === normalizedNextEntry.gridSize,
  );

  if (existingBestIndex === -1) {
    return sortLeaderboard([...rebasedEntries, normalizedNextEntry]);
  }

  const existingBest = rebasedEntries[existingBestIndex];
  if (!isBetterRun(normalizedNextEntry, existingBest)) {
    return sortLeaderboard(rebasedEntries);
  }

  const nextEntries = [...rebasedEntries];
  nextEntries.splice(existingBestIndex, 1, normalizedNextEntry);
  return sortLeaderboard(nextEntries);
};

const buildAccountLeaderboard = (entries: LeaderboardEntry[]) => {
  const bestByUser = new Map<string, LeaderboardEntry>();

  for (const entry of sortLeaderboard(entries)) {
    const current = bestByUser.get(entry.userId);
    if (!current || compareLeaderboardEntries(entry, current) < 0) {
      bestByUser.set(entry.userId, normalizeLeaderboardEntry(entry));
    }
  }

  return sortLeaderboard(Array.from(bestByUser.values()));
};

const saveLeaderboards = (leaderboard: LeaderboardEntry[], accountLeaderboard?: LeaderboardEntry[]) => {
  saveLeaderboard(leaderboard);
  saveAccountLeaderboard(accountLeaderboard ?? buildAccountLeaderboard(leaderboard));
};

const fetchRemoteLeaderboards = async () => {
  if (!supabase) {
    return {
      leaderboard: loadLeaderboard().map(normalizeLeaderboardEntry),
      accountLeaderboard: loadAccountLeaderboard().map(normalizeLeaderboardEntry),
    };
  }

  const [{ data: categoryRows, error: categoryError }, { data: accountRows, error: accountError }] =
    await Promise.all([
      supabase
        .from("leaderboard_rankings")
        .select("*")
        .order("rating", { ascending: false })
        .order("total_points", { ascending: false })
        .order("duration", { ascending: true })
        .limit(100),
      supabase
        .from("leaderboard_accounts")
        .select("*")
        .order("best_rating", { ascending: false })
        .order("total_points", { ascending: false })
        .order("best_duration", { ascending: true })
        .limit(100),
    ]);

  if (categoryError) throw categoryError;
  if (accountError) throw accountError;

  const leaderboard = (categoryRows ?? []).map(mapLeaderboardRow) satisfies LeaderboardEntry[];
  const accountLeaderboard = (accountRows ?? []).map(mapAccountLeaderboardRow) satisfies LeaderboardEntry[];
  saveLeaderboards(leaderboard, accountLeaderboard);
  return { leaderboard, accountLeaderboard };
};

const ensureRemoteProfile = async (user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) => {
  if (!supabase) return null;

  const { data: profileRow, error } = await supabase
    .from("profiles")
    .select("id, username, email, avatar_id, xp, rank, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  if (profileRow) {
    if (!profileRow.email && user.email) {
      await supabase.from("profiles").update({ email: user.email }).eq("id", user.id);
      return { ...profileRow, email: user.email };
    }
    return profileRow;
  }

  const fallbackProfile = mapUserMetaProfile(user);
  const { error: insertError } = await supabase.from("profiles").upsert({
    id: fallbackProfile.id,
    username: fallbackProfile.username,
    email: fallbackProfile.email,
    avatar_id: fallbackProfile.avatarId,
    xp: fallbackProfile.xp,
    rank: fallbackProfile.rank,
    created_at: fallbackProfile.createdAt,
  });

  if (insertError) throw insertError;

  return {
    id: fallbackProfile.id,
    username: fallbackProfile.username,
    email: fallbackProfile.email,
    avatar_id: fallbackProfile.avatarId,
    xp: fallbackProfile.xp,
    rank: fallbackProfile.rank,
    created_at: fallbackProfile.createdAt,
  };
};

const resolveLoginEmail = async (identifier: string) => {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return ensureValidEmail(trimmed);
  }

  const normalizedUsername = ensureValidUsername(trimmed);
  if (!supabase) {
    throw new Error("Email sign-in is required.");
  }

  const { data, error } = await supabase.rpc("resolve_login_email", {
    login_name: normalizedUsername,
  });

  if (error) throw error;
  if (!data) {
    return usernameToLegacyEmail(normalizedUsername);
  }

  return ensureValidEmail(data);
};

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
          email: session.profile.email ?? "",
          isAdmin: canBeAdminFromEnv(session.profile.username) || session.profile.isAdmin || false,
        },
      };
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const profileRow = await ensureRemoteProfile(session.user);

    const fallbackUsername = session.user.email?.split("@")[0] ?? "player";
    const fallbackEmail = session.user.email ?? "";
    const isAdmin = await resolveAdminState(
      session.user.id,
      profileRow?.username ?? fallbackUsername,
    );

    const profile = mapRemoteProfile(
      profileRow
        ? {
            id: profileRow.id,
            username: profileRow.username,
            email: profileRow.email,
            avatarId: profileRow.avatar_id,
            xp: profileRow.xp,
            rank: profileRow.rank,
            createdAt: profileRow.created_at,
          }
        : null,
      fallbackUsername,
      fallbackEmail,
      isAdmin,
    );
    const currentSession = { profile, accessToken: session.access_token };
    saveSession(currentSession);
    return currentSession;
  },

  async register(payload: RegisterPayload): Promise<RegisterResult> {
    const normalized = ensureValidUsername(payload.username);

    if (!hasSupabase || !supabase) {
      const users = loadUsers();
      const normalizedEmail = ensureValidEmail(payload.email);
      if (users.some((item) => item.profile.username === normalized)) {
        throw new Error("That username is already taken.");
      }
      if (users.some((item) => normalizeEmail(item.profile.email) === normalizedEmail)) {
        throw new Error("That email is already in use.");
      }
      const profile = createProfile({ ...payload, username: normalized, email: normalizedEmail });
      users.push({ profile, password: payload.password });
      saveUsers(users);
      const session = { profile };
      saveSession(session);
      return { session };
    }

    const email = ensureValidEmail(payload.email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        emailRedirectTo:
          (import.meta.env.VITE_EMAIL_CONFIRM_REDIRECT_URL as string | undefined) ??
          `${window.location.origin}/login`,
        data: {
          username: normalized,
          avatar_id: payload.avatarId,
        },
      },
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error("Registration did not return a player account.");
    }

    if (!data.session) {
      return { session: null, verificationEmail: email };
    }

    const profileRow = await ensureRemoteProfile(data.user);
    const profile = mapRemoteProfile(
      profileRow
        ? {
            id: profileRow.id,
            username: profileRow.username,
            email: profileRow.email,
            avatarId: profileRow.avatar_id,
            xp: profileRow.xp,
            rank: profileRow.rank,
            createdAt: profileRow.created_at,
          }
        : null,
      normalized,
      email,
      canBeAdminFromEnv(normalized),
    );

    const session = { profile, accessToken: data.session.access_token };
    saveSession(session);
    return { session };
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    const identifier = payload.identifier.trim();

    if (!hasSupabase || !supabase) {
      const users = loadUsers();
      const user = users.find(
        (item) =>
          normalizeEmail(item.profile.email ?? "") === normalizeEmail(identifier) ||
          item.profile.username === normalizeUsername(identifier),
      );
      if (!user || user.password !== payload.password) {
        throw new Error("Signal mismatch. Check your email or username, then try again.");
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

    const email = await resolveLoginEmail(identifier);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: payload.password,
    });

    if (error) throw error;
    if (!data.user) {
      throw new Error("Login did not return an active player.");
    }

    const profileRow = await ensureRemoteProfile(data.user);

    const fallbackUsername = profileRow?.username ?? data.user.email?.split("@")[0] ?? "player";
    const isAdmin = await resolveAdminState(data.user.id, fallbackUsername);

    const profile = mapRemoteProfile(
      profileRow
        ? {
            id: profileRow.id,
            username: profileRow.username,
            email: profileRow.email,
            avatarId: profileRow.avatar_id,
            xp: profileRow.xp,
            rank: profileRow.rank,
            createdAt: profileRow.created_at,
          }
        : null,
      fallbackUsername,
      email,
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
    entry: Omit<LeaderboardEntry, "id" | "playedAt" | "userId" | "username" | "email" | "avatarId" | "rating" | "totalPoints">,
  ) {
    const completeEntry: LeaderboardEntry = {
      ...entry,
      id: uid(),
      userId: session.profile.id,
      username: session.profile.username,
      email: session.profile.email,
      avatarId: session.profile.avatarId,
      matchType: entry.matchType,
      gridSize: entry.gridSize,
      rating: computeRating(entry.score, entry.accuracy, entry.maxCombo, entry.duration),
      totalPoints: entry.score,
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
      const entries = mergeLocalLeaderboard(loadLeaderboard(), completeEntry).slice(0, 100);
      const accountLeaderboard = buildAccountLeaderboard(entries).slice(0, 100);
      saveLeaderboards(entries, accountLeaderboard);
      const nextSession = { profile: updatedProfile };
      saveSession(nextSession);
      return { entry: completeEntry, session: nextSession, leaderboard: entries, accountLeaderboard };
    }

    const { error: runError } = await supabase.from("game_runs").insert({
      id: completeEntry.id,
      user_id: completeEntry.userId,
      username: completeEntry.username,
      avatar_id: completeEntry.avatarId,
      mode: completeEntry.mode,
      match_type: completeEntry.matchType,
      grid_size: completeEntry.gridSize,
      score: completeEntry.score,
      rating: completeEntry.rating,
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

    const { leaderboard, accountLeaderboard } = await fetchRemoteLeaderboards();

    const nextSession = { profile: updatedProfile };
    saveSession(nextSession);
    return { entry: completeEntry, session: nextSession, leaderboard, accountLeaderboard };
  },

  async requestPasswordReset(email: string) {
    const normalizedEmail = ensureValidEmail(email);
    if (!hasSupabase || !supabase) {
      return;
    }

    const redirectTo =
      (import.meta.env.VITE_PASSWORD_RESET_REDIRECT_URL as string | undefined) ??
      `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) throw error;
  },

  async updatePassword(password: string) {
    if (password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    if (!hasSupabase || !supabase) {
      throw new Error("Password reset needs Supabase to be enabled.");
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async updateEmail(session: AuthSession, email: string) {
    const normalizedEmail = ensureValidEmail(email);

    if (!hasSupabase || !supabase) {
      const updatedProfile = { ...session.profile, email: normalizedEmail };
      const users = loadUsers().map((stored) =>
        stored.profile.id === session.profile.id ? { ...stored, profile: updatedProfile } : stored,
      );
      saveUsers(users);
      const nextSession = { ...session, profile: updatedProfile };
      saveSession(nextSession);
      return nextSession;
    }

    const { error: authError } = await supabase.auth.updateUser({ email: normalizedEmail });
    if (authError) throw authError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email: normalizedEmail })
      .eq("id", session.profile.id);

    if (profileError) throw profileError;

    const nextSession = {
      ...session,
      profile: {
        ...session.profile,
        email: normalizedEmail,
      },
    };
    saveSession(nextSession);
    return nextSession;
  },

  async fetchLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[]; accountLeaderboard: LeaderboardEntry[] }> {
    if (!hasSupabase || !supabase) {
      const leaderboard = loadLeaderboard().map((row) => ({
        ...normalizeLeaderboardEntry(row),
      }));
      const accountLeaderboard = loadAccountLeaderboard().length
        ? loadAccountLeaderboard().map((row) => ({ ...normalizeLeaderboardEntry(row) }))
        : buildAccountLeaderboard(leaderboard);
      saveLeaderboards(leaderboard, accountLeaderboard);
      return { leaderboard, accountLeaderboard };
    }

    return fetchRemoteLeaderboards();
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
      saveLeaderboards(nextEntries);
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
      saveLeaderboards(nextEntries);
      return nextEntries;
    }

    const { error } = await supabase.from("game_runs").delete().eq("id", runId);
    if (error) throw error;
    return this.fetchLeaderboard();
  },
};
