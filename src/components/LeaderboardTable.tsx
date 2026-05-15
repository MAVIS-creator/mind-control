import { avatarOptions } from "../data/avatars";
import type { LeaderboardEntry } from "../types";
import { formatDuration, formatNumber, formatPercent } from "../lib/utils";

const avatarMap = new Map(avatarOptions.map((avatar) => [avatar.id, avatar]));

export const LeaderboardTable = ({ entries }: { entries: LeaderboardEntry[] }) => (
  <div className="glass-panel overflow-hidden rounded-[2rem]">
    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
      <h2 className="font-display text-lg uppercase tracking-[0.28em] text-white">
        Global Sync Ladder
      </h2>
      <p className="text-xs uppercase tracking-[0.28em] text-cyan/70">Classic mode</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full text-left">
        <thead className="text-xs uppercase tracking-[0.28em] text-white/45">
          <tr>
            <th className="px-5 py-4">Pilot</th>
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
                <tr key={entry.id} className="border-t border-white/6 text-sm text-white/82">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-white/45">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="h-11 w-11 rounded-2xl border border-cyan/20 bg-slate-950"
                      />
                      <div>
                        <div className="font-medium text-white">{entry.username}</div>
                        <div className="text-xs uppercase tracking-[0.24em] text-white/40">
                          {new Date(entry.playedAt).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-display tracking-[0.18em] text-cyan">
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
              <td className="px-5 py-8 text-sm text-white/60" colSpan={5}>
                No completed runs yet. Enter the grid and set the first neural benchmark.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
