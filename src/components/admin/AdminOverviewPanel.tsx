import type { JSX } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChartBarIcon,
  ClockIcon,
  MailIcon,
  RefreshIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
} from "../AppIcons";
import { avatarOptions } from "../../data/avatars";
import { authApi } from "../../lib/auth";
import { formatNumber } from "../../lib/utils";
import type { Session } from "../../types";
import { AdminPagination } from "./AdminPagination";

export type AdminPlayer = {
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

type AdminOverviewPanelProps = {
  session: Session;
  players: AdminPlayer[];
  totalRunsCount: number;
  flaggedCount: number;
  pendingCount: number;
};

export const AdminOverviewPanel = ({
  session,
  players,
  totalRunsCount,
  flaggedCount,
  pendingCount,
}: AdminOverviewPanelProps): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const paginatedPlayers = players.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const totalPointsAcc = players.reduce((sum, p) => sum + p.totalPoints, 0);
  const verifiedEmailsCount = players.filter((p) => p.email).length;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner (Matching Image 2 Style) */}
      <div className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-r from-[#1c05b3] via-[#2406e2] to-[#140494] p-6 sm:p-8 text-white shadow-[0_16px_36px_rgba(28,5,179,0.2)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Platform Overview</span>
            </div>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {session.profile.username}!
            </h2>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-white/80 leading-relaxed">
              Here is what is happening across the MindGrid competitive ecosystem and neural matrix today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold backdrop-blur-md">
              All Systems Operational
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Operatives</p>
            <div className="rounded-xl bg-[#eff1ff] dark:bg-blue-900/40 p-2 text-[#1c05b3] dark:text-sky-300">
              <UserIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-black text-slate-900 dark:text-white">
            {players.length}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {verifiedEmailsCount} verified profile emails
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Matches</p>
            <div className="rounded-xl bg-[#eff1ff] dark:bg-blue-900/40 p-2 text-[#1c05b3] dark:text-sky-300">
              <TrophyIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-black text-slate-900 dark:text-white">
            {totalRunsCount}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-[#1c05b3] dark:text-sky-400">
            {formatNumber(totalPointsAcc)} total points earned
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Flagged Runs</p>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-600 dark:text-rose-400">
              <RefreshIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-black text-slate-900 dark:text-white">
            {flaggedCount}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {flaggedCount > 0 ? "Requires anti-cheat audit" : "Zero active flags"}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Audits</p>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2 text-amber-600 dark:text-amber-400">
              <ClockIcon className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-3xl font-black text-slate-900 dark:text-white">
            {pendingCount}
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            {pendingCount > 0 ? "Awaiting admin decision" : "Queue up to date"}
          </p>
        </div>
      </div>

      {/* Quick Action Navigation Shortcuts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/mavisbk/messages"
          className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#eff1ff] dark:bg-blue-900/40 p-2 text-[#1c05b3] dark:text-sky-300">
              <MailIcon className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Player Messages & Emailer</h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Batch message operatives with PWA install guides and tournament announcements.
          </p>
        </Link>

        <Link
          to="/mavisbk/ai-assistant"
          className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2 text-amber-600 dark:text-amber-400">
              <SparklesIcon className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Auto-Broadcast</h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Automate weekly streak reminders and generate truthful feature announcements.
          </p>
        </Link>

        <Link
          to="/mavisbk/growth"
          className="rounded-[1.6rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-400">
              <ChartBarIcon className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Growth & Retention</h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Access retention intelligence, viral referral loops, and 1-click campaign activations.
          </p>
        </Link>
      </div>

      {/* Paginated Registered Operatives Table */}
      <div className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Registered Operatives ({players.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized directly with Supabase profiles and competitive gameplay runs.
            </p>
          </div>
          <Link
            to="/mavisbk/messages"
            className="rounded-full bg-[#eff1ff] px-4 py-2 text-xs font-bold text-[#1c05b3] transition hover:bg-blue-100 dark:bg-blue-950/60 dark:text-sky-300"
          >
            Broadcast to All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950">
              <tr>
                <th className="py-3.5 px-5">Operative</th>
                <th className="py-3.5 px-5">Email Address</th>
                <th className="py-3.5 px-5">Total Points</th>
                <th className="py-3.5 px-5">Peak Score</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedPlayers.map((player) => {
                const avatar = avatarOptions.find((a) => a.id === player.avatarId) ?? avatarOptions[0];
                return (
                  <tr key={player.userId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatar.image}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {player.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      {player.email ? (
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                          {player.email}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          Legacy Account
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-[#1c05b3] dark:text-sky-400">
                      {formatNumber(player.totalPoints)} pts
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700 dark:text-slate-300">
                      {formatNumber(player.bestScore)}
                    </td>
                    <td className="py-3.5 px-5">
                      {player.isAdmin ? (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-[#1c05b3] dark:bg-blue-900/50 dark:text-sky-300">
                          Admin
                        </span>
                      ) : player.isBetaTester ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                          Tester
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Operative</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
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
                        className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                      >
                        Reset Pass
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={players.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="operatives"
        />
      </div>
    </div>
  );
};
