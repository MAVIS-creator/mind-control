import { type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import {
  ClockIcon,
  GridIcon,
  PlayIcon,
  SparklesIcon,
  TrophyIcon,
} from "../components/AppIcons";
import { useAppContext } from "../state/AppContext";
import type { LeaderboardEntry } from "../types";
import type { ScoreBreakdown } from "../game/types";
import { formatDuration, formatNumber, formatPercent, getLevelProgress } from "../lib/utils";

type ResultsState = {
  entry: LeaderboardEntry;
  breakdown: ScoreBreakdown;
  accuracy: number;
  xpAwarded?: number;
  won: boolean;
};

export const ResultsRoute = () => {
  const { session } = useAppContext();
  const location = useLocation();
  const state = location.state as ResultsState | undefined;

  if (!state) {
    return <Navigate to="/play" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === state.entry.avatarId) ?? avatarOptions[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[#4f46e5]/10 blur-[100px]" />
        <div className="absolute bottom-10 right-0 h-[24rem] w-[24rem] rounded-full bg-[#862dd4]/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-20">
          <div className="mx-auto mt-32 grid max-w-md rotate-12 grid-cols-4 gap-4 blur-3xl">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-[1.4rem] ${
                  index % 4 === 0
                    ? "bg-[#4f46e5]"
                    : index % 4 === 1
                      ? "bg-[#64a8fe]"
                      : index % 4 === 2
                        ? "bg-[#862dd4]"
                        : "bg-[#3525cd]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-24 sm:px-6">
        {state.won ? (
          <SuccessSummary
            state={state}
            avatar={avatar.image}
            currentXp={session?.profile.xp ?? 0}
            rankLabel={session?.profile.rank ?? "Neural Rookie"}
          />
        ) : (
          <GameOverSummary state={state} avatar={avatar.image} />
        )}
      </main>
    </div>
  );
};

const SuccessSummary = ({
  state,
  avatar,
  currentXp,
  rankLabel,
}: {
  state: ResultsState;
  avatar: string;
  currentXp: number;
  rankLabel: string;
}) => (
  <SuccessSummaryCard state={state} avatar={avatar} currentXp={currentXp} rankLabel={rankLabel} />
);

const SuccessSummaryCard = ({
  state,
  avatar,
  currentXp,
  rankLabel,
}: {
  state: ResultsState;
  avatar: string;
  currentXp: number;
  rankLabel: string;
}) => {
  const progress = getLevelProgress(currentXp);
  const totalMatches = Math.round(state.breakdown.baseScore / 100);

  return (
    <section className="relative w-full max-w-xl">
      <div className="glass-panel relative overflow-hidden rounded-[2.3rem] p-6 shadow-[0_24px_54px_rgba(53,37,205,0.10)] sm:p-8">
        <div className="absolute right-0 top-0 rounded-bl-[1.4rem] rounded-tr-[2.3rem] bg-[#6b00b7] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
          Level Up!
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3525cd]">Session Complete</p>
          <h1 className="mt-3 font-display text-[3rem] font-extrabold tracking-[-0.07em] text-[#111c2d] sm:text-[4rem]">
            Excellent Focus!
          </h1>
        </div>

        <div className="mt-7 rounded-[2rem] border border-white/70 bg-white/45 px-6 py-7 text-center shadow-inner">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Final Score</p>
          <p className="my-2 text-[4.2rem] font-black leading-none tracking-[-0.08em] text-[#3525cd] sm:text-[5rem]">
            {formatNumber(state.breakdown.finalScore)}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-semibold text-[#3525cd]">
            <SparklesIcon className="h-4 w-4" />
            +{state.xpAwarded ?? 0} XP
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <GameOverTile
            icon={<GridIcon className="h-5 w-5" />}
            accent="text-[#0060ac]"
            label="Total Matches"
            value={`${totalMatches}`}
          />
          <GameOverTile
            icon={<ClockIcon className="h-5 w-5" />}
            accent="text-[#6b00b7]"
            label="Time Taken"
            value={formatDuration(state.entry.duration)}
          />
        </div>

        <div className="mt-7 space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Rank Progress</p>
              <p className="mt-1 text-[2rem] font-bold tracking-[-0.05em] text-[#111c2d]">{rankLabel}</p>
            </div>
            <img src={avatar} alt="Player avatar" className="h-16 w-16 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-[#111c2d]">{progress.level > 1 ? `Level ${progress.level}` : "Neural Rookie"}</p>
              <p className="text-sm text-[#5a6174]">Keep pushing your best runs to climb higher.</p>
            </div>
            <span className="text-sm font-semibold text-[#3525cd]">
              {currentXp} / {progress.nextLevelXp} XP
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-[#d8e3fb] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#64a8fe] via-[#4f46e5] to-[#6b00b7]"
              style={{ width: `${Math.max(8, progress.progress)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          to="/play/classic"
          className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-[1.4rem] bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-lg font-bold text-white shadow-[0_18px_34px_rgba(53,37,205,0.22)] transition hover:scale-[1.01]"
        >
          <PlayIcon className="h-5 w-5" />
          Play Again
        </Link>
        <Link
          to="/play"
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[1.4rem] border border-[#bcd1f6] bg-white/65 text-base font-bold text-[#0060ac] transition hover:bg-white"
        >
          <GridIcon className="h-5 w-5" />
          Back to Lobby
        </Link>
      </div>
    </section>
  );
};

const GameOverSummary = ({
  state,
  avatar,
}: {
  state: ResultsState;
  avatar: string;
}) => {
  const totalMatches = Math.round(state.breakdown.baseScore / 100);

  return (
    <section className="w-full max-w-2xl">
      <div className="glass-panel relative overflow-hidden rounded-[2.2rem] p-8 shadow-[0_24px_54px_rgba(53,37,205,0.10)] sm:p-10">
      <div className="absolute right-0 top-0 rounded-bl-[1.4rem] rounded-tr-[2.2rem] bg-[#6b00b7] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
        Session Complete
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3525cd]">Round Summary</p>
        <h1 className="mt-3 font-display text-[2.8rem] font-extrabold tracking-[-0.07em] text-[#111c2d] sm:text-[3.6rem]">
          Time Over
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-8 text-[#5a6174]">
          The run still saved. Review the breakdown, tighten the mistakes, and jump back in for a cleaner finish.
        </p>
      </div>

      <div className="mt-8 rounded-[1.9rem] border border-white/70 bg-white/45 px-6 py-7 text-center shadow-inner">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Final Score</p>
        <p className="my-2 text-[3.6rem] font-black leading-none tracking-[-0.08em] text-[#3525cd]">
          {formatNumber(state.breakdown.finalScore)}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-semibold text-[#3525cd]">
          <SparklesIcon className="h-4 w-4" />
          Saved to Hall of Fame
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <GameOverTile
          icon={<GridIcon className="h-5 w-5" />}
          accent="text-[#0060ac]"
          label="Total Matches"
          value={`${totalMatches}`}
        />
        <GameOverTile
          icon={<ClockIcon className="h-5 w-5" />}
          accent="text-[#6b00b7]"
          label="Time Taken"
          value={formatDuration(state.entry.duration)}
        />
      </div>

      <div className="mt-8 space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Run Breakdown</p>
            <p className="mt-1 text-lg font-bold text-[#111c2d]">Accuracy and score details</p>
          </div>
          <img src={avatar} alt="Player avatar" className="h-14 w-14 rounded-full border-2 border-white bg-slate-100 shadow-sm" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <BreakdownRow label="Accuracy" value={formatPercent(state.accuracy)} />
          <BreakdownRow label="Max Combo" value={`x${state.entry.maxCombo}`} />
          <BreakdownRow label="Combo Bonus" value={formatNumber(state.breakdown.comboBonus)} />
          <BreakdownRow label="Mistake Penalty" value={`-${formatNumber(state.breakdown.mistakePenalty)}`} />
        </div>
      </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/play/classic"
          className="inline-flex h-16 flex-1 items-center justify-center gap-3 rounded-[1.4rem] bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-lg font-bold text-white shadow-[0_18px_34px_rgba(53,37,205,0.22)] transition hover:scale-[1.01]"
        >
          <PlayIcon className="h-5 w-5" />
          Play Again
        </Link>
        <Link
          to="/play"
          className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-[1.4rem] border border-[#bcd1f6] bg-white/65 text-base font-bold text-[#0060ac] transition hover:bg-white"
        >
          <TrophyIcon className="h-5 w-5" />
          Back to Lobby
        </Link>
      </div>
    </section>
  );
};

const GameOverTile = ({
  icon,
  accent,
  label,
  value,
}: {
  icon: ReactNode;
  accent: string;
  label: string;
  value: string;
}) => (
  <div className="flex flex-col rounded-[1.5rem] border border-white/40 bg-[#f0f3ff] p-4">
    <div className={`${accent} mb-2`}>{icon}</div>
    <span className="text-sm text-[#5a6174]">{label}</span>
    <span className="mt-1 text-2xl font-bold text-[#111c2d]">{value}</span>
  </div>
);

const BreakdownRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.4rem] border border-[#e1e6f4] bg-white/72 px-4 py-3">
    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7d8395]">{label}</div>
    <div className="mt-1 text-sm font-medium text-[#111c2d]">{value}</div>
  </div>
);
