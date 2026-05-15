import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { MindGridCanvas } from "../game/phaser/MindGridCanvas";
import { useClassicGame } from "../game/useClassicGame";
import { StatPill } from "../components/StatPill";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const GameRoute = () => {
  const { session, submitRun } = useAppContext();
  const navigate = useNavigate();
  const { state, results, reveal, reset, togglePause } = useClassicGame();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!session || submitted || (state.status !== "won" && state.status !== "lost")) return;

    const persist = async () => {
      const entry = await submitRun({
        mode: "classic",
        score: results.breakdown.finalScore,
        accuracy: Number(results.accuracy.toFixed(2)),
        maxCombo: state.maxCombo,
        duration: 75 - state.timerRemaining,
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

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/play"
            className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.32em] text-white/60"
          >
            Exit to hub
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={togglePause}
              className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.32em] text-white/70"
            >
              {state.status === "paused" ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-2xl bg-white/12 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white"
            >
              Restart
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <StatPill label="Timer" value={formatDuration(state.timerRemaining)} />
              <StatPill label="Score" value={formatNumber(results.breakdown.finalScore)} accent="violet" />
              <StatPill label="Combo" value={`x${Math.max(1, state.combo)}`} />
              <StatPill label="Accuracy" value={formatPercent(results.accuracy)} accent="violet" />
            </div>
            <MindGridCanvas state={state} onReveal={reveal} />
          </div>

          <aside className="glass-panel rounded-[2rem] p-5">
            <p className="font-display text-xs uppercase tracking-[0.24em] text-amber-100">
              Match stats
            </p>
            <div className="mt-5 space-y-4">
              {[
                ["Round state", instability],
                ["Pairs cleared", `${state.matches}/8`],
                ["Mismatches", `${state.mismatches}`],
                ["Moves", `${state.moves}`],
                ["Max combo", `x${state.maxCombo}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-[0.65rem] uppercase tracking-[0.28em] text-white/45">{label}</div>
                  <div className="mt-2 font-display text-lg uppercase tracking-[0.12em] text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/8 p-4 text-sm leading-6 text-white/65">
              Match quickly to build higher combo bonuses. Clean rounds with fewer mistakes produce the best final scores.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
