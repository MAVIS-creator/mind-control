import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel";
import { useAppContext } from "../state/AppContext";

export const LandingRoute = () => {
  const { session } = useAppContext();

  if (session) {
    return <Navigate to="/play" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200/10 via-transparent to-amber-200/10" />
          <div className="relative">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xs uppercase tracking-[0.32em] text-amber-100"
            >
              MINDGRID: NEURAL CLASH
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-5xl lg:text-6xl"
            >
              Flip, match, and beat the clock in a fast fun memory battle.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg"
            >
              MindGrid is a polished arcade-style memory game where quick matches, smooth combos,
              and leaderboard runs keep every round exciting on desktop and mobile.
            </motion.p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Quick matches", "Easy to start, but hard to master once the timer gets tight."],
                ["Player profiles", "Create an account, choose an avatar, and keep your progress."],
                ["Top scores", "Finish strong and climb the leaderboard with clean, accurate runs."],
              ].map(([title, text]) => (
                <div key={title} className="glass-panel rounded-[1.6rem] p-4">
                  <p className="font-display text-sm uppercase tracking-[0.2em] text-amber-100">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-8 rounded-[2rem] border border-white/15 bg-gradient-to-br from-sky-400/10 via-white/8 to-amber-200/10 p-4 sm:p-6">
              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="grid grid-cols-4 gap-3">
                  {["A", "B", "C", "D", "A", "B", "C", "D"].map((label, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-3xl border ${
                        index % 3 === 0
                          ? "border-amber-200/50 bg-amber-100/12"
                          : index % 2 === 0
                            ? "border-sky-200/50 bg-sky-100/12"
                            : "border-white/10 bg-white/8"
                      } flex items-center justify-center font-display text-xl text-white/80`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="rounded-[1.5rem] border border-white/15 bg-white/8 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/55">
                    <span>Classic mode</span>
                    <span className="text-amber-100">00:52</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Score", "6,420"],
                      ["Combo", "x5"],
                      ["Accuracy", "91%"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-white/45">{label}</div>
                        <div className="mt-1 font-display text-xl tracking-[0.18em] text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <AuthPanel />
      </div>
    </div>
  );
};
