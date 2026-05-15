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
  <div className="glass-panel overflow-hidden rounded-[2rem]">
    <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
      <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
        <span className="rounded-2xl bg-indigo-100 p-2 text-indigo-700">
          <TrophyIcon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Classic mode</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500">
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
                <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="h-11 w-11 rounded-2xl border border-white bg-slate-100"
                      />
                      <div>
                        <div className="font-medium text-slate-900">{entry.username}</div>
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          {new Date(entry.playedAt).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-display tracking-[0.1em] text-indigo-700">
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
              <td className="px-5 py-8 text-sm text-slate-500" colSpan={5}>
                No completed runs yet. Start a match and set the first high score.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
