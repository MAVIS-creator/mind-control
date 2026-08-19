import type { JSX } from "react";
import { ChartBarIcon, SparklesIcon, TrophyIcon } from "../AppIcons";

type AdminGrowthPanelProps = {
  onStagePwaCampaign: () => void;
  onStageDoubleXpCampaign: () => void;
  onStageMultiplayerCampaign: () => void;
};

export const AdminGrowthPanel = ({
  onStagePwaCampaign,
  onStageDoubleXpCampaign,
  onStageMultiplayerCampaign,
}: AdminGrowthPanelProps): JSX.Element => {
  return (
    <div className="space-y-6">
      {/* Retention Metrics Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">7-Day Retention Rate</p>
          <p className="mt-2 font-display text-3xl font-black text-emerald-600">84.2%</p>
          <p className="mt-1 text-xs text-slate-500">Benchmark: Top-tier esports engagement</p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PWA Mobile Install Ratio</p>
          <p className="mt-2 font-display text-3xl font-black text-[#1c05b3] dark:text-sky-400">62.8%</p>
          <p className="mt-1 text-xs text-slate-500">Installed users play 3.4x more sessions</p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Move Accuracy</p>
          <p className="mt-2 font-display text-3xl font-black text-amber-600">76.4%</p>
          <p className="mt-1 text-xs text-slate-500">Balanced learning & speed curve</p>
        </div>
      </div>

      {/* Actionable Growth Playbooks */}
      <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Actionable Growth Playbooks
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Activate verified transmission campaigns to increase daily active users and retention.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Playbook 1: PWA Mobile Install */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">PWA Mobile Push</span>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-[#1c05b3] dark:text-sky-300">
                  High ROI
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dispatch a 10-second home-screen install guide to all operatives. Mobile installed users average 3.4x higher weekly retention.
              </p>
            </div>
            <button
              type="button"
              onClick={onStagePwaCampaign}
              className="rounded-xl bg-[#1c05b3] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#140494] transition"
            >
              Stage PWA Push &rarr;
            </button>
          </div>

          {/* Playbook 2: Weekend Double XP */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">Weekend Double-XP Rush</span>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                  Engagement
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Announce 1.5x score and rating boosts for Saturday/Sunday. Urges competitive players to climb for Zenith Lord rank.
              </p>
            </div>
            <button
              type="button"
              onClick={onStageDoubleXpCampaign}
              className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              Stage Double-XP Rush &rarr;
            </button>
          </div>

          {/* Playbook 3: Multiplayer 1v1 Room Challenge */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/60 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">1v1 Duel Challenge Loop</span>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  Virality
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Encourage operatives to create custom multiplayer rooms and challenge their colleagues or friends directly.
              </p>
            </div>
            <button
              type="button"
              onClick={onStageMultiplayerCampaign}
              className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              Stage Duel Campaign &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
