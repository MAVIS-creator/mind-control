import { Link, Navigate, useLocation } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import type { LeaderboardEntry } from "../types";
import type { ScoreBreakdown } from "../game/types";
import { formatNumber, formatPercent } from "../lib/utils";

type ResultsState = {
  entry: LeaderboardEntry;
  breakdown: ScoreBreakdown;
  accuracy: number;
  won: boolean;
};

export const ResultsRoute = () => {
  const location = useLocation();
  const state = location.state as ResultsState | undefined;

  if (!state) {
    return <Navigate to="/play" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === state.entry.avatarId) ?? avatarOptions[0];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                Round summary
              </p>
              <h1 className="mt-3 font-display text-4xl tracking-[-0.04em] text-slate-900">
                {state.won ? "Round cleared" : "Time over"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Your score has been saved. Check the breakdown, then jump back in for a better combo chain.
              </p>
            </div>
            <img
              src={avatar.image}
              alt={avatar.name}
              className="h-24 w-24 rounded-[1.8rem] border-4 border-white bg-slate-100"
            />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Final score", formatNumber(state.breakdown.finalScore)],
              ["Accuracy", formatPercent(state.accuracy)],
              ["Max combo", `x${state.entry.maxCombo}`],
              ["Duration", `${state.entry.duration}s`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">{label}</div>
                <div className="mt-2 font-display text-lg tracking-[-0.03em] text-slate-900">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Base score", state.breakdown.baseScore],
              ["Combo bonus", state.breakdown.comboBonus],
              ["Time bonus", state.breakdown.timeBonus],
              ["Accuracy bonus", state.breakdown.accuracyBonus],
              ["Mistake penalty", -state.breakdown.mistakePenalty],
              ["Difficulty multiplier", state.breakdown.difficultyMultiplier],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-500">{label}</div>
                <div className="mt-1 text-sm text-slate-800">
                  {typeof value === "number" ? formatNumber(value) : value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/play/classic"
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-white"
          >
            Run again
          </Link>
          <Link
            to="/play"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm uppercase tracking-[0.28em] text-slate-600"
          >
            Back to hub
          </Link>
        </div>
      </div>
    </div>
  );
};
