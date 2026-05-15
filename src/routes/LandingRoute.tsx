import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { ClockIcon, GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
import { useAppContext } from "../state/AppContext";

export const LandingRoute = () => {
  const { session } = useAppContext();

  if (session) {
    return <Navigate to="/play" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="glass-panel overflow-hidden rounded-[2.5rem] p-6 sm:p-8 lg:p-10">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600"
          >
            MindGrid: Neural Clash
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-4 max-w-4xl font-display text-5xl tracking-[-0.06em] text-slate-900 sm:text-6xl lg:text-7xl"
          >
            Premium memory battles with a cleaner home screen and focused game flow.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-5 max-w-2xl text-base leading-7 text-slate-600"
          >
            The landing page now stands on its own. Login, register, enter the dashboard,
            and compete through the Hall of Fame without mixing every screen into one page.
          </motion.p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-[1.5rem] bg-indigo-600 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-indigo-200"
            >
              <PlayIcon className="h-5 w-5" />
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-700"
            >
              <GridIcon className="h-5 w-5" />
              Create account
            </Link>
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Separate pages",
                text: "Landing, login, register, dashboard, game board, profile, and Hall of Fame now map to their own pages.",
                icon: <GridIcon className="h-5 w-5" />,
              },
              {
                title: "Classic boards",
                text: "Stay with 4x4, 5x6, and 6x6 grid choices from the live game setup.",
                icon: <ClockIcon className="h-5 w-5" />,
              },
              {
                title: "Score ranking",
                text: "Best runs feed into the Hall of Fame screen for a cleaner ranking flow.",
                icon: <TrophyIcon className="h-5 w-5" />,
              },
            ].map((item) => (
              <article key={item.title} className="glass-panel rounded-[1.75rem] p-5">
                <div className="inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-700">{item.icon}</div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="grid grid-cols-4 gap-3">
              {["A", "B", "C", "D", "A", "B", "C", "D"].map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  className={`flex aspect-square items-center justify-center rounded-[1.5rem] border text-xl font-semibold ${
                    index % 3 === 0
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : index % 2 === 0
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Mode", "Classic"],
                ["Board", "4 x 4"],
                ["Hall", "Top runs"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-500">{label}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
