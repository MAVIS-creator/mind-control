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
    id: "pwa_guide",
    name: "Web App (PWA) Install Guide",
    cadence: "Mobile Onboarding",
    triggerTime: "Sent to new & mobile operatives",
    audience: "All Registered Operatives",
    purpose: "Guides players on installing MindGrid directly to their iOS/Android home screen for fullscreen 60FPS play.",
    verifiedFeatures: ["PWA Home Screen Install", "Fullscreen Mode", "Fast 60FPS Cards"],
    subject: "Install MindGrid on Your Phone (Fast Home-Screen Web App)",
    body: `Hello Operative,

MindGrid can now be installed directly to your mobile home screen as a high-performance Web App (PWA) without needing an app store!

Why Install?
• Fullscreen memory matching with zero browser address bars
• Instant launch directly from your phone's home screen
• Smooth 60FPS card animations and fast board loading

How to Install in 10 Seconds:
• iPhone / iPad (Safari): Open https://neuralclash.dev ➔ Tap the Share button (square with arrow) ➔ Tap "Add to Home Screen".
• Android (Chrome): Open https://neuralclash.dev ➔ Tap Menu (3 dots) ➔ Tap "Install App" or "Add to Home Screen".
• Desktop (Chrome/Edge): Click the Install icon in your browser address bar.

Direct Install Link:
https://neuralclash.dev/?install=pwa

Jump in and test your memory speed today!

Best regards,
MindGrid Admin & Klyvex Studios`,
    ticker: "WEB APP: Install MindGrid directly to your home screen for fullscreen 60FPS memory duels!",
  },
  {
    id: "multiplayer_challenge",
    name: "1v1 Multiplayer Duel Invitation",
    cadence: "Community Duel Call",
    triggerTime: "Dispatched to active players",
    audience: "Active Operatives",
    purpose: "Invites players to create private rooms and challenge friends in real-time memory matches.",
    verifiedFeatures: ["1v1 Live Multiplayer", "Private Room Codes", "Synchronized Grid Cards"],
    subject: "Challenge Your Friends to a 1v1 Real-Time Memory Match on MindGrid",
    body: `Hello Operative,

Did you know MindGrid supports live 1v1 multiplayer duels?

Multiplayer Highlights:
• Create a private duel room with a custom room code to send to a friend.
• Both players play on the exact same card grid in real-time.
• Prove who has the faster reaction memory and accuracy.

Create or Join a Room:
https://neuralclash.dev/multiplayer

Best regards,
MindGrid Esports Team`,
    ticker: "MULTIPLAYER: Create a private 1v1 room and challenge your friends in real-time!",
  },
  {
    id: "hall_of_fame_updates",
    name: "Hall of Fame Leaderboard Update",
    cadence: "Competitive Leaderboard",
    triggerTime: "Dispatched when new top scores are set",
    audience: "Ranked Operatives",
    purpose: "Informs operatives that new high scores have been set across grid sizes and invites them to check their rank.",
    verifiedFeatures: ["Global Hall of Fame", "Grid Sizes (2x2 to 6x6)", "Accuracy & Speed Stats"],
    subject: "New High Scores on the Hall of Fame - Check Your Leaderboard Rank",
    body: `Hello Operative,

Operatives have been setting new high score records on the MindGrid global leaderboards across all grid sizes (2x2, 3x4, 4x4, 5x6, and 6x6).

Check your current standing in the Hall of Fame to see where your profile ranks:
https://neuralclash.dev/ranks

Ready to set a new personal record? Launch a run:
https://neuralclash.dev/play

Best regards,
MindGrid Command`,
    ticker: "HALL OF FAME: New top scores have been set! Check your standing at /ranks.",
  },
  {
    id: "inactive_rank_alert",
    name: "Leaderboard Rank Slipping Alert",
    cadence: "Triggered on 7+ Days Inactivity",
    triggerTime: "Automated after 7 consecutive days without a match",
    audience: "Operatives inactive for 7+ days",
    purpose: "Alerts lapsed players that other operatives have posted higher scores, pushing their rank position down.",
    verifiedFeatures: ["Rank Position Defense", "PWA Quick Launch", "Single & Multiplayer"],
    subject: "Your Leaderboard Rank is Slipping on MindGrid - Reclaim Your Spot!",
    body: `Hello Operative,

Other operatives have been playing and setting higher scores on MindGrid, which means your ranking on the Hall of Fame is slipping down the leaderboard.

Jump back into the grid to play a match and climb back up:
https://neuralclash.dev/play

You can also install the MindGrid Web App directly to your phone's home screen for quick access:
https://neuralclash.dev/?install=pwa

Best regards,
MindGrid Command · Klyvex Studios`,
    ticker: "RANK ALERT: Other operatives are setting higher scores. Jump back in to climb the ranks!",
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
  const [aiTopic, setAiTopic] = useState("Direct PWA install guide for iOS and Android, zero lag, fullscreen home-screen play.");
  const [aiTone, setAiTone] = useState<"promotional" | "esports" | "reengagement" | "tester">("promotional");
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
      let sub = "";
      let bdy = "";
      let ticker = "";

      if (aiTone === "esports") {
        sub = "Challenge Other Operatives in Live 1v1 Memory Duels on MindGrid";
        bdy = `Hello Operative,\n\nTest your memory speed against real opponents in 1v1 multiplayer duels on MindGrid!\n\nReal Features:\n• Create private rooms with custom 6-digit join codes.\n• Synchronized card grids for fair competitive matching.\n• Live match results and winner determination.\n\nEnter the Arena:\nhttps://neuralclash.dev/multiplayer\n\nBest regards,\nMindGrid Esports Team`;
        ticker = "MULTIPLAYER: Duel other operatives live in real-time memory battles at /multiplayer!";
      } else if (aiTone === "reengagement") {
        sub = "Your Hall of Fame Rank is Slipping - Jump Back into MindGrid!";
        bdy = `Hello Operative,\n\nOther players have been playing and setting higher scores on MindGrid, pushing your rank position down the Hall of Fame.\n\nPlay a match now to post a higher score and climb back up:\nhttps://neuralclash.dev/play\n\nBest regards,\nMindGrid Command`;
        ticker = "RANK UPDATE: Climb the Hall of Fame leaderboards at https://neuralclash.dev/ranks";
      } else if (aiTone === "tester") {
        sub = "Neural Tester Access & Founder Recognition on MindGrid";
        bdy = `Hello Operative,\n\nThank you for testing and playing on the MindGrid platform!\n\nAs a verified tester:\n• Your account displays the Tester role on public leaderboards.\n• Access all board grids (2x2 to 6x6) and single/multiplayer modes.\n\nCheck your profile:\nhttps://neuralclash.dev/profile\n\nBest regards,\nKlyvex Studios Team`;
        ticker = "TESTERS: Thank you to all verified neural testers testing new multiplayer features!";
      } else {
        sub = "Install MindGrid on Your Phone (Fast Home-Screen Web App)";
        bdy = `Hello Operative,\n\nMindGrid is available to install directly onto your iOS or Android home screen as a Web App (PWA)!\n\nWhy Install?\n• Fullscreen card matching with zero browser address bars.\n• Fast 60FPS fluid cards and offline caching.\n\nInstall in 10 Seconds:\n• iOS: Safari ➔ Share ➔ Add to Home Screen.\n• Android: Chrome ➔ Menu ➔ Install App.\n\nDirect Link:\nhttps://neuralclash.dev/?install=pwa\n\nBest regards,\nMindGrid Admin & Klyvex Studios`;
        ticker = "PWA READY: Install MindGrid directly to your phone for fullscreen 60FPS play!";
      }

      setCustomAiOutput({
        subject: sub,
        body: bdy,
        broadcast: ticker,
        social: `${sub} https://neuralclash.dev #MindGrid #PWA #Gaming`,
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
                100% grounded in real, active MindGrid features (PWA mobile install, 1v1 live multiplayer duels, Hall of Fame rankings, and inactive rank alerts).
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
                    Automated Cadence Roster (100% Factual)
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
                  Announcement Focus / Custom Topic
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
                    Feature Focus
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="promotional">PWA Web App Install</option>
                    <option value="esports">1v1 Multiplayer Duels</option>
                    <option value="reengagement">Leaderboard Rank Alerts</option>
                    <option value="tester">Neural Tester Recognition</option>
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
                    <option value="active">Active Players</option>
                    <option value="inactive">Inactive Players (7+ Days)</option>
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
              {/* Floating Dancing Logo SVG from Floating Screen */}
              <div className="mx-auto flex flex-col items-center justify-center">
                <img
                  src="/mindgrid_logo.svg"
                  alt="MindGrid"
                  className="h-16 w-16 drop-shadow-[0_12px_24px_rgba(28,5,179,0.38)] animate-bounce"
                />
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
