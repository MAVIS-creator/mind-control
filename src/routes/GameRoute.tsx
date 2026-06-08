import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
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
        accuracy: Number(results.accuracy.toFixed(2)),
        maxCombo: state.maxCombo,
        gridSize: settings.gridSize,
        duration: GRID_OPTIONS[settings.gridSize].totalTimeSeconds - state.timerRemaining,
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
      { label: "Accuracy", value: formatPercent(results.accuracy) },
    ],
    [results.accuracy, settings.gridSize, settings.theme],
  );

  const togglePreference = (key: "soundEffects" | "music" | "haptics") => {
    updatePreferences({ [key]: !preferences[key] });
  };

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f6f7ff_40%,_#dce6ff_100%)]">
      <header className="border-b border-[#ececf6] bg-white/84 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:grid-cols-[auto_1fr_auto] xl:items-center">
          <div className="flex items-center justify-between gap-3 sm:gap-5 xl:justify-start">
            <Link to="/play" className="font-display text-[1.7rem] font-extrabold tracking-[-0.05em] text-[#3525cd] sm:text-[2rem]">
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

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 xl:gap-8">
            <HudStat label="Time" value={formatDuration(state.timerRemaining)} />
            <HudStat label="Moves" value={`${state.moves}`} />
            <HudStat label="Level" value={`${playerLevel}`} />
            <div className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-[#b9d2f4] bg-[#d7e7fb] text-[#0058a8] shadow-inner sm:h-20 sm:w-20">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Combo</span>
              <span className="mt-1 text-[1.55rem] font-bold sm:text-[2rem]">x{Math.max(state.combo, 1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 xl:justify-end">
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

      <main className="mx-auto max-w-[1500px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:gap-5">
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

            <div className="mt-4 grid grid-cols-3 gap-3 sm:mt-5 sm:gap-4">
              {boardSummary.map((item) => (
                <div key={item.label} className="glass-panel rounded-[1.35rem] px-3 py-3 sm:rounded-[1.6rem] sm:px-4 sm:py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#778099]">{item.label}</p>
                  <p className="mt-2 break-words text-[1.05rem] font-bold tracking-[-0.04em] text-[#1b2441] sm:text-[1.6rem]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-4">
            <div className="glass-panel rounded-[1.6rem] p-4 sm:rounded-[1.9rem] sm:p-5">
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
              <div className="mt-5 rounded-[1.25rem] border border-[#d7dcf5] bg-[#f3f4ff] px-3 py-3 text-sm leading-6 text-[#3525cd] sm:rounded-[1.5rem] sm:px-4 sm:py-4 sm:text-[1.05rem] sm:leading-7">
                {state.matches === totalPairs
                  ? "Board cleared. Saving your result now."
                  : `Match ${Math.max(totalPairs - state.matches, 0)} more pair${totalPairs - state.matches === 1 ? "" : "s"} to finish this run.`}
              </div>
            </div>

            <div className="glass-panel rounded-[1.6rem] p-4 sm:rounded-[1.9rem] sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#3f4457]">Run Score</p>
              <div className="mt-4 space-y-3">
                <SideStat icon={<GridIcon className="h-4 w-4" />} label="Score" value={formatNumber(results.breakdown.finalScore)} />
                <SideStat icon={<ClockIcon className="h-4 w-4" />} label="Mistakes" value={`${state.mismatches}`} />
                <SideStat icon={<SparklesIcon className="h-4 w-4" />} label="Best combo" value={`x${state.maxCombo}`} />
              </div>
            </div>

            {audit.suspicionScore > 0 ? (
              <div className="col-span-2 rounded-[1.6rem] border border-amber-200 bg-white/86 p-4 shadow-[0_14px_32px_rgba(53,37,205,0.05)] sm:rounded-[1.9rem] sm:p-5 lg:col-span-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#eef2ff]/76 px-4 py-8 backdrop-blur-xl">
          <div className="relative w-full max-w-[34rem] overflow-hidden rounded-[2.6rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_64px_rgba(53,37,205,0.16)] sm:p-8">
            <div className="pointer-events-none absolute inset-y-8 left-5 hidden w-14 rounded-full bg-[#eef2ff] opacity-80 sm:block" />
            <div className="pointer-events-none absolute inset-y-8 right-5 hidden w-14 rounded-full bg-[#eef2ff] opacity-80 sm:block" />

            <div className="relative z-10">
              <div className="text-center">
                <h2 className="font-display text-[3rem] font-extrabold tracking-[-0.07em] text-[#3525cd] sm:text-[3.8rem]">
                  Paused
                </h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.32em] text-[#7d8395]">
                  Level {playerLevel} • {session.profile.rank}
                </p>
              </div>

              <button
                type="button"
                onClick={togglePause}
                className="mt-8 inline-flex h-20 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-[1.5rem] font-bold text-white shadow-[0_18px_34px_rgba(53,37,205,0.22)] transition hover:scale-[1.01]"
              >
                <PlayIcon className="h-6 w-6" />
                Resume
              </button>

              <div className="mt-8">
                <p className="text-2xl font-semibold tracking-[-0.04em] text-[#1b2441]">Settings</p>
                <div className="mt-3 h-px bg-[#d8dcef]" />
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[#1f2740]">
                      <VolumeIcon className="h-7 w-7 text-[#353964]" />
                      <span className="text-[1.1rem] font-medium">Master Volume</span>
                    </div>
                    <span className="text-[1.1rem] font-semibold text-[#3525cd]">{preferences.masterVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={preferences.masterVolume}
                    onChange={(event) => updatePreferences({ masterVolume: Number(event.target.value) })}
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d8e3fb] accent-[#4f46e5]"
                  />
                </div>

                <PauseToggleRow
                  icon={<SparklesIcon className="h-7 w-7 text-[#353964]" />}
                  label="Sound Effects"
                  checked={preferences.soundEffects}
                  onToggle={() => togglePreference("soundEffects")}
                />
                <PauseToggleRow
                  icon={<MusicIcon className="h-7 w-7 text-[#353964]" />}
                  label="Music"
                  checked={preferences.music}
                  onToggle={() => togglePreference("music")}
                />
                <PauseToggleRow
                  icon={<HapticsIcon className="h-7 w-7 text-[#353964]" />}
                  label="Haptic Feedback"
                  checked={preferences.haptics}
                  onToggle={() => togglePreference("haptics")}
                />
              </div>

              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-full border border-[#cdd6ef] bg-[#f5f7ff] text-[1.15rem] font-semibold text-[#3525cd] transition hover:bg-white"
                >
                  <RefreshIcon className="h-5 w-5" />
                  Restart Level
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/play")}
                  className="inline-flex h-16 w-full items-center justify-center gap-3 rounded-full border border-[#f2c8c8] bg-[#fff5f5] text-[1.15rem] font-semibold text-[#c11c1c] transition hover:bg-white"
                >
                  <ExitIcon className="h-5 w-5" />
                  Quit to Lobby
                </button>
              </div>

              <p className="mt-8 text-center text-sm font-semibold text-[#a0a5b8]">
                MindGrid v2.4.0
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const HudStat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8395]">{label}</p>
    <p className="mt-1 text-[1.6rem] font-bold tracking-[-0.05em] text-[#3525cd] sm:text-[2.15rem]">{value}</p>
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
  <div className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white/74 px-3 py-3 sm:rounded-[1.35rem] sm:px-4 sm:py-4">
    <div className="flex min-w-0 items-center gap-3 text-[#2a3148]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#3525cd] sm:h-10 sm:w-10">{icon}</span>
      <span className="truncate text-sm font-medium">{label}</span>
    </div>
    <span className="shrink-0 text-base font-bold text-[#3525cd] sm:text-lg">{value}</span>
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
    <div className="flex items-center gap-3 text-[#1f2740]">
      {icon}
      <span className="text-[1.1rem] font-medium">{label}</span>
    </div>
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`relative inline-flex h-11 w-20 items-center rounded-full border transition ${
        checked
          ? "border-[#4f46e5] bg-[#3525cd]"
          : "border-[#cad5f0] bg-[#dbe5ff]"
      }`}
    >
      <span
        className={`inline-block h-9 w-9 rounded-full bg-white shadow-[0_10px_18px_rgba(53,37,205,0.18)] transition ${
          checked ? "translate-x-10" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);
