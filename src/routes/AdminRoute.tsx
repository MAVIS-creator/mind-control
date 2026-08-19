import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "../components/AppIcons";
import { EventEditionAdminPanel } from "../components/EventEditionAdminPanel";
import { PerksAdminPanel } from "../components/PerksAdminPanel";
import { AdminAiAssistantPanel } from "../components/admin/AdminAiAssistantPanel";
import { AdminGrowthPanel } from "../components/admin/AdminGrowthPanel";
import { AdminMessagesPanel, PRESET_TEMPLATES } from "../components/admin/AdminMessagesPanel";
import { AdminOverviewPanel, type AdminPlayer } from "../components/admin/AdminOverviewPanel";
import { AdminPromosPanel } from "../components/admin/AdminPromosPanel";
import { AdminReviewsPanel } from "../components/admin/AdminReviewsPanel";
import {
  ADMIN_SECTIONS,
  AdminSidebar,
  type AdminSection,
} from "../components/admin/AdminSidebar";
import { AdminTopBar } from "../components/admin/AdminTopBar";
import { supabase } from "../lib/supabase";
import { isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { LeaderboardEntry, ReviewStatus } from "../types";

export const AdminRoute = (): JSX.Element => {
  const { adminSection } = useParams();
  const {
    session,
    leaderboard,
    accountLeaderboard,
    updateRun,
    deleteRun,
    sendAdminEmail,
  } = useAppContext();

  const [remoteProfiles, setRemoteProfiles] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [emailSubject, setEmailSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [emailBody, setEmailBody] = useState(PRESET_TEMPLATES[0].body);
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Fetch real registered profiles from Supabase database
  const fetchProfiles = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        setRemoteProfiles(data);
      }
    } catch (err) {
      console.warn("Failed to fetch profiles for admin:", err);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const players = useMemo(
    () => buildAdminPlayers(leaderboard, accountLeaderboard, remoteProfiles),
    [accountLeaderboard, leaderboard, remoteProfiles],
  );

  const selectedRun = leaderboard.find((entry) => entry.id === selectedRunId) ?? null;

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

  const section: AdminSection = isAdminSection(adminSection) ? adminSection : "overview";
  const sectionMeta = ADMIN_SECTIONS.find((item) => item.id === section) ?? ADMIN_SECTIONS[0];

  if (!session) return <Navigate to="/login" replace />;

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  if (!session.profile.isAdmin) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f0f3ff_0%,#eff1ff_100%)] dark:bg-none dark:bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[1.8rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-8 text-center shadow-[0_22px_48px_rgba(28,5,179,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">Admin Access</p>
            <h1 className="mt-4 font-display text-[2.4rem] font-extrabold text-[#0f172a] dark:text-white">
              This account cannot open the admin panel.
            </h1>
            <p className="mt-4 text-[1rem] leading-8 text-[#5a6174] dark:text-slate-400">
              Sign in with an admin-enabled account to access operations.
            </p>
            <Link
              to="/play"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-md"
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
    setSelectedUserIds((current) =>
      current.includes(player.userId)
        ? current.filter((id) => id !== player.userId)
        : [...current, player.userId],
    );
  };

  const selectAll = (ids: string[]) => {
    setSelectedUserIds((current) => Array.from(new Set([...current, ...ids])));
  };

  const deselectAll = () => {
    setSelectedUserIds([]);
  };

  const selectRun = (entry: LeaderboardEntry) => {
    setSelectedRunId(entry.id);
    setNote(entry.audit.reviewedNote);
    setSelectedUserIds([entry.userId]);
    setEmailSubject(`MindGrid account update for ${entry.username}`);
    setEmailBody(
      `Hello ${entry.username},\n\nWe are reaching out from the MindGrid admin team regarding your recent match activity.\n\nThank you,\nMindGrid Admin`,
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
      setSendMessage(`Message successfully transmitted to ${result.sent} player${result.sent === 1 ? "" : "s"}.`);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Unable to transmit email message.");
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* 1. Flush Left Sidebar */}
      <AdminSidebar
        session={session}
        flaggedCount={flaggedCount}
        pendingCount={pendingCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area Offset by Sidebar */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
        {/* Top Header Bar */}
        <AdminTopBar
          title={sectionMeta.title}
          helper={sectionMeta.helper}
          onOpenMobile={() => setMobileMenuOpen(true)}
          copiedLink={copiedLink}
          onCopyInstallLink={() => copyToClipboard("https://neuralclash.dev/?install=pwa", "pwa_install")}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full">
          {section === "overview" && (
            <AdminOverviewPanel
              session={session}
              players={players}
              totalRunsCount={leaderboard.length}
              flaggedCount={flaggedCount}
              pendingCount={pendingCount}
            />
          )}

          {section === "messages" && (
            <AdminMessagesPanel
              players={players}
              selectedUserIds={selectedUserIds}
              onTogglePlayer={togglePlayer}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              emailSubject={emailSubject}
              onChangeSubject={setEmailSubject}
              emailBody={emailBody}
              onChangeBody={setEmailBody}
              sending={sending}
              sendMessage={sendMessage}
              sendError={sendError}
              onSendEmail={handleSendEmail}
            />
          )}

          {section === "ai-assistant" && (
            <AdminAiAssistantPanel
              onTransferToComposer={(subject, body) => {
                setEmailSubject(subject);
                setEmailBody(body);
                window.location.hash = "";
              }}
              onSetLiveGlobalTicker={(ticker) => {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem("mindgrid.global_announcement", ticker);
                  alert("Live global in-game ticker updated!");
                }
              }}
            />
          )}

          {section === "growth" && (
            <AdminGrowthPanel
              onStagePwaCampaign={() => {
                setEmailSubject(PRESET_TEMPLATES[0].subject);
                setEmailBody(PRESET_TEMPLATES[0].body);
                setSelectedUserIds(players.map((p) => p.userId));
              }}
              onStageDoubleXpCampaign={() => {
                setEmailSubject(PRESET_TEMPLATES[1].subject);
                setEmailBody(PRESET_TEMPLATES[1].body);
                setSelectedUserIds(players.map((p) => p.userId));
              }}
              onStageMultiplayerCampaign={() => {
                setEmailSubject("Challenge Your Friends to a 1v1 Memory Duel on MindGrid!");
                setEmailBody(`Hello Operative,\n\nDid you know you can challenge your friends in real-time 1v1 memory duels?\n\nCreate a private room with a custom room code or duel online operatives at https://neuralclash.dev/multiplayer\n\nBest regards,\nMindGrid Esports Team`);
                setSelectedUserIds(players.map((p) => p.userId));
              }}
            />
          )}

          {section === "promos" && (
            <AdminPromosPanel
              copiedLink={copiedLink}
              onCopyLink={copyToClipboard}
            />
          )}

          {section === "events" && <EventEditionAdminPanel session={session} />}

          {section === "perks" && <PerksAdminPanel />}

          {section === "reviews" && (
            <AdminReviewsPanel
              orderedRuns={orderedRuns}
              selectedRun={selectedRun}
              onSelectRun={selectRun}
              note={note}
              onChangeNote={setNote}
              onApplyReview={applyReview}
              onDeleteRun={deleteRun}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const isAdminSection = (value: string | undefined): value is AdminSection =>
  value === "overview" ||
  value === "messages" ||
  value === "ai-assistant" ||
  value === "growth" ||
  value === "promos" ||
  value === "events" ||
  value === "perks" ||
  value === "reviews";

const buildAdminPlayers = (
  runs: LeaderboardEntry[],
  accounts: LeaderboardEntry[],
  profiles: any[] = [],
): AdminPlayer[] => {
  const byUser = new Map<string, AdminPlayer>();

  // 1. Map registered profiles from Supabase database
  for (const p of profiles) {
    const userRuns = runs.filter((run) => run.userId === p.id);
    const totalRuns = userRuns.length;
    const totalPoints = userRuns.reduce((sum, run) => sum + run.score, 0) || p.xp || 0;
    const bestScore = userRuns.reduce((max, run) => Math.max(max, run.score), 0);
    const latestRun = userRuns
      .map((run) => run.playedAt)
      .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? p.created_at;

    byUser.set(p.id, {
      userId: p.id,
      username: p.username || "Operative",
      email: p.email || "",
      avatarId: p.avatar_id || "quantum-ray",
      totalRuns,
      bestScore,
      totalPoints,
      latestRun,
      isAdmin: Boolean(p.is_admin),
      isBetaTester: Boolean(p.is_beta_tester),
    });
  }

  // 2. Map local storage saved users
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("mindgrid.users");
      if (raw) {
        const localUsers = JSON.parse(raw);
        for (const u of localUsers) {
          const prof = u.profile || u;
          if (prof?.id && !byUser.has(prof.id)) {
            const userRuns = runs.filter((run) => run.userId === prof.id);
            const totalRuns = userRuns.length;
            const totalPoints = userRuns.reduce((sum, run) => sum + run.score, 0) || prof.xp || 0;
            const bestScore = userRuns.reduce((max, run) => Math.max(max, run.score), 0);
            const latestRun = userRuns
              .map((run) => run.playedAt)
              .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? prof.createdAt;

            byUser.set(prof.id, {
              userId: prof.id,
              username: prof.username || "Operative",
              email: prof.email || "",
              avatarId: prof.avatarId || "quantum-ray",
              totalRuns,
              bestScore,
              totalPoints,
              latestRun,
              isAdmin: Boolean(prof.isAdmin),
              isBetaTester: Boolean(prof.isBetaTester),
            });
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Merge with accounts and run entries
  for (const entry of [...accounts, ...runs]) {
    const existing = byUser.get(entry.userId);
    const userRuns = runs.filter((run) => run.userId === entry.userId);
    const totalRuns = userRuns.length || existing?.totalRuns || 1;
    const totalPoints = userRuns.reduce((sum, run) => sum + run.score, 0) || entry.totalPoints || entry.score || existing?.totalPoints || 0;
    const bestScore = Math.max(entry.score, existing?.bestScore ?? 0, ...userRuns.map((run) => run.score));
    const latestRun = userRuns
      .map((run) => run.playedAt)
      .sort((a, b) => +new Date(b) - +new Date(a))[0] ?? entry.playedAt ?? existing?.latestRun;

    byUser.set(entry.userId, {
      userId: entry.userId,
      username: entry.username || existing?.username || "Operative",
      email: existing?.email || entry.email || "",
      avatarId: entry.avatarId || existing?.avatarId || "quantum-ray",
      totalRuns,
      bestScore,
      totalPoints,
      latestRun,
      isAdmin: entry.isAdmin || existing?.isAdmin || false,
      isBetaTester: entry.isBetaTester || existing?.isBetaTester || false,
    });
  }

  return Array.from(byUser.values()).sort((a, b) => b.totalPoints - a.totalPoints);
};
