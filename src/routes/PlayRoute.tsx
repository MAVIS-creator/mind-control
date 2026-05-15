import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { useAppContext } from "../state/AppContext";
import { avatarOptions } from "../data/avatars";
import { GRID_OPTIONS } from "../game/config";
import type { GameTheme, GridSize } from "../types";

export const PlayRoute = () => {
  const { session, leaderboard, logout, settings, updateSettings } = useAppContext();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];
  const themeOptions: Array<{ id: GameTheme; label: string }> = [
    { id: "numbers", label: "Numbers" },
    { id: "icons", label: "Icons" },
  ];
  const gridOptions = Object.entries(GRID_OPTIONS) as Array<
    [GridSize, (typeof GRID_OPTIONS)[GridSize]]
  >;

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="glass-panel flex flex-col gap-4 rounded-[2rem] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={avatar.image}
              alt={avatar.name}
              className="h-14 w-14 rounded-[1.2rem] border border-white/20 bg-slate-950/20 sm:h-16 sm:w-16 sm:rounded-[1.4rem]"
            />
            <div>
              <p className="font-display text-xs uppercase tracking-[0.24em] text-amber-100">
                Player ready
              </p>
              <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-white">
                {session.profile.username}
              </h1>
              <p className="text-sm text-white/60">
                {session.profile.rank} • {session.profile.xp} XP
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Link
              to="/profile"
              className="rounded-2xl border border-white/10 px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-white/70 sm:px-5 sm:text-sm sm:tracking-[0.28em]"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/70 sm:px-5 sm:text-sm sm:tracking-[0.28em]"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.section
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-[2rem] p-6"
          >
            <p className="font-display text-xs uppercase tracking-[0.24em] text-amber-100">
              Setup game
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.14em] text-white">
              Classic Memory Mode
            </h2>
            <details className="mt-5 rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4 text-white/80" open>
              <summary className="cursor-pointer list-none font-display text-lg uppercase tracking-[0.14em] text-white">
                Game rules
              </summary>
              <div className="mt-4 space-y-3 text-sm leading-7">
                <p>Match all pairs before the timer runs out.</p>
                <p>Each fast match grows your combo and improves your final score.</p>
                <p>Pick bigger grids for longer rounds and higher difficulty multipliers.</p>
              </div>
            </details>

            <div className="mt-5 rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
              <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white">Select theme</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {themeOptions.map((option) => {
                  const active = settings.theme === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateSettings({ theme: option.id })}
                      className={`rounded-2xl px-4 py-4 text-sm font-medium transition ${
                        active
                          ? "bg-[#304859] text-white"
                          : "bg-[#dfe7ec] text-[#304859] hover:bg-white"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/15 bg-white/10 p-5">
              <h3 className="font-display text-sm uppercase tracking-[0.22em] text-white">Grid size</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {gridOptions.map(([key, option]) => {
                  const active = settings.gridSize === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateSettings({ gridSize: key })}
                      className={`rounded-2xl px-4 py-4 text-center transition ${
                        active
                          ? "bg-[#304859] text-white"
                          : "bg-[#dfe7ec] text-[#304859] hover:bg-white"
                      }`}
                    >
                      <div className="font-display text-lg uppercase tracking-[0.1em]">{option.label}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] opacity-75">
                        {option.totalTimeSeconds}s
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Theme", settings.theme === "numbers" ? "Numbers" : "Icons"],
                ["Grid", GRID_OPTIONS[settings.gridSize].label],
                ["Timer", `${GRID_OPTIONS[settings.gridSize].totalTimeSeconds}s`],
              ].map(([title, value]) => (
                <div key={title} className="rounded-2xl border border-white/12 bg-white/8 p-4">
                  <div className="text-[0.65rem] uppercase tracking-[0.22em] text-white/45">{title}</div>
                  <div className="mt-2 font-medium text-white">{value}</div>
                </div>
              ))}
            </div>

            <Link
              to="/play/classic"
              className="mt-6 inline-flex w-full items-center justify-center rounded-[1.6rem] bg-[#fda214] px-5 py-4 font-display text-base uppercase tracking-[0.18em] text-white"
            >
              Start game
            </Link>
          </motion.section>

          <LeaderboardTable entries={leaderboard} />
        </div>
      </div>
    </div>
  );
};
