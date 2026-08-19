import type { JSX } from "react";
import { useState } from "react";
import { CopyIcon, LinkIcon } from "../AppIcons";

type AdminPromosPanelProps = {
  copiedLink: string | null;
  onCopyLink: (url: string, label: string) => void;
};

export const AdminPromosPanel = ({
  copiedLink,
  onCopyLink,
}: AdminPromosPanelProps): JSX.Element => {
  const [globalAnnouncement, setGlobalAnnouncement] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.localStorage.getItem("mindgrid.global_announcement") ||
        "MindGrid Web App is now ready for install! Play with 0-latency."
      );
    }
    return "MindGrid Web App is now ready for install! Play with 0-latency.";
  });
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  const saveGlobalAnnouncement = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mindgrid.global_announcement", globalAnnouncement);
      setAnnouncementSaved(true);
      setTimeout(() => setAnnouncementSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Direct PWA Deep Link Hero */}
      <div className="rounded-[1.8rem] border border-blue-200/80 bg-gradient-to-r from-blue-500/10 via-[#eff1ff] to-blue-500/10 p-6 sm:p-8 dark:border-blue-900/40 dark:bg-slate-900/90 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c05b3] dark:text-sky-300">
              PWA Direct Install Deep Link
            </span>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              https://neuralclash.dev/?install=pwa
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Opening this link automatically triggers the browser PWA install prompt banner on supported mobile (iOS/Android) and desktop browsers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopyLink("https://neuralclash.dev/?install=pwa", "pwa_deep")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1c05b3] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#140494] shrink-0"
          >
            <CopyIcon className="h-4 w-4" />
            <span>{copiedLink === "pwa_deep" ? "Copied to Clipboard!" : "Copy Install Link"}</span>
          </button>
        </div>
      </div>

      {/* Live Global In-Game Broadcast Ticker */}
      <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Live Global In-Game Broadcast Ticker
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This message is displayed live across the top banner of the game for all active players.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={globalAnnouncement}
            onChange={(e) => setGlobalAnnouncement(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="button"
            onClick={saveGlobalAnnouncement}
            className="rounded-xl bg-[#1c05b3] px-6 py-3 text-xs font-bold text-white hover:bg-[#140494] transition shrink-0"
          >
            {announcementSaved ? "Published Live!" : "Publish Broadcast"}
          </button>
        </div>
      </div>

      {/* Public Endpoints & Platform Assets */}
      <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
          Public Platform Endpoints
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">MindGrid Production Web App</p>
              <p className="text-slate-500 font-mono text-[11px]">https://neuralclash.dev</p>
            </div>
            <button
              type="button"
              onClick={() => onCopyLink("https://neuralclash.dev", "ep_app")}
              className="text-xs font-bold text-[#1c05b3] hover:underline"
            >
              {copiedLink === "ep_app" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Klyvex Studios Ecosystem Portfolio</p>
              <p className="text-slate-500 font-mono text-[11px]">https://klyvex-studios.tech</p>
            </div>
            <button
              type="button"
              onClick={() => onCopyLink("https://klyvex-studios.tech", "ep_klyvex")}
              className="text-xs font-bold text-[#1c05b3] hover:underline"
            >
              {copiedLink === "ep_klyvex" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Hall of Fame Global Leaderboard</p>
              <p className="text-slate-500 font-mono text-[11px]">https://neuralclash.dev/ranks</p>
            </div>
            <button
              type="button"
              onClick={() => onCopyLink("https://neuralclash.dev/ranks", "ep_ranks")}
              className="text-xs font-bold text-[#1c05b3] hover:underline"
            >
              {copiedLink === "ep_ranks" ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">1v1 Real-Time Multiplayer Arena</p>
              <p className="text-slate-500 font-mono text-[11px]">https://neuralclash.dev/multiplayer</p>
            </div>
            <button
              type="button"
              onClick={() => onCopyLink("https://neuralclash.dev/multiplayer", "ep_mp")}
              className="text-xs font-bold text-[#1c05b3] hover:underline"
            >
              {copiedLink === "ep_mp" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
