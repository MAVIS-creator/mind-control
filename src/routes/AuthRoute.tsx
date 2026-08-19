import { Link, Navigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel";
import { BrandMotionMark } from "../components/AppIcons";
import { SiteFooter } from "../components/SiteFooter";
import { ThemeToggle } from "../components/ThemeToggle";
import { isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

type AuthRouteProps = {
  mode: "login" | "register";
};

export const AuthRoute = ({ mode }: AuthRouteProps) => {
  const { session } = useAppContext();

  if (session) {
    if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
      return <Navigate to="/complete-email" replace />;
    }
    return <Navigate to="/play" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f8faff_45%,_#dbeafe_100%)] dark:bg-none dark:bg-slate-950 dark:text-slate-100 px-4 py-8 sm:px-6 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-20 h-[22rem] w-[22rem] rounded-full bg-[#38bdf8]/18 dark:bg-[#38bdf8]/10 blur-[90px]" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[#2563eb]/16 dark:bg-[#2563eb]/10 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-[#0284c7]/12 dark:bg-[#0284c7]/8 blur-[100px]" />
      </div>

      {/* Top Header Navigation back to Landing Page */}
      <div className="mx-auto flex max-w-6xl items-center justify-between pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span className="text-sm">←</span>
          <span>Back to Landing Page</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="flex flex-col items-center justify-center text-center lg:min-h-[42rem]">
          <BrandMotionMark className="mb-8 w-[15rem] sm:w-[20rem]" />
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.36em] text-[#464555] dark:text-slate-400">
            {mode === "login" ? "Welcome Back" : "Connect To Clarity"}
          </p>
          <p className="mt-7 max-w-xl text-[1.08rem] leading-8 text-[#5b6073] dark:text-slate-300">
            {mode === "login"
              ? "Return to your board, keep your streak alive, and push your score higher with every clean match."
              : "Create a focused player identity, choose an avatar, and start climbing the memory ranks one board at a time."}
          </p>
        </section>

        <div className="w-full max-w-[34rem] justify-self-center lg:justify-self-end">
          <AuthPanel forcedMode={mode} />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};
