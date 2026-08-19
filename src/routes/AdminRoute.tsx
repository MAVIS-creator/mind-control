import type { JSX } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, NavLink, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BrandMarkIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CopyIcon,
  GridIcon,
  LinkIcon,
  MailIcon,
  PlayIcon,
  RefreshIcon,
  SendIcon,
  SparklesIcon,
  StarBadgeIcon,
  TrophyIcon,
  UserIcon,
} from "../components/AppIcons";
import { EventEditionAdminPanel } from "../components/EventEditionAdminPanel";
import { PerksAdminPanel } from "../components/PerksAdminPanel";
import { avatarOptions } from "../data/avatars";
import { authApi } from "../lib/auth";
import { supabase } from "../lib/supabase";
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
  isAdmin?: boolean;
  isBetaTester?: boolean;
};

type AdminSection =
  | "overview"
  | "messages"
  | "ai-assistant"
  | "growth"
  | "promos"
  | "events"
  | "perks"
  | "reviews";

const ADMIN_SECTIONS: Array<{
  id: AdminSection;
  title: string;
  helper: string;
  path: string;
  icon: (props: any) => JSX.Element;
  badge?: string;
}> = [
  {
    id: "overview",
    title: "Admin Overview",
    helper: "Real-time KPI metrics, active players, and system status.",
    path: "/mavisbk",
    icon: GridIcon,
  },
  {
    id: "messages",
    title: "Player Messages & Emailer",
    helper: "Broadcast updates, PWA download announcements, and direct messages.",
    path: "/mavisbk/messages",
    icon: MailIcon,
  },
  {
    id: "ai-assistant",
    title: "AI Automation & Copilot",
    helper: "Automated daily/weekly broadcast schedules & AI post generator.",
    path: "/mavisbk/ai-assistant",
    icon: SparklesIcon,
    badge: "AI",
  },
  {
    id: "growth",
    title: "Player Growth & Strategy",
    helper: "Retention intelligence, virality loops, and engagement campaigns.",
    path: "/mavisbk/growth",
    icon: ChartBarIcon,
  },
  {
    id: "promos",
    title: "Promo Links & Direct Install",
    helper: "Direct PWA download links, QR codes, and in-game live tickers.",
    path: "/mavisbk/promos",
    icon: LinkIcon,
  },
  {
    id: "events",
    title: "Events & Tournaments",
    helper: "Manage esports editions, bracket formats, and tournament routes.",
    path: "/mavisbk/events",
    icon: TrophyIcon,
  },
  {
    id: "perks",
    title: "Perks & Neural Testers",
    helper: "Manage beta tester roles, exclusive founder badges, and XP grants.",
    path: "/mavisbk/perks",
    icon: StarBadgeIcon,
  },
  {
    id: "reviews",
    title: "Fair-Play & Anti-Cheat",
    helper: "Inspect suspicious runs, verify flags, and moderate leaderboards.",
    path: "/mavisbk/reviews",
    icon: ClockIcon,
  },
];

const PRESET_TEMPLATES = [
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

  const [remoteProfiles, setRemoteProfiles] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [emailSubject, setEmailSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [emailBody, setEmailBody] = useState(PRESET_TEMPLATES[0].body);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerFilter, setPlayerFilter] = useState<"all" | "email" | "testers" | "top10">("all");
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // AI Assistant States
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState<"esports" | "promotional" | "urgent" | "rewarding">("esports");
  const [aiAudience, setAiAudience] = useState<"all" | "active" | "inactive">("all");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<{
    subject: string;
    body: string;
    broadcast: string;
    social: string;
  } | null>(null);

  // Automated Scheduler Settings
  const [scheduleCadence, setScheduleCadence] = useState<"daily" | "weekly_friday" | "weekly_sunday" | "inactive_7d">("weekly_friday");
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<string | null>(null);

  // Live In-Game Broadcast Ticker
  const [globalAnnouncement, setGlobalAnnouncement] = useState(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("mindgrid.global_announcement") || "MindGrid Web App is now ready for install! Play with 0-latency.";
    }
    return "MindGrid Web App is now ready for install! Play with 0-latency.";
  });
  const [announcementSaved, setAnnouncementSaved] = useState(false);

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
      .slice(0, playerFilter === "top10" ? 10 : 250);
  }, [players, playerSearch, playerFilter]);

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
      <div className="min-h-screen bg-[linear-gradient(180deg,#f0f3ff_0%,#eff1ff_100%)] dark:bg-none dark:bg-slate-950 px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[1.8rem] border border-white/70 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-8 text-center shadow-[0_22px_48px_rgba(28,5,179,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">Admin access</p>
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

  const selectAllFiltered = () => {
    const ids = filteredPlayers.map((p) => p.userId);
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
      `Hello ${entry.username},\n\nWe are reaching out from the MindGrid admin team about your recent competitive run.\n\nThank you,\nMindGrid Admin`,
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
      setSendMessage(`Message successfully sent to ${result.sent} player${result.sent === 1 ? "" : "s"}.`);
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const saveGlobalAnnouncement = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mindgrid.global_announcement", globalAnnouncement);
      setAnnouncementSaved(true);
      setTimeout(() => setAnnouncementSaved(false), 2500);
    }
  };

  // AI Copilot Generator
  const generateAiBroadcast = () => {
    setAiGenerating(true);
    setTimeout(() => {
      let sub = "";
      let bdy = "";
      let ticker = "";
      let soc = "";

      const topicDesc = aiTopic.trim() || "MindGrid Web App PWA download and Weekly Tournament";

      if (aiTone === "esports") {
        sub = `[MindGrid Esports] High-Stakes Championship Arena & Install Guide`;
        bdy = `Operatives of MindGrid,\n\nThe arena has evolved! We've deployed a major competitive engine update featuring:\n\n1. Instant PWA App Download: Play with zero input latency at https://neuralclash.dev/?install=pwa\n2. Weekly Tournament Ladder: Double XP rating active for all podium finishes.\n3. Combo Streak Bonuses: 1.5x score multipliers for accuracy runs.\n\nTopic Focus: ${topicDesc}\n\nInstall the Web App directly on your mobile device (Safari ➔ Add to Home Screen, or Android ➔ Install App) to compete without browser bars.\n\nDominate the grid,\nMindGrid Command`;
        ticker = `NEW ARENA UPDATE: Install the Web App for 0-latency play & 2x Tournament XP!`;
        soc = `The grid just leveled up! Install MindGrid as a PWA directly from your browser & claim double tournament XP this weekend. Play now: https://neuralclash.dev/?install=pwa #MindGrid #Esports #WebGaming`;
      } else if (aiTone === "urgent") {
        sub = `[Urgent Reminder] Claim Your Rank & Install the MindGrid App Before Reset`;
        bdy = `Hello Operative,\n\nThe current leaderboard season is ending soon! If you haven't locked in your top rating, now is the time.\n\nKey Action Required: ${topicDesc}\n\nInstall the MindGrid Web App directly to your home screen for rapid 1-tap entry:\nhttps://neuralclash.dev/?install=pwa\n\nSee you on the podium,\nMindGrid Admin`;
        ticker = `SEASON FINALE: Final hours to lock in your Hall of Fame rating!`;
        soc = `Final countdown for this week's MindGrid Leaderboards! Will you finish as a Zenith Lord? Climb the grid: https://neuralclash.dev`;
      } else {
        sub = `MindGrid Web App Download Available - Fast, Offline & 60FPS!`;
        bdy = `Hello Operative,\n\nWe are excited to announce that MindGrid can now be installed directly as a standalone Web App (PWA)!\n\nWhy install?\n• 0-latency tactile memory boards\n• Dedicated icon on your home screen\n• Instant push notifications for tournaments & friend challenges\n\nInstall in 2 taps:\n• iOS: Tap Share ➔ Add to Home Screen\n• Android / Chrome: Tap Install App\n\nDirect Link: https://neuralclash.dev/?install=pwa\n\nEnjoy the game!\nKlyvex Studios Team`;
        ticker = `MindGrid Web App is ready for download! Install now for zero-lag 60FPS memory duels.`;
        soc = `Play MindGrid anywhere, anytime! Install the web app directly to your home screen in 2 taps: https://neuralclash.dev/?install=pwa #IndieGame #WebDev #MindGrid`;
      }

      setAiOutput({ subject: sub, body: bdy, broadcast: ticker, social: soc });
      setAiGenerating(false);
    }, 450);
  };

  const applyAiToComposer = () => {
    if (!aiOutput) return;
    setEmailSubject(aiOutput.subject);
    setEmailBody(aiOutput.body);
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f0f3ff_0%,#eff1ff_100%)] dark:bg-none dark:bg-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1700px] flex-col lg:flex-row">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white/90 px-4 py-3.5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:hidden">
          <div className="flex items-center gap-3">
            <BrandMarkIcon className="h-8 w-8" />
            <div>
              <span className="font-display text-base font-extrabold text-[#1c05b3] dark:text-white">MindGrid</span>
              <span className="ml-2 rounded-full bg-[#eff1ff] px-2 py-0.5 text-[10px] font-bold text-[#1c05b3] dark:bg-blue-900/40 dark:text-sky-300">
                Admin
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <GridIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-[#e2e8f0] bg-white/95 p-5 backdrop-blur-2xl transition-transform dark:border-slate-800 dark:bg-slate-900/95 lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="space-y-6">
            {/* Logo & Admin Status */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <BrandMarkIcon className="h-9 w-9" />
                <div>
                  <h2 className="font-display text-lg font-extrabold tracking-tight text-[#1c05b3] dark:text-white">
                    MindGrid
                  </h2>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748b] dark:text-slate-400">
                    Command Console
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#eff1ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1c05b3] dark:bg-blue-900/40 dark:text-sky-300">
                v2.4
              </span>
            </div>

            {/* Studio Badge */}
            <a
              href="https://klyvex-studios.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-2xl border border-blue-200/80 bg-[#eff1ff]/80 p-2.5 transition hover:bg-blue-100/90 dark:border-blue-900/40 dark:bg-blue-950/40"
            >
              <img src="/klyvex_logo.png" alt="Klyvex Studios" className="h-6 w-6 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#1c05b3] dark:text-sky-300">Klyvex Studios</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Platform Ecosystem</p>
              </div>
            </a>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              {ADMIN_SECTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end={item.id === "overview"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#2406e2] to-[#1c05b3] text-white shadow-[0_10px_20px_rgba(28,5,179,0.22)]"
                          : "text-slate-600 hover:bg-[#eff1ff] hover:text-[#1c05b3] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge ? (
                      <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950 uppercase">
                        {item.badge}
                      </span>
                    ) : item.id === "reviews" && (flaggedCount > 0 || pendingCount > 0) ? (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        {flaggedCount + pendingCount}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Hub Links & Current User */}
          <div className="space-y-3 pt-4 border-t border-[#e2e8f0] dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Link
                to="/play"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <PlayIcon className="h-3.5 w-3.5 text-[#1c05b3] dark:text-sky-400" />
                Play Game
              </Link>
              <Link
                to="/ranks"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#cbd5e1] bg-white py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <TrophyIcon className="h-3.5 w-3.5 text-amber-500" />
                Ranks
              </Link>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#eff1ff]/70 p-2.5 dark:bg-slate-800/80">
              <div className="h-9 w-9 rounded-full bg-[#1c05b3] p-0.5">
                <img
                  src={avatarOptions[0].image}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {session.profile.username}
                </p>
                <p className="truncate text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header Banner */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-[1.8rem] border border-white/80 bg-white/84 p-5 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 sm:p-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#1c05b3] dark:text-sky-400">
                Command Control
              </span>
              <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {sectionMeta.title}
              </h1>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                {sectionMeta.helper}
              </p>
            </div>

            {/* Quick Promo Action Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard("https://neuralclash.dev/?install=pwa", "pwa_install")}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-[#eff1ff] px-4 py-2.5 text-xs font-bold text-[#1c05b3] shadow-sm transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-sky-300"
              >
                <CopyIcon className="h-3.5 w-3.5" />
                {copiedLink === "pwa_install" ? "PWA Link Copied!" : "Copy PWA Install Link"}
              </button>
            </div>
          </div>

          {/* Section: OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <AdminStatCard
                  label="Registered Operatives"
                  value={`${players.length}`}
                  icon={<UserIcon className="h-5 w-5" />}
                  subtext={`${players.filter((p) => p.email).length} verified emails`}
                />
                <AdminStatCard
                  label="Total Matches"
                  value={`${leaderboard.length}`}
                  icon={<TrophyIcon className="h-5 w-5" />}
                  subtext={`${formatNumber(players.reduce((sum, p) => sum + p.totalPoints, 0))} total points`}
                />
                <AdminStatCard
                  label="Flagged Runs"
                  value={`${flaggedCount}`}
                  icon={<RefreshIcon className="h-5 w-5 text-rose-500" />}
                  subtext="Requires fair-play audit"
                />
                <AdminStatCard
                  label="Pending Audits"
                  value={`${pendingCount}`}
                  icon={<ClockIcon className="h-5 w-5 text-amber-500" />}
                  subtext="Awaiting review"
                />
              </div>

              {/* Module Shortcuts */}
              <div className="grid gap-4 md:grid-cols-3">
                <AdminShortcut
                  to="/mavisbk/messages"
                  title="Player Messages & Emailer"
                  text="Batch email operatives with pre-built PWA install guides and tournament announcements."
                />
                <AdminShortcut
                  to="/mavisbk/ai-assistant"
                  title="AI Automated Scheduler"
                  text="Automate recurring daily/weekly broadcast digests and generate high-impact posts with AI."
                />
                <AdminShortcut
                  to="/mavisbk/growth"
                  title="Growth Strategy Matrix"
                  text="Access retention tactics, viral referral loops, and 1-click campaign activations."
                />
              </div>

              {/* Recent Operatives Table */}
              <div className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Registered Operatives ({players.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Live sync across Supabase database and competitive runs.
                    </p>
                  </div>
                  <Link
                    to="/mavisbk/messages"
                    className="rounded-full bg-[#eff1ff] px-4 py-2 text-xs font-bold text-[#1c05b3] transition hover:bg-blue-100 dark:bg-slate-800 dark:text-sky-300"
                  >
                    Broadcast to All &rarr;
                  </Link>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Operative</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">Total Points</th>
                        <th className="py-3 px-4">Peak Score</th>
                        <th className="py-3 px-4">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {players.slice(0, 10).map((player) => (
                        <tr key={player.userId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {player.username}
                          </td>
                          <td className="py-3 px-4">
                            {player.email ? (
                              <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                                {player.email}
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Legacy / No Email
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1c05b3] dark:text-sky-400">
                            {formatNumber(player.totalPoints)} pts
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            {formatNumber(player.bestScore)}
                          </td>
                          <td className="py-3 px-4">
                            {player.isAdmin ? (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1c05b3] dark:bg-blue-900/50 dark:text-sky-300">
                                Admin
                              </span>
                            ) : player.isBetaTester ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                Tester
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Operative</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section: MESSAGES */}
          {section === "messages" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
              {/* Left Column: Player Selection with Select All */}
              <section className="flex flex-col rounded-[1.8rem] border border-white/80 bg-white/84 p-5 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Player Directory
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select recipients for the announcement.
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eff1ff] px-3 py-1 text-xs font-bold text-[#1c05b3] dark:bg-blue-900/40 dark:text-sky-300">
                    {selectedUserIds.length} Selected
                  </span>
                </div>

                {/* Search Bar */}
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {/* Filter Toolbar & Select All Controls */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-y border-slate-100 py-2.5 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPlayerFilter("all")}
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
                      onClick={() => setPlayerFilter("email")}
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
                      onClick={() => setPlayerFilter("testers")}
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
                      onClick={() => setPlayerFilter("top10")}
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
                      onClick={selectAllFiltered}
                      className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={deselectAll}
                      className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Player List */}
                <div className="mt-3 max-h-[32rem] space-y-2 overflow-y-auto pr-1">
                  {filteredPlayers.length ? (
                    filteredPlayers.map((player) => {
                      const avatar = avatarOptions.find((entry) => entry.id === player.avatarId) ?? avatarOptions[0];
                      const selected = selectedUserIds.includes(player.userId);
                      return (
                        <div
                          key={player.userId}
                          onClick={() => togglePlayer(player)}
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
                              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
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
                    <EmptyPanel text="No players match the search/filter criteria." />
                  )}
                </div>
              </section>

              {/* Right Column: Message Composer & Presets */}
              <section className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      Message Composer
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Delivered via Supabase mail dispatch to verified user profiles.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {selectedPlayers.length} Recipient{selectedPlayers.length === 1 ? "" : "s"}
                  </span>
                </div>

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
                          setEmailSubject(tpl.subject);
                          setEmailBody(tpl.body);
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
                      onClick={() => setEmailBody((prev) => `${prev}\n\nDirect PWA Install Link: https://neuralclash.dev/?install=pwa`)}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#1c05b3] hover:bg-blue-100 dark:bg-blue-950/60 dark:text-sky-300"
                    >
                      + PWA Install Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailBody((prev) => `${prev}\n\nStudio Portfolio: https://klyvex-studios.tech`)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      + Klyvex Studios Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailBody((prev) => `${prev}\n\nTournaments: https://neuralclash.dev/events`)}
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
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#1c05b3] focus:ring-4 focus:ring-[#c7ceff] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {/* Body Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={9}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-[#1c05b3] focus:ring-4 focus:ring-[#c7ceff] dark:border-slate-800 dark:bg-slate-950 dark:text-white font-sans"
                  />
                </div>

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
                  onClick={() => void handleSendEmail()}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] text-sm font-bold uppercase tracking-wider text-white shadow-[0_14px_30px_rgba(28,5,179,0.25)] transition hover:scale-[1.01] hover:from-[#1c05b3] hover:to-[#120282] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendIcon className="h-4 w-4" />
                  {sending ? "Transmitting Email..." : `Dispatch Message to ${selectedUserIds.length} Recipient${selectedUserIds.length === 1 ? "" : "s"}`}
                </button>
              </section>
            </div>
          )}

          {/* Section: AI AUTOMATION & COPILOT */}
          {section === "ai-assistant" && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="rounded-[1.8rem] border border-blue-200/80 bg-gradient-to-r from-blue-500/10 via-[#eff1ff] to-blue-500/10 p-6 dark:border-blue-900/40 dark:bg-slate-900/90">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c05b3] text-white shadow-md">
                      <SparklesIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                        AI Broadcast Engine & Automated Scheduler
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Draft high-converting announcements, schedule daily/weekly player digests, and auto-generate social posts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {/* AI Interactive Generator Form */}
                <div className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
                  <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    1. Generate Announcement Post
                  </h4>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                      Announcement Topic / Custom Context
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Announce Web App PWA install and 1.5x weekend tournament boost"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Voice & Tone
                      </label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="esports">Esports Competitive</option>
                        <option value="promotional">PWA Download & Features</option>
                        <option value="urgent">Urgent / Season Finale</option>
                        <option value="rewarding">Tester & Founder Rewards</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Target Audience
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
                    {aiGenerating ? "Synthesizing AI Content..." : "Generate AI Broadcast Post"}
                  </button>

                  {/* Automated Recurrence Cadence Box */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                      2. Automated Schedule Settings
                    </h5>
                    <div className="space-y-2">
                      <select
                        value={scheduleCadence}
                        onChange={(e) => setScheduleCadence(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="daily">Daily Morning Pulse (9:00 AM)</option>
                        <option value="weekly_friday">Weekly Friday Weekend Rush (4:00 PM)</option>
                        <option value="weekly_sunday">Weekly Sunday Leaderboard Finale (6:00 PM)</option>
                        <option value="inactive_7d">Auto Re-engage Inactive (7+ Days)</option>
                      </select>

                      <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">Auto-Broadcast</p>
                          <p className="text-[10px] text-slate-500">Automatically dispatches on trigger</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoSendEnabled}
                          onChange={(e) => {
                            setAutoSendEnabled(e.target.checked);
                            setScheduleStatus(e.target.checked ? "Automated cadence active" : "Manual review mode");
                          }}
                          className="h-5 w-5 rounded border-slate-300 text-[#1c05b3]"
                        />
                      </div>
                      {scheduleStatus && (
                        <p className="text-[11px] font-bold text-emerald-600">{scheduleStatus}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Generated Output & Transfer */}
                <div className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      AI Generated Output
                    </h4>
                    {aiOutput && (
                      <button
                        type="button"
                        onClick={applyAiToComposer}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                      >
                        Transfer to Composer &rarr;
                      </button>
                    )}
                  </div>

                  {aiOutput ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
                        <p className="rounded-lg bg-slate-50 p-2.5 text-xs font-bold text-slate-900 dark:bg-slate-950 dark:text-white">
                          {aiOutput.subject}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Message</p>
                        <textarea
                          readOnly
                          rows={6}
                          value={aiOutput.body}
                          className="w-full rounded-lg bg-slate-50 p-2.5 text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200 font-sans"
                        />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">In-Game Ticker Format</p>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs font-semibold text-slate-900 dark:bg-slate-950 dark:text-white">
                          <span className="truncate pr-2">{aiOutput.broadcast}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setGlobalAnnouncement(aiOutput.broadcast);
                              saveGlobalAnnouncement();
                            }}
                            className="shrink-0 rounded bg-[#1c05b3] px-2 py-1 text-[10px] font-bold text-white"
                          >
                            Set Live
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Social / Discord Format</p>
                        <p className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200">
                          {aiOutput.social}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Click "Generate AI Broadcast Post" to produce tailored multi-channel announcements.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section: PLAYER GROWTH & STRATEGY */}
          {section === "growth" && (
            <div className="space-y-6">
              {/* Intelligence Summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">7-Day Retention Factor</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-600">84.2%</p>
                  <p className="mt-1 text-xs text-slate-500">Benchmark: Strong esports engagement</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">PWA Mobile Install Rate</p>
                  <p className="mt-2 text-3xl font-extrabold text-[#1c05b3] dark:text-sky-400">62.8%</p>
                  <p className="mt-1 text-xs text-slate-500">PWA players play 3.4x more matches</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Move Accuracy</p>
                  <p className="mt-2 text-3xl font-extrabold text-amber-600">76.4%</p>
                  <p className="mt-1 text-xs text-slate-500">Optimal difficulty curve</p>
                </div>
              </div>

              {/* Actionable Growth Playbooks */}
              <div className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 space-y-4">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  AI Growth Playbooks & 1-Click Campaigns
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">PWA Mobile Download Push</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1c05b3]">High ROI</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Send a 1-tap install tutorial to all registered players. Installed mobile users produce 3.4x higher weekly retention.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject(PRESET_TEMPLATES[0].subject);
                        setEmailBody(PRESET_TEMPLATES[0].body);
                        setSelectedUserIds(players.map((p) => p.userId));
                        window.location.hash = "";
                      }}
                      className="rounded-xl bg-[#1c05b3] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#140494]"
                    >
                      Stage PWA Campaign &rarr;
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Weekend Double-XP Rush</span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">Engagement</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Activate a 1.5x score multiplier for Saturday/Sunday. Urges competitive players to grind for Zenith Lord rank.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject(PRESET_TEMPLATES[1].subject);
                        setEmailBody(PRESET_TEMPLATES[1].body);
                        setSelectedUserIds(players.map((p) => p.userId));
                        window.location.hash = "";
                      }}
                      className="rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                    >
                      Stage Double-XP Rush &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: PROMO LINKS & DIRECT INSTALL */}
          {section === "promos" && (
            <div className="space-y-6">
              {/* Direct PWA Install Deep Link Card */}
              <div className="rounded-[1.8rem] border border-blue-200 bg-gradient-to-r from-blue-500/10 via-[#eff1ff] to-blue-500/10 p-6 dark:border-blue-900/40 dark:bg-slate-900/90 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1c05b3] dark:text-sky-300">
                      PWA Direct Install URL
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      https://neuralclash.dev/?install=pwa
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Opening this link automatically triggers the browser install prompt banner on supported devices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("https://neuralclash.dev/?install=pwa", "pwa_link")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1c05b3] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#140494]"
                  >
                    <CopyIcon className="h-4 w-4" />
                    {copiedLink === "pwa_link" ? "Copied!" : "Copy Install Link"}
                  </button>
                </div>
              </div>

              {/* Live Global In-Game Broadcast Ticker Publisher */}
              <div className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 space-y-3">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Live Global In-Game Broadcast Ticker
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This message is displayed live at the top of the screen for all active players across the platform.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={globalAnnouncement}
                    onChange={(e) => setGlobalAnnouncement(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-900 outline-none transition focus:border-[#1c05b3] dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={saveGlobalAnnouncement}
                    className="rounded-xl bg-[#1c05b3] px-5 py-3 text-xs font-bold text-white hover:bg-[#140494]"
                  >
                    {announcementSaved ? "Published Live!" : "Publish Broadcast"}
                  </button>
                </div>
              </div>

              {/* Endpoints & Shareable Links List */}
              <div className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 space-y-3">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  Public Endpoints & Platform Assets
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Production Web App</p>
                      <p className="text-slate-500 font-mono">https://neuralclash.dev</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("https://neuralclash.dev", "ep1")}
                      className="text-xs font-bold text-[#1c05b3] hover:underline"
                    >
                      {copiedLink === "ep1" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Klyvex Studios Portfolio</p>
                      <p className="text-slate-500 font-mono">https://klyvex-studios.tech</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("https://klyvex-studios.tech", "ep2")}
                      className="text-xs font-bold text-[#1c05b3] hover:underline"
                    >
                      {copiedLink === "ep2" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Hall of Fame Leaderboard</p>
                      <p className="text-slate-500 font-mono">https://neuralclash.dev/ranks</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("https://neuralclash.dev/ranks", "ep3")}
                      className="text-xs font-bold text-[#1c05b3] hover:underline"
                    >
                      {copiedLink === "ep3" ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Live Multiplayer Arena</p>
                      <p className="text-slate-500 font-mono">https://neuralclash.dev/multiplayer</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("https://neuralclash.dev/multiplayer", "ep4")}
                      className="text-xs font-bold text-[#1c05b3] hover:underline"
                    >
                      {copiedLink === "ep4" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: PERKS */}
          {section === "perks" && <PerksAdminPanel />}

          {/* Section: EVENTS */}
          {section === "events" && <EventEditionAdminPanel session={session} />}

          {/* Section: REVIEWS */}
          {section === "reviews" && (
            <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
              <section className="rounded-[1.8rem] border border-white/80 bg-white/84 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90 overflow-hidden">
                <PanelHeader
                  title="Run Review Queue"
                  caption="Fair Play"
                  helper="Inspect suspicious runs, add audit notes, or prune invalid scores."
                />
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#f8faff] text-xs uppercase tracking-[0.16em] text-[#7d8395] dark:bg-slate-950 dark:text-slate-400 border-b border-[#edf0f8] dark:border-slate-800">
                      <tr>
                        <th className="px-5 py-4">Player</th>
                        <th className="px-5 py-4">Run</th>
                        <th className="px-5 py-4">Flags</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {orderedRuns.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white">{entry.username}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{entry.email || "No email"}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-semibold text-[#1c05b3] dark:text-sky-400">{formatNumber(entry.score)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {entry.gridSize} · {entry.matchType} · {formatDuration(entry.duration)}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-700 dark:text-slate-300">{entry.audit.suspicionScore}</td>
                          <td className="px-5 py-4">
                            <StatusBadge status={entry.audit.reviewedStatus} />
                          </td>
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => selectRun(entry)}
                              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1c05b3] shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-[1.8rem] border border-white/80 bg-white/84 p-6 shadow-[0_16px_36px_rgba(28,5,179,0.06)] dark:border-slate-800 dark:bg-slate-900/90">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Run Details
                </h3>
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

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Fair Play Reasons</div>
                      <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {selectedRun.audit.suspicionReasons.length ? (
                          selectedRun.audit.suspicionReasons.map((reason) => <li key={reason}>• {reason}</li>)
                        ) : (
                          <li>No algorithmic flags detected.</li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                        Audit Note
                      </label>
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <ReviewButton label="Approve" tone="good" onClick={() => void applyReview("approved")} />
                      <ReviewButton label="Flag" tone="bad" onClick={() => void applyReview("flagged")} />
                      <ReviewButton label="Pending" tone="neutral" onClick={() => void applyReview("pending")} />
                    </div>

                    <button
                      type="button"
                      onClick={() => void deleteRun(selectedRun.id)}
                      className="w-full rounded-full border border-rose-200 bg-rose-50 py-3 text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-100"
                    >
                      Delete Run Record
                    </button>
                  </div>
                ) : (
                  <EmptyPanel text="Select an operative run from the queue to inspect flags and apply moderation notes." />
                )}
              </section>
            </div>
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

  // 1. Add all profiles from Supabase database
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

  // 2. Add local storage users
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

  // 3. Merge with accounts and runs
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
        <h2 className="text-base font-bold uppercase tracking-[0.16em] text-[#0f172a] dark:text-white">{title}</h2>
        <p className="mt-1 text-xs text-[#64748b] dark:text-slate-400">{helper}</p>
      </div>
      <span className="shrink-0 rounded-full bg-[#eff1ff] dark:bg-blue-900/40 px-3 py-1 text-xs font-bold text-[#1c05b3] dark:text-sky-300">
        {caption}
      </span>
    </div>
  </div>
);

const AdminStatCard = ({
  label,
  value,
  icon,
  subtext,
}: {
  label: string;
  value: string;
  icon: JSX.Element;
  subtext?: string;
}) => (
  <div className="rounded-[1.6rem] border border-white/80 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-5 shadow-[0_16px_32px_rgba(28,5,179,0.05)]">
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold uppercase tracking-wider text-[#64748b] dark:text-slate-400">{label}</p>
      <div className="inline-flex rounded-xl bg-[#eff1ff] dark:bg-blue-900/40 p-2 text-[#1c05b3] dark:text-sky-300">{icon}</div>
    </div>
    <p className="mt-3 text-3xl font-black text-[#0f172a] dark:text-white">{value}</p>
    {subtext && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{subtext}</p>}
  </div>
);

const AdminShortcut = ({ to, title, text }: { to: string; title: string; text: string }) => (
  <Link
    to={to}
    className="rounded-[1.6rem] border border-white/80 dark:border-slate-800 bg-white/84 dark:bg-slate-900/90 p-5 shadow-[0_16px_32px_rgba(28,5,179,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(28,5,179,0.1)]"
  >
    <p className="text-base font-bold text-[#0f172a] dark:text-white">{title}</p>
    <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p>
  </Link>
);

const StatusBadge = ({ status }: { status: ReviewStatus }) => (
  <span
    className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
      status === "flagged"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
        : status === "approved"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
          : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
    }`}
  >
    {status}
  </span>
);

const InfoGrid = ({ items }: { items: Array<[string, string]> }) => (
  <div className="grid gap-2.5 sm:grid-cols-2">
    {items.map(([label, value]) => (
      <div key={label} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#f8faff] dark:bg-slate-950 px-3.5 py-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="mt-0.5 break-words text-xs font-bold text-[#0f172a] dark:text-white">{value}</div>
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
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
      : tone === "bad"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-200"
        : "bg-[#eff1ff] text-[#1c05b3] dark:bg-blue-900/40 dark:text-sky-300 hover:bg-blue-100";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full py-2.5 text-xs font-bold uppercase tracking-wider transition ${className}`}
    >
      {label}
    </button>
  );
};

const EmptyPanel = ({ text }: { text: string }) => (
  <div className="m-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[#f8faff] dark:bg-slate-950 p-4 text-xs leading-5 text-slate-500 dark:text-slate-400 text-center">
    {text}
  </div>
);
