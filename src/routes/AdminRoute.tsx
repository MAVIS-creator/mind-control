import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Link, Navigate, NavLink, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ClockIcon,
  RefreshIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
} from "../components/AppIcons";
import { EventEditionAdminPanel } from "../components/EventEditionAdminPanel";
import { PerksAdminPanel } from "../components/PerksAdminPanel";
import { avatarOptions } from "../data/avatars";
import { formatDuration, formatNumber, formatPercent, isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { LeaderboardEntry, ReviewStatus } from "../types";

type AdminPlayer = {
  userId: string;
  username: string;
  email: string;
  avatarId: string;
  totalRuns: number;
  bestScore: number;
  totalPoints: number;
  latestRun?: string;
};

export const AdminRoute = () => {
  const { adminSection } = useParams();
  const {
    session,
    leaderboard,
    accountLeaderboard,
    updateRun,
    deleteRun,
    sendAdminEmail,
  } = useAppContext();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [emailSubject, setEmailSubject] = useState("MindGrid account message");
  const [emailBody, setEmailBody] = useState(
    "Hello,\n\nWe are reaching out from the MindGrid admin team about your account.\n\nThank you,\nMindGrid Admin",
  );
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const players = useMemo(
    () => buildAdminPlayers(leaderboard, accountLeaderboard),
    [accountLeaderboard, leaderboard],
  );
  const selectedRun = leaderboard.find((entry) => entry.id === selectedRunId) ?? null;
  const selectedPlayers = players.filter((player) => selectedUserIds.includes(player.userId));
  const flaggedCount = useMemo(
    () => leaderboard.filter((entry) => entry.audit.reviewedStatus === "flagged").length,
    [leaderboard],
  );
  const pendingCount = useMemo(
    () => leaderboard.filter((entry) => entry.audit.reviewedStatus === "pending").length,
    [leaderboard],
  );
  const orderedRuns = useMemo(
    () =>
      [...leaderboard].sort((a, b) => {
        const priority = { flagged: 0, pending: 1, approved: 2 } as const;
        const statusDiff = priority[a.audit.reviewedStatus] - priority[b.audit.reviewedStatus];
        if (statusDiff !== 0) return statusDiff;
        if (b.audit.suspicionScore !== a.audit.suspicionScore) return b.audit.suspicionScore - a.audit.suspicionScore;
        return +new Date(b.playedAt) - +new Date(a.playedAt);
      }),
    [leaderboard],
  );
  const section = isAdminSection(adminSection) ? adminSection : "overview";
  const sectionMeta = ADMIN_SECTIONS.find((item) => item.id === section) ?? ADMIN_SECTIONS[0];

  if (!session) return <Navigate to="/login" replace />;

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  if (!session.profile.isAdmin) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8ff_0%,#eef4ff_100%)] dark:bg-none dark:bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[1.8rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-8 text-center shadow-[0_22px_48px_rgba(53,37,205,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">Admin access</p>
            <h1 className="mt-4 font-display text-[2.4rem] font-extrabold text-[#111c2d] dark:text-white">
              This account cannot open the admin panel.
            </h1>
            <p className="mt-4 text-[1rem] leading-8 text-[#5a6174] dark:text-slate-400">
              Sign in with an admin-enabled account to review runs and message players.
            </p>
            <Link
              to="/play"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Game Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const togglePlayer = (player: AdminPlayer) => {
    setSendMessage(null);
    setSendError(null);
    setSelectedUserIds((current) =>
      current.includes(player.userId)
        ? current.filter((id) => id !== player.userId)
        : [...current, player.userId],
    );
  };

  const selectRun = (entry: LeaderboardEntry) => {
    setSelectedRunId(entry.id);
    setNote(entry.audit.reviewedNote);
    setSelectedUserIds([entry.userId]);
    setEmailSubject(`MindGrid account message for ${entry.username}`);
    setEmailBody(
      `Hello ${entry.username},\n\nWe are reaching out from the MindGrid admin team about your account activity.\n\nThank you,\nMindGrid Admin`,
    );
    setSendMessage(null);
    setSendError(null);
  };

  const applyReview = async (status: ReviewStatus) => {
    if (!selectedRun) return;
    await updateRun({
      ...selectedRun,
      audit: {
        ...selectedRun.audit,
        reviewedStatus: status,
        reviewedNote: note,
      },
    });
  };

  const handleSendEmail = async () => {
    setSending(true);
    setSendMessage(null);
    setSendError(null);

    try {
      const result = await sendAdminEmail({
        recipientIds: selectedUserIds,
        subject: emailSubject,
        message: emailBody,
      });
      setSendMessage(`Message sent to ${result.sent} player${result.sent === 1 ? "" : "s"}.`);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8ff_0%,#eef4ff_100%)] dark:bg-none dark:bg-slate-950 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 px-5 py-5 shadow-[0_18px_40px_rgba(53,37,205,0.07)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">Admin panel</p>
              <h1 className="mt-2 font-display text-[2.2rem] font-extrabold text-[#111c2d] dark:text-white sm:text-[3rem]">
                {sectionMeta.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5a6174] dark:text-slate-400">
                {sectionMeta.helper}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/play"
                className="inline-flex items-center gap-2 rounded-full border border-[#d9deee] dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-[#495066] dark:text-slate-300"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Hub
              </Link>
              <Link
                to="/hall-of-fame"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-5 py-3 text-sm font-semibold text-white"
              >
                <TrophyIcon className="h-4 w-4" />
                Ranks
              </Link>
            </div>
          </div>
        </header>

        <AdminNav />

        {section === "overview" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard label="Players" value={`${players.length}`} icon={<UserIcon className="h-5 w-5" />} />
              <AdminStatCard label="Runs" value={`${leaderboard.length}`} icon={<TrophyIcon className="h-5 w-5" />} />
              <AdminStatCard label="Flagged" value={`${flaggedCount}`} icon={<RefreshIcon className="h-5 w-5" />} />
              <AdminStatCard label="Pending" value={`${pendingCount}`} icon={<ClockIcon className="h-5 w-5" />} />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <AdminShortcut
                to="/mavisbk/events"
                title="Event builder"
                text="Create one-time tournaments, edit slugs, and draft supported configs with AI."
              />
              <AdminShortcut
                to="/mavisbk/messages"
                title="Player messages"
                text="Select registered accounts and send styled email messages."
              />
              <AdminShortcut
                to="/mavisbk/reviews"
                title="Fair-play reviews"
                text="Review flagged runs, add notes, approve, flag, or delete bad runs."
              />
            </div>
          </>
        ) : null}

        {section === "perks" ? <PerksAdminPanel /> : null}

        {section === "events" ? <EventEditionAdminPanel session={session} /> : null}

        {section === "messages" ? <div className="grid gap-5 xl:grid-cols-[0.8fr_1fr]">
          <section className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
            <PanelHeader
              title="Player emails"
              caption={`${selectedUserIds.length} selected`}
              helper="Select who receives the admin message."
            />
            <div className="max-h-[34rem] overflow-y-auto p-3">
              {players.length ? (
                <div className="space-y-2">
                  {players.map((player) => {
                    const avatar = avatarOptions.find((entry) => entry.id === player.avatarId) ?? avatarOptions[0];
                    const selected = selectedUserIds.includes(player.userId);
                    return (
                      <button
                        key={player.userId}
                        type="button"
                        onClick={() => togglePlayer(player)}
                        className={`flex w-full items-center gap-3 rounded-[1.2rem] border p-3 text-left transition ${
                          selected
                            ? "border-[#4f46e5] bg-[#eef2ff] dark:bg-indigo-900/30"
                            : "border-[#e5e9f5] bg-white hover:border-[#c9d5f6] dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
                        }`}
                      >
                        <img src={avatar.image} alt="" className="h-12 w-12 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-[#1a2340] dark:text-white">{player.username}</div>
                          <div className="truncate text-xs text-[#6c7489] dark:text-slate-400">{player.email || "No email saved"}</div>
                          <div className="mt-1 text-xs font-semibold text-[#3525cd] dark:text-indigo-400">
                            {formatNumber(player.totalPoints)} pts · best {formatNumber(player.bestScore)}
                          </div>
                        </div>
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
                          className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-500/20 border border-amber-500/30"
                        >
                          Reset Pass
                        </button>
                        <span
                          className={`h-5 w-5 rounded-full border ${
                            selected ? "border-[#3525cd] bg-[#3525cd]" : "border-[#cdd6ef] bg-white dark:border-slate-700 dark:bg-slate-800"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyPanel text="No players with saved runs yet. Players will appear here after they submit runs." />
              )}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
            <PanelHeader
              title="Send email message"
              caption={selectedPlayers.length ? `${selectedPlayers.length} recipient${selectedPlayers.length === 1 ? "" : "s"}` : "No recipient"}
              helper="This sends through the secure Supabase function, using registered profile emails."
            />
            <div className="space-y-4 p-5">
              <div className="rounded-[1.2rem] border border-[#e5e9f5] dark:border-slate-800 bg-[#f8faff] dark:bg-slate-950 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">Recipients</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPlayers.length ? (
                    selectedPlayers.map((player) => (
                      <span
                        key={player.userId}
                        className="rounded-full bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-[#3525cd] dark:text-indigo-400"
                        title={player.email || "No saved email"}
                      >
                        {player.username}
                        {player.email ? ` · ${player.email}` : " · no email"}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-[#6c7489] dark:text-slate-400">Choose one or more players from the list.</span>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">Subject</span>
                <input
                  value={emailSubject}
                  onChange={(event) => setEmailSubject(event.target.value)}
                  className="h-13 w-full rounded-[1.1rem] border border-[#dfe4f2] dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-[#1f2740] dark:text-white outline-none transition focus:border-[#c5c2ff] dark:focus:border-indigo-500 focus:ring-4 focus:ring-[#ebe9ff] dark:focus:ring-indigo-500/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">Message</span>
                <textarea
                  value={emailBody}
                  onChange={(event) => setEmailBody(event.target.value)}
                  rows={8}
                  className="w-full rounded-[1.1rem] border border-[#dfe4f2] dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm leading-6 text-[#1f2740] dark:text-white outline-none transition focus:border-[#c5c2ff] dark:focus:border-indigo-500 focus:ring-4 focus:ring-[#ebe9ff] dark:focus:ring-indigo-500/20"
                />
              </label>

              {sendMessage ? <p className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{sendMessage}</p> : null}
              {sendError ? <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{sendError}</p> : null}

              <button
                type="button"
                disabled={sending || !selectedUserIds.length}
                onClick={() => void handleSendEmail()}
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_14px_30px_rgba(53,37,205,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparklesIcon className="h-4 w-4" />
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </section>
        </div> : null}

        {section === "reviews" ? <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
          <section className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
            <PanelHeader title="Run review queue" caption="Fair play" helper="Open a run to review flags, save notes, or remove a bad result." />
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#f7f8ff] dark:bg-slate-950 text-xs uppercase tracking-[0.16em] text-[#7d8395] dark:text-slate-400 border-b border-[#edf0f8] dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Player</th>
                    <th className="px-5 py-4">Run</th>
                    <th className="px-5 py-4">Flags</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedRuns.map((entry) => (
                    <tr key={entry.id} className="border-t border-[#edf0f8] dark:border-slate-800 text-sm text-[#1f2740] dark:text-white">
                      <td className="px-5 py-4">
                        <div className="font-semibold">{entry.username}</div>
                        <div className="text-xs text-[#7d8395] dark:text-slate-400">{entry.email || "No email"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#3525cd] dark:text-indigo-400">{formatNumber(entry.score)}</div>
                        <div className="text-xs text-[#7d8395] dark:text-slate-400">
                          {entry.gridSize} · {entry.matchType} · {formatDuration(entry.duration)}
                        </div>
                      </td>
                      <td className="px-5 py-4">{entry.audit.suspicionScore}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={entry.audit.reviewedStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => selectRun(entry)}
                          className="rounded-full border border-[#dce1f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#3525cd] dark:text-indigo-400"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-5 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
            <h2 className="text-lg font-semibold uppercase tracking-[0.16em] text-[#1a2340] dark:text-white">Run details</h2>
            {selectedRun ? (
              <div className="mt-5 space-y-4">
                <InfoGrid
                  items={[
                    ["Player", selectedRun.username],
                    ["Email", selectedRun.email || "No email saved"],
                    ["Score", formatNumber(selectedRun.score)],
                    ["Accuracy", formatPercent(selectedRun.accuracy)],
                    ["Combo", `x${selectedRun.maxCombo}`],
                    ["Duration", formatDuration(selectedRun.duration)],
                  ]}
                />

                <div className="rounded-[1.2rem] border border-[#e5e8f5] dark:border-slate-800 bg-[#fbfbff] dark:bg-slate-950 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">Fair play reasons</div>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#5a6174] dark:text-slate-300">
                    {selectedRun.audit.suspicionReasons.length ? (
                      selectedRun.audit.suspicionReasons.map((reason) => <li key={reason}>{reason}</li>)
                    ) : (
                      <li>No flags recorded.</li>
                    )}
                  </ul>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">Admin note</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    className="w-full rounded-[1.2rem] border border-[#dfe4f2] dark:border-slate-800 bg-[#f8f9ff] dark:bg-slate-950 px-4 py-3 text-sm text-[#1f2740] dark:text-white outline-none transition focus:border-[#c5c2ff] dark:focus:border-indigo-500 focus:ring-4 focus:ring-[#ebe9ff] dark:focus:ring-indigo-500/20"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-3">
                  <ReviewButton label="Approve" tone="good" onClick={() => void applyReview("approved")} />
                  <ReviewButton label="Flag" tone="bad" onClick={() => void applyReview("flagged")} />
                  <ReviewButton label="Pending" tone="neutral" onClick={() => void applyReview("pending")} />
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRun(selectedRun.id)}
                  className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700"
                >
                  Delete Run
                </button>
              </div>
            ) : (
              <EmptyPanel text="Open a run from the table to inspect details and save review notes." />
            )}
          </section>
        </div> : null}
      </div>
    </div>
  );
};

type AdminSection = "overview" | "perks" | "events" | "messages" | "reviews";

const ADMIN_SECTIONS: Array<{ id: AdminSection; title: string; helper: string; path: string }> = [
  {
    id: "overview",
    title: "Admin overview",
    helper: "Jump into events, messages, or fair-play reviews without one long page.",
    path: "/mavisbk",
  },
  {
    id: "perks",
    title: "Perks & Neural Testers",
    helper: "Manage Neural Tester statuses, inspect user emails, and distribute perks.",
    path: "/mavisbk/perks",
  },
  {
    id: "events",
    title: "Events and tournaments",
    helper: "Create backend-driven event pages, edit routes, and ask AI to draft supported tournament configs.",
    path: "/mavisbk/events",
  },
  {
    id: "messages",
    title: "Player messages",
    helper: "Pick players from the account list, write one clear message, and send it to registered emails.",
    path: "/mavisbk/messages",
  },
  {
    id: "reviews",
    title: "Fair-play reviews",
    helper: "Inspect suspicious runs, save review notes, and keep the leaderboard clean.",
    path: "/mavisbk/reviews",
  },
];

const isAdminSection = (value: string | undefined): value is AdminSection =>
  value === "overview" || value === "perks" || value === "events" || value === "messages" || value === "reviews";

const AdminNav = () => (
  <nav className="flex gap-2 overflow-x-auto rounded-[1.4rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-2 shadow-[0_14px_30px_rgba(53,37,205,0.05)]">
    {ADMIN_SECTIONS.map((item) => (
      <NavLink
        key={item.id}
        to={item.path}
        end={item.id === "overview"}
        className={({ isActive }) =>
          `shrink-0 rounded-full px-5 py-3 text-sm font-bold transition ${
            isActive
              ? "bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-white shadow-[0_12px_24px_rgba(53,37,205,0.18)]"
              : "text-[#5a6174] hover:bg-[#eef2ff] hover:text-[#3525cd] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          }`
        }
      >
        {item.title.replace("Admin ", "")}
      </NavLink>
    ))}
  </nav>
);

const AdminShortcut = ({ to, title, text }: { to: string; title: string; text: string }) => (
  <Link
    to={to}
    className="rounded-[1.6rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-6 shadow-[0_16px_32px_rgba(53,37,205,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(53,37,205,0.1)]"
  >
    <p className="text-xl font-bold tracking-[-0.04em] text-[#111c2d] dark:text-white">{title}</p>
    <p className="mt-2 text-sm leading-7 text-[#5a6174] dark:text-slate-400">{text}</p>
  </Link>
);

const buildAdminPlayers = (runs: LeaderboardEntry[], accounts: LeaderboardEntry[]): AdminPlayer[] => {
  const byUser = new Map<string, AdminPlayer>();

  for (const entry of [...accounts, ...runs]) {
    const current = byUser.get(entry.userId);
    const userRuns = runs.filter((run) => run.userId === entry.userId);
    const totalRuns = userRuns.length || 1;
    const totalPoints = userRuns.reduce((sum, run) => sum + run.score, 0) || entry.totalPoints || entry.score;
    const bestScore = Math.max(entry.score, current?.bestScore ?? 0, ...userRuns.map((run) => run.score));
    const latestRun = userRuns
      .map((run) => run.playedAt)
      .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? entry.playedAt;

    byUser.set(entry.userId, {
      userId: entry.userId,
      username: entry.username,
      email: entry.email,
      avatarId: entry.avatarId,
      totalRuns,
      bestScore,
      totalPoints,
      latestRun,
    });
  }

  return Array.from(byUser.values()).sort((a, b) => b.totalPoints - a.totalPoints);
};

const PanelHeader = ({
  title,
  caption,
  helper,
}: {
  title: string;
  caption: string;
  helper: string;
}) => (
  <div className="border-b border-[#ececf6] dark:border-slate-800 px-5 py-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold uppercase tracking-[0.16em] text-[#1a2340] dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-[#6c7489] dark:text-slate-400">{helper}</p>
      </div>
      <span className="shrink-0 rounded-full bg-[#eef2ff] dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-[#3525cd] dark:text-indigo-400">
        {caption}
      </span>
    </div>
  </div>
);

const AdminStatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: JSX.Element;
}) => (
  <div className="rounded-[1.35rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-5 shadow-[0_16px_32px_rgba(53,37,205,0.05)]">
    <div className="inline-flex rounded-2xl bg-[#eef2ff] dark:bg-indigo-900/30 p-2 text-[#3525cd] dark:text-indigo-400">{icon}</div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">{label}</p>
    <p className="mt-2 text-[1.8rem] font-bold text-[#1a2340] dark:text-white">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: ReviewStatus }) => (
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
      status === "flagged"
        ? "bg-rose-100 text-rose-700"
        : status === "approved"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
    }`}
  >
    {status}
  </span>
);

const InfoGrid = ({ items }: { items: Array<[string, string]> }) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="rounded-[1rem] border border-[#e4e8f5] dark:border-slate-800 bg-[#fbfbff] dark:bg-slate-950 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8395] dark:text-slate-400">{label}</div>
        <div className="mt-1 break-words text-sm font-semibold text-[#1f2740] dark:text-white">{value}</div>
      </div>
    ))}
  </div>
);

const ReviewButton = ({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "good" | "bad" | "neutral";
  onClick: () => void;
}) => {
  const className =
    tone === "good"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : tone === "bad"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        : "bg-[#eef2ff] text-[#3525cd] dark:bg-indigo-900/30 dark:text-indigo-400";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] ${className}`}
    >
      {label}
    </button>
  );
};

const EmptyPanel = ({ text }: { text: string }) => (
  <div className="m-5 rounded-[1.2rem] border border-[#e5e8f5] dark:border-slate-800 bg-[#fbfbff] dark:bg-slate-950 p-5 text-sm leading-7 text-[#5a6174] dark:text-slate-400">
    {text}
  </div>
);
