import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { GridIcon, PlayIcon } from "../components/AppIcons";
import { GRID_OPTIONS } from "../game/config";
import { useAppContext } from "../state/AppContext";
import type { GameTheme, GridSize } from "../types";

export const PlayRoute = () => {
  const { session, settings, updateSettings } = useAppContext();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const themeOptions: Array<{ id: GameTheme; label: string; icon: string }> = [
    { id: "numbers", label: "Numbers", icon: "3" },
    { id: "icons", label: "Icons", icon: "◌" },
  ];
  const gridOptions = Object.entries(GRID_OPTIONS) as Array<
    [GridSize, (typeof GRID_OPTIONS)[GridSize]]
  >;

  return (
    <AppShell session={session} active="social">
      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="glass-panel rounded-[2.5rem] px-6 py-8 shadow-[0_18px_42px_rgba(53,37,205,0.08)] sm:px-10 md:px-14">
            <div className="mx-auto max-w-[540px]">
              <div className="mb-8 h-1 rounded-full bg-gradient-to-r from-indigo-700 to-violet-500" />

              <div className="mb-8 flex justify-center">
                <div className="inline-flex rounded-full bg-slate-100 p-1.5 shadow-inner">
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-b from-indigo-600 to-indigo-700 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200"
                  >
                    Single Player
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="mb-4 text-[1.45rem] font-semibold text-slate-900">Grid Size</h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {gridOptions.map(([key, option]) => {
                      const active = settings.gridSize === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => updateSettings({ gridSize: key })}
                          className={`inline-flex items-center justify-center gap-3 rounded-full border px-5 py-4 text-lg font-medium transition ${
                            active
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-md"
                              : "border-slate-200 bg-white text-slate-700"
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
                  <h2 className="mb-4 text-[1.45rem] font-semibold text-slate-900">Match Type</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {themeOptions.map((option) => {
                      const active = settings.theme === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => updateSettings({ theme: option.id })}
                          className={`inline-flex items-center justify-center gap-3 rounded-full border px-5 py-4 text-lg font-medium transition ${
                            active
                              ? "border-indigo-200 bg-indigo-50 text-indigo-700 shadow-md"
                              : "border-slate-200 bg-white text-slate-700"
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

                <Link
                  to="/play/classic"
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-indigo-600 to-indigo-700 px-6 py-5 text-[1.35rem] font-semibold text-white shadow-[0_14px_28px_rgba(53,37,205,0.25)]"
                >
                  <PlayIcon className="h-6 w-6" />
                  Start Game
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
