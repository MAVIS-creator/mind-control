import type { AppSnapshot, AuthSession, LeaderboardEntry, PlayerProfile } from "../types";

const PROFILE_KEY = "mindgrid.profile";
const SESSION_KEY = "mindgrid.session";
const USERS_KEY = "mindgrid.users";
const BOARD_KEY = "mindgrid.leaderboard";

type StoredUser = {
  profile: PlayerProfile;
  password: string;
};

const safeStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const loadSession = (): AuthSession | null => {
  const storage = safeStorage();
  if (!storage) return null;
  const raw = storage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as AuthSession) : null;
};

export const saveSession = (session: AuthSession | null) => {
  const storage = safeStorage();
  if (!storage) return;
  if (!session) {
    storage.removeItem(SESSION_KEY);
    return;
  }
  storage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadUsers = (): StoredUser[] => {
  const storage = safeStorage();
  if (!storage) return [];
  const raw = storage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
};

export const saveUsers = (users: StoredUser[]) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loadLeaderboard = (): LeaderboardEntry[] => {
  const storage = safeStorage();
  if (!storage) return [];
  const raw = storage.getItem(BOARD_KEY);
  return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
};

export const saveLeaderboard = (entries: LeaderboardEntry[]) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(BOARD_KEY, JSON.stringify(entries));
};

export const snapshotApp = (): AppSnapshot => {
  const session = loadSession();
  return {
    profile: session?.profile ?? null,
    leaderboard: loadLeaderboard(),
  };
};

export const clearAppStorage = () => {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(PROFILE_KEY);
  storage.removeItem(SESSION_KEY);
  storage.removeItem(USERS_KEY);
  storage.removeItem(BOARD_KEY);
};
