import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PublicSiteShell } from "../components/PublicSiteShell";
import { TrophyIcon } from "../components/AppIcons";
import { avatarOptions } from "../data/avatars";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { LeaderboardEntry } from "../types";

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

  const rankedEntries = useMemo(() => {
    const source = accountLeaderboard.length ? accountLeaderboard : leaderboard;
    return [...source].sort(compareRanks);
  }, [accountLeaderboard, leaderboard]);

  const visibleEntries = rankedEntries.slice(0, PUBLIC_PREVIEW_LIMIT);
  const podium = rankedEntries.slice(0, 3);
  const empty = rankedEntries.length === 0;
  const hiddenPlayerCount = Math.max(rankedEntries.length - PUBLIC_PREVIEW_LIMIT, 0);

  return (
    <PublicSiteShell active="ranks">
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-white shadow-[0_18px_36px_rgba(53,37,205,0.22)]">
            <TrophyIcon className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-5xl font-extrabold tracking-[-0.06em] text-[#3525cd] sm:text-7xl">
            MindGrid Ranks
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#4f5568] sm:text-lg">
            Track the strongest MindGrid runs across rating, total points, best scores, accuracy, combo strength, and clear time.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 font-semibold text-white shadow-[0_18px_30px_rgba(53,37,205,0.22)]">
              Join the Leaderboard
            </Link>
            <Link to="/login" className="rounded-full border border-[#d9d8eb] bg-white/80 px-8 py-4 font-semibold text-[#3525cd]">
              Sign In
            </Link>
          </div>
        </section>

        <section className="mt-9 grid gap-4 md:grid-cols-3">
          {(podium.length ? podium : fallbackRows).slice(0, 3).map((entry, index) => {
            const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
            return (
              <article
                key={`${entry.username}-${index}`}
                className="glass-panel rounded-[2rem] p-6 text-center shadow-[0_20px_44px_rgba(53,37,205,0.07)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 shadow-sm">
                  {index + 1}
                </div>
                <img src={avatar.image} alt={avatar.name} className="mx-auto mt-4 h-24 w-24 rounded-full border-4 border-white bg-slate-100 object-cover shadow-md" />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{entry.username}</h2>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-[#3525cd]">{formatNumber(entry.rating)} rating</p>
                <p className="mt-2 text-sm text-slate-500">
                  Best {formatNumber(entry.score)} • Total {formatNumber(entry.totalPoints)}
                </p>
              </article>
            );
          })}
        </section>

        <section className="glass-panel mt-9 overflow-hidden rounded-[2rem] shadow-[0_18px_40px_rgba(53,37,205,0.08)]">
          <div className="border-b border-slate-200/70 px-5 py-5 sm:px-7">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">Leaderboard</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              A preview of the strongest players right now. Create an account to compete for the full Hall of Fame.
            </p>
          </div>

          {empty ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              The public board is warming up. Create an account, finish a run, and become one of the first ranked players.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleEntries.map((entry, index) => {
                const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                return (
                  <div key={entry.id} className="grid gap-4 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-7">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0edff] text-sm font-bold text-[#3525cd]">
                        {index + 1}
                      </span>
                      <img src={avatar.image} alt={avatar.name} className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm" />
                      <div>
                        <p className="font-semibold text-slate-900">{entry.username}</p>
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
                    <div className="rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-[#3525cd] shadow-sm">
                      x{entry.maxCombo}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!empty ? (
            <div className="border-t border-slate-100 px-5 py-6 text-center">
              <p className="text-sm leading-6 text-slate-500">
                {hiddenPlayerCount > 0
                  ? `${hiddenPlayerCount} more ranked players are waiting inside the full Hall of Fame.`
                  : "The full Hall of Fame unlocks after you join and save your first run."}
              </p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(53,37,205,0.18)]"
                >
                  Join the Leaderboard
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-[#d9d8eb] bg-white/80 px-6 py-3 text-sm font-semibold text-[#3525cd] shadow-sm"
                >
                  Sign In to View More
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
    <p className={`mt-1 font-semibold ${strong ? "text-[#3525cd]" : "text-slate-800"}`}>{value}</p>
  </div>
);
