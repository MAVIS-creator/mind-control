import { Navigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel";
import { BrandMarkIcon } from "../components/AppIcons";
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
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
        <section className="w-full max-w-md text-center">
          <div className="mb-8 flex flex-col items-center gap-4">
            <BrandMarkIcon className="h-20 w-20" />
            <div>
              <h1 className="font-display text-[3.2rem] font-extrabold tracking-[-0.05em] text-[#3525cd]">
                MindGrid
              </h1>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#464555]">
                {mode === "login" ? "Welcome Back" : "Connect To Clarity"}
              </p>
            </div>
          </div>
        </section>

        <div className="w-full max-w-md">
          <AuthPanel forcedMode={mode} />
        </div>
      </div>
    </div>
  );
};
