import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { GridIcon, PlayIcon } from "../components/AppIcons";
import { GRID_OPTIONS } from "../game/config";
import { isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { GameTheme, GridSize } from "../types";

export const PlayRoute = () => {
  const { session, settings, updateSettings, isGamingRestricted } = useAppContext();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  const themeOptions: Array<{ id: GameTheme; label: string; icon: string }> = [
    { id: "numbers", label: "Numbers", icon: "3" },
    { id: "icons", label: "Icons", icon: "◌" },
  ];
  const gridOptions = Object.entries(GRID_OPTIONS) as Array<
    [GridSize, (typeof GRID_OPTIONS)[GridSize]]
  >;

  return (
    <AppShell session={session} active="home">
      <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f8faff_42%,_#dbeafe_100%)] dark:bg-none dark:bg-slate-950 px-3 py-5 pb-32 sm:px-6 sm:py-8 sm:pb-36 md:pb-10">
        <div className="mx-auto max-w-5xl">
          <div className="glass-panel rounded-[2rem] px-4 py-6 shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:rounded-[2.5rem] sm:px-8 sm:py-8 md:px-12">
            <div className="mx-auto max-w-[540px]">
              <div className="mb-8 h-1 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-400" />

              <div className="mb-8 flex justify-center gap-3">
                <div className="inline-flex rounded-full bg-[#f0f9ff] dark:bg-slate-900/90 p-1.5 shadow-inner">
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]"
                  >
                    Single Player
                  </button>
                  <Link
                    to="/multiplayer"
                    className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#475569] dark:text-slate-300 hover:text-[#0284c7] dark:hover:text-white transition-all"
                  >
                    Multiplayer Clash
                  </Link>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="mb-4 text-[1.35rem] font-semibold text-[#0f172a] dark:text-white sm:text-[1.45rem]">Grid Size</h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {gridOptions.map(([key, option]) => {
                      const active = settings.gridSize === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateSettings({ gridSize: key })}
                          className={`inline-flex items-center justify-center gap-3 rounded-full border px-4 py-4 text-base font-medium transition sm:px-5 sm:text-lg ${
                            active
                              ? "border-[#bfdbfe] dark:border-blue-500 bg-[#dbeafe] dark:bg-blue-900/90 text-[#1e3a8a] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_18px_rgba(37,99,235,0.08)]"
                              : "border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#334155] dark:text-slate-200"
                          }`}
                        >
                          <GridIcon className="h-5 w-5" />
                          {option.label.replace(/\s/g, "")}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-[1.35rem] font-semibold text-[#0f172a] dark:text-white sm:text-[1.45rem]">Match Type</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {themeOptions.map((option) => {
                      const active = settings.theme === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => updateSettings({ theme: option.id })}
                          className={`inline-flex items-center justify-center gap-3 rounded-full border px-4 py-4 text-base font-medium transition sm:px-5 sm:text-lg ${
                            active
                              ? "border-[#bfdbfe] dark:border-blue-500 bg-[#dbeafe] dark:bg-blue-900/90 text-[#1e3a8a] dark:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_18px_rgba(37,99,235,0.08)]"
                              : "border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 text-[#334155] dark:text-slate-200"
                          }`}
                        >
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-current text-base font-semibold">
                            {option.icon}
                          </span>
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isGamingRestricted ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-slate-300 px-6 py-4 text-[1.15rem] font-semibold text-slate-600 shadow-none cursor-not-allowed sm:py-5 sm:text-[1.35rem]"
                  >
                    Rest Break Active
                  </button>
                ) : (
                  <Link
                    to="/play/classic"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-6 py-4 text-[1.15rem] font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.25)] sm:py-5 sm:text-[1.35rem]"
                  >
                    <PlayIcon className="h-6 w-6" />
                    Start Game
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
