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

export type GamePreferences = {
  masterVolume: number;
  soundEffects: boolean;
  music: boolean;
  haptics: boolean;
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
  email: string;
  avatarId: string;
  xp: number;
  rank: RankTitle;
  createdAt: string;
  isAdmin: boolean;
  isBetaTester?: boolean;
  hasClaimedBetaReward?: boolean;
  lastSeenAt?: string;
  mustChangePassword?: boolean;
};

export type PlayerStats = {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  bestAccuracy: number;
  bestCombo: number;
  totalPoints: number;
  multiplayerWins?: number;
  multiplayerLosses?: number;
  multiplayerTotal?: number;
  coopClears?: number;
};

export type PlayerSnapshot = {
  profile: PlayerProfile;
  stats: PlayerStats;
  recentRuns: LeaderboardEntry[];
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
  email: string;
  avatarId: string;
  mode: "classic";
  matchType: MatchType;
  gridSize: GridSize;
  score: number;
  rating: number;
  totalPoints: number;
  won: boolean;
  accuracy: number;
  maxCombo: number;
  duration: number;
  movesUsed: number;
  moveLimit: number;
  playedAt: string;
  audit: RunAudit;
};

export type AuthSession = {
  profile: PlayerProfile;
  accessToken?: string;
};

export type RegisterResult = {
  session: AuthSession | null;
  verificationEmail?: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  avatarId: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type AdminEmailPayload = {
  recipientIds: string[];
  subject: string;
  message: string;
};

export type AdminEmailResult = {
  sent: number;
  recipients: string[];
};

export type AppSnapshot = {
  profile: PlayerProfile | null;
  leaderboard: LeaderboardEntry[];
};

export type MultiplayerGameMode = "turn_based" | "speed_sprint" | "coop";
export type RoomStatus = "waiting" | "playing" | "finished";

export type MultiplayerRoom = {
  id: string;
  roomCode: string;
  hostId: string;
  guestId: string | null;
  gameMode: MultiplayerGameMode;
  gridSize: GridSize;
  theme: GameTheme;
  seed: number;
  status: RoomStatus;
  currentTurnId: string | null;
  hostReady: boolean;
  guestReady: boolean;
  scores: {
    host: number;
    guest: number;
  };
  winnerId: string | null;
  createdAt: string;
  updatedAt: string;
  hostProfile?: PlayerProfile;
  guestProfile?: PlayerProfile;
};

