import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  BrandMarkIcon,
  ClockIcon,
  ExitIcon,
  GridIcon,
  HapticsIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  SparklesIcon,
  VolumeIcon,
} from "../components/AppIcons";
import { avatarOptions } from "../data/avatars";
import { MindGridCanvas } from "../game/phaser/MindGridCanvas";
import { useClassicGame } from "../game/useClassicGame";
import { useFairPlayMonitor } from "../game/useFairPlayMonitor";
import { GRID_OPTIONS } from "../game/config";
import { calculateRunXp, formatDuration, formatNumber, formatPercent, isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import { getLevelFromXp } from "../lib/utils";

export const GameRoute = () => {
  const { session, submitRun, settings, preferences, updatePreferences } = useAppContext();
  const navigate = useNavigate();
  const playerLevel = getLevelFromXp(session?.profile.xp ?? 0);
  const { state, results, reveal, reset, togglePause } = useClassicGame(settings, preferences, playerLevel);
  const [submitted, setSubmitted] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const audit = useFairPlayMonitor(state.events, state.status);
  const awardedXp = useMemo(
    () =>
      calculateRunXp({
        score: results.breakdown.finalScore,
        accuracy: Number(results.accuracy.toFixed(2)),
        maxCombo: state.maxCombo,
      }),
    [results.accuracy, results.breakdown.finalScore, state.maxCombo],
  );

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (state.status === "running" || state.status === "paused" || state.status === "idle")) {
        togglePause();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [state.status, togglePause]);

  useEffect(() => {
    if (!session || submitted || (state.status !== "won" && state.status !== "lost")) return;

    const persist = async () => {
      const entry = await submitRun({
        mode: "classic",
        matchType: settings.theme,
        score: results.breakdown.finalScore,
        won: state.status === "won",
        accuracy: Number(results.accuracy.toFixed(2)),
        maxCombo: state.maxCombo,
        gridSize: settings.gridSize,
        duration: GRID_OPTIONS[settings.gridSize].totalTimeSeconds - state.timerRemaining,
        movesUsed: state.moves,
        moveLimit: state.moveLimit,
        audit,
      });
      setSubmitted(true);
      navigate(`/results/${entry.id}`, {
        state: {
          entry,
          breakdown: results.breakdown,
          accuracy: results.accuracy,
          xpAwarded: awardedXp,
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
    awardedXp,
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
      { label: "Win Pace", value: `${Math.max(state.moveLimit - state.moves, 0)} moves left` },
    ],
    [settings.gridSize, settings.theme, state.moveLimit, state.moves],
  );

  const togglePreference = (key: "soundEffects" | "music" | "haptics") => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const handleBackClick = () => {
    if (state.status === "running" || state.status === "paused") {
      setShowQuitConfirm(true);
      return;
    }

    navigate("/play");
  };

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[linear-gradient(180deg,#f6f8ff_0%,#eef4ff_100%)] lg:h-screen lg:max-h-screen lg:overflow-hidden dark:bg-none dark:bg-slate-950">
      <header className="shrink-0 border-b border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(238,245,255,0.94))] backdrop-blur-xl dark:bg-none dark:bg-slate-950 dark:border-slate-800">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
          <div className="flex min-w-0 items-center justify-between gap-2 lg:flex-1 lg:justify-start">
            <Link to="/play" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <BrandMarkIcon className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" />
              <span className="truncate font-display text-[1.45rem] font-extrabold text-[#2563eb] dark:text-sky-400 sm:text-[2rem]">
                MindGrid
              </span>
            </Link>
            <button
              type="button"
              onClick={togglePause}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/84 px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[#0284c7] shadow-[0_10px_22px_rgba(37,99,235,0.08)] dark:bg-slate-900/90 dark:text-sky-400 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {state.status === "paused" ? <PlayIcon className="h-4 w-4" /> : <PauseIcon className="h-4 w-4" />}
              {state.status === "paused" ? "Resume" : "Pause"}
            </button>
          </div>

          <div className="mx-auto flex w-full max-w-[33rem] items-center justify-between gap-2 rounded-[1.5rem] border border-white/80 bg-white/62 px-3 py-2 shadow-[0_16px_36px_rgba(37,99,235,0.08)] dark:border-slate-800 dark:bg-slate-900/80 sm:gap-4 sm:px-5 lg:w-auto lg:max-w-none lg:justify-center lg:rounded-full">
            <HudStat label="Time" value={formatDuration(state.timerRemaining)} />
            <HudStat label="Moves" value={`${state.moves}/${state.moveLimit}`} />
            <HudStat label="Level" value={`${playerLevel}`} />
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-[#b9d2f4] bg-[#d7e7fb] text-[#0058a8] shadow-inner dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300 sm:h-16 sm:w-16">
              <span className="text-[0.62rem] font-semibold uppercase">Combo</span>
              <span className="text-[1.25rem] font-bold sm:text-[1.45rem]">x{Math.max(state.combo, 1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 lg:flex-1 lg:justify-end">
            <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-3 py-2 text-white shadow-[0_14px_30px_rgba(37,99,235,0.18)] sm:gap-2 sm:px-4 sm:py-2.5">
              <SparklesIcon className="h-4 w-4" />
              <span className="truncate text-[0.74rem] font-semibold tracking-[0.03em] sm:text-sm">{session.profile.xp} XP</span>
            </div>
            <Link to="/profile" className="shrink-0 rounded-full border-2 border-white bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <img src={avatar.image} alt={avatar.name} className="h-10 w-10 rounded-full sm:h-12 sm:w-12" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 overflow-visible px-3 py-2 sm:px-6 sm:py-3 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-hidden lg:px-8 xl:px-10">
        <div className="grid min-h-0 w-full gap-3 lg:grid-cols-[minmax(0,1fr)_17.5rem] xl:gap-4">
          <section className="flex min-h-0 min-w-0 flex-col gap-3 lg:grid lg:grid-rows-[auto_minmax(0,1fr)_auto]">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleBackClick}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbdef0] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[#495066] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbdef0] bg-white/88 px-4 py-2.5 text-sm font-semibold text-[#495066] dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200"
              >
                <RefreshIcon className="h-4 w-4" />
                Restart
              </button>
            </div>

            <div className="min-h-0 lg:flex lg:flex-1 lg:items-center lg:justify-center">
              <MindGridCanvas state={state} onReveal={reveal} />
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {boardSummary.map((item) => (
                <div key={item.label} className="glass-panel rounded-[1.15rem] px-3 py-2.5 sm:rounded-[1.35rem] sm:px-4 sm:py-3">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#778099] dark:text-slate-400">{item.label}</p>
                  <p className="mt-1.5 break-words text-[0.98rem] font-bold tracking-[-0.04em] text-[#1b2441] dark:text-white sm:text-[1.25rem]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-3 xl:min-h-0">
            <div className="glass-panel rounded-[1.4rem] p-4 sm:rounded-[1.6rem] sm:p-[1.125rem]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3f4457] dark:text-slate-300">Match Progress</p>
              <div className="mt-4 flex items-center justify-between text-[1rem] text-[#2a3148]">
                <span>Matches</span>
                <span className="font-bold text-[#2563eb]">
                  {state.matches}/{totalPairs}
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#d9e5fb] dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38bdf8] via-[#2563eb] to-[#1d4ed8]"
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
              <div className="mt-4 rounded-[1.15rem] border border-[#bae6fd] bg-[#f0f9ff] px-3 py-3 text-sm leading-6 text-[#0284c7] dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300 sm:rounded-[1.3rem] sm:px-4 sm:py-3.5">
                {state.matches === totalPairs
                  ? "Board cleared. Saving your result now."
                  : `Match ${Math.max(totalPairs - state.matches, 0)} more pair${totalPairs - state.matches === 1 ? "" : "s"} to finish this run.`}
              </div>
            </div>

            <div className="glass-panel rounded-[1.4rem] p-4 sm:rounded-[1.6rem] sm:p-[1.125rem]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3f4457] dark:text-slate-300">Run Score</p>
              <div className="mt-3 space-y-2.5">
                <SideStat icon={<GridIcon className="h-4 w-4" />} label="Score" value={formatNumber(results.breakdown.finalScore)} />
                <SideStat icon={<ClockIcon className="h-4 w-4" />} label="Mistakes" value={`${state.mismatches}`} />
                <SideStat icon={<SparklesIcon className="h-4 w-4" />} label="Best combo" value={`x${state.maxCombo}`} />
                <SideStat icon={<RefreshIcon className="h-4 w-4" />} label="Moves left" value={`${Math.max(state.moveLimit - state.moves, 0)}`} />
              </div>
            </div>

            {audit.suspicionScore > 0 ? (
              <div className="col-span-2 rounded-[1.6rem] border border-amber-200 bg-white/86 p-4 shadow-[0_14px_32px_rgba(37,99,235,0.05)] sm:rounded-[1.9rem] sm:p-5 lg:col-span-1">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7b5d10]">Fair Play Review</p>
                <p className="mt-3 text-sm leading-7 text-[#5b6073]">
                  This run has {audit.suspicionScore} suspicious signal{audit.suspicionScore > 1 ? "s" : ""} logged. It will still save, and the admin review desk can inspect it later.
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      </main>

      {state.status === "paused" ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f0f9ff]/76 px-4 py-4 backdrop-blur-xl dark:bg-slate-950/80 sm:py-8">
          <div className="mx-auto flex min-h-full w-full max-w-[34rem] items-center">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-5 shadow-[0_28px_64px_rgba(37,99,235,0.16)] dark:border-slate-800 dark:bg-slate-900/95 sm:rounded-[2.6rem] sm:p-8">
            <div className="pointer-events-none absolute inset-y-8 left-5 hidden w-14 rounded-full bg-[#e0f2fe] opacity-80 dark:bg-slate-800 sm:block" />
            <div className="pointer-events-none absolute inset-y-8 right-5 hidden w-14 rounded-full bg-[#e0f2fe] opacity-80 dark:bg-slate-800 sm:block" />

            <div className="relative z-10">
              <div className="text-center">
                <h2 className="font-display text-[2.35rem] font-extrabold tracking-[-0.04em] text-[#2563eb] dark:text-sky-400 sm:text-[3.8rem]">
                  Paused
                </h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395] sm:mt-2 sm:text-sm sm:tracking-[0.32em]">
                  Level {playerLevel} • {session.profile.rank}
                </p>
              </div>

              <button
                type="button"
                onClick={togglePause}
                className="mt-5 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] text-[1.2rem] font-bold text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)] transition hover:scale-[1.01] sm:mt-8 sm:h-20 sm:text-[1.5rem]"
              >
                <PlayIcon className="h-6 w-6" />
                Resume
              </button>

              <div className="mt-5 sm:mt-8">
                <p className="text-xl font-semibold tracking-[-0.02em] text-[#1b2441] dark:text-white sm:text-2xl">Settings</p>
                <div className="mt-3 h-px bg-[#d8dcef] dark:bg-slate-800" />
              </div>

              <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[#1f2740] dark:text-slate-200">
                      <VolumeIcon className="h-6 w-6 text-[#353964] dark:text-slate-400 sm:h-7 sm:w-7" />
                      <span className="text-[0.98rem] font-medium sm:text-[1.1rem]">Master Volume</span>
                    </div>
                    <span className="text-[0.98rem] font-semibold text-[#0284c7] dark:text-sky-400 sm:text-[1.1rem]">{preferences.masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={preferences.masterVolume}
                    onChange={(event) => updatePreferences({ masterVolume: Number(event.target.value) })}
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d8e3fb] accent-[#2563eb] dark:bg-slate-700"
                  />
                </div>

                <PauseToggleRow
                  icon={<SparklesIcon className="h-7 w-7 text-[#353964] dark:text-slate-400" />}
                  label="Sound Effects"
                  checked={preferences.soundEffects}
                  onToggle={() => togglePreference("soundEffects")}
                />
                <PauseToggleRow
                  icon={<MusicIcon className="h-7 w-7 text-[#353964] dark:text-slate-400" />}
                  label="Music"
                  checked={preferences.music}
                  onToggle={() => togglePreference("music")}
                />
                <PauseToggleRow
                  icon={<HapticsIcon className="h-7 w-7 text-[#353964] dark:text-slate-400" />}
                  label="Haptic Feedback"
                  checked={preferences.haptics}
                  onToggle={() => togglePreference("haptics")}
                />
              </div>

              <div className="mt-5 space-y-3 sm:mt-8">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#cdd6ef] bg-[#f5f7ff] text-[1rem] font-semibold text-[#0284c7] transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700 sm:h-16 sm:text-[1.15rem]"
                >
                  <RefreshIcon className="h-5 w-5" />
                  Restart Level
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/play")}
                  className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#f2c8c8] bg-[#fff5f5] text-[1rem] font-semibold text-[#c11c1c] transition hover:bg-white dark:border-red-900 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60 sm:h-16 sm:text-[1.15rem]"
                >
                  <ExitIcon className="h-5 w-5" />
                  Quit to Lobby
                </button>
              </div>

              <p className="mt-5 text-center text-xs font-semibold text-[#a0a5b8] sm:mt-8 sm:text-sm">
                MindGrid v2.4.0
              </p>
            </div>
          </div>
          </div>
        </div>
      ) : null}

      {showQuitConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0f9ff]/78 px-4 py-8 backdrop-blur-xl dark:bg-slate-950/80">
          <div className="w-full max-w-[34rem] rounded-[2.6rem] border border-white/70 bg-white/92 p-6 shadow-[0_28px_64px_rgba(37,99,235,0.16)] dark:border-slate-800 dark:bg-slate-900/95 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7d8395] dark:text-slate-400">Quit match</p>
            <h2 className="mt-3 font-display text-[2.4rem] font-extrabold tracking-[-0.06em] text-[#111c2d] dark:text-white sm:text-[2.9rem]">
              Leave this run?
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5a6174] dark:text-slate-300 sm:text-[1rem]">
              Your current match is still in progress. If you leave now, this run will be abandoned.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowQuitConfirm(false)}
                className="inline-flex h-14 items-center justify-center rounded-full border border-[#d4ddf4] bg-[#f7f9ff] px-6 text-[1rem] font-semibold text-[#0284c7] transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
              >
                Keep Playing
              </button>
              <button
                type="button"
                onClick={() => navigate("/play")}
                className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-6 text-[1rem] font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:scale-[1.01]"
              >
                Quit Match
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const HudStat = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-[3.5rem] text-center sm:min-w-[4.5rem]">
    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#7d8395] dark:text-slate-400 sm:text-xs">{label}</p>
    <p className="mt-0.5 text-[1.35rem] font-bold text-[#2563eb] dark:text-sky-400 sm:text-[1.8rem]">{value}</p>
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
  <div className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white/74 dark:bg-slate-900/90 dark:border dark:border-slate-800 px-3 py-3 sm:rounded-[1.35rem] sm:px-4 sm:py-4">
    <div className="flex min-w-0 items-center gap-3 text-[#2a3148] dark:text-slate-200">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e0f2fe] text-[#0284c7] dark:bg-slate-800 dark:text-sky-300 sm:h-10 sm:w-10">{icon}</span>
      <span className="truncate text-sm font-medium">{label}</span>
    </div>
    <span className="shrink-0 text-base font-bold text-[#0284c7] dark:text-sky-400 sm:text-lg">{value}</span>
  </div>
);

const PauseToggleRow = ({
  icon,
  label,
  checked,
  onToggle,
}: {
  icon: ReactNode;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex items-center gap-3 text-[#1f2740] dark:text-slate-200">
      {icon}
      <span className="text-[0.98rem] font-medium sm:text-[1.1rem]">{label}</span>
    </div>
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`relative inline-flex h-10 w-[4.35rem] shrink-0 items-center rounded-full border transition sm:h-11 sm:w-20 ${
        checked
          ? "border-[#2563eb] bg-[#2563eb]"
          : "border-[#cad5f0] bg-[#dbe5ff] dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <span
        className={`inline-block h-8 w-8 rounded-full bg-white shadow-[0_10px_18px_rgba(37,99,235,0.18)] transition sm:h-9 sm:w-9 ${
          checked ? "translate-x-9 sm:translate-x-10" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);
