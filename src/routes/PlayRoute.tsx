import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ClockIcon, GridIcon, PlayIcon, SparklesIcon, TrophyIcon, UserIcon } from "../components/AppIcons";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { avatarOptions } from "../data/avatars";
import { GRID_OPTIONS } from "../game/config";
import { useAppContext } from "../state/AppContext";
import type { GameTheme, GridSize } from "../types";

export const PlayRoute = () => {
  const { session, leaderboard, logout, settings, updateSettings } = useAppContext();

  if (!session) {
    return <Navigate to="/login" replace />;
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
    <AppShell session={session} active="play">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="h-16 w-16 rounded-full border-4 border-white bg-slate-100 shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                      Dashboard
                    </p>
                    <h1 className="mt-1 font-display text-4xl tracking-[-0.05em] text-slate-900">
                      {session.profile.username}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {session.profile.rank} • {session.profile.xp} XP
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <Link
                    to="/hall-of-fame"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700"
                  >
                    <TrophyIcon className="h-4 w-4" />
                    Hall of Fame
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="col-span-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 sm:col-span-1"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Classic Memory Mode
              </p>
              <h2 className="mt-3 font-display text-4xl tracking-[-0.05em] text-slate-900">
                Pick your board.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                This page maps the stitch dashboard idea into your current game flow. Keep the
                setup simple, then move straight into the board.
              </p>

              <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-white/80 p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                    Select theme
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {themeOptions.map((option) => {
                    const active = settings.theme === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateSettings({ theme: option.id })}
                        className={`rounded-2xl px-4 py-4 text-sm font-semibold transition ${
                          active
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-[1.6rem] border border-slate-200 bg-white/80 p-5">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                    <GridIcon className="h-5 w-5" />
                  </span>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">
                    Grid size
                  </h3>
                </div>
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
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <div className="font-display text-xl tracking-[-0.03em]">{option.label}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.18em] opacity-80">
                          {option.totalTimeSeconds}s
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    title: "Theme",
                    value: settings.theme === "numbers" ? "Numbers" : "Icons",
                    icon: <SparklesIcon className="h-4 w-4" />,
                  },
                  {
                    title: "Grid",
                    value: GRID_OPTIONS[settings.gridSize].label,
                    icon: <GridIcon className="h-4 w-4" />,
                  },
                  {
                    title: "Timer",
                    value: `${GRID_OPTIONS[settings.gridSize].totalTimeSeconds}s`,
                    icon: <ClockIcon className="h-4 w-4" />,
                  },
                ].map((card) => (
                  <div key={card.title} className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">
                      {card.icon}
                      {card.title}
                    </div>
                    <div className="mt-2 text-base font-semibold text-slate-900">{card.value}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/play/classic"
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-[1.6rem] bg-indigo-600 px-5 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white shadow-lg shadow-indigo-200"
              >
                <PlayIcon className="h-5 w-5" />
                Start game
              </Link>
            </div>
          </section>

          <div className="space-y-6">
            <LeaderboardTable entries={leaderboard} title="Hall of Fame Preview" />
            <div className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Page map
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Landing page is now separate at `/`.</li>
                <li>Login and register now live on `/login` and `/register`.</li>
                <li>Dashboard setup stays on `/play`.</li>
                <li>Hall of Fame now has its own page at `/hall-of-fame`.</li>
                <li>Profile stays separate at `/profile`.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
