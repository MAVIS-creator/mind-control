import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { fetchMultiplayerLeaderboard, type MultiplayerLeaderboardEntry } from "../lib/multiplayer";
import { formatDuration, formatNumber, formatPercent, getLevelProgress, isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { GridSize, LeaderboardEntry, MatchType } from "../types";

const medalClasses = [
  "border-[#ffd166] bg-[#fff7db] dark:border-amber-500/50 dark:bg-amber-900/20",
  "border-[#c7d2fe] bg-[#eef2ff] dark:border-indigo-500/50 dark:bg-indigo-900/20",
  "border-[#f4c7a1] bg-[#fff2e8] dark:border-orange-500/50 dark:bg-orange-900/20",
] as const;

const PAGE_SIZE = 20;

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

type SortKey = "rating" | "points" | "fastest" | "accuracy" | "combo";

const compareBySort = (sortKey: SortKey, a: LeaderboardEntry, b: LeaderboardEntry) => {
  switch (sortKey) {
    case "points":
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return compareLeaderboardEntries(a, b);
    case "fastest":
      if (a.duration !== b.duration) return a.duration - b.duration;
      if (b.score !== a.score) return b.score - a.score;
      return compareLeaderboardEntries(a, b);
    case "accuracy":
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.score !== a.score) return b.score - a.score;
      return compareLeaderboardEntries(a, b);
    case "combo":
      if (b.maxCombo !== a.maxCombo) return b.maxCombo - a.maxCombo;
      if (b.score !== a.score) return b.score - a.score;
      return compareLeaderboardEntries(a, b);
    case "rating":
    default:
      return compareLeaderboardEntries(a, b);
  }
};

export const HallOfFameRoute = () => {
  const { session, leaderboard, accountLeaderboard } = useAppContext();
  const [gridFilter, setGridFilter] = useState<"all" | GridSize>("all");
  const [matchTypeFilter, setMatchTypeFilter] = useState<"all" | MatchType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [leaderboardTab, setLeaderboardTab] = useState<"single" | "multiplayer">("single");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [mpLeaderboard, setMpLeaderboard] = useState<MultiplayerLeaderboardEntry[]>([]);
  const [loadingMp, setLoadingMp] = useState(false);

  useEffect(() => {
    if (leaderboardTab === "multiplayer") {
      setLoadingMp(true);
      fetchMultiplayerLeaderboard().then((data) => {
        setMpLeaderboard(data);
        setLoadingMp(false);
      });
    }
  }, [leaderboardTab]);

  const hasLegacyRuns = leaderboard.some((entry) => entry.matchType === "standard");

  const filteredCategoryRows = useMemo(
    () =>
      leaderboard
        .filter((entry) => (gridFilter === "all" ? true : entry.gridSize === gridFilter))
        .filter((entry) => (matchTypeFilter === "all" ? true : entry.matchType === matchTypeFilter))
        .sort((a, b) => compareBySort(sortKey, a, b)),
    [gridFilter, leaderboard, matchTypeFilter, sortKey],
  );

  const filtered = useMemo(() => {
    const bestByUser = new Map<string, LeaderboardEntry>();
    for (const entry of filteredCategoryRows) {
      const current = bestByUser.get(entry.userId);
      if (!current || compareBySort(sortKey, entry, current) < 0) {
        bestByUser.set(entry.userId, entry);
      }
    }
    return Array.from(bestByUser.values()).sort((a, b) => compareBySort(sortKey, a, b));
  }, [filteredCategoryRows, sortKey]);

  const usingAccountTotals = gridFilter === "all" && matchTypeFilter === "all";
  const accountSorted = useMemo(
    () => [...accountLeaderboard].sort((a, b) => compareBySort(sortKey, a, b)),
    [accountLeaderboard, sortKey],
  );
  const globalSorted = useMemo(() => {
    const bestByUser = new Map<string, LeaderboardEntry>();
    for (const entry of [...leaderboard].sort((a, b) => compareBySort(sortKey, a, b))) {
      const current = bestByUser.get(entry.userId);
      if (!current || compareBySort(sortKey, entry, current) < 0) {
        bestByUser.set(entry.userId, entry);
      }
    }
    return Array.from(bestByUser.values()).sort((a, b) => compareBySort(sortKey, a, b));
  }, [leaderboard, sortKey]);
  const rankedEntries = usingAccountTotals
    ? sortKey === "points"
      ? accountSorted
      : globalSorted
    : filtered;

  const visibleEntries = rankedEntries.slice(0, visibleCount);
  const canLoadMore = visibleCount < rankedEntries.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [gridFilter, matchTypeFilter, sortKey, rankedEntries.length]);

  useEffect(() => {
    if (!canLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + PAGE_SIZE, rankedEntries.length));
        }
      },
      { rootMargin: "320px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [canLoadMore, rankedEntries.length]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  const podiumSingle = rankedEntries.slice(0, 3);
  const podiumMp = mpLeaderboard.slice(0, 3);

  return (
    <AppShell session={session} active="ranks">
      <div className="mx-auto min-h-full w-full max-w-[1260px] px-3 py-5 pb-32 sm:px-6 sm:pb-36 lg:px-10 md:pb-10">
        <section className="mb-8 text-center">
          <h1 className="mt-3 font-display text-4xl tracking-[-0.05em] text-[#3525cd] dark:text-indigo-400 sm:text-5xl">Hall of Fame</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-[#464555] dark:text-slate-300 sm:text-base">
            {leaderboardTab === "multiplayer"
              ? "Global multiplayer rankings tracking battle victories, win rates, and co-op completions."
              : usingAccountTotals
              ? "One account row per player with cumulative points stacked across every saved run."
              : "Best run per player inside the selected board and match type."}
          </p>

          {/* Mode Switch: Single Player vs Multiplayer */}
          <div className="mt-5 flex justify-center">
            <div className="inline-flex rounded-full bg-white/80 dark:bg-slate-900/90 p-1.5 shadow-sm border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLeaderboardTab("single")}
                className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  leaderboardTab === "single"
                    ? "bg-[#3525cd] text-white shadow-md dark:bg-indigo-600"
                    : "text-[#64748b] hover:text-[#1e1b4b] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Single Player Leaderboard
              </button>
              <button
                type="button"
                onClick={() => setLeaderboardTab("multiplayer")}
                className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  leaderboardTab === "multiplayer"
                    ? "bg-[#3525cd] text-white shadow-md dark:bg-indigo-600"
                    : "text-[#64748b] hover:text-[#1e1b4b] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Multiplayer Clash Ranks
              </button>
            </div>
          </div>

          {/* Compact Normalized Filter Toolbar for Single Player */}
          {leaderboardTab === "single" && (
            <div className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-slate-400">Grid:</span>
                <select
                  value={gridFilter}
                  onChange={(e) => setGridFilter(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3 py-1.5 text-xs font-semibold text-[#1e1b4b] outline-none focus:border-[#3525cd]"
                >
                  <option value="all">All Boards</option>
                  <option value="4x4">4x4 Matrix</option>
                  <option value="5x6">5x6 Matrix</option>
                  <option value="6x6">6x6 Matrix</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-slate-400">Sort:</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1e1b4b] outline-none focus:border-[#3525cd] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="rating">Overall Rating</option>
                  <option value="points">Total Points</option>
                  <option value="fastest">Fastest Time</option>
                  <option value="accuracy">Highest Accuracy</option>
                  <option value="combo">Max Combo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-slate-400">Theme:</span>
                <select
                  value={matchTypeFilter}
                  onChange={(e) => setMatchTypeFilter(e.target.value as any)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#1e1b4b] outline-none focus:border-[#3525cd] dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                >
                  <option value="all">All Themes</option>
                  <option value="numbers">Numbers</option>
                  <option value="icons">Icons</option>
                  {hasLegacyRuns && <option value="standard">Legacy</option>}
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Top 3 Podium Section */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {leaderboardTab === "multiplayer" ? (
            loadingMp ? (
              <div className="glass-panel rounded-[2rem] p-8 text-center text-sm text-slate-500 md:col-span-3">
                Loading multiplayer rankings...
              </div>
            ) : podiumMp.length ? (
              podiumMp.map((entry, index) => {
                const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                return (
                  <article
                    key={entry.userId}
                    className={`rounded-[2rem] border p-5 text-center shadow-[0_20px_44px_rgba(53,37,205,0.07)] backdrop-blur-xl sm:p-6 ${
                      medalClasses[index] ?? "border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80"
                    }`}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white">
                      {index + 1}
                    </div>
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="mx-auto mt-4 h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-900"
                    />
                    <Link
                      to={`/profile/${entry.userId}`}
                      className="mt-4 inline-block text-xl font-semibold text-slate-900 hover:text-[#3525cd] dark:text-white dark:hover:text-indigo-400"
                    >
                      {entry.username}
                    </Link>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-[#3525cd] dark:text-indigo-400">
                      {entry.multiplayerWins} Multiplayer Win{entry.multiplayerWins === 1 ? "" : "s"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Win Rate {entry.winRate.toFixed(0)}% • {entry.totalBattles} Total Battles
                    </p>
                    <div className="mt-3 flex items-center justify-center">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4f46e5] dark:bg-slate-800 dark:text-slate-200">
                        {entry.rank}
                      </span>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="glass-panel rounded-[2rem] p-8 text-center text-sm text-slate-500 md:col-span-3">
                No multiplayer battles completed yet. Play a match to claim top rank!
              </div>
            )
          ) : podiumSingle.length ? (
            podiumSingle.map((entry, index) => {
              const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
              return (
                <article
                  key={entry.id}
                  className={`rounded-[2rem] border p-5 text-center shadow-[0_20px_44px_rgba(53,37,205,0.07)] backdrop-blur-xl sm:p-6 ${
                    medalClasses[index] ?? "border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80"
                  }`}
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white">
                    {index + 1}
                  </div>
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="mx-auto mt-4 h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-900"
                  />
                  <Link
                    to={`/profile/${entry.userId}`}
                    className="mt-4 inline-block text-xl font-semibold text-slate-900 hover:text-[#3525cd] dark:text-white dark:hover:text-indigo-400"
                  >
                    {entry.username}
                  </Link>
                  <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#3525cd] dark:text-indigo-400">
                    {formatNumber(entry.rating)} rating
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Best {formatNumber(entry.score)} • Total {formatNumber(entry.totalPoints)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]">
                    <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-slate-800 dark:text-slate-200">{entry.gridSize}</span>
                    <span className="rounded-full bg-white/80 px-3 py-1 dark:bg-slate-800 dark:text-slate-200">{matchTypeLabels[entry.matchType]}</span>
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

        {/* Main Table Section */}
        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {leaderboardTab === "multiplayer" ? "Multiplayer Clash Standings" : "Single Player Leaderboard"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {leaderboardTab === "multiplayer"
                ? "Ranked by multiplayer victories, win rates, and total competitive battle experience."
                : usingAccountTotals
                ? "One best row per player, with cumulative total points counting across all saved runs."
                : "Best row per player inside this filter."}
            </p>
          </div>

          <div className="overflow-x-auto">
            {leaderboardTab === "multiplayer" ? (
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Operative</th>
                    <th className="px-6 py-4">MP Wins</th>
                    <th className="px-6 py-4">Defeats</th>
                    <th className="px-6 py-4">Win Rate</th>
                    <th className="px-6 py-4">Co-Op Clears</th>
                    <th className="px-6 py-4">Level & XP</th>
                  </tr>
                </thead>
                <tbody>
                  {mpLeaderboard.length ? (
                    mpLeaderboard.map((entry, index) => {
                      const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                      const level = getLevelProgress(entry.xp);
                      return (
                        <tr key={entry.userId} className="border-t border-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200">
                          <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatar.image}
                                alt={avatar.name}
                                className="h-11 w-11 rounded-full border-2 border-white bg-slate-100 object-cover dark:border-slate-800 dark:bg-slate-900"
                              />
                              <div>
                                <Link
                                  to={`/profile/${entry.userId}`}
                                  className="font-semibold text-slate-900 hover:text-[#3525cd] dark:text-white dark:hover:text-indigo-400"
                                >
                                  {entry.username}
                                </Link>
                                <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">{entry.rank}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-[#3525cd] dark:text-indigo-400">{entry.multiplayerWins}</td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{entry.multiplayerLosses}</td>
                          <td className="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">{entry.winRate.toFixed(0)}%</td>
                          <td className="px-6 py-4 text-indigo-600 font-semibold dark:text-indigo-400">{entry.coopClears}</td>
                          <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                            Lvl {level.level} ({formatNumber(entry.xp)} XP)
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-sm text-slate-500 text-center">
                        No multiplayer battle rankings available yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-950 dark:text-slate-400">
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
                    visibleEntries.map((entry, index) => {
                      const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                      return (
                        <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-200">
                          <td className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">{index + 1}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={avatar.image}
                                alt={avatar.name}
                                className="h-11 w-11 rounded-full border-2 border-white bg-slate-100 object-cover dark:border-slate-800 dark:bg-slate-900"
                              />
                              <div>
                                <Link
                                  to={`/profile/${entry.userId}`}
                                  className="font-medium text-slate-900 hover:text-[#3525cd] dark:text-white dark:hover:text-indigo-400"
                                >
                                  {entry.username}
                                </Link>
                                <div className="text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                                  {matchTypeLabels[entry.matchType]} • {entry.gridSize}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#3525cd] dark:text-indigo-400">{formatNumber(entry.rating)}</td>
                          <td className="px-6 py-4 font-semibold text-[#0060ac] dark:text-sky-400">{formatNumber(entry.totalPoints)}</td>
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
            )}
          </div>
          {leaderboardTab === "single" && (
            <>
              <div ref={sentinelRef} className="h-2" />
              {canLoadMore && (
                <div className="border-t border-slate-100 px-6 py-5 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, rankedEntries.length))}
                    className="rounded-full border border-[#d9d8eb] bg-white/80 px-6 py-3 text-sm font-semibold text-[#3525cd] shadow-sm transition hover:bg-white"
                  >
                    Load More Players
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
};
