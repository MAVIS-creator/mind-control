import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import {
  BrandMotionMark,
  ClockIcon,
  GridIcon,
  PlayIcon,
  SparklesIcon,
  StarBadgeIcon,
  TrophyIcon,
} from "../components/AppIcons";
import { PublicSiteShell } from "../components/PublicSiteShell";
import { avatarOptions } from "../data/avatars";
import { formatNumber, isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

const fallbackRanks = [
  { name: "SOLO_LEVELER", rank: "ZENITH LORD", score: 12500, avatarId: "quantum-ray" },
  { name: "NEURON_GIRL", rank: "ELITE MIND", score: 10800, avatarId: "luna-spark" },
  { name: "KINETIC_BOY", rank: "ELITE MIND", score: 9200, avatarId: "ace-scout" },
];

const gameSteps = [
  {
    title: "Choose your board",
    text: "Start with 4 x 4, stretch into 5 x 6, or push your memory on 6 x 6.",
    icon: GridIcon,
  },
  {
    title: "Flip and match",
    text: "Reveal two cards at a time, read the pattern, and keep mistakes low.",
    icon: PlayIcon,
  },
  {
    title: "Protect the run",
    text: "Timer, move limits, accuracy, and combo all shape your final rating.",
    icon: ClockIcon,
  },
  {
    title: "Climb the ranks",
    text: "Only your best category run ranks, while total points keep stacking.",
    icon: TrophyIcon,
  },
];

export const LandingRoute = () => {
  const { session, leaderboard, accountLeaderboard } = useAppContext();

  if (session) {
    if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
      return <Navigate to="/complete-email" replace />;
    }
    return <Navigate to="/play" replace />;
  }

  const previewRanks = (() => {
    if (accountLeaderboard.length === 0) return fallbackRanks;
    return [...accountLeaderboard]
      .sort((a, b) => b.totalPoints - a.totalPoints || b.rating - a.rating)
      .slice(0, 3)
      .map((entry) => ({
        name: entry.username.toUpperCase(),
        rank: `${formatNumber(entry.totalPoints)} TOTAL`,
        score: entry.totalPoints,
        avatarId: entry.avatarId,
      }));
  })();

  const bestScore = accountLeaderboard[0]?.score ?? leaderboard[0]?.score ?? 17983;
  const totalPlayers = accountLeaderboard.length || new Set(leaderboard.map((entry) => entry.userId)).size || 42;

  return (
    <PublicSiteShell active="home">
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#3525cd] shadow-[0_14px_30px_rgba(53,37,205,0.08)] backdrop-blur-xl sm:text-xs">
              <SparklesIcon className="h-4 w-4" />
              Premium memory battles
            </div>
            <BrandMotionMark className="mx-auto mt-8 w-[15rem] sm:w-[21rem] lg:mx-0 lg:w-[24rem]" />
            <h1 className="mt-7 font-display text-[3.4rem] font-extrabold uppercase leading-[0.88] tracking-[-0.08em] text-[#3525cd] sm:text-[5.5rem] lg:text-[6.7rem]">
              MindGrid
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[1rem] leading-8 text-[#4f5568] sm:text-[1.16rem] sm:leading-9 lg:mx-0">
              Train your memory through fast classic boards, clean scoring, combos, move limits, and account-based ranks built for repeat runs.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 text-[1.05rem] font-semibold text-white shadow-[0_18px_30px_rgba(53,37,205,0.22)] transition hover:scale-[1.01]"
              >
                <PlayIcon className="h-5 w-5" />
                Start Playing
              </Link>
              <Link
                to="/ranks"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[#d9d8eb] bg-white/80 px-8 py-4 text-[1rem] font-semibold text-[#3525cd] shadow-[0_12px_24px_rgba(53,37,205,0.06)] transition hover:border-[#c5c2e5] hover:bg-white"
              >
                View Ranks
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-panel rounded-[2.1rem] p-5 shadow-[0_18px_40px_rgba(53,37,205,0.08)] sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8395]">Live preview</p>
                <h2 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-[#111c2d]">Global Rank</h2>
              </div>
              <TrophyIcon className="h-6 w-6 text-[#667085]" />
            </div>
            <div className="space-y-4">
              {previewRanks.map((entry, index) => {
                const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                return (
                  <div key={`${entry.name}-${index}`} className="flex items-center justify-between gap-3 rounded-[1.4rem] border border-white/70 bg-white/72 p-4 shadow-[0_10px_24px_rgba(53,37,205,0.05)]">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={avatar.image} alt={entry.name} className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d8e3fb] text-[0.65rem] font-bold text-[#111c2d]">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#111c2d]">{entry.name}</p>
                        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#3525cd]">{entry.rank}</p>
                      </div>
                    </div>
                    <p className="text-[1.75rem] font-bold tracking-[-0.04em] text-[#3525cd]">
                      {entry.score >= 1000 ? `${(entry.score / 1000).toFixed(1)}k` : formatNumber(entry.score)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.aside>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Boards", "3", "4 x 4, 5 x 6, and 6 x 6"],
            ["Top score", formatNumber(bestScore), "Best recorded run"],
            ["Players", formatNumber(totalPlayers), "Accounts on the board"],
          ].map(([label, value, note]) => (
            <div key={label} className="glass-panel rounded-[1.6rem] px-5 py-5 text-center shadow-[0_12px_30px_rgba(53,37,205,0.05)]">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7d8395]">{label}</p>
              <p className="mt-2 text-[2rem] font-bold tracking-[-0.05em] text-[#3525cd]">{value}</p>
              <p className="mt-1 text-sm text-[#5a6174]">{note}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3525cd]">How it plays</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-[#111c2d] sm:text-5xl">
              A simple memory game with real score pressure.
            </h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {gameSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="glass-panel rounded-[1.7rem] p-6 shadow-[0_14px_32px_rgba(53,37,205,0.06)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#f1efff] text-[#3525cd] shadow-[0_12px_24px_rgba(53,37,205,0.08)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#111c2d]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#586074]">{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-6 shadow-[0_14px_32px_rgba(53,37,205,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8395]">MVP modes</p>
            <h2 className="mt-3 text-[2.2rem] font-bold tracking-[-0.05em] text-[#111c2d]">Classic Sync is the main arena.</h2>
            <p className="mt-4 text-base leading-8 text-[#586074]">
              MindGrid currently focuses on one polished single-player mode: timed pair matching with move limits, combo feedback, score rating, and persistent leaderboard runs.
            </p>
          </div>
          <div className="glass-panel rounded-[2rem] p-6 shadow-[0_14px_32px_rgba(53,37,205,0.06)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8395]">Leaderboard logic</p>
            <h2 className="mt-3 text-[2.2rem] font-bold tracking-[-0.05em] text-[#6b00b7]">Best run ranks. Points stack.</h2>
            <p className="mt-4 text-base leading-8 text-[#586074]">
              Your leaderboard position uses your strongest eligible run, while every saved run keeps adding account points for long-term progress.
            </p>
          </div>
        </section>

        <section className="mt-10 glass-panel rounded-[2.2rem] p-6 text-center shadow-[0_18px_40px_rgba(53,37,205,0.08)] sm:p-10">
          <StarBadgeIcon className="mx-auto h-10 w-10 text-[#3525cd]" />
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-[#111c2d]">Ready to enter the grid?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[#586074]">
            Create an account, choose an avatar, and start chasing your first ranked memory run.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 font-semibold text-white shadow-[0_18px_30px_rgba(53,37,205,0.22)]">
              Create Account
            </Link>
            <Link to="/contact" className="rounded-full border border-[#d9d8eb] bg-white/80 px-8 py-4 font-semibold text-[#3525cd]">
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
};
