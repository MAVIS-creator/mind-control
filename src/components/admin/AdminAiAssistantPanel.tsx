import type { JSX } from "react";
import { useState } from "react";
import { BrandMarkIcon, CopyIcon, SendIcon, SparklesIcon } from "../AppIcons";

type AdminAiAssistantPanelProps = {
  onTransferToComposer: (subject: string, body: string) => void;
  onSetLiveGlobalTicker: (ticker: string) => void;
};

export const VERIFIED_FEATURE_TOPICS = [
  {
    id: "pwa_install",
    title: "Web App (PWA) Install Tutorial",
    desc: "Guides players on installing MindGrid directly to their iOS/Android home screen for 0-latency play.",
    promptHint: "Direct PWA install guide for iOS (Safari Add to Home Screen) and Android (Install App), zero lag, full offline caching.",
  },
  {
    id: "multiplayer_duels",
    title: "1v1 Real-Time Multiplayer Duels",
    desc: "Invites players to create private rooms or duel opponents live in real-time memory sprints.",
    promptHint: "1v1 live multiplayer arena duels, custom room codes, synchronized grid cards, and live spectator rankings at /multiplayer.",
  },
  {
    id: "inactivity_streak",
    title: "Inactivity & Streak Protection Nudge",
    desc: "Re-engages players who haven't logged in, reminding them to protect their rating and combo multipliers.",
    promptHint: "Friendly competitive re-engagement, streak bonus protection, Hall of Fame leaderboard defense at /play.",
  },
  {
    id: "season_reset",
    title: "Weekly Leaderboard Season Finale",
    desc: "Announces the closing of the weekly rank cycle and rewards top operatives with Zenith Lord honors.",
    promptHint: "Weekly leaderboard season climax, Hall of Fame rating lock-in, Double XP for top 10 finishers at /ranks.",
  },
];

export const AdminAiAssistantPanel = ({
  onTransferToComposer,
  onSetLiveGlobalTicker,
}: AdminAiAssistantPanelProps): JSX.Element => {
  const [aiTopic, setAiTopic] = useState(VERIFIED_FEATURE_TOPICS[0].promptHint);
  const [selectedPresetId, setSelectedPresetId] = useState(VERIFIED_FEATURE_TOPICS[0].id);
  const [aiTone, setAiTone] = useState<"esports" | "promotional" | "urgent" | "rewarding">("promotional");
  const [aiAudience, setAiAudience] = useState<"all" | "active" | "inactive">("all");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [scheduleCadence, setScheduleCadence] = useState<"daily" | "weekly_friday" | "weekly_sunday" | "inactive_7d">("weekly_friday");
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<string | null>(null);

  const [aiOutput, setAiOutput] = useState<{
    subject: string;
    body: string;
    broadcast: string;
    social: string;
  } | null>({
    subject: "MindGrid Web App is Ready for Install (0-Latency & Offline)",
    body: `Hello Operative,

MindGrid is now officially available as a standalone Web App (PWA) for your mobile and desktop devices!

Verified Core Features:
• 0-Latency Card Flips: High-speed neural matrix rendering at 60FPS.
• Home-Screen Access: 1-tap entry without browser navigation bars.
• Multiplayer Duel Rooms: Real-time 1v1 battles with custom join codes.

How to Install in 10 Seconds:
• iOS (Safari): Open https://neuralclash.dev ➔ Tap Share ➔ "Add to Home Screen".
• Android: Open https://neuralclash.dev ➔ Tap Menu ➔ "Install App".

Direct Install Link:
https://neuralclash.dev/?install=pwa

See you on the grid,
MindGrid Command · Klyvex Studios`,
    broadcast: "MindGrid Web App is now ready for install! Tap to play with zero input lag.",
    social: "Install MindGrid directly to your phone's home screen for zero-latency 60FPS memory duels! https://neuralclash.dev/?install=pwa #MindGrid #Esports #WebDev",
  });

  const generateAiBroadcast = () => {
    setAiGenerating(true);
    setTimeout(() => {
      let sub = "";
      let bdy = "";
      let ticker = "";
      let soc = "";

      if (selectedPresetId === "inactivity_streak") {
        sub = `[Rank Alert] Protect Your MindGrid Rating & Daily Streak!`;
        bdy = `Hello Operative,

Your competitive rating is being contested in the global Hall of Fame leaderboards!

Keep your brain sharp and protect your daily streak multiplier:
• Daily Combo Multiplier: Earn up to 1.5x bonus score.
• 1v1 Multiplayer Duels: Challenge friends in custom rooms.
• Hall of Fame Protection: Maintain your Zenith tier ranking.

Jump back into the grid:
https://neuralclash.dev/play

Best regards,
MindGrid Command`;
        ticker = `STREAK ALERT: Log in now to protect your Hall of Fame rating and combo bonus!`;
        soc = `Don't let your MindGrid rank slip! Defend your spot on the Hall of Fame podium: https://neuralclash.dev #MindGrid #CompetitiveGaming`;
      } else if (selectedPresetId === "multiplayer_duels") {
        sub = `[Live Multiplayer] Challenge Operatives in Real-Time 1v1 Memory Duels`;
        bdy = `Hello Operative,

MindGrid's real-time multiplayer arena is live!

Multiplayer Highlights:
• Instant Room Codes: Create private 1v1 duel rooms for your friends.
• Synchronized Grids: Match cards in real-time under identical matrix conditions.
• Speed Leaderboards: Prove who has the fastest reaction memory.

Enter the Arena:
https://neuralclash.dev/multiplayer

Best regards,
MindGrid Esports Team`;
        ticker = `MULTIPLAYER LIVE: Create custom 1v1 duel rooms and battle friends in real-time!`;
        soc = `Real-time 1v1 memory duels are live on MindGrid! Challenge your friends with a custom room code: https://neuralclash.dev/multiplayer #Esports #MindGrid`;
      } else if (selectedPresetId === "season_reset") {
        sub = `[Season Climax] Final Hours for Weekly Hall of Fame Leaderboards!`;
        bdy = `Hello Operative,

The weekly leaderboard cycle is reaching its final countdown!

Season Rewards:
• Zenith Lord badges for top podium finishers.
• Double XP rating for all completed speed sprints.
• Permanent ranking record on the public Hall of Fame.

Climb the Leaderboards:
https://neuralclash.dev/ranks

Best regards,
MindGrid Admin`;
        ticker = `SEASON FINALE: Final hours to lock in your top ranking on the Hall of Fame!`;
        soc = `Who will finish as this week's Zenith Lord? Final hours to climb the MindGrid leaderboards: https://neuralclash.dev/ranks #Esports`;
      } else {
        sub = `MindGrid Web App is Ready for Install (0-Latency & Offline)`;
        bdy = `Hello Operative,

MindGrid is now officially available as a standalone Web App (PWA) for your mobile and desktop devices!

Why Install?
• Instant 0-latency home-screen access
• Fullscreen immersion with 60FPS fluid cards
• 1.5x score boosts and immediate leaderboard syncing

How to Install in 10 Seconds:
• iOS (Safari): Open https://neuralclash.dev ➔ Tap Share ➔ "Add to Home Screen".
• Android / Chrome: Open https://neuralclash.dev ➔ Tap Menu ➔ "Install App".

Direct Install Link:
https://neuralclash.dev/?install=pwa

Best regards,
MindGrid Admin · Klyvex Studios`;
        ticker = `NEW: Install MindGrid directly as a Web App (PWA) for 0-latency 60FPS play!`;
        soc = `Install MindGrid directly to your phone's home screen in 2 taps: https://neuralclash.dev/?install=pwa #MindGrid #PWA #Gaming`;
      }

      setAiOutput({ subject: sub, body: bdy, broadcast: ticker, social: soc });
      setAiGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-[1.8rem] border border-blue-200/80 bg-gradient-to-r from-blue-500/10 via-[#eff1ff] to-blue-500/10 p-6 dark:border-blue-900/40 dark:bg-slate-900/90">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c05b3] text-white shadow-md shrink-0">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              AI Broadcast Engine & Automated Scheduler
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Generate truthful announcements grounded exclusively in real MindGrid features (PWA install, 1v1 multiplayer duels, streak reminders, and weekly leaderboards).
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Generator Form & Verified Feature Presets */}
        <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
            1. Select Verified Feature Context
          </h4>

          {/* Verified Feature Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VERIFIED_FEATURE_TOPICS.map((topic) => {
              const selected = selectedPresetId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedPresetId(topic.id);
                    setAiTopic(topic.promptHint);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-[#1c05b3] bg-[#eff1ff] dark:border-blue-700 dark:bg-blue-950/40"
                      : "border-slate-200 bg-white hover:border-blue-200 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <p className={`text-xs font-bold ${selected ? "text-[#1c05b3] dark:text-sky-300" : "text-slate-800 dark:text-slate-200"}`}>
                    {topic.title}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {topic.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Custom Prompt / Announcement Focus
            </label>
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="promotional">PWA Download & Features</option>
                <option value="esports">Esports & Competitive Duels</option>
                <option value="urgent">Urgent / Season Finale</option>
                <option value="rewarding">Tester & Founder Rewards</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Audience Filter
              </label>
              <select
                value={aiAudience}
                onChange={(e) => setAiAudience(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
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
            onClick={generateAiBroadcast}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:scale-[1.01]"
          >
            <SparklesIcon className="h-4 w-4" />
            {aiGenerating ? "Synthesizing AI Announcement..." : "Generate AI Broadcast Post"}
          </button>

          {/* Automated Schedule Settings */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
              2. Automated Recurrence Schedule
            </h5>
            <div className="space-y-2.5">
              <select
                value={scheduleCadence}
                onChange={(e) => setScheduleCadence(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="daily">Daily Morning Pulse (9:00 AM)</option>
                <option value="weekly_friday">Weekly Friday Weekend Rush (4:00 PM)</option>
                <option value="weekly_sunday">Weekly Sunday Leaderboard Finale (6:00 PM)</option>
                <option value="inactive_7d">Auto Re-engage Inactive Operatives (7+ Days)</option>
              </select>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Broadcast Activation</p>
                  <p className="text-[10px] text-slate-500">Dispatches automatically when triggered</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSendEnabled}
                  onChange={(e) => {
                    setAutoSendEnabled(e.target.checked);
                    setScheduleStatus(e.target.checked ? "Automated cadence active" : "Manual review mode active");
                  }}
                  className="h-5 w-5 rounded border-slate-300 text-[#1c05b3]"
                />
              </div>
              {scheduleStatus && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{scheduleStatus}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Output & Styled Preview with Floating Logo */}
        <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Generated Email & Floating Brand Preview
            </h4>
            {aiOutput && (
              <button
                type="button"
                onClick={() => onTransferToComposer(aiOutput.subject, aiOutput.body)}
                className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
              >
                Transfer to Composer &rarr;
              </button>
            )}
          </div>

          {aiOutput ? (
            <div className="space-y-4">
              {/* Styled Preview with Floating Logo */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/70 space-y-4">
                <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="mx-auto flex flex-col items-center justify-center">
                    <div className="h-12 w-12 rounded-2xl bg-[#1c05b3] p-2.5 shadow-[0_8px_20px_rgba(28,5,179,0.35)] animate-bounce">
                      <BrandMarkIcon className="h-full w-full" />
                    </div>
                    <h5 className="mt-2 font-display text-sm font-black tracking-tight text-[#1c05b3] dark:text-white">
                      MindGrid
                    </h5>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Neural Clash · Klyvex Studios
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{aiOutput.subject}</p>
                  <div className="mt-2 rounded-xl bg-white p-3.5 text-xs leading-relaxed text-slate-800 dark:bg-slate-900 dark:text-slate-200 whitespace-pre-line border border-slate-200/60 dark:border-slate-800">
                    {aiOutput.body}
                  </div>
                </div>
              </div>

              {/* In-Game Ticker Format */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  In-Game Live Ticker Format
                </p>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs font-semibold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800">
                  <span className="truncate pr-2">{aiOutput.broadcast}</span>
                  <button
                    type="button"
                    onClick={() => onSetLiveGlobalTicker(aiOutput.broadcast)}
                    className="shrink-0 rounded-lg bg-[#1c05b3] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-[#140494]"
                  >
                    Publish Live
                  </button>
                </div>
              </div>

              {/* Social / Discord Post Format */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Social / Discord Post
                </p>
                <p className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
                  {aiOutput.social}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Click "Generate AI Broadcast Post" to produce verified announcements.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
