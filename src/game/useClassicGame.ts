import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  calculateResults,
  createInitialGameState,
  pauseGame,
  resolveSelection,
  revealCard,
  tickGame,
} from "./engine";

type Action =
  | { type: "reveal"; cardId: string }
  | { type: "resolve" }
  | { type: "tick" }
  | { type: "pause" }
  | { type: "reset" };

const reducer = (state = createInitialGameState(), action: Action) => {
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
      return createInitialGameState();
    default:
      return state;
  }
};

export const useClassicGame = () => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialGameState);

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

  return {
    state,
    results,
    reveal: useCallback((cardId: string) => dispatch({ type: "reveal", cardId }), []),
    reset: useCallback(() => dispatch({ type: "reset" }), []),
    togglePause: useCallback(() => dispatch({ type: "pause" }), []),
  };
};
