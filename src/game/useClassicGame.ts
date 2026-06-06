import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { GamePreferences, GameSetupSettings } from "../types";
import {
  calculateResults,
  createInitialGameState,
  pauseGame,
  resolveSelection,
  revealCard,
  tickGame,
} from "./engine";
import { useGameAudio } from "./useGameAudio";

type Action =
  | { type: "reveal"; cardId: string }
  | { type: "resolve" }
  | { type: "tick" }
  | { type: "pause" }
  | { type: "reset"; settings: GameSetupSettings };

const reducer = (state: ReturnType<typeof createInitialGameState>, action: Action) => {
  switch (action.type) {
    case "reveal":
      return revealCard(state, action.cardId);
    case "resolve":
      return resolveSelection(state);
    case "tick":
      return tickGame(state);
    case "pause":
      return pauseGame(state);
    case "reset":
      return createInitialGameState(action.settings);
    default:
      return state;
  }
};

export const useClassicGame = (settings: GameSetupSettings, preferences: GamePreferences, level = 1) => {
  const settingsWithLevel = useMemo(() => ({ ...settings, level }), [level, settings]);
  const [state, dispatch] = useReducer(reducer, settingsWithLevel, createInitialGameState as any);

  useEffect(() => {
    dispatch({ type: "reset", settings: settingsWithLevel as GameSetupSettings });
  }, [settingsWithLevel]);

  useEffect(() => {
    if (state.selectedIds.length !== 2) return undefined;
    const timeout = window.setTimeout(() => dispatch({ type: "resolve" }), 650);
    return () => window.clearTimeout(timeout);
  }, [state.selectedIds.length]);

  useEffect(() => {
    if (state.status !== "running") return undefined;
    const interval = window.setInterval(() => dispatch({ type: "tick" }), 1000);
    return () => window.clearInterval(interval);
  }, [state.status]);

  const results = useMemo(() => calculateResults(state), [state]);
  useGameAudio(state.events, preferences, state.status);

  return {
    state,
    results,
    reveal: useCallback((cardId: string) => dispatch({ type: "reveal", cardId }), []),
    reset: useCallback(() => dispatch({ type: "reset", settings: settingsWithLevel as GameSetupSettings }), [settingsWithLevel]),
    togglePause: useCallback(() => dispatch({ type: "pause" }), []),
  };
};
