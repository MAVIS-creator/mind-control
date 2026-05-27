import { Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { formatNumber } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

const medalClasses = [
  "border-[#ffd166] bg-[#fff7db]",
  "border-[#c7d2fe] bg-[#eef2ff]",
  "border-[#f4c7a1] bg-[#fff2e8]",
] as const;

export const HallOfFameRoute = () => {
  const { session, leaderboard } = useAppContext();
  const [gridFilter, setGridFilter] = useState<"all" | "4x4" | "5x6" | "6x6">("all");

  const filtered = useMemo(
    () => leaderboard.filter((entry) => (gridFilter === "all" ? true : entry.gridSize === gridFilter)),
    [gridFilter, leaderboard],
  );

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const podium = filtered.slice(0, 3);
  const rest = filtered.slice(3, 12);

  return (
    <AppShell session={session} active="ranks">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-10">
        <section className="mb-8 text-center">
          <h1 className="mt-3 font-display text-5xl tracking-[-0.05em] text-[#3525cd]">
            Hall of Fame
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#464555]">
            Ranked by rating (score + accuracy + combo + speed), with personal totals combined.
          </p>
          <div className="mt-4">
            <label htmlFor="grid-filter" className="sr-only">
              Filter by grid size
            </label>
            <select
              id="grid-filter"
              className="rounded-xl border px-3 py-2"
              value={gridFilter}
              onChange={(e) => setGridFilter(e.target.value as typeof gridFilter)}
            >
              <option value="all">All grids</option>
              <option value="4x4">4x4</option>
              <option value="5x6">5x6</option>
              <option value="6x6">6x6</option>
            </select>
          </div>
        </section>

        <div className="mb-8 grid gap-4 sm:gap-6 md:grid-cols-3">
          {podium.map((entry, index) => {
            const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
            return (
              <article
                key={entry.id}
                className={`glass-panel rounded-[2rem] border p-6 text-center shadow-[0_14px_34px_rgba(53,37,205,0.08)] ${medalClasses[index] ?? "border-slate-200 bg-white"}`}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 shadow-sm">
                  {index + 1}
                </div>
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="mx-auto mt-4 h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-md"
                />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{entry.username}</h2>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#3525cd]">
                  {formatNumber(entry.rating)} rating
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Score {formatNumber(entry.score)} • Total {formatNumber(entry.totalPoints)}
                </p>
              </article>
            );
          })}
        </div>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Leaderboard</h2>
            <p className="mt-1 text-sm text-slate-500">Classic mode ranking by best recorded runs.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Combo</th>
                </tr>
              </thead>
              <tbody>
                {rest.length ? (
                  rest.map((entry, index) => {
                    const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                    return (
                      <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-500">{index + 4}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="h-11 w-11 rounded-full border border-white bg-slate-100"
                            />
                            <span className="font-medium text-slate-900">{entry.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#3525cd]">{formatNumber(entry.score)}</td>
                        <td className="px-6 py-4">{entry.accuracy.toFixed(1)}%</td>
                        <td className="px-6 py-4">x{entry.maxCombo}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                      No ranked runs yet. Play a round to place the first Hall of Fame score.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
};
