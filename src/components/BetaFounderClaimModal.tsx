import { useState } from "react";
import { SparklesIcon, StarBadgeIcon, TrophyIcon } from "./AppIcons";
import { saveSession } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { calculateRank } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const BetaFounderClaimModal = () => {
  const { session, setSession } = useAppContext();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (!session?.profile) return null;

  const profile = session.profile;
  const isBetaTester = Boolean(profile.isBetaTester);
  const hasClaimed = Boolean(profile.hasClaimedBetaReward) || Boolean(localStorage.getItem(`claimed_beta_${profile.id}`));

  // Main Admin / Creator NEVER sees the claim modal!
  if (profile.isAdmin || !isBetaTester || hasClaimed || claimed) return null;

  const handleClaim = async () => {
    setClaiming(true);
    localStorage.setItem(`claimed_beta_${profile.id}`, "true");

    const xpBonus = 1000;
    const newXp = (profile.xp || 0) + xpBonus;
    const newRank = calculateRank(newXp);

    const updatedProfile = {
      ...profile,
      xp: newXp,
      rank: newRank,
      hasClaimedBetaReward: true,
    };

    const nextSession = { ...session, profile: updatedProfile };
    setSession(nextSession);
    saveSession(nextSession);

    if (supabase) {
      try {
        await Promise.all([
          supabase.from("profiles").update({ xp: newXp, rank: newRank }).eq("id", profile.id),
          supabase.auth.updateUser({ data: { has_claimed_beta_reward: true } }),
        ]);
      } catch (err) {
        console.warn("Error updating tester reward in Supabase:", err);
      }
    }

    setClaiming(false);
    setClaimed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-fade-in dark:bg-slate-950/80">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.2rem] border border-amber-300/60 bg-gradient-to-b from-[#1e1b4b] via-[#2e1065] to-[#0f172a] p-7 text-center shadow-[0_25px_60px_rgba(245,158,11,0.25)] dark:bg-none dark:bg-slate-900 dark:border-slate-800">
        {/* Top Glow & Badge */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-inner">
          <TrophyIcon className="h-9 w-9 text-amber-300 animate-bounce" />
        </div>

        <span className="inline-block rounded-full bg-amber-400/20 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-300 border border-amber-400/30">
          Official Neural Tester Gift
        </span>

        <h2 className="mt-4 font-display text-2xl font-black tracking-tight text-white sm:text-3xl dark:text-white">
          Neural Tester Pack!
        </h2>

        <p className="mt-3 text-xs leading-relaxed text-slate-300 sm:text-sm dark:text-slate-300">
          Thank you for testing MindGrid: Neural Clash! As an official Neural Tester, you qualify for exclusive early-access perks.
        </p>

        {/* Perks Box */}
        <div className="mt-5 space-y-2.5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
          <div className="flex items-center gap-3">
            <StarBadgeIcon className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-bold text-white dark:text-white">Exclusive [NEURAL TESTER] Title</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">Displayed on your profile & global ranks.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SparklesIcon className="h-5 w-5 shrink-0 text-sky-400" />
            <div>
              <p className="text-xs font-bold text-white dark:text-white">+1,000 Founder XP Boost</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-400">Instantly unlocks higher level tiers.</p>
            </div>
          </div>
        </div>

        {/* Claim Button */}
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 py-4 text-sm font-black uppercase tracking-[0.16em] text-slate-950 shadow-[0_12px_28px_rgba(245,158,11,0.4)] transition hover:scale-[1.02] disabled:opacity-50"
        >
          {claiming ? "Claiming Tester Pack..." : "Claim Neural Tester Rewards"}
        </button>
      </div>
    </div>
  );
};
