import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicSiteShell } from "../components/PublicSiteShell";
import { TrophyIcon } from "../components/AppIcons";
import { avatarOptions } from "../data/avatars";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";
import { fetchMultiplayerLeaderboard, type MultiplayerLeaderboardEntry } from "../lib/multiplayer";
import { useAppContext } from "../state/AppContext";
import type { LeaderboardEntry, MultiplayerGameMode } from "../types";

const PUBLIC_PREVIEW_LIMIT = 6;

const compareRanks = (a: LeaderboardEntry, b: LeaderboardEntry) => {
  if (b.rating !== a.rating) return b.rating - a.rating;
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  if (b.score !== a.score) return b.score - a.score;
  if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
  if (b.maxCombo !== a.maxCombo) return b.maxCombo - a.maxCombo;
  return a.duration - b.duration;
};

const fallbackRows = [
  { username: "SOLO_LEVELER", rating: 12500, totalPoints: 12500, score: 12500, accuracy: 88, maxCombo: 5, duration: 72, avatarId: "quantum-ray" },
  { username: "NEURON_GIRL", rating: 10800, totalPoints: 10800, score: 10800, accuracy: 84, maxCombo: 4, duration: 81, avatarId: "luna-spark" },
  { username: "KINETIC_BOY", rating: 9200, totalPoints: 9200, score: 9200, accuracy: 79, maxCombo: 4, duration: 94, avatarId: "ace-scout" },
] as const;

export const PublicRanksRoute = () => {
  const { accountLeaderboard, leaderboard } = useAppContext();
  const [activeTab, setActiveTab] = useState<"single" | "multiplayer">("single");
  const [mpModeFilter, setMpModeFilter] = useState<"all" | MultiplayerGameMode>("all");
  const [mpLeaderboard, setMpLeaderboard] = useState<MultiplayerLeaderboardEntry[]>([]);
  const [loadingMp, setLoadingMp] = useState(false);

  useEffect(() => {
    if (activeTab === "multiplayer") {
      setLoadingMp(true);
      fetchMultiplayerLeaderboard().then((data) => {
        setMpLeaderboard(data);
        setLoadingMp(false);
      });
    }
  }, [activeTab]);

  const rankedEntries = useMemo(() => {
    const source = accountLeaderboard.length ? accountLeaderboard : leaderboard;
    return [...source].sort(compareRanks);
  }, [accountLeaderboard, leaderboard]);

  const filteredMpEntries = useMemo(() => {
    return [...mpLeaderboard].sort((a, b) => {
      if (mpModeFilter === "all") {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.multiplayerWins !== a.multiplayerWins) return b.multiplayerWins - a.multiplayerWins;
        return b.xp - a.xp;
      }
      const aMode = a.modeStats?.[mpModeFilter] || { wins: 0, losses: 0, total: 0, points: 0, winRate: 0 };
      const bMode = b.modeStats?.[mpModeFilter] || { wins: 0, losses: 0, total: 0, points: 0, winRate: 0 };
      if (bMode.points !== aMode.points) return bMode.points - aMode.points;
      if (bMode.wins !== aMode.wins) return bMode.wins - aMode.wins;
      return b.xp - a.xp;
    });
  }, [mpLeaderboard, mpModeFilter]);

  const visibleEntries = rankedEntries.slice(0, PUBLIC_PREVIEW_LIMIT);
  const visibleMpEntries = filteredMpEntries.slice(0, PUBLIC_PREVIEW_LIMIT);
  const podiumSingle = rankedEntries.slice(0, 3);
  const podiumMp = filteredMpEntries.slice(0, 3);
  const empty = activeTab === "single" ? rankedEntries.length === 0 : filteredMpEntries.length === 0;

  return (
    <PublicSiteShell active="ranks">
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-b from-[#1c05b3] to-[#140494] text-white shadow-[0_18px_36px_rgba(28, 5, 179,0.22)]">
            <TrophyIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-5xl font-extrabold tracking-[-0.06em] text-[#0f172a] dark:text-white sm:text-7xl">
            MindGrid Ranks
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#475569] dark:text-slate-200 sm:text-lg">
            {activeTab === "single"
              ? "Track the strongest MindGrid runs across rating, total points, best scores, accuracy, combo strength, and clear time."
              : "Explore top neural operatives across real-time multiplayer duels, speed sprint races, and co-op grid syncs."}
          </p>

          {/* Mode Selector Pill Switch */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-full bg-white/80 dark:bg-slate-900/90 p-1.5 shadow-sm border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("single")}
                className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "single"
                    ? "bg-[#1c05b3] text-white shadow-md dark:bg-[#1c05b3]"
                    : "text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Single Player
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("multiplayer")}
                className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "multiplayer"
                    ? "bg-[#1c05b3] text-white shadow-md dark:bg-[#1c05b3]"
                    : "text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Multiplayer Clash
              </button>
            </div>
          </div>

          {activeTab === "multiplayer" && (
            <div className="mx-auto mt-4 flex max-w-sm items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/70 p-2.5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-slate-400">Mode:</span>
              <select
                value={mpModeFilter}
                onChange={(e) => setMpModeFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white px-3 py-1.5 text-xs font-semibold text-[#0f172a] outline-none focus:border-[#1c05b3]"
              >
                <option value="all">All Modes</option>
                <option value="speed_sprint">Speed Sprint Race</option>
                <option value="turn_based">Turn-Based Duel</option>
                <option value="coop">Co-Op Grid Sync</option>
              </select>
            </div>
          )}

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-full bg-gradient-to-b from-[#1c05b3] to-[#140494] px-8 py-4 font-semibold text-white shadow-[0_18px_30px_rgba(28, 5, 179,0.22)]">
              Join the Leaderboard
            </Link>
            <Link to="/login" className="rounded-full border border-[#cbd5e1] bg-white/80 px-8 py-4 font-semibold text-[#1c05b3] dark:border-slate-800 dark:bg-slate-900 dark:text-[#2406e2] dark:hover:bg-slate-800">
              Sign In
            </Link>
          </div>
        </section>

        <section className="mt-9 grid gap-4 md:grid-cols-3">
          {activeTab === "multiplayer" ? (
            loadingMp ? (
              <div className="glass-panel rounded-[2rem] p-8 text-center text-sm text-slate-500 md:col-span-3">
                Loading multiplayer rankings...
              </div>
            ) : podiumMp.length ? (
              podiumMp.map((entry, index) => {
                const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                const modeStat = mpModeFilter === "all" ? null : entry.modeStats?.[mpModeFilter];
                const pts = mpModeFilter === "all" ? entry.totalPoints : (modeStat?.points ?? 0);
                const wins = mpModeFilter === "all" ? entry.multiplayerWins : (modeStat?.wins ?? 0);
                const total = mpModeFilter === "all" ? entry.totalBattles : (modeStat?.total ?? 0);

                return (
                  <article
                    key={`${entry.userId}-${index}`}
                    className="glass-panel rounded-[2rem] p-6 text-center shadow-[0_20px_44px_rgba(28, 5, 179,0.07)] dark:border dark:border-slate-800 dark:bg-slate-900/90 dark:text-white"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm">
                      {index + 1}
                    </div>
                    <div
                      className={`mx-auto mt-4 w-fit rounded-full p-[3px] transition-all duration-300 ${
                        entry.isAdmin
                          ? "bg-gradient-to-r from-[#2406e2] via-[#2406e2] to-amber-400 shadow-[0_0_24px_rgba(28, 5, 179,0.55)] dark:shadow-[0_0_28px_rgba(28, 5, 179,0.75)]"
                          : entry.isBetaTester
                          ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] dark:shadow-[0_0_24px_rgba(245,158,11,0.7)]"
                          : ""
                      }`}
                    >
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 dark:border-slate-700 dark:bg-slate-900 object-cover shadow-md"
                      />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{entry.username}</h2>
                    <p className="mt-1 text-sm font-bold uppercase tracking-[0.18em] text-[#1c05b3] dark:text-[#2406e2]">
                      {formatNumber(pts)} MP Points
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {mpModeFilter === "coop" ? `${wins} Sync Clears` : `${wins} Wins`} • {total} Battles
                    </p>
                  </article>
                );
              })
            ) : (
              <div className="glass-panel rounded-[2rem] p-8 text-center text-sm text-slate-500 md:col-span-3">
                No multiplayer battles completed yet.
              </div>
            )
          ) : (podiumSingle.length ? podiumSingle : fallbackRows).slice(0, 3).map((entry, index) => {
            const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
            return (
              <article
                key={`${entry.username}-${index}`}
                className="glass-panel rounded-[2rem] p-6 text-center shadow-[0_20px_44px_rgba(28, 5, 179,0.07)] dark:border dark:border-slate-800 dark:bg-slate-900/90 dark:text-white"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm">
                  {index + 1}
                </div>
                <div
                  className={`mx-auto mt-4 w-fit rounded-full p-[3px] transition-all duration-300 ${
                    entry.isAdmin
                      ? "bg-gradient-to-r from-[#2406e2] via-[#2406e2] to-amber-400 shadow-[0_0_24px_rgba(28, 5, 179,0.55)] dark:shadow-[0_0_28px_rgba(28, 5, 179,0.75)]"
                      : entry.isBetaTester
                      ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] dark:shadow-[0_0_24px_rgba(245,158,11,0.7)]"
                      : ""
                  }`}
                >
                  <img
                    src={avatar.image}
                    alt={avatar.name}
                    className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 dark:border-slate-700 dark:bg-slate-900 object-cover shadow-md"
                  />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{entry.username}</h2>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#1c05b3] dark:text-[#2406e2]">{formatNumber(entry.rating)} rating</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Best {formatNumber(entry.score)} • Total {formatNumber(entry.totalPoints)}
                </p>
              </article>
            );
          })}
        </section>

        <section className="glass-panel mt-9 overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(28, 5, 179,0.08)] dark:border dark:border-slate-800 dark:bg-slate-900/90">
          <div className="border-b border-slate-200/70 dark:border-slate-800 px-5 py-5 sm:px-7">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">
              {activeTab === "single" ? "Single Player Leaderboard" : "Multiplayer Standings"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
              A preview of the strongest players right now. Create an account to compete for the full Hall of Fame.
            </p>
          </div>

          {empty ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              The public board is warming up. Create an account, finish a run, and become one of the first ranked players.
            </div>
          ) : activeTab === "multiplayer" ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleMpEntries.map((entry, index) => {
                const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                const modeStat = mpModeFilter === "all" ? null : entry.modeStats?.[mpModeFilter];
                const pts = mpModeFilter === "all" ? entry.totalPoints : (modeStat?.points ?? 0);
                const wins = mpModeFilter === "all" ? entry.multiplayerWins : (modeStat?.wins ?? 0);
                const losses = mpModeFilter === "all" ? entry.multiplayerLosses : (modeStat?.losses ?? 0);
                const winRate = mpModeFilter === "all" ? entry.winRate : (modeStat?.winRate ?? 0);
                const total = mpModeFilter === "all" ? entry.totalBattles : (modeStat?.total ?? 0);

                return (
                  <div key={entry.userId} className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-7">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0e4ff] text-sm font-bold text-[#1c05b3] dark:bg-slate-800 dark:text-[#c7ceff]">
                        {index + 1}
                      </span>
                      <div
                        className={`rounded-full p-[2px] transition-all duration-300 shrink-0 ${
                          entry.isAdmin
                            ? "bg-gradient-to-r from-[#2406e2] via-[#2406e2] to-amber-400 shadow-[0_0_12px_rgba(28, 5, 179,0.55)] dark:shadow-[0_0_16px_rgba(28, 5, 179,0.7)]"
                            : entry.isBetaTester
                            ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] dark:shadow-[0_0_14px_rgba(245,158,11,0.65)]"
                            : ""
                        }`}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="h-14 w-14 rounded-full border-2 border-white dark:border-slate-700 object-cover shadow-sm"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{entry.username}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{entry.rank}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <RankStat label="Points" value={formatNumber(pts)} strong />
                      <RankStat label={mpModeFilter === "coop" ? "Sync Clears" : "Wins"} value={String(wins)} />
                      {mpModeFilter !== "coop" && <RankStat label="Defeats" value={String(losses)} />}
                      {mpModeFilter !== "coop" && <RankStat label="Win Rate" value={`${winRate.toFixed(0)}%`} />}
                      <RankStat label="Battles" value={String(total)} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleEntries.map((entry, index) => {
                const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                return (
                  <div key={entry.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-7">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e0e4ff] text-sm font-bold text-[#1c05b3] dark:bg-slate-800 dark:text-[#c7ceff]">
                        {index + 1}
                      </span>
                      <div
                        className={`rounded-full p-[2px] transition-all duration-300 shrink-0 ${
                          entry.isAdmin
                            ? "bg-gradient-to-r from-[#2406e2] via-[#2406e2] to-amber-400 shadow-[0_0_12px_rgba(28, 5, 179,0.55)] dark:shadow-[0_0_16px_rgba(28, 5, 179,0.7)]"
                            : entry.isBetaTester
                            ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] dark:shadow-[0_0_14px_rgba(245,158,11,0.65)]"
                            : ""
                        }`}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="h-14 w-14 rounded-full border-2 border-white dark:border-slate-700 object-cover shadow-sm"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{entry.username}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {entry.gridSize} • {entry.matchType}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                      <RankStat label="Rating" value={formatNumber(entry.rating)} strong />
                      <RankStat label="Points" value={formatNumber(entry.totalPoints)} />
                      <RankStat label="Best" value={formatNumber(entry.score)} />
                      <RankStat label="Accuracy" value={formatPercent(entry.accuracy)} />
                      <RankStat label="Time" value={formatDuration(entry.duration)} />
                    </div>
                    <div className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-[#1c05b3] shadow-sm dark:bg-slate-800 dark:text-[#c7ceff]">
                      x{entry.maxCombo}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!empty ? (
            <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-6 text-center">
              <div className="mt-2 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-b from-[#1c05b3] to-[#140494] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(28, 5, 179,0.18)]"
                >
                  Join the Leaderboard
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-[#cbd5e1] bg-white/80 dark:border-slate-800 dark:bg-slate-900 dark:text-white px-6 py-3 text-sm font-semibold text-[#1c05b3] shadow-sm"
                >
                  Sign In to View Full Ranks
                </Link>
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </PublicSiteShell>
  );
};

const RankStat = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div>
    <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className={`mt-1 font-semibold ${strong ? "text-[#1c05b3] dark:text-[#2406e2]" : "text-slate-800 dark:text-slate-200"}`}>{value}</p>
  </div>
);
