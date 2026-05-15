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
    <AppShell session={session} active="home">
      <div className="min-h-[calc(100vh-84px)] bg-[#0b0f29] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] border border-[#e4e5ec] bg-[#b8b8bf] px-6 py-8 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_20px_48px_rgba(0,0,0,0.16)] sm:px-10 md:px-14">
            <div className="mx-auto max-w-[540px]">
              <div className="mb-8 h-1 rounded-full bg-gradient-to-r from-indigo-700 to-violet-500" />

              <div className="mb-8 flex justify-center">
                <div className="inline-flex rounded-full bg-[#dbe1ec] p-1.5 shadow-inner">
                  <button
                    type="button"
                    className="rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-10 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(53,37,205,0.24)]"
                  >
                    Single Player
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h2 className="mb-4 text-[1.45rem] font-semibold text-[#111c2d]">Grid Size</h2>
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
                              ? "border-[#d7d9ea] bg-[#b0b0b8] text-[#25354b] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_18px_rgba(53,37,205,0.08)]"
                              : "border-[#eef1f7] bg-white text-[#32445c]"
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
                  <h2 className="mb-4 text-[1.45rem] font-semibold text-[#111c2d]">Match Type</h2>
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
                              ? "border-[#d7d9ea] bg-[#b0b0b8] text-[#25354b] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_10px_18px_rgba(53,37,205,0.08)]"
                              : "border-[#eef1f7] bg-white text-[#32445c]"
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
                  className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 py-5 text-[1.35rem] font-semibold text-white shadow-[0_14px_28px_rgba(53,37,205,0.25)]"
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
