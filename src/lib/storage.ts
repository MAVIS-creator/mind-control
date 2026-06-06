import type { AppSnapshot, AuthSession, GamePreferences, LeaderboardEntry, PlayerProfile } from "../types";

const SESSION_KEY = "mindgrid.session";
const USERS_KEY = "mindgrid.users";
const BOARD_KEY = "mindgrid.leaderboard";
const ACCOUNT_BOARD_KEY = "mindgrid.accountLeaderboard";
const SETTINGS_KEY = "mindgrid.settings";
const PREFERENCES_KEY = "mindgrid.preferences";

export type StoredUser = {
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

export const loadAccountLeaderboard = (): LeaderboardEntry[] => {
  const storage = safeStorage();
  if (!storage) return [];
  const raw = storage.getItem(ACCOUNT_BOARD_KEY);
  return raw ? (JSON.parse(raw) as LeaderboardEntry[]) : [];
};

export const saveAccountLeaderboard = (entries: LeaderboardEntry[]) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(ACCOUNT_BOARD_KEY, JSON.stringify(entries));
};

export const snapshotApp = (): AppSnapshot => {
  const session = loadSession();
  return {
    profile: session?.profile ?? null,
    leaderboard: loadLeaderboard(),
  };
};

export const loadSettings = <T>(fallback: T): T => {
  const storage = safeStorage();
  if (!storage) return fallback;
  const raw = storage.getItem(SETTINGS_KEY);
  return raw ? (JSON.parse(raw) as T) : fallback;
};

export const saveSettings = <T>(value: T) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(SETTINGS_KEY, JSON.stringify(value));
};

export const loadPreferences = <T extends GamePreferences>(fallback: T): T => {
  const storage = safeStorage();
  if (!storage) return fallback;
  const raw = storage.getItem(PREFERENCES_KEY);
  return raw ? ({ ...fallback, ...(JSON.parse(raw) as Partial<T>) } as T) : fallback;
};

export const savePreferences = <T extends GamePreferences>(value: T) => {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(PREFERENCES_KEY, JSON.stringify(value));
};

export const clearAppStorage = () => {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(SESSION_KEY);
  storage.removeItem(USERS_KEY);
  storage.removeItem(BOARD_KEY);
  storage.removeItem(ACCOUNT_BOARD_KEY);
  storage.removeItem(SETTINGS_KEY);
  storage.removeItem(PREFERENCES_KEY);
};
