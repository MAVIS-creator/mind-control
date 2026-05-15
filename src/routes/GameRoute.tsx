import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ClockIcon,
  GridIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  SparklesIcon,
} from "../components/AppIcons";
import { avatarOptions } from "../data/avatars";
import { MindGridCanvas } from "../game/phaser/MindGridCanvas";
import { useClassicGame } from "../game/useClassicGame";
import { useFairPlayMonitor } from "../game/useFairPlayMonitor";
import { GRID_OPTIONS } from "../game/config";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

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
    audit,
    navigate,
    results.accuracy,
    results.breakdown,
    session,
    settings.gridSize,
    state.maxCombo,
    state.status,
    state.timerRemaining,
    submitRun,
    submitted,
  ]);

  const totalPairs = state.board.cards.length / 2;
  const matchPercent = totalPairs ? (state.matches / totalPairs) * 100 : 0;
  const avatar = session
    ? avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0]
    : avatarOptions[0];

  const boardSummary = useMemo(
    () => [
      { label: "Board", value: GRID_OPTIONS[settings.gridSize].label },
      { label: "Theme", value: settings.theme === "numbers" ? "Numbers" : "Icons" },
      { label: "Accuracy", value: formatPercent(results.accuracy) },
    ],
    [results.accuracy, settings.gridSize, settings.theme],
  );

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f6f7ff_40%,_#dce6ff_100%)]">
      <header className="border-b border-[#ececf6] bg-white/84 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link to="/play" className="font-display text-[2rem] font-extrabold tracking-[-0.05em] text-[#3525cd]">
              MindGrid
            </Link>
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex items-center gap-2 rounded-full bg-[#f1efff] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#3525cd]"
            >
              {state.status === "paused" ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
              {state.status === "paused" ? "Resume" : "Pause"}
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <HudStat label="Time" value={formatDuration(state.timerRemaining)} />
            <HudStat label="Moves" value={`${state.moves}`} />
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-[#b9d2f4] bg-[#d7e7fb] text-[#0058a8] shadow-inner">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Combo</span>
              <span className="mt-1 text-[2rem] font-bold">x{Math.max(state.combo, 1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-5 py-3 text-white shadow-[0_14px_30px_rgba(53,37,205,0.22)]">
              <SparklesIcon className="h-4 w-4" />
              <span className="text-sm font-semibold tracking-[0.04em]">{session.profile.xp} XP</span>
            </div>
            <Link to="/profile" className="rounded-full border-2 border-white bg-slate-100 shadow-sm">
              <img src={avatar.image} alt={avatar.name} className="h-12 w-12 rounded-full" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-5 xl:grid-cols-[1fr_18rem]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Link
                to="/play"
                className="inline-flex items-center gap-2 rounded-full border border-[#dbdef0] bg-white/88 px-4 py-3 text-sm font-semibold text-[#495066]"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Link>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbdef0] bg-white/88 px-4 py-3 text-sm font-semibold text-[#495066]"
              >
                <RefreshIcon className="h-4 w-4" />
                Restart
              </button>
            </div>

            <MindGridCanvas state={state} onReveal={reveal} />

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {boardSummary.map((item) => (
                <div key={item.label} className="glass-panel rounded-[1.6rem] px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#778099]">{item.label}</p>
                  <p className="mt-2 text-[1.6rem] font-bold tracking-[-0.04em] text-[#1b2441]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="glass-panel rounded-[1.9rem] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3f4457]">Match Progress</p>
              <div className="mt-5 flex items-center justify-between text-[1.05rem] text-[#2a3148]">
                <span>Matches</span>
                <span className="font-bold text-[#3525cd]">
                  {state.matches}/{totalPairs}
                </span>
              </div>
              <div className="mt-3 h-4 overflow-hidden rounded-full bg-[#d9e5fb]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#64a8fe] via-[#4f46e5] to-[#3525cd]"
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-[#d7dcf5] bg-[#f3f4ff] px-4 py-4 text-[1.05rem] leading-7 text-[#3525cd]">
                {state.matches === totalPairs
                  ? "Board cleared. Saving your result now."
                  : `Match ${Math.max(totalPairs - state.matches, 0)} more pair${totalPairs - state.matches === 1 ? "" : "s"} to finish this run.`}
              </div>
            </div>

            <div className="glass-panel rounded-[1.9rem] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3f4457]">Run Score</p>
              <div className="mt-4 space-y-3">
                <SideStat icon={<GridIcon className="h-4 w-4" />} label="Score" value={formatNumber(results.breakdown.finalScore)} />
                <SideStat icon={<ClockIcon className="h-4 w-4" />} label="Mistakes" value={`${state.mismatches}`} />
                <SideStat icon={<SparklesIcon className="h-4 w-4" />} label="Best combo" value={`x${state.maxCombo}`} />
              </div>
            </div>

            {audit.suspicionScore > 0 ? (
              <div className="rounded-[1.9rem] border border-amber-200 bg-white/86 p-5 shadow-[0_14px_32px_rgba(53,37,205,0.05)]">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5d10]">Fair Play Review</p>
                <p className="mt-3 text-sm leading-7 text-[#5b6073]">
                  This run has {audit.suspicionScore} suspicious signal{audit.suspicionScore > 1 ? "s" : ""} logged. It will still save, and the admin review desk can inspect it later.
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
};

const HudStat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8395]">{label}</p>
    <p className="mt-1 text-[2.15rem] font-bold tracking-[-0.05em] text-[#3525cd]">{value}</p>
  </div>
);

const SideStat = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center justify-between rounded-[1.35rem] bg-white/74 px-4 py-4">
    <div className="flex items-center gap-3 text-[#2a3148]">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff] text-[#3525cd]">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <span className="text-lg font-bold text-[#3525cd]">{value}</span>
  </div>
);
