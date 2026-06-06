import type { RankTitle } from "../types";

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const normalizeUsername = (username: string) =>
  username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));

export const usernameToLegacyEmail = (username: string) =>
  `${normalizeUsername(username)}@mindgridplay.com`;

export const isLegacyAccountEmail = (email: string) =>
  normalizeEmail(email).endsWith("@mindgridplay.com");

export const calculateRank = (xp: number): RankTitle => {
  if (xp >= 12000) return "System Overlord";
  if (xp >= 8000) return "Quantum Architect";
  if (xp >= 4500) return "Mindbreaker";
  if (xp >= 2200) return "Synapse Hunter";
  if (xp >= 800) return "Cipher Agent";
  return "Neural Rookie";
};

export const getXpRequiredForLevel = (level: number) => {
  if (level <= 1) return 0;

  let total = 0;
  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += 220 + (currentLevel - 1) * 140;
  }
  return total;
};

export const getLevelFromXp = (xp: number) => {
  let level = 1;
  while (xp >= getXpRequiredForLevel(level + 1)) {
    level += 1;
  }
  return level;
};

export const getLevelProgress = (xp: number) => {
  const level = getLevelFromXp(xp);
  const levelStartXp = getXpRequiredForLevel(level);
  const nextLevelXp = getXpRequiredForLevel(level + 1);
  const progress = ((xp - levelStartXp) / (nextLevelXp - levelStartXp)) * 100;
  return { level, levelStartXp, nextLevelXp, progress: Math.min(100, Math.max(0, progress)) };
};

export const calculateRunXp = ({
  score,
  accuracy,
  maxCombo,
}: {
  score: number;
  accuracy: number;
  maxCombo: number;
}) => {
  const baseXp = 20;
  const scoreXp = Math.min(34, Math.floor(score / 900));
  const accuracyXp = Math.min(18, Math.floor(accuracy / 8));
  const comboXp = Math.min(16, maxCombo * 2);
  return Math.max(18, baseXp + scoreXp + accuracyXp + comboXp);
};

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-GB").format(value);

export const formatPercent = (value: number) =>
  `${Math.round(value)}%`;

export const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${mins}:${String(remainder).padStart(2, "0")}`;
};

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const parseAdminUsernames = () =>
  (import.meta.env.VITE_ADMIN_USERNAMES as string | undefined)
    ?.split(",")
    .map((value) => normalizeUsername(value))
    .filter(Boolean) ?? [];
