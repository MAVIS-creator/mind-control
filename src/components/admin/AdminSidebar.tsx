import type { JSX } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  BrandMarkIcon,
  ChartBarIcon,
  ClockIcon,
  GridIcon,
  LinkIcon,
  MailIcon,
  PlayIcon,
  SparklesIcon,
  StarBadgeIcon,
  TrophyIcon,
} from "../AppIcons";
import { avatarOptions } from "../../data/avatars";
import type { Session } from "../../types";

export type AdminSection =
  | "overview"
  | "messages"
  | "ai-assistant"
  | "growth"
  | "promos"
  | "events"
  | "perks"
  | "reviews";

export const ADMIN_SECTIONS: Array<{
  id: AdminSection;
  title: string;
  helper: string;
  path: string;
  icon: (props: any) => JSX.Element;
  badge?: string;
}> = [
  {
    id: "overview",
    title: "Dashboard Overview",
    helper: "Real-time KPI metrics, active players, and system status.",
    path: "/mavisbk",
    icon: GridIcon,
  },
  {
    id: "messages",
    title: "Player Messages",
    helper: "Broadcast updates, PWA download announcements, and direct messages.",
    path: "/mavisbk/messages",
    icon: MailIcon,
  },
  {
    id: "ai-assistant",
    title: "AI Auto-Broadcast",
    helper: "Automated broadcast digests and verified feature post generator.",
    path: "/mavisbk/ai-assistant",
    icon: SparklesIcon,
    badge: "AI",
  },
  {
    id: "growth",
    title: "Growth & Retention",
    helper: "Retention intelligence, virality loops, and engagement campaigns.",
    path: "/mavisbk/growth",
    icon: ChartBarIcon,
  },
  {
    id: "promos",
    title: "Promo & Deep Links",
    helper: "Direct PWA download links, QR codes, and in-game live tickers.",
    path: "/mavisbk/promos",
    icon: LinkIcon,
  },
  {
    id: "events",
    title: "Esports Tournaments",
    helper: "Manage esports editions, bracket formats, and tournament routes.",
    path: "/mavisbk/events",
    icon: TrophyIcon,
  },
  {
    id: "perks",
    title: "Neural Testers",
    helper: "Manage beta tester roles, exclusive founder badges, and XP grants.",
    path: "/mavisbk/perks",
    icon: StarBadgeIcon,
  },
  {
    id: "reviews",
    title: "Fair-Play Audits",
    helper: "Inspect suspicious runs, verify flags, and moderate leaderboards.",
    path: "/mavisbk/reviews",
    icon: ClockIcon,
  },
];

type AdminSidebarProps = {
  session: Session;
  flaggedCount: number;
  pendingCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export const AdminSidebar = ({
  session,
  flaggedCount,
  pendingCount,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps): JSX.Element => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar Container - Flush Left Edge */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xl lg:shadow-none transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-5">
          {/* Header Brand Section */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <BrandMarkIcon className="h-9 w-9 shrink-0" />
              <div className="min-w-0">
                <h2 className="font-display text-lg font-black tracking-tight text-[#1c05b3] dark:text-white truncate">
                  MindGrid
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Command Console
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[#eff1ff] px-2.5 py-0.5 text-[10px] font-bold text-[#1c05b3] dark:bg-blue-900/40 dark:text-sky-300">
              v2.4
            </span>
          </div>

          {/* Klyvex Studios Studio Attribution Card */}
          <a
            href="https://klyvex-studios.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2.5 rounded-2xl border border-blue-200/70 bg-[#eff1ff]/70 p-2.5 transition hover:bg-blue-100/90 dark:border-blue-900/40 dark:bg-blue-950/40"
          >
            <img
              src="/klyvex_logo.png"
              alt="Klyvex Studios"
              className="h-6 w-6 rounded-full object-cover shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#1c05b3] dark:text-sky-300">
                Klyvex Studios
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                Gaming & Platform Ecosystem
              </p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="mt-5 flex-1 space-y-1.5">
            {ADMIN_SECTIONS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.id === "overview"}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-3.5 py-3 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#2406e2] to-[#1c05b3] text-white shadow-[0_8px_18px_rgba(28,5,179,0.24)] font-extrabold"
                        : "text-slate-600 hover:bg-[#eff1ff] hover:text-[#1c05b3] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge ? (
                    <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-slate-950 uppercase shrink-0">
                      {item.badge}
                    </span>
                  ) : item.id === "reviews" && (flaggedCount > 0 || pendingCount > 0) ? (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                      {flaggedCount + pendingCount}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Area: Quick Links & Admin Profile */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Link
                to="/play"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <PlayIcon className="h-3.5 w-3.5 text-[#1c05b3] dark:text-sky-400" />
                Play Game
              </Link>
              <Link
                to="/ranks"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-[11px] font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <TrophyIcon className="h-3.5 w-3.5 text-amber-500" />
                Ranks
              </Link>
            </div>

            {/* Admin User Chip */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-100 dark:border-slate-800">
              <div className="h-9 w-9 rounded-full bg-[#1c05b3] p-0.5 shrink-0">
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
                <p className="truncate text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
