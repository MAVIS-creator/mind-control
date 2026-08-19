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
    <div className="relative h-[100dvh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#eff1ff_0%,_#f8faff_42%,_#dbeafe_100%)] dark:bg-none dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[#2406e2]/12 blur-[100px]" />
        <div className="absolute bottom-10 right-0 h-[24rem] w-[24rem] rounded-full bg-[#1c05b3]/10 blur-[100px]" />
        <div className="absolute inset-0 opacity-20">
          <div className="mx-auto mt-32 grid max-w-md rotate-12 grid-cols-4 gap-4 blur-3xl">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`aspect-square rounded-[1.4rem] ${
                  index % 4 === 0
                    ? "bg-[#1c05b3]"
                    : index % 4 === 1
                      ? "bg-[#2406e2]"
                      : index % 4 === 2
                        ? "bg-[#2406e2]"
                        : "bg-[#140494]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto flex min-h-full max-w-5xl items-center justify-center px-4 py-5 sm:px-6 lg:py-8">
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
      <div className="glass-panel relative overflow-hidden rounded-[1.8rem] p-5 shadow-[0_24px_54px_rgba(28,5,179,0.10)] sm:rounded-[2.3rem] sm:p-8">
        <div className="absolute right-0 top-0 rounded-bl-[1.4rem] rounded-tr-[2.3rem] bg-gradient-to-r from-[#1c05b3] to-[#140494] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
          Level Up!
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c05b3] dark:text-sky-400">Session Complete</p>
          <h1 className="mt-2 font-display text-[2.1rem] font-extrabold tracking-[-0.04em] text-[#0f172a] dark:text-white sm:mt-3 sm:text-[4rem]">
            Excellent Focus!
          </h1>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-white/70 bg-white/45 px-4 py-5 text-center shadow-inner sm:mt-7 sm:rounded-[2rem] sm:px-6 sm:py-7 dark:border-slate-800 dark:bg-slate-950/60">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b] dark:text-slate-400">Final Score</p>
          <p className="my-2 text-[3.1rem] font-black leading-none tracking-[-0.04em] text-[#140494] dark:text-sky-400 sm:text-[5rem]">
            {formatNumber(state.breakdown.finalScore)}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eff1ff] px-4 py-2 text-sm font-semibold text-[#2406e2] dark:bg-slate-800 dark:text-sky-300">
            <SparklesIcon className="h-4 w-4" />
            +{state.xpAwarded ?? 0} XP
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
          <GameOverTile
            icon={<GridIcon className="h-5 w-5" />}
            accent="text-[#2406e2]"
            label="Total Matches"
            value={`${totalMatches}`}
          />
          <GameOverTile
            icon={<ClockIcon className="h-5 w-5" />}
            accent="text-[#1c05b3]"
            label="Time Taken"
            value={formatDuration(state.entry.duration)}
          />
        </div>

        <div className="mt-5 space-y-3 sm:mt-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b] dark:text-slate-400">Rank Progress</p>
              <p className="mt-1 text-[1.35rem] font-bold tracking-[-0.03em] text-[#0f172a] dark:text-white sm:text-[2rem]">{rankLabel}</p>
            </div>
            <img src={avatar} alt="Player avatar" className="h-12 w-12 rounded-full border-2 border-white bg-slate-100 shadow-sm sm:h-16 sm:w-16" />
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-[#0f172a] dark:text-white">{progress.level > 1 ? `Level ${progress.level}` : "Neural Rookie"}</p>
              <p className="text-sm text-[#64748b] dark:text-slate-400">Keep pushing your best runs to climb higher.</p>
            </div>
            <span className="text-sm font-semibold text-[#2406e2] dark:text-sky-400">
              {currentXp} / {progress.nextLevelXp} XP
            </span>
          </div>
          <div className="h-4 w-full rounded-full bg-[#dbeafe] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2406e2] via-[#1c05b3] to-[#140494]"
              style={{ width: `${Math.max(8, progress.progress)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-5">
        <Link
          to="/play/classic"
          className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-[1.4rem] bg-gradient-to-b from-[#1c05b3] to-[#140494] text-base font-bold text-white shadow-[0_18px_34px_rgba(28,5,179,0.22)] transition hover:scale-[1.01] sm:h-16 sm:text-lg"
        >
          <PlayIcon className="h-5 w-5" />
          Play Again
        </Link>
        <Link
          to="/play"
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-[1.4rem] border border-[#bfdbfe] bg-white/65 text-sm font-bold text-[#2406e2] transition hover:bg-white sm:h-14 sm:text-base dark:border-slate-700 dark:bg-slate-900/90 dark:text-sky-400 dark:hover:bg-slate-800"
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
  const ranOutOfMoves = state.entry.movesUsed >= state.entry.moveLimit;

  return (
    <section className="w-full max-w-2xl">
      <div className="glass-panel relative overflow-hidden rounded-[1.8rem] p-5 shadow-[0_24px_54px_rgba(28,5,179,0.10)] sm:rounded-[2.2rem] sm:p-10">
      <div className="absolute right-0 top-0 rounded-bl-[1.4rem] rounded-tr-[2.2rem] bg-gradient-to-r from-[#1c05b3] to-[#140494] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white">
        Session Complete
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c05b3] dark:text-sky-400">Round Summary</p>
        <h1 className="mt-2 font-display text-[2.1rem] font-extrabold tracking-[-0.04em] text-[#0f172a] dark:text-white sm:mt-3 sm:text-[3.6rem]">
          {ranOutOfMoves ? "Moves Over" : "Time Over"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#475569] dark:text-slate-300 sm:mt-4 sm:text-[1rem] sm:leading-8">
          {ranOutOfMoves
            ? "You ran out of moves before clearing the board. Review the breakdown, tighten the mistakes, and jump back in for a cleaner finish."
            : "The run still saved. Review the breakdown, tighten the mistakes, and jump back in for a cleaner finish."}
        </p>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/70 bg-white/45 px-4 py-5 text-center shadow-inner sm:mt-8 sm:rounded-[1.9rem] sm:px-6 sm:py-7 dark:border-slate-800 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b] dark:text-slate-400">Final Score</p>
        <p className="my-2 text-[3rem] font-black leading-none tracking-[-0.04em] text-[#140494] dark:text-sky-400 sm:text-[3.6rem]">
          {formatNumber(state.breakdown.finalScore)}
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eff1ff] px-4 py-2 text-sm font-semibold text-[#2406e2] dark:bg-slate-800 dark:text-sky-300">
          <SparklesIcon className="h-4 w-4" />
          Saved to Hall of Fame
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
        <GameOverTile
          icon={<GridIcon className="h-5 w-5" />}
          accent="text-[#2406e2]"
          label="Total Matches"
          value={`${totalMatches}`}
        />
        <GameOverTile
          icon={<ClockIcon className="h-5 w-5" />}
          accent="text-[#1c05b3]"
          label={ranOutOfMoves ? "Moves Used" : "Time Taken"}
          value={ranOutOfMoves ? `${state.entry.movesUsed}/${state.entry.moveLimit}` : formatDuration(state.entry.duration)}
        />
      </div>

      <div className="mt-5 space-y-3 sm:mt-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b] dark:text-slate-400">Run Breakdown</p>
            <p className="mt-1 text-lg font-bold text-[#0f172a] dark:text-white">Accuracy and score details</p>
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

      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:flex-row">
        <Link
          to="/play/classic"
          className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-[1.4rem] bg-gradient-to-b from-[#1c05b3] to-[#140494] text-base font-bold text-white shadow-[0_18px_34px_rgba(28,5,179,0.22)] transition hover:scale-[1.01] sm:h-16 sm:text-lg"
        >
          <PlayIcon className="h-5 w-5" />
          Play Again
        </Link>
        <Link
          to="/play"
          className="inline-flex h-12 flex-1 items-center justify-center gap-3 rounded-[1.4rem] border border-[#bfdbfe] bg-white/65 text-sm font-bold text-[#2406e2] transition hover:bg-white sm:h-14 sm:text-base dark:border-slate-700 dark:bg-slate-900/90 dark:text-sky-400 dark:hover:bg-slate-800"
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
  <div className="flex flex-col rounded-[1.2rem] border border-white/40 bg-[#f0f9ff] p-3 sm:rounded-[1.5rem] sm:p-4 dark:border-slate-800 dark:bg-slate-900/90">
    <div className={`${accent} mb-2`}>{icon}</div>
    <span className="text-sm text-[#64748b] dark:text-slate-400">{label}</span>
    <span className="mt-1 text-xl font-bold text-[#0f172a] dark:text-white sm:text-2xl">{value}</span>
  </div>
);

const BreakdownRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.4rem] border border-[#cbd5e1] bg-white/72 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90">
    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#64748b] dark:text-slate-400">{label}</div>
    <div className="mt-1 text-sm font-medium text-[#0f172a] dark:text-white">{value}</div>
  </div>
);
