import type { JSX } from "react";
import { useMemo, useState } from "react";
import {
  BrandMarkIcon,
  CheckCircleIcon,
  CopyIcon,
  SendIcon,
  SparklesIcon,
} from "../AppIcons";
import { avatarOptions } from "../../data/avatars";
import { authApi } from "../../lib/auth";
import { formatNumber } from "../../lib/utils";
import type { AdminPlayer } from "./AdminOverviewPanel";
import { AdminPagination } from "./AdminPagination";

export const PRESET_TEMPLATES = [
  {
    id: "pwa_download",
    name: "PWA Web App Available for Install",
    subject: "MindGrid Web App is Ready for Download (Zero Lag & Offline)",
    body: `Hello Operative,

MindGrid is now officially ready to install as a high-performance Web App (PWA) on your mobile and desktop devices!

Why Install?
• Instant 0-latency home-screen access
• Fullscreen immersion with 60FPS fluid cards
• 1.5x score boosts and immediate leaderboard syncing

How to Install in 10 Seconds:
• iOS (Safari): Open https://neuralclash.dev ➔ Tap the Share button (box with arrow) ➔ Tap "Add to Home Screen".
• Android / Chrome: Open https://neuralclash.dev ➔ Tap Menu (3 dots) ➔ Tap "Install App" or "Add to Home Screen".
• Desktop (Chrome/Edge): Click the Install icon in your address bar.

Direct Install Link:
https://neuralclash.dev/?install=pwa

Jump in and test your memory speed today!

Best regards,
MindGrid Admin & Klyvex Studios`,
  },
  {
    id: "weekly_tournament",
    name: "New Weekly Tournament Live",
    subject: "Weekly Tournament Arena is Live - Double XP & Prize Multipliers!",
    body: `Hello Operative,

The new MindGrid Weekly Championship Arena is officially live!

Tournament Highlights:
• Exclusive 5x6 Speed Sprint & Tactical Sync Matrix
• 2x Rating Points for all podium finishers
• Special Founder Badges for top 10 operatives

Join the Arena Now:
https://neuralclash.dev/events

Best regards,
MindGrid Esports Team`,
  },
  {
    id: "reengagement",
    name: "Player Re-engagement / Streak Boost",
    subject: "Your MindGrid Rank is Slipping - Reclaim Your Spot on the Hall of Fame!",
    body: `Hello Operative,

Other players are climbing the Hall of Fame leaderboards! Your spot is being contested in the global rankings.

Log in now to protect your rating and unlock your daily combo multiplier bonus.

Play Now:
https://neuralclash.dev/play

Best regards,
MindGrid Command`,
  },
  {
    id: "tester_perks",
    name: "Neural Tester Founder Rewards",
    subject: "Exclusive Neural Tester Perks & Founder Badge Activated!",
    body: `Hello Operative,

Thank you for being an active part of the MindGrid competitive ecosystem!

Your account has been granted exclusive Neural Tester access, which includes:
• Golden Founder Avatar Ring
• 1,000 Bonus Account XP
• Early access to new multiplayer duel modes

Claim your rewards inside your profile:
https://neuralclash.dev/profile

Best regards,
Klyvex Studios Team`,
  },
];

type AdminMessagesPanelProps = {
  players: AdminPlayer[];
  selectedUserIds: string[];
  onTogglePlayer: (player: AdminPlayer) => void;
  onSelectAll: (ids: string[]) => void;
  onDeselectAll: () => void;
  emailSubject: string;
  onChangeSubject: (sub: string) => void;
  emailBody: string;
  onChangeBody: (body: string) => void;
  sending: boolean;
  sendMessage: string | null;
  sendError: string | null;
  onSendEmail: () => Promise<void>;
};

export const AdminMessagesPanel = ({
  players,
  selectedUserIds,
  onTogglePlayer,
  onSelectAll,
  onDeselectAll,
  emailSubject,
  onChangeSubject,
  emailBody,
  onChangeBody,
  sending,
  sendMessage,
  sendError,
  onSendEmail,
}: AdminMessagesPanelProps): JSX.Element => {
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerFilter, setPlayerFilter] = useState<"all" | "email" | "testers" | "top10">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const pageSize = 7;

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        if (!playerSearch) return true;
        const q = playerSearch.toLowerCase();
        return p.username.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      })
      .filter((p) => {
        if (playerFilter === "email") return Boolean(p.email);
        if (playerFilter === "testers") return Boolean(p.isBetaTester);
        return true;
      })
      .slice(0, playerFilter === "top10" ? 10 : 500);
  }, [players, playerSearch, playerFilter]);

  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const selectedPlayers = players.filter((p) => selectedUserIds.includes(p.userId));

  const handleSelectAllFiltered = () => {
    const ids = filteredPlayers.map((p) => p.userId);
    onSelectAll(ids);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
      {/* Left Column: Player Selection with Pagination */}
      <section className="flex flex-col rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Player Directory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select operatives to receive the styled transmission.
              </p>
            </div>
            <span className="rounded-full bg-[#eff1ff] dark:bg-blue-900/40 px-3 py-1 text-xs font-bold text-[#1c05b3] dark:text-sky-300">
              {selectedUserIds.length} Selected
            </span>
          </div>

          {/* Search Bar */}
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search by username or email..."
              value={playerSearch}
              onChange={(e) => {
                setPlayerSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>

          {/* Filter Toolbar & Select All Controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setPlayerFilter("all");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  playerFilter === "all"
                    ? "bg-[#1c05b3] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                All ({players.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlayerFilter("email");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  playerFilter === "email"
                    ? "bg-[#1c05b3] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                With Email ({players.filter((p) => p.email).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlayerFilter("testers");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  playerFilter === "testers"
                    ? "bg-[#1c05b3] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Testers ({players.filter((p) => p.isBetaTester).length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlayerFilter("top10");
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  playerFilter === "top10"
                    ? "bg-[#1c05b3] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Top 10
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onDeselectAll}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Paginated Player Cards List */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {paginatedPlayers.length ? (
            paginatedPlayers.map((player) => {
              const avatar = avatarOptions.find((entry) => entry.id === player.avatarId) ?? avatarOptions[0];
              const selected = selectedUserIds.includes(player.userId);
              return (
                <div
                  key={player.userId}
                  onClick={() => onTogglePlayer(player)}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 transition ${
                    selected
                      ? "border-[#1c05b3] bg-[#eff1ff] dark:border-blue-700 dark:bg-blue-950/40"
                      : "border-slate-200/80 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={avatar.image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                        {player.username}
                      </p>
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {player.email ? player.email : "No email saved"}
                      </p>
                      <p className="text-[10px] font-semibold text-[#1c05b3] dark:text-sky-400">
                        {formatNumber(player.totalPoints)} pts · best {formatNumber(player.bestScore)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const defaultTemp = `Temp-${Math.floor(1000 + Math.random() * 9000)}`;
                        const input = prompt(
                          `Set temporary password for ${player.username}:\n(Player will be forced to set a new password upon logging in)`,
                          defaultTemp,
                        );
                        if (input) {
                          authApi.adminResetUserPassword(player.userId, input).then(() => {
                            alert(`Temporary password set to "${input}" for ${player.username}!\nThey must set a new password upon login.`);
                          });
                        }
                      }}
                      className="rounded-lg bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-500/20 border border-amber-500/30 dark:text-amber-400"
                    >
                      Reset
                    </button>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                        selected
                          ? "border-[#1c05b3] bg-[#1c05b3] text-white"
                          : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                      }`}
                    >
                      {selected && <CheckCircleIcon className="h-3.5 w-3.5" />}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No players found matching your filter criteria.
            </div>
          )}
        </div>

        {/* Directory Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredPlayers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="players"
        />
      </section>

      {/* Right Column: Message Composer & Styled Email Preview */}
      <section className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Message Composer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dispatches formatted emails with the floating MindGrid brand mark.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen(!previewOpen)}
            className="rounded-full border border-blue-200 bg-[#eff1ff] px-3.5 py-1.5 text-xs font-bold text-[#1c05b3] hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-sky-300"
          >
            {previewOpen ? "Edit Form" : "View Styled Preview"}
          </button>
        </div>

        {!previewOpen ? (
          <>
            {/* Pre-Built Template Injectors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                1-Click Message Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      onChangeSubject(tpl.subject);
                      onChangeBody(tpl.body);
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-left text-xs font-bold text-slate-700 transition hover:border-[#1c05b3] hover:bg-[#eff1ff] hover:text-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-blue-700"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Promo Link Inserters */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Insert Quick Promo Links
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChangeBody(`${emailBody}\n\nDirect PWA Install Link: https://neuralclash.dev/?install=pwa`)}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1c05b3] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-sky-300"
                >
                  + PWA Install Link
                </button>
                <button
                  type="button"
                  onClick={() => onChangeBody(`${emailBody}\n\nStudio Portfolio: https://klyvex-studios.tech`)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  + Klyvex Studios Link
                </button>
                <button
                  type="button"
                  onClick={() => onChangeBody(`${emailBody}\n\nTournaments: https://neuralclash.dev/events`)}
                  className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300"
                >
                  + Tournament Arena
                </button>
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => onChangeSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1c05b3] focus:ring-4 focus:ring-[#c7ceff] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Body Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Message Body
              </label>
              <textarea
                rows={8}
                value={emailBody}
                onChange={(e) => onChangeBody(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#1c05b3] focus:ring-4 focus:ring-[#c7ceff] dark:border-slate-800 dark:bg-slate-950 dark:text-white font-sans"
              />
            </div>
          </>
        ) : (
          /* Live Styled Email Preview Container with Floating MindGrid Logo */
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/70 space-y-6">
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800">
              {/* Floating Logo with Animation and MindGrid underneath */}
              <div className="mx-auto flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-16 w-16 rounded-2xl bg-[#1c05b3] p-3 shadow-[0_10px_25px_rgba(28,5,179,0.35)] animate-bounce">
                    <BrandMarkIcon className="h-full w-full" />
                  </div>
                </div>
                <h4 className="mt-3 font-display text-lg font-black tracking-tight text-[#1c05b3] dark:text-white">
                  MindGrid
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Neural Clash · Klyvex Studios
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {emailSubject}
              </h5>
              <div className="rounded-xl bg-white p-4 text-xs leading-relaxed text-slate-800 dark:bg-slate-900 dark:text-slate-200 whitespace-pre-line border border-slate-200/60 dark:border-slate-800">
                {emailBody}
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800">
              Dispatched from secure admin gateway · https://neuralclash.dev
            </div>
          </div>
        )}

        {/* Notification Banners */}
        {sendMessage && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {sendMessage}
          </p>
        )}
        {sendError && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            {sendError}
          </p>
        )}

        {/* Send Button */}
        <button
          type="button"
          disabled={sending || !selectedUserIds.length}
          onClick={() => void onSendEmail()}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_30px_rgba(28,5,179,0.25)] transition hover:scale-[1.01] hover:from-[#1c05b3] hover:to-[#120282] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon className="h-4 w-4" />
          {sending
            ? "Transmitting Email..."
            : `Dispatch Transmission to ${selectedUserIds.length} Recipient${selectedUserIds.length === 1 ? "" : "s"}`}
        </button>
      </section>
    </div>
  );
};
