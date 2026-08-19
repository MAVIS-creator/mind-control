import type { JSX } from "react";
import { useState } from "react";
import { formatDuration, formatNumber, formatPercent } from "../../lib/utils";
import type { LeaderboardEntry, ReviewStatus } from "../../types";
import { AdminPagination } from "./AdminPagination";

type AdminReviewsPanelProps = {
  orderedRuns: LeaderboardEntry[];
  selectedRun: LeaderboardEntry | null;
  onSelectRun: (entry: LeaderboardEntry) => void;
  note: string;
  onChangeNote: (note: string) => void;
  onApplyReview: (status: ReviewStatus) => Promise<void>;
  onDeleteRun: (id: string) => Promise<void>;
};

export const AdminReviewsPanel = ({
  orderedRuns,
  selectedRun,
  onSelectRun,
  note,
  onChangeNote,
  onApplyReview,
  onDeleteRun,
}: AdminReviewsPanelProps): JSX.Element => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const paginatedRuns = orderedRuns.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      {/* Left Column: Paginated Fair-Play Review Table */}
      <section className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Run Review Queue ({orderedRuns.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect algorithmic flags, timing anomalies, and suspicious match logs.
          </p>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/70 dark:bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Operative</th>
                <th className="px-5 py-3.5">Run</th>
                <th className="px-5 py-3.5">Flags</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRuns.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition ${
                    selectedRun?.id === entry.id ? "bg-[#eff1ff]/60 dark:bg-blue-950/30" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{entry.username}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{entry.email || "No email"}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-[#1c05b3] dark:text-sky-400">{formatNumber(entry.score)}</div>
                    <div className="text-[11px] text-slate-400">
                      {entry.gridSize} · {formatDuration(entry.duration)}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                    {entry.audit.suspicionScore}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        entry.audit.reviewedStatus === "flagged"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                          : entry.audit.reviewedStatus === "approved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                      }`}
                    >
                      {entry.audit.reviewedStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectRun(entry)}
                      className="rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#1c05b3] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <AdminPagination
          currentPage={currentPage}
          totalItems={orderedRuns.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="runs"
        />
      </section>

      {/* Right Column: Run Details & Moderation Actions */}
      <section className="rounded-[1.8rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Run Inspection & Moderation
        </h3>
        {selectedRun ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operative</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedRun.username}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</p>
                <p className="font-mono text-slate-900 dark:text-white mt-0.5 truncate">{selectedRun.email || "No email"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Score</p>
                <p className="font-bold text-[#1c05b3] dark:text-sky-400 mt-0.5">{formatNumber(selectedRun.score)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Accuracy & Combo</p>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatPercent(selectedRun.accuracy)} · x{selectedRun.maxCombo}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fair Play Reasons</div>
              <ul className="mt-2 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {selectedRun.audit.suspicionReasons.length ? (
                  selectedRun.audit.suspicionReasons.map((reason) => <li key={reason}>• {reason}</li>)
                ) : (
                  <li>No algorithmic flags detected for this run.</li>
                )}
              </ul>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Audit Note
              </label>
              <textarea
                value={note}
                onChange={(e) => onChangeNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => void onApplyReview("approved")}
                className="rounded-full bg-emerald-100 text-emerald-800 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-emerald-200 transition"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => void onApplyReview("flagged")}
                className="rounded-full bg-rose-100 text-rose-800 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-rose-200 transition"
              >
                Flag
              </button>
              <button
                type="button"
                onClick={() => void onApplyReview("pending")}
                className="rounded-full bg-amber-100 text-amber-800 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-amber-200 transition"
              >
                Pending
              </button>
            </div>

            <button
              type="button"
              onClick={() => void onDeleteRun(selectedRun.id)}
              className="w-full rounded-full border border-rose-200 bg-rose-50 py-3 text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-100 transition"
            >
              Delete Run Record
            </button>
          </div>
        ) : (
          <div className="mt-12 text-center text-xs text-slate-400">
            Select a competitive run from the queue to inspect flags and apply moderation actions.
          </div>
        )}
      </section>
    </div>
  );
};
