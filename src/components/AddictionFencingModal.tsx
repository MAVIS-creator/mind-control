import { useEffect, useState } from "react";
import { ClockIcon, SparklesIcon } from "./AppIcons";
import { formatDuration } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const AddictionFencingModal = () => {
  const { session, isGamingRestricted, cooldownRemainingSeconds } = useAppContext();
  const [remaining, setRemaining] = useState(cooldownRemainingSeconds);

  useEffect(() => {
    setRemaining(cooldownRemainingSeconds);
    if (!isGamingRestricted) return;

    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isGamingRestricted, cooldownRemainingSeconds]);

  // Main Admin / Creator is exempt from restriction
  if (!session || session.profile.isAdmin || !isGamingRestricted || remaining <= 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-emerald-400/40 bg-gradient-to-b from-[#064e3b] via-[#022c22] to-[#0f172a] p-8 text-center shadow-[0_30px_70px_rgba(16,185,129,0.3)]">
        {/* Top Icon Badge */}
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-inner">
          <ClockIcon className="h-10 w-10 text-emerald-400 animate-pulse" />
        </div>

        <span className="inline-block rounded-full bg-emerald-400/20 px-5 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-300 border border-emerald-400/30">
          Healthy Gaming Environment Notice
        </span>

        <h2 className="mt-5 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
          Time for a Healthy Rest Break!
        </h2>

        <p className="mt-4 text-xs leading-relaxed text-slate-300 sm:text-sm">
          To contribute to a good gaming environment and ensure our players&apos; mental health, focus, and well-being stay at 100%, continuous play has been temporarily paused after reaching the maximum continuous session limit.
        </p>

        {/* Cooldown Timer Display Box */}
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-5 shadow-inner">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-300">
            Mandatory Rest Cooldown Remaining
          </p>
          <div className="my-2 font-display text-4xl font-black tracking-wider text-emerald-400 sm:text-5xl">
            {formatDuration(remaining)}
          </div>
          <p className="text-[11px] font-medium text-slate-400">
            Gameplay matches will automatically unlock once your rest cooldown expires.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300/80">
          <SparklesIcon className="h-4 w-4" />
          MindGrid Wellness & Fair Play Initiative
        </div>
      </div>
    </div>
  );
};
