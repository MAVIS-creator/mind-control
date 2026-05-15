import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { ClockIcon, GridIcon, PlayIcon, SparklesIcon, UserIcon } from "../components/AppIcons";
import { AuthPanel } from "../components/AuthPanel";
import { useAppContext } from "../state/AppContext";

export const LandingRoute = () => {
  const { session, setAuthMode } = useAppContext();

  if (session) {
    return <Navigate to="/play" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6">
          <div className="glass-panel overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-xs uppercase tracking-[0.24em] text-amber-100"
            >
              MINDGRID: NEURAL CLASH
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-4 max-w-3xl font-display text-4xl uppercase leading-[0.96] tracking-[0.04em] text-white sm:text-5xl"
            >
              A simple memory game with faster rounds, cleaner boards, and better score chasing.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="mt-5 max-w-2xl text-base leading-7 text-white/70"
            >
              Sign in, pick your avatar, choose your preferred board, and start matching cards.
              Play quick 4x4 rounds or push yourself with larger boards on desktop and mobile.
            </motion.p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="inline-flex items-center justify-center gap-3 rounded-[1.4rem] bg-[#fda214] px-5 py-3 font-display text-sm uppercase tracking-[0.18em] text-white"
              >
                <PlayIcon className="h-5 w-5" />
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="inline-flex items-center justify-center gap-3 rounded-[1.4rem] border border-white/15 bg-white/8 px-5 py-3 font-display text-sm uppercase tracking-[0.18em] text-white"
              >
                <UserIcon className="h-5 w-5" />
                Sign up
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Quick setup",
                text: "Switch between numbers and icons, then choose the board size you want.",
                icon: <GridIcon className="h-5 w-5" />,
              },
              {
                title: "Fast rounds",
                text: "Short rounds feel easy to start, but bigger boards raise the challenge quickly.",
                icon: <ClockIcon className="h-5 w-5" />,
              },
              {
                title: "Score chase",
                text: "Build cleaner runs, improve accuracy, and keep climbing the leaderboard.",
                icon: <SparklesIcon className="h-5 w-5" />,
              },
            ].map(({ title, text, icon }) => (
              <div key={title} className="glass-panel rounded-[1.6rem] p-4 sm:p-5">
                <div className="inline-flex rounded-2xl bg-white/10 p-2 text-amber-100">{icon}</div>
                <p className="mt-4 font-display text-sm uppercase tracking-[0.16em] text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{text}</p>
              </div>
            ))}
          </div>

          <div className="glass-panel rounded-[2rem] p-4 sm:p-6">
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="grid grid-cols-4 gap-3">
                {["A", "B", "C", "D", "A", "B", "C", "D"].map((label, index) => (
                  <div
                    key={index}
                    className={`aspect-square rounded-full border ${
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
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/55">
                  <span>Classic mode</span>
                  <span className="text-amber-100">4 x 4</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["Theme", "Numbers"],
                    ["Timer", "75s"],
                    ["Best score", "6,420"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                      <div className="text-[0.65rem] uppercase tracking-[0.18em] text-white/45">{label}</div>
                      <div className="mt-1 font-display text-xl tracking-[0.12em] text-white">{value}</div>
                    </div>
                  ))}
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
