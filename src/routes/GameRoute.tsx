import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ClockIcon, GridIcon, PauseIcon, PlayIcon, RefreshIcon, SparklesIcon } from "../components/AppIcons";
import { MindGridCanvas } from "../game/phaser/MindGridCanvas";
import { useFairPlayMonitor } from "../game/useFairPlayMonitor";
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
  const audit = useFairPlayMonitor(state.events, state.status);

  useEffect(() => {
    if (!session || submitted || (state.status !== "won" && state.status !== "lost")) return;

    const persist = async () => {
      const entry = await submitRun({
        mode: "classic",
        score: results.breakdown.finalScore,
        accuracy: Number(results.accuracy.toFixed(2)),
        maxCombo: state.maxCombo,
        duration: GRID_OPTIONS[settings.gridSize].totalTimeSeconds - state.timerRemaining,
        audit,
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
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
        <div className="glass-panel flex flex-col gap-3 rounded-[2rem] px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div className="text-center sm:text-left">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/50">Classic board</p>
            <h1 className="font-display text-2xl uppercase tracking-[0.08em] text-white sm:text-3xl">
              Memory
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#304859] px-3 py-3 text-[0.65rem] uppercase tracking-[0.18em] text-white sm:px-4 sm:text-xs"
            >
              {state.status === "paused" ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
              {state.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#dfe7ec] px-3 py-3 text-[0.65rem] uppercase tracking-[0.16em] text-[#304859] sm:px-4 sm:text-xs"
            >
              <RefreshIcon className="h-4 w-4" />
              Restart
            </button>
            <Link
              to="/play"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#dfe7ec] px-3 py-3 text-center text-[0.65rem] uppercase tracking-[0.16em] text-[#304859] sm:px-4 sm:text-xs"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              New game
            </Link>
          </div>
        </div>

        <MindGridCanvas state={state} onReveal={reveal} />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatPill label="Time" value={formatDuration(state.timerRemaining)} icon={<ClockIcon className="h-4 w-4" />} />
          <StatPill label="Moves" value={`${state.moves}`} accent="violet" icon={<RefreshIcon className="h-4 w-4" />} />
          <StatPill label="Pairs" value={`${state.matches}/${totalPairs}`} icon={<GridIcon className="h-4 w-4" />} />
          <StatPill label="Score" value={formatNumber(results.breakdown.finalScore)} accent="violet" icon={<SparklesIcon className="h-4 w-4" />} />
          <StatPill label="Theme" value={settings.theme === "numbers" ? "Numbers" : "Icons"} icon={<SparklesIcon className="h-4 w-4" />} />
        </div>

        <div className="glass-panel rounded-[2rem] p-4 text-sm leading-6 text-white/70 sm:p-5 sm:leading-7">
          Current setup: {GRID_OPTIONS[settings.gridSize].label} board, {GRID_OPTIONS[settings.gridSize].totalTimeSeconds}s timer,
          {settings.theme === "numbers" ? " number" : " icon"} cards, status {instability.toLowerCase()}, accuracy {formatPercent(results.accuracy)},
          and best combo x{state.maxCombo}.
        </div>

        {audit.suspicionScore > 0 ? (
          <div className="glass-panel rounded-[2rem] border border-amber-300/20 p-4 text-sm leading-6 text-white/70">
            Fair-play monitor is active. This run has {audit.suspicionScore} suspicious signal{audit.suspicionScore > 1 ? "s" : ""} logged for admin review.
          </div>
        ) : null}
      </div>
    </div>
  );
};
