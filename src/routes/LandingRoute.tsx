import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { BrandMotionMark, GridIcon, HomeIcon, TrophyIcon, UserIcon } from "../components/AppIcons";
import { avatarOptions } from "../data/avatars";
import { formatNumber } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

const fallbackRanks = [
  { name: "SOLO_LEVELER", rank: "ZENITH LORD", score: 12500, avatarId: "quantum-ray" },
  { name: "NEURON_GIRL", rank: "ELITE MIND", score: 10800, avatarId: "luna-spark" },
  { name: "KINETIC_BOY", rank: "ELITE MIND", score: 9200, avatarId: "ace-scout" },
];

export const LandingRoute = () => {
  const { session, leaderboard, accountLeaderboard } = useAppContext();

  if (session) {
    return <Navigate to="/play" replace />;
  }

  const previewRanks = (() => {
    if (accountLeaderboard.length === 0) return fallbackRanks;
    return accountLeaderboard
      .sort((a, b) => b.totalPoints - a.totalPoints || b.rating - a.rating)
      .slice(0, 3)
      .map((entry) => ({
        name: entry.username.toUpperCase(),
        rank: `${entry.totalPoints.toLocaleString()} TOTAL`,
        score: entry.totalPoints,
        avatarId: entry.avatarId,
      }));
  })();

  const bestScore = accountLeaderboard[0]?.score ?? leaderboard[0]?.score ?? 17983;
  const totalPlayers = accountLeaderboard.length || new Set(leaderboard.map((entry) => entry.userId)).size || 42;

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-14 top-16 h-[24rem] w-[24rem] rounded-full bg-[#8a70ff]/16 blur-[95px]" />
        <div className="absolute right-0 top-4 h-[26rem] w-[26rem] rounded-full bg-[#64a8fe]/16 blur-[95px]" />
        <div className="absolute bottom-10 left-1/3 h-[22rem] w-[22rem] rounded-full bg-[#6b00b7]/10 blur-[110px]" />
      </div>

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.78fr] lg:gap-7">
          <section className="space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-1 pt-3 text-center sm:px-2 sm:pt-6"
            >
              <div className="mx-auto flex max-w-3xl flex-col items-center">
                <BrandMotionMark className="mb-5 h-24 w-24 sm:mb-7 sm:h-32 sm:w-32" />
                <h1 className="font-display text-[2.8rem] font-extrabold tracking-[-0.08em] text-[#3525cd] sm:text-[4.2rem] lg:text-[5rem]">
                  MINDGRID
                </h1>
                <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-[#4f5568] sm:mt-5 sm:text-[1.15rem] sm:leading-9">
                  Memory battles with fast boards, clean score chasing, and a focused single-player flow built for repeat runs.
                </p>
              </div>
            </motion.div>

            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="glass-panel rounded-[2rem] px-4 py-6 shadow-[0_20px_45px_rgba(53,37,205,0.08)] sm:rounded-[2.4rem] sm:px-8 sm:py-8"
            >
              <div className="flex flex-col items-center gap-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex w-full max-w-[22rem] items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 text-[1.05rem] font-semibold text-white shadow-[0_18px_30px_rgba(53,37,205,0.22)] transition hover:scale-[1.01] sm:px-10 sm:py-5 sm:text-[1.15rem]"
                >
                  <span className="text-base">▶</span>
                  Play Now
                </Link>

                <div className="grid w-full gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-8">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Boards</p>
                    <p className="mt-2 text-[2rem] font-bold text-[#3525cd]">3</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Themes</p>
                    <p className="mt-2 text-[2rem] font-bold text-[#3525cd]">2</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Top Score</p>
                    <p className="mt-2 text-[2rem] font-bold text-[#3525cd]">{bestScore.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="grid gap-5 md:grid-cols-2 md:gap-6">
              <motion.article
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="glass-panel rounded-[1.8rem] p-5 shadow-[0_14px_32px_rgba(53,37,205,0.06)] sm:rounded-[2rem] sm:p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#111c2d]">Classic Sync</h2>
                    <p className="mt-2 text-[1rem] leading-7 text-[#586074]">
                      Match pairs against the clock, hold your combo, and finish clean for a stronger Hall of Fame score.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[#f1efff] text-[#3525cd]">
                    <GridIcon className="h-7 w-7" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["4 x 4", "5 x 6", "6 x 6"].map((board) => (
                    <div key={board} className="rounded-[1.3rem] border border-[#e8eaf5] bg-white/75 px-4 py-4 text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">Board</p>
                      <p className="mt-2 text-lg font-bold text-[#1a2340]">{board}</p>
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="glass-panel rounded-[1.8rem] p-5 shadow-[0_14px_32px_rgba(53,37,205,0.06)] sm:rounded-[2rem] sm:p-6"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#6b00b7] to-[#4f46e5] text-white shadow-inner">
                    <TrophyIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">Hall of Fame</p>
                    <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#6b00b7]">Score Chase</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-[1.2rem] bg-white/78 px-4 py-4 text-sm font-medium text-[#1b2441]">
                    <span>Ranked players</span>
                    <span className="text-lg font-bold text-[#3525cd]">{totalPlayers}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.2rem] bg-white/78 px-4 py-4 text-sm font-medium text-[#1b2441]">
                    <span>Best score on record</span>
                    <span className="text-lg font-bold text-[#3525cd]">{bestScore.toLocaleString()}</span>
                  </div>
                  <Link to="/hall-of-fame" className="inline-flex w-full items-center justify-center rounded-full border border-[#d9d8eb] bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#3525cd]">
                    View Ranks
                  </Link>
                </div>
              </motion.article>
            </div>
          </section>

          <aside className="space-y-5 lg:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-[1.8rem] p-5 shadow-[0_14px_32px_rgba(53,37,205,0.06)] sm:rounded-[2rem] sm:p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#111c2d]">Global Rank</h2>
                <TrophyIcon className="h-6 w-6 text-[#667085]" />
              </div>
              <div className="space-y-4">
                {previewRanks.map((entry, index) => (
                  <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-3 rounded-[1.4rem] bg-white/58 p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={(avatarOptions.find((avatar) => avatar.id === entry.avatarId) ?? avatarOptions[0]).image}
                          alt={entry.name}
                          className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8e3fb] text-[0.65rem] font-bold text-[#111c2d]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#111c2d]">{entry.name}</p>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#3525cd]">{entry.rank}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-[1.65rem] font-bold tracking-[-0.04em] text-[#3525cd] sm:text-[2rem]">
                      {entry.score >= 1000 ? `${(entry.score / 1000).toFixed(1)}k` : formatNumber(entry.score)}
                    </p>
                  </div>
                ))}
              </div>
              <Link to="/hall-of-fame" className="mt-6 inline-flex w-full justify-center text-sm font-semibold uppercase tracking-[0.18em] text-[#3525cd]">
                View Full Leaderboard
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="glass-panel rounded-[1.8rem] p-5 shadow-[0_14px_32px_rgba(53,37,205,0.06)] sm:rounded-[2rem] sm:p-6"
            >
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">What&apos;s live</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[1.05rem] text-[#111c2d]">
                  <span>Single-player mode</span>
                  <span className="font-bold text-[#3525cd]">Classic Sync</span>
                </div>
                <div className="flex items-center justify-between text-[1.05rem] text-[#111c2d]">
                  <span>Card themes</span>
                  <span className="font-bold text-[#3525cd]">Numbers / Icons</span>
                </div>
                <div className="flex items-center justify-between text-[1.05rem] text-[#111c2d]">
                  <span>Score saving</span>
                  <span className="font-bold text-[#3525cd]">Enabled</span>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        <div className="fixed bottom-5 left-5 hidden rounded-full bg-white/82 p-2 shadow-[0_18px_40px_rgba(53,37,205,0.12)] backdrop-blur-xl md:flex md:flex-col md:gap-2">
          <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4f46e5] text-white">
            <HomeIcon className="h-5 w-5" />
          </Link>
          <Link to="/hall-of-fame" className="flex h-12 w-12 items-center justify-center rounded-full text-[#3525cd]">
            <TrophyIcon className="h-5 w-5" />
          </Link>
          <Link to="/login" className="flex h-12 w-12 items-center justify-center rounded-full text-[#3525cd]">
            <UserIcon className="h-5 w-5" />
          </Link>
        </div>
      </main>
    </div>
  );
};
