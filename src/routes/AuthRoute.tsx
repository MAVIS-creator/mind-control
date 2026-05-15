import { Navigate } from "react-router-dom";
import { AuthPanel } from "../components/AuthPanel";
import { GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
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
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
              MindGrid
            </p>
            <h1 className="mt-4 font-display text-5xl tracking-[-0.05em] text-slate-900 sm:text-6xl">
              Enter the board.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Login and register now live on their own page, separate from the landing screen.
              Pick an avatar, choose a board size, and keep climbing the score table.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Clean sign in",
                text: "Separate auth flow with focused account entry.",
                icon: <PlayIcon className="h-5 w-5" />,
              },
              {
                title: "Board choice",
                text: "Keep 4x4, 5x6, and 6x6 game setups ready.",
                icon: <GridIcon className="h-5 w-5" />,
              },
              {
                title: "Hall of Fame",
                text: "Track top players from the new ranking page.",
                icon: <TrophyIcon className="h-5 w-5" />,
              },
            ].map((item) => (
              <div key={item.title} className="glass-panel rounded-[1.75rem] p-5">
                <div className="inline-flex rounded-2xl bg-indigo-100 p-3 text-indigo-700">{item.icon}</div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <AuthPanel forcedMode={mode} />
      </div>
    </div>
  );
};
