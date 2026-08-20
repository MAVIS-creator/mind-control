import type {
  AuthSession,
  AdminEmailPayload,
  AdminEmailResult,
  MatchType,
  LeaderboardEntry,
  LoginPayload,
  PlayerProfile,
  PlayerSnapshot,
  PlayerStats,
  RegisterResult,
  RegisterPayload,
} from "../types";
import { avatarOptions } from "../data/avatars";
import { createEmptyAudit, normalizeAudit } from "./audit";
import {
  calculateRunXp,
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
export { saveSession } from "./storage";
import { hasSupabase, supabase } from "./supabase";
import { loadStoredFinishedRooms } from "./multiplayer";

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
  rank: calculateRank(row?.xp ?? 0),
  createdAt: row?.createdAt ?? new Date().toISOString(),
  isAdmin,
  isBetaTester: isBetaTesterUser(
    row?.username ?? fallbackUsername,
    (row as any)?.is_beta_tester ?? row?.isBetaTester,
    row?.createdAt ?? (row as any)?.created_at,
  ),
  hasClaimedBetaReward:
    Boolean(row?.hasClaimedBetaReward ?? (row as any)?.has_claimed_beta_reward) ||
    Boolean((row as any)?.user_metadata?.has_claimed_beta_reward),
});

const normalizeLeaderboardEntry = (entry: LeaderboardEntry): LeaderboardEntry => ({
  ...entry,
  email: entry.email ?? "",
  matchType: entry.matchType ?? "standard",
  won: entry.won ?? true,
  rating:
    typeof entry.rating === "number" && !Number.isNaN(entry.rating)
      ? entry.rating
      : computeRating(entry.score, entry.accuracy, entry.maxCombo, entry.duration),
  totalPoints:
    typeof entry.totalPoints === "number" && !Number.isNaN(entry.totalPoints)
      ? entry.totalPoints
      : entry.score,
  movesUsed:
    typeof entry.movesUsed === "number" && !Number.isNaN(entry.movesUsed)
      ? entry.movesUsed
      : 0,
  moveLimit:
    typeof entry.moveLimit === "number" && !Number.isNaN(entry.moveLimit)
      ? entry.moveLimit
      : 0,
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

const mapLeaderboardRow = (row: any, meta?: { isAdmin: boolean; isBetaTester: boolean; email?: string }): LeaderboardEntry => ({
  id: row.id,
  userId: row.user_id,
  username: row.username,
  email: meta?.email || row.email || "",
  avatarId: row.avatar_id,
  mode: row.mode,
  matchType: toStoredMatchType(row.match_type),
  gridSize: row.grid_size ?? "4x4",
  score: row.score,
  rating: row.rating ?? computeRating(row.score, row.accuracy, row.max_combo, row.duration),
  totalPoints: row.total_points ?? row.score,
  won: row.won ?? true,
  accuracy: row.accuracy,
  maxCombo: row.max_combo,
  duration: row.duration,
  movesUsed: row.moves_used ?? 0,
  moveLimit: row.move_limit ?? 0,
  playedAt: row.played_at,
  isAdmin: meta?.isAdmin ?? (canBeAdminFromEnv(row.username) || Boolean(row.is_admin || row.isAdmin)),
  isBetaTester:
    meta?.isBetaTester ??
    isBetaTesterUser(row.username, row.is_beta_tester ?? row.isBetaTester, row.played_at),
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

const mapAccountLeaderboardRow = (row: any, meta?: { isAdmin: boolean; isBetaTester: boolean; email?: string }): LeaderboardEntry => ({
  id: `account-${row.user_id}`,
  userId: row.user_id,
  username: row.username,
  email: meta?.email || row.email || "",
  avatarId: row.avatar_id,
  mode: row.mode ?? "classic",
  matchType: toStoredMatchType(row.match_type),
  gridSize: row.grid_size ?? "4x4",
  score: row.best_score,
  rating: row.best_rating ?? computeRating(row.best_score, row.best_accuracy, row.best_max_combo, row.best_duration),
  totalPoints: row.total_points ?? row.best_score,
  won: row.best_won ?? true,
  accuracy: row.best_accuracy,
  maxCombo: row.best_max_combo,
  duration: row.best_duration,
  movesUsed: row.best_moves_used ?? 0,
  moveLimit: row.best_move_limit ?? 0,
  playedAt: row.best_played_at,
  isAdmin: meta?.isAdmin ?? (canBeAdminFromEnv(row.username) || Boolean(row.is_admin || row.isAdmin)),
  isBetaTester:
    meta?.isBetaTester ??
    isBetaTesterUser(row.username, row.is_beta_tester ?? row.isBetaTester, row.best_played_at),
  audit: createEmptyAudit(),
});

const calculatePlayerStats = (runs: LeaderboardEntry[]): PlayerStats => {
  const normalizedRuns = runs.map(normalizeLeaderboardEntry);
  const totalGames = normalizedRuns.length;
  const wins = normalizedRuns.filter((run) => run.won).length;
  const losses = Math.max(totalGames - wins, 0);
  const totalScore = normalizedRuns.reduce((sum, run) => sum + run.score, 0);
  const totalPoints = normalizedRuns.reduce((sum, run) => sum + run.score, 0);

  return {
    totalGames,
    wins,
    losses,
    winRate: totalGames ? (wins / totalGames) * 100 : 0,
    averageScore: totalGames ? Math.round(totalScore / totalGames) : 0,
    bestScore: normalizedRuns.reduce((best, run) => Math.max(best, run.score), 0),
    bestAccuracy: normalizedRuns.reduce((best, run) => Math.max(best, run.accuracy), 0),
    bestCombo: normalizedRuns.reduce((best, run) => Math.max(best, run.maxCombo), 0),
    totalPoints,
  };
};

const canBeAdminFromEnv = (username: string) =>
  parseAdminUsernames().includes(normalizeUsername(username));

const LAUNCH_DAY_CUTOFF = new Date("2026-08-16T04:30:00.000Z").getTime();

const BETA_TESTER_WHITELIST = new Set([
  "ladiechamp",
  "quantacipher",
  "tracy426",
]);

const parseBetaTesterUsernames = (): string[] => {
  const envUsernames = (import.meta.env.VITE_BETA_TESTER_USERNAMES as string | undefined) ?? "";
  return envUsernames
    .split(",")
    .map((name: string) => name.trim().toLowerCase())
    .filter(Boolean);
};

export const isBetaTesterUser = (
  username?: string,
  isBetaTesterFlag?: boolean | null,
  createdAt?: string,
): boolean => {
  // If explicitly revoked or disabled in database/profile (is_beta_tester is false), NEVER grant beta status!
  if (isBetaTesterFlag === false) return false;

  // If explicitly granted in database/profile (is_beta_tester is true)
  if (isBetaTesterFlag === true) return true;

  // Otherwise (null or undefined), fallback to whitelist or pre-launch registration date:
  const cleanUsername = username ? normalizeUsername(username) : "";
  if (cleanUsername) {
    if (BETA_TESTER_WHITELIST.has(cleanUsername)) return true;
    if (parseBetaTesterUsernames().includes(cleanUsername)) return true;
  }
  if (createdAt) {
    const timestamp = new Date(createdAt).getTime();
    if (!Number.isNaN(timestamp) && timestamp <= LAUNCH_DAY_CUTOFF) {
      return true;
    }
  }
  return false;
};

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

const buildPublicLeaderboardsFromRuns = (rows: any[]) => {
  const runs = rows.map(mapLeaderboardRow);
  const totals = new Map<string, number>();

  for (const run of runs) {
    totals.set(run.userId, (totals.get(run.userId) ?? 0) + run.score);
  }

  const runsWithTotals = runs.map((run) =>
    normalizeLeaderboardEntry({
      ...run,
      totalPoints: totals.get(run.userId) ?? run.score,
    }),
  );

  const bestByCategory = new Map<string, LeaderboardEntry>();

  for (const run of sortLeaderboard(runsWithTotals)) {
    const key = `${run.userId}:${run.mode}:${run.matchType}:${run.gridSize}`;
    const current = bestByCategory.get(key);
    if (!current || compareLeaderboardEntries(run, current) < 0) {
      bestByCategory.set(key, run);
    }
  }

  const leaderboard = sortLeaderboard(Array.from(bestByCategory.values()));
  return {
    leaderboard,
    accountLeaderboard: buildAccountLeaderboard(runsWithTotals),
  };
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

  try {
    const [{ data: categoryRows, error: categoryError }, { data: accountRows, error: accountError }, { data: profileRows }] =
      await Promise.all([
        supabase
          .from("public_leaderboard_rankings")
          .select("*")
          .order("rating", { ascending: false })
          .order("total_points", { ascending: false })
          .order("duration", { ascending: true })
          .limit(200),
        supabase
          .from("public_leaderboard_accounts")
          .select("*")
          .order("best_rating", { ascending: false })
          .order("total_points", { ascending: false })
          .order("best_duration", { ascending: true })
          .limit(200),
        supabase.from("profiles").select("id, username, email, is_admin, is_beta_tester, created_at"),
      ]);

    if (categoryError) throw categoryError;
    if (accountError) throw accountError;

    const profileMetaMap = new Map<string, { isAdmin: boolean; isBetaTester: boolean; email?: string }>();
    (profileRows || []).forEach((p) => {
      const isAdmin = canBeAdminFromEnv(p.username) || Boolean(p.is_admin);
      const isBetaTester = isBetaTesterUser(p.username, Boolean(p.is_beta_tester), p.created_at);
      const email = p.email ?? "";
      profileMetaMap.set(p.id, { isAdmin, isBetaTester, email });
      if (p.username) profileMetaMap.set(p.username.toLowerCase(), { isAdmin, isBetaTester, email });
    });

    const leaderboard = (categoryRows ?? []).map((r) =>
      mapLeaderboardRow(r, profileMetaMap.get(r.user_id) || (r.username ? profileMetaMap.get(r.username.toLowerCase()) : undefined)),
    ) satisfies LeaderboardEntry[];
    const accountLeaderboard = (accountRows ?? []).map((r) =>
      mapAccountLeaderboardRow(r, profileMetaMap.get(r.user_id) || (r.username ? profileMetaMap.get(r.username.toLowerCase()) : undefined)),
    ) satisfies LeaderboardEntry[];
    saveLeaderboards(leaderboard, accountLeaderboard);
    return { leaderboard, accountLeaderboard };
  } catch {
    const [{ data: runRows, error: runsError }, { data: profileRows }] = await Promise.all([
      supabase
        .from("game_runs")
        .select("*")
        .order("rating", { ascending: false })
        .order("score", { ascending: false })
        .order("duration", { ascending: true })
        .limit(500),
      supabase.from("profiles").select("id, username, email, is_admin, is_beta_tester, created_at"),
    ]);

    if (runsError) throw runsError;

    const profileMetaMap = new Map<string, { isAdmin: boolean; isBetaTester: boolean; email?: string }>();
    (profileRows || []).forEach((p) => {
      const isAdmin = canBeAdminFromEnv(p.username) || Boolean(p.is_admin);
      const isBetaTester = isBetaTesterUser(p.username, Boolean(p.is_beta_tester), p.created_at);
      const email = p.email ?? "";
      profileMetaMap.set(p.id, { isAdmin, isBetaTester, email });
      if (p.username) profileMetaMap.set(p.username.toLowerCase(), { isAdmin, isBetaTester, email });
    });

    const next = buildPublicLeaderboardsFromRuns(runRows ?? []);
    next.leaderboard.forEach((e) => {
      const meta = profileMetaMap.get(e.userId) || (e.username ? profileMetaMap.get(e.username.toLowerCase()) : undefined);
      if (meta) {
        e.isAdmin = meta.isAdmin;
        e.isBetaTester = meta.isBetaTester;
        if (meta.email) e.email = meta.email;
      }
    });
    next.accountLeaderboard.forEach((e) => {
      const meta = profileMetaMap.get(e.userId) || (e.username ? profileMetaMap.get(e.username.toLowerCase()) : undefined);
      if (meta) {
        e.isAdmin = meta.isAdmin;
        e.isBetaTester = meta.isBetaTester;
        if (meta.email) e.email = meta.email;
      }
    });
    saveLeaderboards(next.leaderboard, next.accountLeaderboard);
    return next;
  }
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
    const emailRedirect =
      (import.meta.env.VITE_EMAIL_CONFIRM_REDIRECT_URL as string | undefined) ??
      (import.meta.env.PROD ? "https://neuralclash.dev/login" : `${window.location.origin}/login`);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        emailRedirectTo: emailRedirect,
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
      won: entry.won,
      movesUsed: entry.movesUsed,
      moveLimit: entry.moveLimit,
      playedAt: new Date().toISOString(),
      audit: normalizeAudit(entry.audit),
    };

    const gainedXp = calculateRunXp({
      score: entry.score,
      accuracy: entry.accuracy,
      maxCombo: entry.maxCombo,
    });
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
      const nextSession = { profile: updatedProfile, accessToken: session.accessToken };
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
      won: completeEntry.won,
      accuracy: completeEntry.accuracy,
      max_combo: completeEntry.maxCombo,
      duration: completeEntry.duration,
      moves_used: completeEntry.movesUsed,
      move_limit: completeEntry.moveLimit,
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

    const nextSession = { profile: updatedProfile, accessToken: session.accessToken };
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
      (import.meta.env.PROD ? "https://neuralclash.dev/reset-password" : `${window.location.origin}/reset-password`);

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

  async fetchPlayerSnapshot(userId: string): Promise<PlayerSnapshot> {
    if (!hasSupabase || !supabase) {
      const users = loadUsers();
      const user = users.find((entry) => entry.profile.id === userId);
      if (!user) {
        throw new Error("Player profile not found.");
      }

      const leaderboard = loadLeaderboard()
        .map(normalizeLeaderboardEntry)
        .filter((entry) => entry.userId === userId)
        .sort((a, b) => +new Date(b.playedAt) - +new Date(a.playedAt));

      const localRooms = loadStoredFinishedRooms().filter(
        (r) =>
          r.status === "finished" &&
          (r.host_id === userId || r.guest_id === userId) &&
          r.host_id &&
          r.guest_id &&
          r.host_id !== r.guest_id,
      );

      let mpWins = 0;
      let mpLosses = 0;
      let coopClears = 0;
      let turnBasedPoints = 0;
      let speedSprintPoints = 0;
      let coopPoints = 0;

      localRooms.forEach((r) => {
        const isHost = r.host_id === userId;
        const rawScores = typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores || {};
        const myMatchScore = Number(rawScores[userId] ?? (isHost ? rawScores.host : rawScores.guest) ?? 600) || 600;

        if (r.game_mode === "coop") {
          coopClears += 1;
          const pts = Math.max(0, myMatchScore) + 350;
          coopPoints += pts;
        } else if (r.winner_id === userId) {
          mpWins += 1;
          const victoryBonus = r.game_mode === "speed_sprint" ? 300 : 250;
          const pts = Math.max(0, myMatchScore) + victoryBonus;
          if (r.game_mode === "speed_sprint") speedSprintPoints += pts;
          else turnBasedPoints += pts;
        } else if (r.winner_id && (r.winner_id === r.host_id || r.winner_id === r.guest_id)) {
          mpLosses += 1;
          const pts = Math.max(0, myMatchScore);
          if (r.game_mode === "speed_sprint") speedSprintPoints += pts;
          else turnBasedPoints += pts;
        } else {
          const pts = Math.max(0, myMatchScore);
          if (r.game_mode === "speed_sprint") speedSprintPoints += pts;
          else turnBasedPoints += pts;
        }
      });

      const multiplayerPoints = turnBasedPoints + speedSprintPoints + coopPoints;
      const baseStats = calculatePlayerStats(leaderboard);

      return {
        profile: user.profile,
        stats: {
          ...baseStats,
          multiplayerWins: mpWins,
          multiplayerLosses: mpLosses,
          multiplayerTotal: localRooms.length,
          coopClears,
          multiplayerPoints,
          turnBasedPoints,
          speedSprintPoints,
          coopPoints,
        },
        recentRuns: leaderboard.slice(0, 8),
      };
    }

    const [{ data: profileRow, error: profileError }, { data: runRows, error: runsError }, { data: mpRows }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, email, avatar_id, xp, rank, created_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("game_runs")
        .select("*")
        .eq("user_id", userId)
        .order("played_at", { ascending: false }),
      supabase
        .from("multiplayer_rooms")
        .select("*")
        .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
        .eq("status", "finished"),
    ]);

    if (profileError) throw profileError;
    if (runsError) throw runsError;
    if (!profileRow) {
      throw new Error("Player profile not found.");
    }

    const profile = mapRemoteProfile(
      {
        id: profileRow.id,
        username: profileRow.username,
        email: profileRow.email,
        avatarId: profileRow.avatar_id,
        xp: profileRow.xp,
        rank: profileRow.rank,
        createdAt: profileRow.created_at,
      },
      profileRow.username,
      profileRow.email ?? "",
      await resolveAdminState(profileRow.id, profileRow.username),
    );
    const recentRuns = (runRows ?? []).map(mapLeaderboardRow);

    const localRooms = loadStoredFinishedRooms();
    const allMpRoomsMap = new Map<string, any>();
    (mpRows || []).forEach((r) => allMpRoomsMap.set(r.id, r));
    localRooms.forEach((r) => {
      if (r.host_id === userId || r.guest_id === userId) {
        if (!allMpRoomsMap.has(r.id)) allMpRoomsMap.set(r.id, r);
      }
    });

    const validMpRooms = Array.from(allMpRoomsMap.values()).filter(
      (r) => r.status === "finished" && r.host_id && r.guest_id && r.host_id !== r.guest_id,
    );

    let mpWins = 0;
    let mpLosses = 0;
    let coopClears = 0;
    let turnBasedPoints = 0;
    let speedSprintPoints = 0;
    let coopPoints = 0;
    const mpTotal = validMpRooms.length;

    validMpRooms.forEach((r) => {
      const isHost = r.host_id === userId;
      const rawScores = typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores || {};
      const myMatchScore = Number(rawScores[userId] ?? (isHost ? rawScores.host : rawScores.guest) ?? 600) || 600;

      if (r.game_mode === "coop") {
        coopClears += 1;
        const pts = Math.max(0, myMatchScore) + 350;
        coopPoints += pts;
      } else if (r.winner_id === userId) {
        mpWins += 1;
        const victoryBonus = r.game_mode === "speed_sprint" ? 300 : 250;
        const pts = Math.max(0, myMatchScore) + victoryBonus;
        if (r.game_mode === "speed_sprint") speedSprintPoints += pts;
        else turnBasedPoints += pts;
      } else if (r.winner_id && (r.winner_id === r.host_id || r.winner_id === r.guest_id)) {
        mpLosses += 1;
        const pts = Math.max(0, myMatchScore);
        if (r.game_mode === "speed_sprint") speedSprintPoints += pts;
        else turnBasedPoints += pts;
      } else {
        const pts = Math.max(0, myMatchScore);
        if (r.game_mode === "speed_sprint") speedSprintPoints += pts;
        else turnBasedPoints += pts;
      }
    });

    const multiplayerPoints = turnBasedPoints + speedSprintPoints + coopPoints;
    const baseStats = calculatePlayerStats(recentRuns);

    return {
      profile,
      stats: {
        ...baseStats,
        multiplayerWins: mpWins,
        multiplayerLosses: mpLosses,
        multiplayerTotal: mpTotal,
        coopClears,
        multiplayerPoints,
        turnBasedPoints,
        speedSprintPoints,
        coopPoints,
      },
      recentRuns: recentRuns.slice(0, 8),
    };
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

  async sendAdminEmail(
    session: AuthSession,
    payload: AdminEmailPayload,
  ): Promise<AdminEmailResult> {
    if (!session.profile.isAdmin) {
      throw new Error("Admin access is required.");
    }

    const recipientIds = Array.from(new Set(payload.recipientIds)).filter(Boolean);
    if (!recipientIds.length) {
      throw new Error("Choose at least one player.");
    }
    if (!payload.subject.trim()) {
      throw new Error("Add an email subject.");
    }
    if (!payload.message.trim()) {
      throw new Error("Write a message before sending.");
    }

    if (!hasSupabase || !supabase) {
      const localProfiles = loadUsers().map((stored) => stored.profile);
      const localLeaderboardRows = [...loadLeaderboard(), ...loadAccountLeaderboard()].map(normalizeLeaderboardEntry);
      const recipients = recipientIds
        .map((recipientId) => {
          const profileEmail = localProfiles.find((profile) => profile.id === recipientId)?.email;
          const runEmail = localLeaderboardRows.find((entry) => entry.userId === recipientId)?.email;
          return profileEmail || runEmail || "";
        })
        .filter((email, index, list) => isValidEmail(email) && list.indexOf(email) === index);

      if (!recipients.length) {
        throw new Error(
          "The selected players do not have saved emails in this local browser. Restart the dev server so localhost uses Supabase, then refresh the admin page.",
        );
      }
      window.location.href = `mailto:${recipients.join(",")}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.message)}`;
      return { sent: recipients.length, recipients };
    }

    const html = formatAdminHtmlEmail(payload.subject, payload.message);

    const { data, error } = await supabase.functions.invoke("admin-send-email", {
      headers: session.accessToken
        ? {
            Authorization: `Bearer ${session.accessToken}`,
          }
        : undefined,
      body: {
        recipientIds,
        subject: payload.subject,
        message: payload.message,
        html,
      },
    });

    if (error) {
      let details = "";
      const maybeContext = (error as { context?: unknown }).context;
      if (maybeContext instanceof Response) {
        try {
          const body = (await maybeContext.clone().json()) as { error?: string; details?: string };
          details = [body.error, body.details].filter(Boolean).join(" ");
        } catch {
          details = await maybeContext.clone().text().catch(() => "");
        }
      }
      throw new Error(details || error.message || "Unable to send admin email.");
    }
    return data as AdminEmailResult;
  },

  async adminResetUserPassword(userId: string, tempPassword: string): Promise<void> {
    if (!hasSupabase || !supabase) {
      const users = loadUsers();
      const target = users.find((u) => u.profile.id === userId);
      if (target) {
        target.password = tempPassword;
        target.profile.mustChangePassword = true;
        saveUsers(users);
      }
      return;
    }

    await supabase.from("profiles").update({ must_change_password: true }).eq("id", userId);
  },

  async resetPassword(newPassword: string): Promise<void> {
    if (!hasSupabase || !supabase) {
      const session = loadSession();
      if (session) {
        session.profile.mustChangePassword = false;
        saveSession(session);
        const users = loadUsers();
        const target = users.find((u) => u.profile.id === session.profile.id);
        if (target) {
          target.password = newPassword;
          target.profile.mustChangePassword = false;
          saveUsers(users);
        }
      }
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },
};

export const formatAdminHtmlEmail = (subject: string, message: string): string => {
  const escapeHtml = (val: string) =>
    val
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const linkify = (escapedText: string) =>
    escapedText.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" style="color:#1c05b3;font-weight:700;text-decoration:underline;">$1</a>',
    );

  const paragraphs = escapeHtml(message)
    .split(/\n{2,}/)
    .map((paragraph) => {
      const formatted = linkify(paragraph.replaceAll("\n", "<br />"));
      return `<p style="margin:0 0 14px;color:#334155;line-height:1.75;font-size:14px;">${formatted}</p>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f8faff;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 16px 40px rgba(28,5,179,0.06);">
      
      <!-- Brand Header with Floating Trypan Blue Logo -->
      <tr>
        <td style="padding:36px 24px 20px;text-align:center;background:radial-gradient(circle at top,#eff1ff 0%,#ffffff 75%);border-bottom:1px solid #f1f5f9;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
            <tr>
              <td style="background:#1c05b3;border-radius:18px;padding:12px;text-align:center;box-shadow:0 10px 24px rgba(28,5,179,0.32);">
                <img src="https://neuralclash.dev/logo-m.png" alt="MindGrid" width="40" height="40" style="display:block;margin:0 auto;border:none;" />
              </td>
            </tr>
          </table>
          <h1 style="margin:14px 0 2px;font-size:22px;font-weight:900;color:#1c05b3;letter-spacing:-0.02em;line-height:1.2;">MindGrid</h1>
          <p style="margin:0;font-size:10px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">NEURAL CLASH &middot; KLYVEX STUDIOS</p>
        </td>
      </tr>

      <!-- Subject & Main Message Content -->
      <tr>
        <td style="padding:28px 28px 12px;">
          <div style="background:#f8faff;border:1px solid #e2e8f0;border-radius:20px;padding:24px 22px;">
            <h2 style="margin:0 0 16px;color:#0f172a;font-size:17px;font-weight:800;line-height:1.4;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">
              ${escapeHtml(subject)}
            </h2>
            <div>
              ${paragraphs}
            </div>
          </div>
        </td>
      </tr>

      <!-- Quick Action Button -->
      <tr>
        <td style="padding:8px 28px 24px;text-align:center;">
          <a href="https://neuralclash.dev/?install=pwa" target="_blank" style="display:inline-block;background:linear-gradient(180deg,#2406e2 0%,#1c05b3 100%);color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;border-radius:999px;padding:14px 32px;box-shadow:0 12px 24px rgba(28,5,179,0.25);">
            Launch MindGrid &rarr;
          </a>
        </td>
      </tr>

      <!-- Footer Security & Studio Attribution -->
      <tr>
        <td style="padding:20px 24px 28px;border-top:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:11px;line-height:1.6;">
          <p style="margin:0 0 4px;">Dispatched from secure admin gateway &middot; <a href="https://neuralclash.dev" style="color:#1c05b3;text-decoration:none;font-weight:600;">https://neuralclash.dev</a></p>
          <p style="margin:0;">Built by <strong>Klyvex Studios</strong> &middot; <a href="https://klyvex-studios.tech" style="color:#64748b;text-decoration:none;">https://klyvex-studios.tech</a></p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

