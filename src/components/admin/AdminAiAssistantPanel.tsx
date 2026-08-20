import type { JSX } from "react";
import { useState } from "react";
import {
  BrandMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  MailIcon,
  SendIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
} from "../AppIcons";

type AdminAiAssistantPanelProps = {
  recipientCount: number;
  sending?: boolean;
  onTransferToComposer: (subject: string, body: string) => void;
  onDirectDispatchAll: (subject: string, body: string) => Promise<void>;
  onSetLiveGlobalTicker: (ticker: string) => void;
};

export type AutoScheduleItem = {
  id: string;
  name: string;
  cadence: string;
  audience: string;
  triggerTime: string;
  purpose: string;
  verifiedFeatures: string[];
  subject: string;
  body: string;
  ticker: string;
};

export const AUTOMATED_SCHEDULES: AutoScheduleItem[] = [
  {
    id: "daily_pulse",
    name: "Daily Morning Pulse",
    cadence: "Daily",
    triggerTime: "Every morning at 9:00 AM UTC",
    audience: "All Registered Operatives",
    purpose: "Daily challenge notification and streak combo multiplier protection.",
    verifiedFeatures: ["Daily Sprint Matrix", "1.5x Streak Multiplier", "XP Bonus"],
    subject: "Your Daily MindGrid Challenge is Ready (1.5x Combo Multiplier Active)",
    body: `Hello Operative,

Your daily MindGrid speed sprint matrix has been generated for today!

Today's Mission:
• Complete 1 Speed Sprint run to maintain your daily login streak.
• Earn up to 1.5x score combo bonuses for clean board clears.
• Check your current standing on the Hall of Fame podium.

Launch Today's Grid:
https://neuralclash.dev/play

Best regards,
MindGrid Command`,
    ticker: "DAILY CHALLENGE: Today's speed matrix is ready! Complete your run for 1.5x combo bonus.",
  },
  {
    id: "friday_rush",
    name: "Weekly Friday Weekend Rush",
    cadence: "Weekly (Fridays)",
    triggerTime: "Every Friday at 4:00 PM UTC",
    audience: "Active & Competitive Operatives",
    purpose: "Announces weekend competitive matrix with Double XP and 1v1 multiplayer duels.",
    verifiedFeatures: ["Weekend Tournament Arena", "2x Rating Points", "1v1 Room Duels"],
    subject: "Weekend Tournament Arena is Live - Double XP & Prize Multipliers!",
    body: `Hello Operative,

The MindGrid Weekend Championship Arena is officially open for competition!

Weekend Highlights:
• Exclusive 5x6 Speed Sprint & Tactical Sync Matrix
• 2x Rating Points for all podium finishers
• Challenge friends in real-time 1v1 duel rooms with custom codes

Enter the Arena:
https://neuralclash.dev/events

Best regards,
MindGrid Esports Team`,
    ticker: "WEEKEND RUSH: 2x rating points and 1v1 multiplayer duel arenas are live all weekend!",
  },
  {
    id: "sunday_finale",
    name: "Weekly Sunday Season Finale",
    cadence: "Weekly (Sundays)",
    triggerTime: "Every Sunday at 6:00 PM UTC",
    audience: "Top 50 & Ranked Operatives",
    purpose: "Urges players to defend their Hall of Fame ranking before weekly lock-in.",
    verifiedFeatures: ["Hall of Fame Lock-In", "Zenith Lord Honors", "Podium Badges"],
    subject: "Final Hours: Weekly Leaderboard Season Locks at Midnight!",
    body: `Hello Operative,

The weekly MindGrid leaderboard cycle is entering its final hours!

Season Climax Details:
• Weekly ranks will lock at midnight UTC.
• Top podium finishers will be permanently crowned Zenith Lords in the Hall of Fame.
• Defend your position against contenders before time runs out.

Defend Your Rank:
https://neuralclash.dev/ranks

Best regards,
MindGrid Admin`,
    ticker: "SEASON FINALE: Final hours before weekly leaderboard lock-in! Defend your rank.",
  },
  {
    id: "inactive_nudge",
    name: "Inactive Player Auto-Nudge",
    cadence: "Triggered on 7+ Days Inactive",
    triggerTime: "Automated after 7 consecutive days of inactivity",
    audience: "Operatives with no runs in 7+ days",
    purpose: "Re-engages inactive players by reminding them of rank defense and the new PWA install.",
    verifiedFeatures: ["PWA Web App Install", "0-Latency Play", "Rank Defense"],
    subject: "Your MindGrid Rank is Slipping - Claim Your Spot on the Hall of Fame!",
    body: `Hello Operative,

Other players are climbing the global Hall of Fame leaderboards! Your spot is being contested.

New Since Your Last Session:
• MindGrid Web App (PWA) is now available for direct 1-tap install on iOS & Android with 0 latency.
• Real-time 1v1 multiplayer duels are active.
• Jump back in to restore your rating and combo multipliers.

Install & Play:
https://neuralclash.dev/?install=pwa

Best regards,
MindGrid Command · Klyvex Studios`,
    ticker: "RE-ENGAGE: Install MindGrid PWA directly to your home screen for zero-latency duels!",
  },
];

export const AdminAiAssistantPanel = ({
  recipientCount,
  sending = false,
  onTransferToComposer,
  onDirectDispatchAll,
  onSetLiveGlobalTicker,
}: AdminAiAssistantPanelProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<"scheduler" | "custom_generator">("scheduler");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(AUTOMATED_SCHEDULES[0].id);

  // Custom AI generator state
  const [aiTopic, setAiTopic] = useState("Direct PWA install guide for iOS and Android, zero lag, full offline caching.");
  const [aiTone, setAiTone] = useState<"esports" | "promotional" | "urgent" | "rewarding">("promotional");
  const [aiAudience, setAiAudience] = useState<"all" | "active" | "inactive">("all");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customAiOutput, setCustomAiOutput] = useState<{
    subject: string;
    body: string;
    broadcast: string;
    social: string;
  } | null>(null);

  // Automated cadence switch
  const [autoScheduleActive, setAutoScheduleActive] = useState(true);

  const currentSchedule =
    AUTOMATED_SCHEDULES.find((s) => s.id === selectedScheduleId) ?? AUTOMATED_SCHEDULES[0];

  const activeDisplay = activeTab === "scheduler"
    ? {
        subject: currentSchedule.subject,
        body: currentSchedule.body,
        broadcast: currentSchedule.ticker,
        social: `${currentSchedule.subject} https://neuralclash.dev #MindGrid #Esports`,
      }
    : (customAiOutput ?? {
        subject: currentSchedule.subject,
        body: currentSchedule.body,
        broadcast: currentSchedule.ticker,
        social: `${currentSchedule.subject} https://neuralclash.dev #MindGrid #Esports`,
      });

  const generateCustomAiBroadcast = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setCustomAiOutput({
        subject: `[MindGrid Update] ${aiTopic.slice(0, 45)}...`,
        body: `Hello Operative,\n\n${aiTopic}\n\nVerified Features Included:\n• 0-Latency Web App (PWA) home-screen install.\n• Real-time 1v1 multiplayer arena duels at /multiplayer.\n• Daily combo multipliers and Hall of Fame ranking at /ranks.\n\nPlay Now:\nhttps://neuralclash.dev/?install=pwa\n\nBest regards,\nMindGrid Command · Klyvex Studios`,
        broadcast: `UPDATE: ${aiTopic.slice(0, 60)} - Tap to play!`,
        social: `${aiTopic.slice(0, 100)} https://neuralclash.dev #MindGrid #Esports`,
      });
      setAiGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Explaining What Gets Sent */}
      <div className="rounded-[1.8rem] border border-blue-200/80 bg-gradient-to-r from-blue-500/10 via-[#eff1ff] to-blue-500/10 p-6 dark:border-blue-900/40 dark:bg-slate-900/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c05b3] text-white shadow-md shrink-0">
              <SparklesIcon className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                AI Automated Broadcast Scheduler
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                100% grounded in real MindGrid features. Inspect exact schedule timings, message contents, and dispatch templates below.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-white dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("scheduler")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "scheduler"
                  ? "bg-[#1c05b3] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Scheduled Roster (4)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom_generator")}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeTab === "custom_generator"
                  ? "bg-[#1c05b3] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Custom AI Generator
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.1fr]">
        {/* Left Column: Schedule Cards or Custom Form */}
        <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          {activeTab === "scheduler" ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    Automated Cadence Roster
                  </h4>
                  <p className="text-xs text-slate-500">
                    Click any schedule below to inspect the exact message that is sent.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Auto-Send:
                  </span>
                  <button
                    type="button"
                    onClick={() => setAutoScheduleActive(!autoScheduleActive)}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                      autoScheduleActive
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {autoScheduleActive ? "Enabled" : "Paused"}
                  </button>
                </div>
              </div>

              {/* 4 Verified Schedules */}
              <div className="space-y-2.5">
                {AUTOMATED_SCHEDULES.map((item) => {
                  const selected = selectedScheduleId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedScheduleId(item.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition ${
                        selected
                          ? "border-[#1c05b3] bg-[#eff1ff] dark:border-blue-700 dark:bg-blue-950/40"
                          : "border-slate-200/80 bg-white hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                              selected
                                ? "bg-[#1c05b3] text-white"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {selected ? <CheckCircleIcon className="h-4 w-4" /> : item.name[0]}
                          </span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#1c05b3] dark:bg-blue-900/50 dark:text-sky-300">
                          {item.cadence}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                        {item.purpose}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800/80 text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <ClockIcon className="h-3 w-3 text-slate-400" />
                          {item.triggerTime}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <UserIcon className="h-3 w-3 text-slate-400" />
                          {item.audience}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Custom Generator Form */
            <div className="space-y-4">
              <div>
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Custom AI Announcement Generator
                </h4>
                <p className="text-xs text-slate-500">
                  Synthesize high-converting copy grounded strictly in real MindGrid features.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Announcement Context / Custom Topic
                </label>
                <textarea
                  rows={4}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Voice Tone
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="promotional">PWA Download & Features</option>
                    <option value="esports">Esports Competitive</option>
                    <option value="urgent">Urgent Season Finale</option>
                    <option value="rewarding">Founder & Tester Perks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Audience Filter
                  </label>
                  <select
                    value={aiAudience}
                    onChange={(e) => setAiAudience(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="all">All Registered Operatives</option>
                    <option value="active">Active Players (Last 7 Days)</option>
                    <option value="inactive">Inactive Players (Re-engage)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                disabled={aiGenerating}
                onClick={generateCustomAiBroadcast}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:scale-[1.01]"
              >
                <SparklesIcon className="h-4 w-4" />
                {aiGenerating ? "Synthesizing AI Post..." : "Generate AI Broadcast Post"}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Styled Email Preview matching Actual Dispatch */}
        <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Exact Email Template Preview
              </h4>
              <p className="text-[11px] text-slate-500">
                Matches the exact HTML email delivered to operative inboxes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onTransferToComposer(activeDisplay.subject, activeDisplay.body)}
                className="rounded-full bg-[#eff1ff] px-3.5 py-1.5 text-xs font-bold text-[#1c05b3] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-sky-300 transition"
              >
                Edit in Composer &rarr;
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={() => onDirectDispatchAll(activeDisplay.subject, activeDisplay.body)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#1c05b3] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#140494] transition disabled:opacity-50"
              >
                <SendIcon className="h-3 w-3" />
                <span>{sending ? "Sending..." : `Send to All (${recipientCount})`}</span>
              </button>
            </div>
          </div>

          {/* Styled Card Preview with Floating Trypan Blue Brand Logo */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/70 space-y-4">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="mx-auto flex flex-col items-center justify-center">
                <div className="h-14 w-14 rounded-2xl bg-[#1c05b3] p-3 shadow-[0_10px_24px_rgba(28,5,179,0.35)] animate-bounce">
                  <BrandMarkIcon className="h-full w-full" />
                </div>
                <h5 className="mt-2.5 font-display text-base font-black tracking-tight text-[#1c05b3] dark:text-white">
                  MindGrid
                </h5>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  NEURAL CLASH · KLYVEX STUDIOS
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 text-xs leading-relaxed text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200/70 dark:border-slate-800 space-y-3">
              <h5 className="font-display text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                {activeDisplay.subject}
              </h5>
              <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                {activeDisplay.body}
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="inline-block rounded-full bg-[#1c05b3] px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                Launch MindGrid &rarr;
              </span>
            </div>

            <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
              Dispatched from secure admin gateway · Built by <strong>Klyvex Studios</strong>
            </div>
          </div>

          {/* In-Game Ticker Quick Publish */}
          <div className="space-y-1.5 pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Live In-Game Ticker Version
            </p>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800">
              <span className="truncate pr-2">{activeDisplay.broadcast}</span>
              <button
                type="button"
                onClick={() => onSetLiveGlobalTicker(activeDisplay.broadcast)}
                className="shrink-0 rounded-lg bg-[#1c05b3] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#140494]"
              >
                Publish Live
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
