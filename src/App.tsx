import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { BrandMotionMark } from "./components/AppIcons";
import { Seo } from "./components/Seo";
import { useAppContext } from "./state/AppContext";

const LandingRoute = lazy(() =>
  import("./routes/LandingRoute").then((module) => ({ default: module.LandingRoute })),
);
const AuthRoute = lazy(() =>
  import("./routes/AuthRoute").then((module) => ({ default: module.AuthRoute })),
);
const ForgotPasswordRoute = lazy(() =>
  import("./routes/ForgotPasswordRoute").then((module) => ({ default: module.ForgotPasswordRoute })),
);
const ResetPasswordRoute = lazy(() =>
  import("./routes/ResetPasswordRoute").then((module) => ({ default: module.ResetPasswordRoute })),
);
const CompleteEmailRoute = lazy(() =>
  import("./routes/CompleteEmailRoute").then((module) => ({ default: module.CompleteEmailRoute })),
);
const PlayRoute = lazy(() =>
  import("./routes/PlayRoute").then((module) => ({ default: module.PlayRoute })),
);
const HallOfFameRoute = lazy(() =>
  import("./routes/HallOfFameRoute").then((module) => ({ default: module.HallOfFameRoute })),
);
const PublicRanksRoute = lazy(() =>
  import("./routes/PublicRanksRoute").then((module) => ({ default: module.PublicRanksRoute })),
);
const ContactRoute = lazy(() =>
  import("./routes/ContactRoute").then((module) => ({ default: module.ContactRoute })),
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
const EventJoinRoute = lazy(() =>
  import("./routes/EventJoinRoute").then((module) => ({ default: module.EventJoinRoute })),
);
const EventGameRoute = lazy(() =>
  import("./routes/EventGameRoute").then((module) => ({ default: module.EventGameRoute })),
);
const EventBonusRoute = lazy(() =>
  import("./routes/EventBonusRoute").then((module) => ({ default: module.EventBonusRoute })),
);
const EventResultsRoute = lazy(() =>
  import("./routes/EventResultsRoute").then((module) => ({ default: module.EventResultsRoute })),
);
const EventLiveRoute = lazy(() =>
  import("./routes/EventLiveRoute").then((module) => ({ default: module.EventLiveRoute })),
);

export const App = () => {
  const { booting } = useAppContext();

  if (booting) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-12 top-8 h-[22rem] w-[22rem] rounded-full bg-[#8a70ff]/16 blur-[95px]" />
          <div className="absolute right-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[#64a8fe]/16 blur-[95px]" />
          <div className="absolute bottom-0 left-1/3 h-[18rem] w-[18rem] rounded-full bg-[#6b00b7]/10 blur-[100px]" />
        </div>
        <div className="glass-panel w-full max-w-md rounded-[2rem] px-6 py-8 text-center shadow-[0_22px_48px_rgba(53,37,205,0.08)] sm:px-8">
          <BrandMotionMark className="mx-auto mb-6 w-[11rem] sm:w-[14rem]" />
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[#3525cd]">Initializing</p>
          <p className="mt-2 text-sm leading-7 text-[#464555] sm:text-base">
            Loading your game hub and preparing the next board.
          </p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#d8e3fb]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#64a8fe] via-[#4f46e5] to-[#6b00b7]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4">
          <div className="glass-panel w-full max-w-sm rounded-[2rem] px-6 py-7 text-center shadow-[0_22px_48px_rgba(53,37,205,0.08)]">
            <BrandMotionMark className="mx-auto mb-5 w-[9rem] sm:w-[11rem]" />
            <p className="font-display text-xs uppercase tracking-[0.4em] text-[#3525cd]">Routing</p>
            <p className="mt-3 text-sm leading-7 text-[#464555]">Opening the next screen...</p>
          </div>
        </div>
      }
    >
      <Seo />
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<AuthRoute mode="login" />} />
        <Route path="/register" element={<AuthRoute mode="register" />} />
        <Route path="/forgot-password" element={<ForgotPasswordRoute />} />
        <Route path="/reset-password" element={<ResetPasswordRoute />} />
        <Route path="/complete-email" element={<CompleteEmailRoute />} />
        <Route path="/play" element={<PlayRoute />} />
        <Route path="/play/classic" element={<GameRoute />} />
        <Route path="/results/:runId" element={<ResultsRoute />} />
        <Route path="/ranks" element={<PublicRanksRoute />} />
        <Route path="/contact" element={<ContactRoute />} />
        <Route path="/hall-of-fame" element={<HallOfFameRoute />} />
        <Route path="/profile" element={<ProfileRoute />} />
        <Route path="/profile/:userId" element={<ProfileRoute />} />
        <Route path="/mavisbk" element={<AdminRoute />} />
        <Route path="/mavisbk/:adminSection" element={<AdminRoute />} />
        <Route path="/:eventSlug" element={<EventJoinRoute />} />
        <Route path="/:eventSlug/play" element={<EventGameRoute />} />
        <Route path="/:eventSlug/bonus" element={<EventBonusRoute />} />
        <Route path="/:eventSlug/results" element={<EventResultsRoute />} />
        <Route path="/:eventSlug/live" element={<EventLiveRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
