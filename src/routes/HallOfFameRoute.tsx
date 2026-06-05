import { Navigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { GridSize, LeaderboardEntry, MatchType } from "../types";

const medalClasses = [
  "border-[#ffd166] bg-[#fff7db]",
  "border-[#c7d2fe] bg-[#eef2ff]",
  "border-[#f4c7a1] bg-[#fff2e8]",
] as const;

const compareLeaderboardEntries = (a: LeaderboardEntry, b: LeaderboardEntry) => {
  if (b.rating !== a.rating) return b.rating - a.rating;
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  if (b.score !== a.score) return b.score - a.score;
  if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
  if (b.maxCombo !== a.maxCombo) return b.maxCombo - a.maxCombo;
  return a.duration - b.duration;
};

const matchTypeLabels: Record<MatchType, string> = {
  standard: "Legacy",
  numbers: "Numbers",
  icons: "Icons",
};

export const HallOfFameRoute = () => {
  const { session, leaderboard, accountLeaderboard } = useAppContext();
  const [gridFilter, setGridFilter] = useState<"all" | GridSize>("all");
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | MatchType>("all");

  const hasLegacyRuns = leaderboard.some((entry) => entry.matchType === "standard");

  const filteredCategoryRows = useMemo(
    () =>
      leaderboard
        .filter((entry) => (gridFilter === "all" ? true : entry.gridSize === gridFilter))
        .filter((entry) => (matchTypeFilter === "all" ? true : entry.matchType === matchTypeFilter))
        .sort(compareLeaderboardEntries),
    [gridFilter, leaderboard, matchTypeFilter],
  );

  const filtered = useMemo(() => {
    const bestByUser = new Map<string, LeaderboardEntry>();
    for (const entry of filteredCategoryRows) {
      const current = bestByUser.get(entry.userId);
      if (!current || compareLeaderboardEntries(entry, current) < 0) {
        bestByUser.set(entry.userId, entry);
      }
    }
    return Array.from(bestByUser.values()).sort(compareLeaderboardEntries);
  }, [filteredCategoryRows]);

  const usingAccountTotals = gridFilter === "all" && matchTypeFilter === "all";
  const rankedEntries = usingAccountTotals ? accountLeaderboard : filtered;

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const podium = rankedEntries.slice(0, 3);

  return (
    <AppShell session={session} active="ranks">
      <div className="mx-auto w-full max-w-[1260px] px-3 py-5 sm:px-6 lg:px-10">
        <section className="mb-8 text-center">
          <h1 className="mt-3 font-display text-4xl tracking-[-0.05em] text-[#3525cd] sm:text-5xl">Hall of Fame</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-[#464555] sm:text-base">
            {usingAccountTotals
              ? "One account row per player with cumulative points stacked across every saved run."
              : "Best run per player inside the selected board and match type, while total points still keep stacking account-wide."}
          </p>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "All Boards" },
                { id: "4x4", label: "4x4" },
                { id: "5x6", label: "5x6" },
                { id: "6x6", label: "6x6" },
              ].map((option) => {
                const active = gridFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setGridFilter(option.id as typeof gridFilter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[#3525cd] text-white shadow-[0_12px_24px_rgba(53,37,205,0.18)]"
                        : "bg-white/80 text-[#495066] border border-[#dfe4f2]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {([
                { id: "all", label: "All Match Types" },
                { id: "numbers", label: "Numbers" },
                { id: "icons", label: "Icons" },
                ...(hasLegacyRuns ? [{ id: "standard", label: "Legacy" }] : []),
              ] as const).map((option) => {
                const active = matchTypeFilter === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMatchTypeFilter(option.id as typeof matchTypeFilter)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[#4f46e5] text-white shadow-[0_12px_24px_rgba(79,70,229,0.18)]"
                        : "bg-white/80 text-[#495066] border border-[#dfe4f2]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {podium.length ? (
            podium.map((entry, index) => {
              const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
              return (
                <article
                  key={entry.id}
                  className={`rounded-[2rem] border p-5 text-center shadow-[0_20px_44px_rgba(53,37,205,0.07)] backdrop-blur-xl sm:p-6 ${medalClasses[index] ?? "border-slate-200 bg-white/80"}`}
                  style={{
                    background: "rgba(255,255,255,0.74)",
                    borderColor:
                      index === 0 ? "#ffd166" : index === 1 ? "#d8e3fb" : index === 2 ? "#f4c7a1" : "#d8e3fb",
                  }}
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
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#3525cd]">{formatNumber(entry.rating)} rating</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Best {formatNumber(entry.score)} • Total {formatNumber(entry.totalPoints)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">
                    <span className="rounded-full bg-white/80 px-3 py-1">{entry.gridSize}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1">{matchTypeLabels[entry.matchType]}</span>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="glass-panel rounded-[2rem] p-8 text-center text-sm text-slate-500 md:col-span-3">
              No ranked runs match those filters yet.
            </div>
          )}
        </div>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Leaderboard</h2>
            <p className="mt-1 text-sm text-slate-500">
              {usingAccountTotals
                ? "One best row per player, with cumulative total points counting across all saved runs."
                : "Best row per player inside this filter, with cumulative total points still counting across all saved runs."}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[980px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Points</th>
                  <th className="px-6 py-4">Best Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Combo</th>
                  <th className="px-6 py-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {rankedEntries.length ? (
                  rankedEntries.map((entry, index) => {
                    const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                    return (
                      <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-500">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="h-11 w-11 rounded-full border-2 border-white bg-slate-100 object-cover"
                            />
                            <div>
                              <div className="font-medium text-slate-900">{entry.username}</div>
                              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                {matchTypeLabels[entry.matchType]} • {entry.gridSize}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#3525cd]">{formatNumber(entry.rating)}</td>
                        <td className="px-6 py-4 font-semibold text-[#0060ac]">{formatNumber(entry.totalPoints)}</td>
                        <td className="px-6 py-4">{formatNumber(entry.score)}</td>
                        <td className="px-6 py-4">{formatPercent(entry.accuracy)}</td>
                        <td className="px-6 py-4">x{entry.maxCombo}</td>
                        <td className="px-6 py-4">{formatDuration(entry.duration)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-sm text-slate-500">
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
