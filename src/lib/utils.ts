import type { RankTitle } from "../types";

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const normalizeUsername = (username: string) =>
  username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

export const usernameToEmail = (username: string) =>
  `${normalizeUsername(username)}@mindgrid.player`;

export const calculateRank = (xp: number): RankTitle => {
  if (xp >= 12000) return "System Overlord";
  if (xp >= 8000) return "Quantum Architect";
  if (xp >= 4500) return "Mindbreaker";
  if (xp >= 2200) return "Synapse Hunter";
  if (xp >= 800) return "Cipher Agent";
  return "Neural Rookie";
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
