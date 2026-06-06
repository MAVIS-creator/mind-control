import type { GameSetupSettings, GridSize } from "../types";

export const GRID_OPTIONS: Record<
  GridSize,
  {
    label: string;
    rows: number;
    columns: number;
    totalTimeSeconds: number;
    difficultyMultiplier: number;
  }
> = {
  "4x4": {
    label: "4 x 4",
    rows: 4,
    columns: 4,
    totalTimeSeconds: 75,
    difficultyMultiplier: 1.25,
  },
  "5x6": {
    label: "5 x 6",
    rows: 5,
    columns: 6,
    totalTimeSeconds: 120,
    difficultyMultiplier: 1.55,
  },
  "6x6": {
    label: "6 x 6",
    rows: 6,
    columns: 6,
    totalTimeSeconds: 145,
    difficultyMultiplier: 1.8,
  },
};

export const DEFAULT_GAME_SETTINGS: GameSetupSettings = {
  theme: "numbers",
  gridSize: "4x4",
};

export const DEFAULT_GAME_PREFERENCES = {
  masterVolume: 72,
  soundEffects: true,
  music: true,
  haptics: false,
} as const;

export const createClassicModeConfig = (settings: GameSetupSettings) => {
  const grid = GRID_OPTIONS[settings.gridSize];

  return {
    ...grid,
    baseMatchScore: 100,
    mistakePenalty: 35,
    comboBoost: 0.45,
    timeBonusMultiplier: 12,
    accuracyBonusMultiplier: 350,
  };
};
