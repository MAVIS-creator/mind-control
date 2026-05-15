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
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/35 p-6 shadow-violet sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-neural-grid bg-grid opacity-40" />
          <div className="relative">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xs uppercase tracking-[0.45em] text-cyan/80"
            >
              MINDGRID: NEURAL CLASH
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.95] tracking-[0.08em] text-white sm:text-5xl lg:text-6xl"
            >
              Synchronize corrupted memory fragments before the AI core collapses.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg"
            >
              MindGrid turns classic memory play into a neon arcade duel against instability,
              pressure, and glitch storms. Match fast, chain combos, and climb the global sync ladder.
            </motion.p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["Pressure loop", "Timer pressure, combo chaining, and escalating corruption."],
                ["Pilot identity", "Create your login, choose an avatar shell, and track rank progress."],
                ["Ranked ladder", "Every completed sync run updates the leaderboard and your neural title."],
              ].map(([title, text]) => (
                <div key={title} className="glass-panel rounded-[1.6rem] p-4">
                  <p className="font-display text-sm uppercase tracking-[0.24em] text-cyan">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-8 rounded-[2rem] border border-cyan/20 bg-gradient-to-br from-indigo/20 via-slate-950/50 to-cyan/10 p-4 shadow-neon sm:p-6">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan/80 to-transparent" />
              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="grid grid-cols-4 gap-3">
                  {new Array(8).fill(null).map((_, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-3xl border ${
                        index % 3 === 0
                          ? "border-violet/50 bg-violet/10"
                          : index % 2 === 0
                            ? "border-cyan/50 bg-cyan/10"
                            : "border-white/10 bg-white/5"
                      } flex items-center justify-center font-display text-xl text-white/80`}
                    >
                      {["ψ", "Ω", "Λ", "Δ", "Σ", "⊕", "⟡", "⬢"][index]}
                    </div>
                  ))}
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/50">
                    <span>Classic Sync</span>
                    <span className="text-cyan">00:52</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Score", "6,420"],
                      ["Combo", "x5"],
                      ["Accuracy", "91%"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="text-[0.65rem] uppercase tracking-[0.28em] text-white/45">{label}</div>
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
