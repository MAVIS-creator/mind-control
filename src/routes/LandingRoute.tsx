import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { BrandMarkIcon, HomeIcon, TrophyIcon, UserIcon } from "../components/AppIcons";
import { useAppContext } from "../state/AppContext";

const leaderboardPreview = [
  { name: "SOLO_LEVELER", rank: "ZENITH LORD", score: "12.5k", color: "border-[#4f46e5]" },
  { name: "NEURON_GIRL", rank: "ELITE MIND", score: "10.8k", color: "border-transparent" },
  { name: "KINETIC_BOY", rank: "ELITE MIND", score: "9.2k", color: "border-transparent" },
] as const;

export const LandingRoute = () => {
  const { session } = useAppContext();

  if (session) {
    return <Navigate to="/play" replace />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_40%,_#d4e3ff_100%)]">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#4f46e5]/20 blur-[90px]" />
        <div className="absolute bottom-20 right-0 h-[24rem] w-[24rem] rounded-full bg-[#862dd4]/20 blur-[90px]" />
        <div className="absolute left-1/3 top-1/2 h-[18rem] w-[18rem] rounded-full bg-[#64a8fe]/18 blur-[90px]" />
      </div>

      <main className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <section className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <BrandMarkIcon className="mb-6 h-32 w-32 rotate-3 shadow-[0_18px_40px_rgba(53,37,205,0.18)]" />
              <h1 className="font-display text-[3.8rem] font-extrabold tracking-[-0.06em] text-[#3525cd] md:text-[4.4rem]">
                MINDGRID
              </h1>
              <p className="mt-4 max-w-xl text-[1.1rem] leading-8 text-[#464555]">
                Master your focus. Unlock your mental potential one puzzle at a time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="glass-panel rounded-[2.2rem] p-8 shadow-[0_18px_40px_rgba(53,37,205,0.08)]"
            >
              <div className="flex flex-col items-center gap-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex min-w-[20rem] items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-10 py-5 text-[1.1rem] font-semibold text-white shadow-[0_14px_28px_rgba(53,37,205,0.25)]"
                >
                  <span className="text-base">▶</span>
                  Play Now
                </Link>

                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">Level</p>
                    <p className="mt-1 text-[2rem] font-bold text-[#3525cd]">24</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">Games</p>
                    <p className="mt-1 text-[2rem] font-bold text-[#3525cd]">142</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">Streak</p>
                    <p className="mt-1 text-[2rem] font-bold text-[#3525cd]">7</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              <motion.article
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="glass-panel rounded-[2rem] p-6 shadow-[0_12px_30px_rgba(53,37,205,0.06)]"
              >
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#111c2d]">Daily Challenge</h2>
                    <p className="text-sm text-[#464555]">The Paradox Prism</p>
                  </div>
                  <div className="rounded-full border border-[#c9b8ff] bg-[#f0dbff]/60 px-3 py-1 text-sm font-semibold text-[#6b00b7]">
                    14:22:05
                  </div>
                </div>
                <div className="mb-5 aspect-video rounded-[1.7rem] bg-[radial-gradient(circle_at_50%_20%,_#8d2bd5_0%,_#40136e_45%,_#10111f_100%)]" />
                <Link
                  to="/login"
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#64a8fe] px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#0f2140]"
                >
                  Start Challenge
                </Link>
              </motion.article>

              <motion.article
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="glass-panel rounded-[2rem] p-6 shadow-[0_12px_30px_rgba(53,37,205,0.06)]"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[#6b00b7] to-[#4f46e5] text-white shadow-inner">
                    <TrophyIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">Current Rank</p>
                    <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#6b00b7]">Memory Master</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-[#111c2d]">
                    <span>XP Progress</span>
                    <span>1,250 / 2,000</span>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-[#d8e3fb]">
                    <div className="h-full w-[62.5%] rounded-full bg-gradient-to-r from-[#64a8fe] via-[#4f46e5] to-[#6b00b7]" />
                  </div>
                  <p className="text-[1.05rem] italic text-[#464555]">750 XP until “Cognitive Architect”</p>
                </div>
              </motion.article>
            </div>
          </section>

          <aside className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-[2rem] p-6 shadow-[0_12px_30px_rgba(53,37,205,0.06)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-[2rem] font-bold tracking-[-0.04em] text-[#111c2d]">Global Rank</h2>
                <TrophyIcon className="h-6 w-6 text-[#667085]" />
              </div>
              <div className="space-y-4">
                {leaderboardPreview.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center justify-between rounded-[1.4rem] bg-white/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`relative rounded-full border-2 ${entry.color}`}>
                        <div className="h-12 w-12 rounded-full bg-[radial-gradient(circle_at_40%_30%,_#9aa8ff_0%,_#5a2db2_38%,_#18233b_100%)]" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8e3fb] text-[0.65rem] font-bold text-[#111c2d]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#111c2d]">{entry.name}</p>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[#3525cd]">{entry.rank}</p>
                      </div>
                    </div>
                    <p className="text-[2rem] font-bold tracking-[-0.04em] text-[#3525cd]">{entry.score}</p>
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
              className="glass-panel rounded-[2rem] p-6 shadow-[0_12px_30px_rgba(53,37,205,0.06)]"
            >
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">Recent Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[1.05rem] text-[#111c2d]">
                  <span>Avg. Reaction Time</span>
                  <span className="font-bold text-[#3525cd]">245ms</span>
                </div>
                <div className="flex items-center justify-between text-[1.05rem] text-[#111c2d]">
                  <span>Focus Score</span>
                  <span className="font-bold text-[#3525cd]">88/100</span>
                </div>
                <div className="flex items-center justify-between text-[1.05rem] text-[#111c2d]">
                  <span>Daily Goal</span>
                  <span className="font-bold text-[#3525cd]">3 / 5</span>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>

        <div className="fixed bottom-5 left-5 hidden rounded-full bg-white/80 p-2 shadow-[0_18px_40px_rgba(53,37,205,0.12)] backdrop-blur-xl md:flex md:flex-col md:gap-2">
          <Link to="/play" className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4f46e5] text-white">
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
