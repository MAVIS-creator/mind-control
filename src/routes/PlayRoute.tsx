import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { useAppContext } from "../state/AppContext";
import { avatarOptions } from "../data/avatars";

export const PlayRoute = () => {
  const { session, leaderboard, logout } = useAppContext();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="glass-panel flex flex-col gap-4 rounded-[2rem] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={avatar.image}
              alt={avatar.name}
              className="h-16 w-16 rounded-[1.4rem] border border-white/20 bg-slate-950/20"
            />
            <div>
              <p className="font-display text-xs uppercase tracking-[0.24em] text-amber-100">
                Player ready
              </p>
              <h1 className="font-display text-2xl uppercase tracking-[0.12em] text-white">
                {session.profile.username}
              </h1>
              <p className="text-sm text-white/60">
                {session.profile.rank} • {session.profile.xp} XP
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/play/classic"
              className="rounded-2xl bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-5 py-3 font-display text-sm uppercase tracking-[0.24em] text-slate-900"
            >
              Play now
            </Link>
            <Link
              to="/profile"
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm uppercase tracking-[0.28em] text-white/70"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-2xl border border-white/10 px-5 py-3 text-sm uppercase tracking-[0.28em] text-white/70"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.section
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-[2rem] p-6"
          >
            <p className="font-display text-xs uppercase tracking-[0.38em] text-cyan/75">
              Game overview
            </p>
            <h2 className="mt-3 font-display text-3xl uppercase tracking-[0.14em] text-white">
              Classic Sync Mode
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
              Reveal matching cards before the timer runs out. Good streaks raise your combo,
              while mistakes slow down your climb up the leaderboard.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Goal", "Clear all 8 pairs"],
                ["Pressure", "75-second round timer"],
                ["Scoring", "Combo, time, and accuracy bonuses"],
              ].map(([title, value]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-[0.65rem] uppercase tracking-[0.28em] text-white/45">{title}</div>
                  <div className="mt-2 font-medium text-white">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.6rem] border border-white/15 bg-white/8 p-4 text-sm text-white/70">
              More modes and multiplayer can come later. This first version focuses on a clean, replayable classic mode.
            </div>
          </motion.section>

          <LeaderboardTable entries={leaderboard} />
        </div>
      </div>
    </div>
  );
};
