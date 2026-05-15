import { Navigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel";
import { BrandMotionMark } from "../components/AppIcons";
import { useAppContext } from "../state/AppContext";

type AuthRouteProps = {
  mode: "login" | "register";
};

export const AuthRoute = ({ mode }: AuthRouteProps) => {
  const { session } = useAppContext();

  if (session) {
    return <Navigate to="/play" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_45%,_#d4e3ff_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-20 h-[22rem] w-[22rem] rounded-full bg-[#9a7cff]/16 blur-[90px]" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[#64a8fe]/18 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-[#4f46e5]/14 blur-[100px]" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="flex flex-col items-center justify-center text-center lg:min-h-[42rem]">
          <BrandMotionMark className="mb-8 h-28 w-28 sm:h-32 sm:w-32" />
          <h1 className="font-display text-[3.7rem] font-extrabold tracking-[-0.07em] text-[#3525cd] sm:text-[4.4rem]">
            MindGrid
          </h1>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.36em] text-[#464555]">
            {mode === "login" ? "Welcome Back" : "Connect To Clarity"}
          </p>
          <p className="mt-7 max-w-xl text-[1.08rem] leading-8 text-[#5b6073]">
            {mode === "login"
              ? "Return to your board, keep your streak alive, and push your score higher with every clean match."
              : "Create a focused player identity, choose an avatar, and start climbing the memory ranks one board at a time."}
          </p>
        </section>

        <div className="w-full max-w-[34rem] justify-self-center lg:justify-self-end">
          <AuthPanel forcedMode={mode} />
        </div>
      </div>
    </div>
  );
};
