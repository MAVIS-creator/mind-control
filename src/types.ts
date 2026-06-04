export type AvatarOption = {
  id: string;
  name: string;
  image: string;
  accent: string;
};

export type GameTheme = "numbers" | "icons";
export type GridSize = "4x4" | "5x6" | "6x6";
export type MatchType = "standard" | "numbers" | "icons";

export type GameSetupSettings = {
  theme: GameTheme;
  gridSize: GridSize;
  level?: number;
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
  isAdmin: boolean;
};

export type ReviewStatus = "pending" | "approved" | "flagged";

export type RunAudit = {
  suspicionScore: number;
  suspicionReasons: string[];
  automationFlag: boolean;
  fastInputFlag: boolean;
  hiddenTabFlag: boolean;
  rapidSequenceCount: number;
  reviewedStatus: ReviewStatus;
  reviewedNote: string;
};

export type LeaderboardEntry = {
  id: string;
  userId: string;
  username: string;
  avatarId: string;
  mode: "classic";
  matchType: MatchType;
  gridSize: GridSize;
  score: number;
  rating: number;
  totalPoints: number;
  accuracy: number;
  maxCombo: number;
  duration: number;
  playedAt: string;
  audit: RunAudit;
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
