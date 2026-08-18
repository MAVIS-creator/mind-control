import { Link } from "react-router-dom";
import { TrophyIcon } from "./AppIcons";
import { avatarOptions } from "../data/avatars";
import type { LeaderboardEntry } from "../types";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";

const avatarMap = new Map(avatarOptions.map((avatar) => [avatar.id, avatar]));

export const LeaderboardTable = ({
  entries,
  title = "Leaderboard",
}: {
  entries: LeaderboardEntry[];
  title?: string;
}) => (
  <div className="glass-panel overflow-hidden rounded-[2rem] dark:bg-slate-950 dark:border-slate-800">
    <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-800">
      <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-white">
        <span className="rounded-2xl bg-indigo-100 p-2 text-indigo-700">
          <TrophyIcon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Classic mode</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th className="px-5 py-4">Player</th>
            <th className="px-5 py-4">Score</th>
            <th className="px-5 py-4">Accuracy</th>
            <th className="px-5 py-4">Combo</th>
            <th className="px-5 py-4">Duration</th>
          </tr>
        </thead>
        <tbody>
          {entries.length ? (
            entries.map((entry, index) => {
              const avatar = avatarMap.get(entry.avatarId) ?? avatarOptions[0];
              return (
                <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700 dark:border-slate-800 dark:text-slate-300">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-slate-400 dark:text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div
                        className={`rounded-2xl p-[2px] transition-all duration-300 shrink-0 ${
                          entry.isAdmin
                            ? "bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 shadow-[0_0_12px_rgba(14,165,233,0.55)] dark:shadow-[0_0_16px_rgba(56,189,248,0.7)]"
                            : entry.isBetaTester
                            ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] dark:shadow-[0_0_14px_rgba(245,158,11,0.65)]"
                            : ""
                        }`}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="h-11 w-11 rounded-2xl border border-white bg-slate-100 dark:border-slate-800 dark:bg-slate-900 object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/profile/${entry.userId}`} className="font-medium text-slate-900 hover:text-indigo-700 dark:text-white dark:hover:text-indigo-400">
                            {entry.username}
                          </Link>
                          {entry.isAdmin && (
                            <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm border border-sky-300">
                              Founder Architect
                            </span>
                          )}
                          {entry.isBetaTester && !entry.isAdmin && (
                            <span className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-sm border border-amber-300">
                              Neural Tester
                            </span>
                          )}
                        </div>
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                          {new Date(entry.playedAt).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-display tracking-[0.1em] text-indigo-700 dark:text-indigo-400">
                    {formatNumber(entry.score)}
                  </td>
                  <td className="px-5 py-4">{formatPercent(entry.accuracy)}</td>
                  <td className="px-5 py-4">x{entry.maxCombo}</td>
                  <td className="px-5 py-4">{formatDuration(entry.duration)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="px-5 py-8 text-sm text-slate-500 dark:text-slate-400" colSpan={5}>
                No completed runs yet. Start a match and set the first high score.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
