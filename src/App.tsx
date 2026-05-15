import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppContext } from "./state/AppContext";

const LandingRoute = lazy(() =>
  import("./routes/LandingRoute").then((module) => ({ default: module.LandingRoute })),
);
const AuthRoute = lazy(() =>
  import("./routes/AuthRoute").then((module) => ({ default: module.AuthRoute })),
);
const PlayRoute = lazy(() =>
  import("./routes/PlayRoute").then((module) => ({ default: module.PlayRoute })),
);
const HallOfFameRoute = lazy(() =>
  import("./routes/HallOfFameRoute").then((module) => ({ default: module.HallOfFameRoute })),
);
const ProfileRoute = lazy(() =>
  import("./routes/ProfileRoute").then((module) => ({ default: module.ProfileRoute })),
);
const GameRoute = lazy(() =>
  import("./routes/GameRoute").then((module) => ({ default: module.GameRoute })),
);
const ResultsRoute = lazy(() =>
  import("./routes/ResultsRoute").then((module) => ({ default: module.ResultsRoute })),
);
const AdminRoute = lazy(() =>
  import("./routes/AdminRoute").then((module) => ({ default: module.AdminRoute })),
);

export const App = () => {
  const { booting } = useAppContext();

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel rounded-[2rem] px-8 py-6 text-center">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-cyan/75">
            Initializing
          </p>
          <h1 className="mt-3 font-display text-2xl uppercase tracking-[0.18em] text-white">
            MindGrid
          </h1>
          <p className="mt-2 text-sm text-white/60">Loading your game hub...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="glass-panel rounded-[2rem] px-8 py-6 text-center">
            <p className="font-display text-xs uppercase tracking-[0.4em] text-cyan/75">
              Routing
            </p>
            <p className="mt-3 text-sm text-white/60">Opening the next screen...</p>
          </div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<AuthRoute mode="login" />} />
        <Route path="/register" element={<AuthRoute mode="register" />} />
        <Route path="/play" element={<PlayRoute />} />
        <Route path="/play/classic" element={<GameRoute />} />
        <Route path="/results/:runId" element={<ResultsRoute />} />
        <Route path="/hall-of-fame" element={<HallOfFameRoute />} />
        <Route path="/profile" element={<ProfileRoute />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
