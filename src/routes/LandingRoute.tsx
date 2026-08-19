import { useEffect, useState } from "react";
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

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        "To install MindGrid as a Web App on your device:\n\n• On iOS (Safari): Tap the Share button ➔ 'Add to Home Screen'\n• On Android / Chrome: Tap Menu (3 dots) ➔ 'Install App' or 'Add to Home Screen'",
      );
    }
  };

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
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#1d4ed8] shadow-[0_14px_30px_rgba(37,99,235,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-white sm:text-xs">
                <SparklesIcon className="h-4 w-4 text-[#2563eb] dark:text-sky-400" />
                Live Multiplayer Clash & PWA Web App
              </div>
              <a
                href="https://klyvex-studios.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm backdrop-blur-xl transition hover:bg-blue-100 hover:scale-[1.02] dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-sky-300 dark:hover:bg-blue-900/80 sm:text-xs"
              >
                <img src="/klyvex_logo.png" alt="Klyvex Studios" className="h-4 w-4 rounded-full object-cover" />
                By Klyvex Studios
              </a>
            </div>
            <BrandMotionMark className="mx-auto mt-8 w-[15rem] sm:w-[21rem] lg:mx-0 lg:w-[24rem]" />
            <h1 className="mt-7 font-display text-[3.4rem] font-extrabold uppercase leading-[0.88] tracking-[-0.08em] text-[#1d4ed8] dark:text-white sm:text-[5.5rem] lg:text-[6.7rem]">
              MindGrid
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[1rem] leading-8 text-[#475569] dark:text-slate-200 sm:text-[1.16rem] sm:leading-9 lg:mx-0">
              Compete in real-time Multiplayer Duels, Speed Sprint Races, Co-Op Sync, and Solo Memory Boards with 1.5x score boosts, 3D glass boards, and global rankings.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-8 py-4 text-[1.05rem] font-semibold text-white shadow-[0_18px_30px_rgba(37,99,235,0.22)] transition hover:scale-[1.01]"
              >
                <PlayIcon className="h-5 w-5" />
                Start Playing
              </Link>
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-white/90 px-7 py-4 text-[1rem] font-semibold text-[#1d4ed8] shadow-[0_12px_24px_rgba(37,99,235,0.06)] transition hover:border-[#93c5fd] hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                <SparklesIcon className="h-4 w-4 text-[#2563eb] dark:text-sky-400" />
                {isStandalone ? "App Installed" : "Install Web App"}
              </button>
              <Link
                to="/ranks"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-[#cbd5e1] bg-white/80 px-7 py-4 text-[1rem] font-semibold text-[#1d4ed8] shadow-[0_12px_24px_rgba(37,99,235,0.06)] transition hover:border-[#93c5fd] hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                View Ranks
              </Link>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="glass-panel rounded-[2.1rem] p-5 shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:p-6 dark:border dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#64748b] dark:text-slate-400">Current Hall of Fame</p>
                <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#0f172a] dark:text-white">Leaderboard Preview</h2>
              </div>
              <Link
                to="/ranks"
                className="rounded-full bg-[#e0f2fe] px-4 py-2 text-xs font-semibold text-[#0284c7] transition hover:bg-[#bae6fd] dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
              >
                Full Board
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {previewRanks.map((rank, index) => {
                const avatar = avatarOptions.find((item) => item.id === rank.avatarId) ?? avatarOptions[0];
                return (
                  <div
                    key={rank.name}
                    className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/76 p-3 shadow-sm transition hover:border-[#93c5fd] dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e0f2fe] text-xs font-bold text-[#0284c7] dark:bg-slate-800 dark:text-sky-300">
                        {index + 1}
                      </span>
                      <img src={avatar.image} alt="" className="h-10 w-10 rounded-full border border-white dark:border-slate-700 object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-[#0f172a] dark:text-white">{rank.name}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-[#64748b] dark:text-slate-400">{rank.rank}</p>
                      </div>
                    </div>
                    <span className="font-display text-sm font-bold text-[#0284c7] dark:text-sky-400">{formatNumber(rank.score)}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#e2e8f0] pt-4 dark:border-slate-800">
              <div className="rounded-2xl bg-[#f0f9ff] p-3 text-center dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-[#64748b] dark:text-slate-400">Peak Rating</p>
                <p className="mt-1 font-display text-xl font-bold text-[#0284c7] dark:text-sky-400">{formatNumber(bestScore)}</p>
              </div>
              <div className="rounded-2xl bg-[#f0f9ff] p-3 text-center dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.2em] text-[#64748b] dark:text-slate-400">Operatives</p>
                <p className="mt-1 font-display text-xl font-bold text-[#0f172a] dark:text-white">{formatNumber(totalPlayers)}</p>
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="mt-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#0284c7] dark:text-sky-400">How it plays</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-[#0f172a] dark:text-white sm:text-5xl">
              A simple memory game with real score pressure.
            </h2>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {gameSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article key={step.title} className="glass-panel rounded-[1.7rem] p-6 shadow-[0_14px_32px_rgba(37,99,235,0.06)] dark:border dark:border-slate-800 dark:bg-slate-900/90">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#e0f2fe] text-[#0284c7] dark:bg-slate-800 dark:text-white shadow-[0_12px_24px_rgba(37,99,235,0.08)]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[#0f172a] dark:text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#475569] dark:text-slate-300">{step.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-6 shadow-[0_14px_32px_rgba(37,99,235,0.06)] sm:p-8 dark:border dark:border-slate-800 dark:bg-slate-900/90">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#64748b] dark:text-slate-400">MVP modes</p>
            <h2 className="mt-3 text-[2.2rem] font-bold tracking-[-0.05em] text-[#0f172a] dark:text-white">Classic Sync is the main arena.</h2>
            <p className="mt-4 text-base leading-8 text-[#475569] dark:text-slate-300">
              MindGrid currently focuses on one polished single-player mode: timed pair matching with move limits, combo feedback, score rating, and persistent leaderboard runs.
            </p>
          </div>
          <div className="glass-panel rounded-[2rem] p-6 shadow-[0_14px_32px_rgba(37,99,235,0.06)] sm:p-8 dark:border dark:border-slate-800 dark:bg-slate-900/90">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#64748b] dark:text-slate-400">Leaderboard logic</p>
            <h2 className="mt-3 text-[2.2rem] font-bold tracking-[-0.05em] text-[#0284c7] dark:text-sky-300">Best run ranks. Points stack.</h2>
            <p className="mt-4 text-base leading-8 text-[#475569] dark:text-slate-300">
              Your leaderboard position uses your strongest eligible run, while every saved run keeps adding account points for long-term progress.
            </p>
          </div>
        </section>

        {/* Klyvex Studios Studio Spotlight */}
        <section className="mt-10 glass-panel overflow-hidden rounded-[2.2rem] p-6 sm:p-8 shadow-[0_18px_40px_rgba(37,99,235,0.08)] dark:border dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row text-center md:text-left">
            <div className="flex flex-col items-center gap-5 md:flex-row">
              <img
                src="/klyvex_logo.png"
                alt="Klyvex Studios"
                className="h-16 w-16 rounded-2xl object-cover shadow-lg ring-2 ring-blue-300 dark:ring-blue-700 sm:h-20 sm:w-20"
              />
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-900/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
                  Official Gaming & Tech Studio
                </div>
                <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  Klyvex Studios
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                  Forging the intersection of high-performance gaming, AI integration, and cutting-edge developer platforms. Built for speed, mastery, and competitive multiplayer ecosystems.
                </p>
              </div>
            </div>
            <a
              href="https://klyvex-studios.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 hover:scale-[1.02] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shrink-0"
            >
              Visit Studio Portfolio
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </section>

        <section className="mt-10 glass-panel rounded-[2.2rem] p-6 text-center shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:p-10 dark:border dark:border-slate-800 dark:bg-slate-900/90">
          <StarBadgeIcon className="mx-auto h-10 w-10 text-[#2563eb] dark:text-sky-400" />
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-[#0f172a] dark:text-white">Ready to enter the grid?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-[#475569] dark:text-slate-300">
            Create an account, choose an avatar, and start chasing your first ranked memory run.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/register" className="rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-8 py-4 font-semibold text-white shadow-[0_18px_30px_rgba(37,99,235,0.22)]">
              Create Account
            </Link>
            <Link to="/contact" className="rounded-full border border-[#cbd5e1] bg-white/80 px-8 py-4 font-semibold text-[#1d4ed8] dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800">
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </PublicSiteShell>
  );
};
