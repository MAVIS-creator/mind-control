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
import type { LeaderboardEntry } from "../types";
import type { ScoreBreakdown } from "../game/types";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";

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
        {state.won ? <SuccessSummary state={state} avatar={avatar.image} /> : <GameOverSummary state={state} avatar={avatar.image} />}
      </main>
    </div>
  );
};

const SuccessSummary = ({
  state,
  avatar,
}: {
  state: ResultsState;
  avatar: string;
}) => (
  <div className="relative w-full max-w-md">
    <div className="glass-panel relative overflow-visible rounded-[2.2rem] p-8 text-center shadow-[0_24px_54px_rgba(53,37,205,0.10)] sm:p-10">
      <div className="relative mb-6 inline-flex">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/80 bg-[#64a8fe] shadow-[0_16px_32px_rgba(0,96,172,0.16)]">
          <span className="text-[3rem] font-black text-white">✓</span>
        </div>
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#ddb7ff] animate-pulse" />
        <span className="absolute -bottom-1 -left-4 h-3 w-3 rounded-full bg-[#d4e3ff]" />
      </div>

      <h1 className="font-display text-[2.9rem] font-extrabold tracking-[-0.07em] text-[#3525cd] sm:text-[3.3rem]">
        PERFECT MATCH!
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-[1rem] leading-7 text-[#5a6174]">
        Your run is saved. Clean focus, solid accuracy, and a strong finish.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <RewardChip tone="blue" label={`+${Math.max(Math.round(state.breakdown.accuracyBonus / 10), 15)} XP`} />
        <RewardChip tone="violet" label={`x${state.entry.maxCombo} Max Combo`} />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <ResultStat label="Final Score" value={formatNumber(state.breakdown.finalScore)} />
        <ResultStat label="Accuracy" value={formatPercent(state.accuracy)} />
        <ResultStat label="Duration" value={formatDuration(state.entry.duration)} />
        <ResultStat label="Best Combo" value={`x${state.entry.maxCombo}`} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          to="/play/classic"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 py-4 text-lg font-bold text-white shadow-[0_18px_34px_rgba(53,37,205,0.22)] transition hover:scale-[1.01]"
        >
          Continue
        </Link>
        <Link
          to="/play"
          className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#d8dcee] bg-white/70 px-6 py-4 text-base font-semibold text-[#0060ac] transition hover:bg-white"
        >
          Back to Lobby
        </Link>
      </div>
    </div>

    <img
      src={avatar}
      alt="Player avatar"
      className="absolute -right-2 top-4 hidden h-14 w-14 rounded-full border-2 border-[#4f46e5]/20 bg-white shadow-sm sm:block"
    />
  </div>
);

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

const RewardChip = ({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "violet";
}) => (
  <div
    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
      tone === "blue"
        ? "border-[#64a8fe]/20 bg-[#d4e3ff]/65 text-[#3525cd]"
        : "border-[#862dd4]/20 bg-[#f0dbff]/65 text-[#6b00b7]"
    }`}
  >
    {label}
  </div>
);

const ResultStat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.5rem] border border-[#e2e7f5] bg-white/72 p-4 text-left">
    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#7d8395]">{label}</div>
    <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#111c2d]">{value}</div>
  </div>
);

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
