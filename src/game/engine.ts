import type { GameSetupSettings } from "../types";
import { getCardSymbols } from "./cardPool";
import { createClassicModeConfig } from "./config";
import { createBoard } from "./createBoard";
import { calculateScoreBreakdown, comboMultiplierFor } from "./scoring";
import type { CardNode, GameEvent, GameSessionState } from "./types";

const createEvent = (
  type: GameEvent["type"],
  payload?: GameEvent["payload"],
): GameEvent => ({
  type,
  payload,
  timestamp: Date.now(),
});

export const createInitialGameState = (settings: GameSetupSettings): GameSessionState => {
  const config = createClassicModeConfig(settings);

  return {
  board: createBoard(getCardSymbols(settings.theme), config.rows, config.columns),
  theme: settings.theme,
  gridSize: settings.gridSize,
  score: 0,
  timerRemaining: config.totalTimeSeconds,
  matches: 0,
  mismatches: 0,
  moves: 0,
  combo: 0,
  maxCombo: 0,
  status: "idle",
  selectedIds: [],
  events: [],
  };
};

export const revealCard = (state: GameSessionState, cardId: string): GameSessionState => {
  if (state.status === "won" || state.status === "lost" || state.selectedIds.length >= 2) {
    return state;
  }

  const targetCard = state.board.cards.find((card) => card.id === cardId);
  if (!targetCard || targetCard.matched || targetCard.revealed) return state;

  return {
    ...state,
    status: state.status === "idle" ? "running" : state.status,
    board: {
      ...state.board,
      cards: state.board.cards.map((card) =>
        card.id === cardId ? { ...card, revealed: true } : card,
      ),
    },
    selectedIds: [...state.selectedIds, cardId],
    events: [...state.events, createEvent("card_flipped", { cardId })],
  };
};

const withUpdatedCards = (
  state: GameSessionState,
  updater: (card: CardNode) => CardNode,
): GameSessionState => ({
  ...state,
  board: {
    ...state.board,
    cards: state.board.cards.map(updater),
  },
});

export const resolveSelection = (state: GameSessionState): GameSessionState => {
  if (state.selectedIds.length !== 2) return state;
  const config = createClassicModeConfig({
    theme: state.theme,
    gridSize: state.gridSize as GameSetupSettings["gridSize"],
  });

  const [firstId, secondId] = state.selectedIds;
  const first = state.board.cards.find((card) => card.id === firstId);
  const second = state.board.cards.find((card) => card.id === secondId);

  if (!first || !second) return { ...state, selectedIds: [] };

  const nextMoves = state.moves + 1;
  const isMatch = first.symbol === second.symbol;

  if (isMatch) {
    const nextCombo = state.combo + 1;
    const multiplier = comboMultiplierFor(nextCombo);
    const nextScore = state.score + config.baseMatchScore * multiplier;
    const nextState = withUpdatedCards(state, (card) =>
      card.id === firstId || card.id === secondId
        ? { ...card, matched: true, revealed: true }
        : card,
    );

    const matches = state.matches + 1;
    const won = matches === nextState.board.cards.length / 2;

    return {
      ...nextState,
      score: nextScore,
      matches,
      moves: nextMoves,
      combo: nextCombo,
      maxCombo: Math.max(state.maxCombo, nextCombo),
      selectedIds: [],
      status: won ? "won" : nextState.status,
      events: [
        ...nextState.events,
        createEvent("match_resolved", { symbol: first.symbol, combo: nextCombo, match: true }),
        createEvent("combo_changed", { combo: nextCombo }),
        ...(won ? [createEvent("game_finished", { won: true })] : []),
      ],
    };
  }

  const nextState = withUpdatedCards(state, (card) =>
    card.id === firstId || card.id === secondId ? { ...card, revealed: false } : card,
  );

  return {
    ...nextState,
    score: Math.max(0, state.score - config.mistakePenalty),
    mismatches: state.mismatches + 1,
    moves: nextMoves,
    combo: 0,
    selectedIds: [],
    events: [
      ...nextState.events,
      createEvent("match_resolved", { symbol: first.symbol, combo: 0, match: false }),
      createEvent("combo_changed", { combo: 0 }),
      createEvent("corruption_triggered", { mismatches: state.mismatches + 1 }),
    ],
  };
};

export const tickGame = (state: GameSessionState): GameSessionState => {
  if (state.status !== "running") return state;

  if (state.timerRemaining <= 1) {
    return {
      ...state,
      timerRemaining: 0,
      status: "lost",
      events: [...state.events, createEvent("game_finished", { won: false })],
    };
  }

  return {
    ...state,
    timerRemaining: state.timerRemaining - 1,
  };
};

export const pauseGame = (state: GameSessionState): GameSessionState => ({
  ...state,
  status: state.status === "paused" ? "running" : "paused",
});

export const calculateResults = (state: GameSessionState) => {
  const config = createClassicModeConfig({
    theme: state.theme,
    gridSize: state.gridSize as GameSetupSettings["gridSize"],
  });
  const accuracy = state.moves ? (state.matches / state.moves) * 100 : 0;
  const breakdown = calculateScoreBreakdown({
    config,
    matches: state.matches,
    maxCombo: state.maxCombo,
    mistakes: state.mismatches,
    accuracy,
    timeRemaining: state.timerRemaining,
  });

  return {
    accuracy,
    breakdown,
  };
};
