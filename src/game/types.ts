export type CardNode = {
  id: string;
  symbol: string;
  matched: boolean;
  revealed: boolean;
};

export type BoardLayout = {
  rows: number;
  columns: number;
  cards: CardNode[];
};

export type ScoreBreakdown = {
  baseScore: number;
  comboBonus: number;
  timeBonus: number;
  accuracyBonus: number;
  mistakePenalty: number;
  difficultyMultiplier: number;
  finalScore: number;
};

export type GameEventType =
  | "card_flipped"
  | "match_resolved"
  | "combo_changed"
  | "corruption_triggered"
  | "game_finished";

export type GameEvent = {
  type: GameEventType;
  timestamp: number;
  payload?: Record<string, number | string | boolean>;
};

export type GameStatus = "idle" | "running" | "won" | "lost" | "paused";

export type GameSessionState = {
  board: BoardLayout;
  theme: "numbers" | "icons";
  gridSize: string;
  score: number;
  timerRemaining: number;
  matches: number;
  mismatches: number;
  moves: number;
  combo: number;
  maxCombo: number;
  status: GameStatus;
  selectedIds: string[];
  events: GameEvent[];
};
