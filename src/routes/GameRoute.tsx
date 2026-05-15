import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MindGridCanvas } from "../game/phaser/MindGridCanvas";
import { useClassicGame } from "../game/useClassicGame";
import { StatPill } from "../components/StatPill";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import { GRID_OPTIONS } from "../game/config";

export const GameRoute = () => {
  const { session, submitRun, settings } = useAppContext();
  const navigate = useNavigate();
  const { state, results, reveal, reset, togglePause } = useClassicGame(settings);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!session || submitted || (state.status !== "won" && state.status !== "lost")) return;

    const persist = async () => {
      const entry = await submitRun({
        mode: "classic",
        score: results.breakdown.finalScore,
        accuracy: Number(results.accuracy.toFixed(2)),
        maxCombo: state.maxCombo,
        duration: GRID_OPTIONS[settings.gridSize].totalTimeSeconds - state.timerRemaining,
      });
      setSubmitted(true);
      navigate(`/results/${entry.id}`, {
        state: {
          entry,
          breakdown: results.breakdown,
          accuracy: results.accuracy,
          won: state.status === "won",
        },
      });
    };

    void persist();
  }, [
    navigate,
    results.accuracy,
    results.breakdown,
    session,
    state.maxCombo,
    state.status,
    state.timerRemaining,
    submitRun,
    submitted,
  ]);

  const instability = useMemo(() => {
    if (state.timerRemaining <= 12) return "Critical";
    if (state.timerRemaining <= 28) return "Unstable";
    return "Nominal";
  }, [state.timerRemaining]);
  const totalPairs = state.board.cards.length / 2;

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-[2rem] px-5 py-4">
          <h1 className="font-display text-3xl uppercase tracking-[0.08em] text-white">
            Memory
          </h1>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={togglePause}
              className="rounded-2xl bg-[#304859] px-4 py-3 text-xs uppercase tracking-[0.22em] text-white"
            >
              {state.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-2xl bg-[#dfe7ec] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#304859]"
            >
              Restart
            </button>
            <Link
              to="/play"
              className="rounded-2xl bg-[#dfe7ec] px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#304859]"
            >
              New game
            </Link>
          </div>
        </div>

        <MindGridCanvas state={state} onReveal={reveal} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatPill label="Time" value={formatDuration(state.timerRemaining)} />
          <StatPill label="Moves" value={`${state.moves}`} accent="violet" />
          <StatPill label="Pairs" value={`${state.matches}/${totalPairs}`} />
          <StatPill label="Score" value={formatNumber(results.breakdown.finalScore)} accent="violet" />
          <StatPill label="Theme" value={settings.theme === "numbers" ? "Numbers" : "Icons"} />
        </div>

        <div className="glass-panel rounded-[2rem] p-5 text-sm leading-7 text-white/70">
          Current setup: {GRID_OPTIONS[settings.gridSize].label} board, {GRID_OPTIONS[settings.gridSize].totalTimeSeconds}s timer,
          {settings.theme === "numbers" ? " number" : " icon"} cards, status {instability.toLowerCase()}, accuracy {formatPercent(results.accuracy)},
          and best combo x{state.maxCombo}.
        </div>
      </div>
    </div>
  );
};
