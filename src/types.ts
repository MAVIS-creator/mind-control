export type AvatarOption = {
  id: string;
  name: string;
  image: string;
  accent: string;
};

export type GameTheme = "numbers" | "icons";
export type GridSize = "4x4" | "5x6" | "6x6";

export type GameSetupSettings = {
  theme: GameTheme;
  gridSize: GridSize;
};

export type RankTitle =
  | "Neural Rookie"
  | "Cipher Agent"
  | "Synapse Hunter"
  | "Mindbreaker"
  | "Quantum Architect"
  | "System Overlord";

export type PlayerProfile = {
  id: string;
  username: string;
  avatarId: string;
  xp: number;
  rank: RankTitle;
  createdAt: string;
};

export type LeaderboardEntry = {
  id: string;
  userId: string;
  username: string;
  avatarId: string;
  mode: "classic";
  score: number;
  accuracy: number;
  maxCombo: number;
  duration: number;
  playedAt: string;
};

export type AuthSession = {
  profile: PlayerProfile;
  accessToken?: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  avatarId: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type AppSnapshot = {
  profile: PlayerProfile | null;
  leaderboard: LeaderboardEntry[];
};
