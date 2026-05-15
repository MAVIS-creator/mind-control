import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  RefreshIcon,
  TrophyIcon,
  UserIcon,
} from "../components/AppIcons";
import { useAppContext } from "../state/AppContext";
import type { LeaderboardEntry, ReviewStatus } from "../types";

export const AdminRoute = () => {
  const { session, leaderboard, updateRun, deleteRun } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (!session) return <Navigate to="/" replace />;
  if (!session.profile.isAdmin) return <Navigate to="/play" replace />;

  const selected = leaderboard.find((entry) => entry.id === selectedId) ?? null;
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
        if (b.audit.suspicionScore !== a.audit.suspicionScore) {
          return b.audit.suspicionScore - a.audit.suspicionScore;
        }
        return b.score - a.score;
      }),
    [leaderboard],
  );

  const applyReview = async (status: ReviewStatus) => {
    if (!selected) return;
    await updateRun({
      ...selected,
      audit: {
        ...selected.audit,
        reviewedStatus: status,
        reviewedNote: note,
      },
    });
  };

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="glass-panel flex flex-col gap-4 rounded-[2rem] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-white/50">Admin panel</p>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.08em] text-white">
              Run Review Desk
            </h1>
          </div>
          <Link
            to="/play"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/75"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to hub
          </Link>
        </header>

        <div className="grid gap-4 sm:grid-cols-4">
          <AdminStatCard label="Total runs" value={`${leaderboard.length}`} icon={<TrophyIcon className="h-5 w-5" />} />
          <AdminStatCard label="Flagged runs" value={`${flaggedCount}`} icon={<RefreshIcon className="h-5 w-5" />} />
          <AdminStatCard label="Pending review" value={`${pendingCount}`} icon={<RefreshIcon className="h-5 w-5" />} />
          <AdminStatCard label="Admin" value={session.profile.username} icon={<UserIcon className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/12 bg-[#20314d]/72 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-display text-lg uppercase tracking-[0.18em] text-white">Results</h2>
              <span className="text-xs uppercase tracking-[0.18em] text-white/50">Review queue</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="text-xs uppercase tracking-[0.18em] text-white/45">
                  <tr>
                    <th className="px-5 py-4">Player</th>
                    <th className="px-5 py-4">Mode</th>
                    <th className="px-5 py-4">Score</th>
                    <th className="px-5 py-4">Audit</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedRuns.map((entry) => (
                    <tr key={entry.id} className="border-t border-white/6 text-sm text-white/82">
                      <td className="px-5 py-4">
                        <div className="font-medium text-white">{entry.username}</div>
                        <div className="text-xs text-white/45">{new Date(entry.playedAt).toLocaleString("en-GB")}</div>
                      </td>
                      <td className="px-5 py-4">{entry.mode}</td>
                      <td className="px-5 py-4">{entry.score}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.14em] ${
                            entry.audit.reviewedStatus === "flagged"
                              ? "bg-rose-500/18 text-rose-100"
                              : entry.audit.reviewedStatus === "approved"
                                ? "bg-emerald-500/18 text-emerald-100"
                                : "bg-amber-300/15 text-amber-50"
                          }`}
                        >
                          {entry.audit.reviewedStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(entry.id);
                            setNote(entry.audit.reviewedNote);
                          }}
                          className="rounded-xl bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-white"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/12 bg-[#20314d]/72 p-5">
            <h2 className="font-display text-lg uppercase tracking-[0.18em] text-white">Selected run</h2>
            {selected ? (
              <div className="mt-5 space-y-4">
                <InfoRow label="Player" value={selected.username} />
                <InfoRow label="Score" value={`${selected.score}`} />
                <InfoRow label="Accuracy" value={`${selected.accuracy}`} />
                <InfoRow label="Max combo" value={`x${selected.maxCombo}`} />
                <InfoRow label="Duration" value={`${selected.duration}s`} />
                <InfoRow label="Suspicion score" value={`${selected.audit.suspicionScore}`} />
                <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Reasons</div>
                  <ul className="mt-3 space-y-2 text-sm text-white/75">
                    {selected.audit.suspicionReasons.length ? (
                      selected.audit.suspicionReasons.map((reason) => <li key={reason}>• {reason}</li>)
                    ) : (
                      <li>No flags recorded.</li>
                    )}
                  </ul>
                </div>
                <label className="block">
                  <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.18em] text-white/45">Review note</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none"
                  />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => void applyReview("approved")}
                    className="rounded-2xl bg-emerald-500/16 px-4 py-3 text-xs uppercase tracking-[0.16em] text-emerald-100"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyReview("flagged")}
                    className="rounded-2xl bg-rose-500/16 px-4 py-3 text-xs uppercase tracking-[0.16em] text-rose-100"
                  >
                    Flag
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyReview("pending")}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-xs uppercase tracking-[0.16em] text-white"
                  >
                    Reset
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRun(selected.id)}
                  className="w-full rounded-2xl bg-rose-500/16 px-4 py-3 text-xs uppercase tracking-[0.16em] text-rose-100"
                >
                  Delete run
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 p-4 text-sm text-white/65">
                Pick a run from the table to inspect flags, add notes, or moderate the result.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

const AdminStatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: JSX.Element;
}) => (
  <div className="rounded-[1.6rem] border border-white/12 bg-[#20314d]/72 p-4">
    <div className="inline-flex rounded-2xl bg-white/8 p-2 text-amber-100">{icon}</div>
    <p className="mt-4 text-[0.65rem] uppercase tracking-[0.18em] text-white/45">{label}</p>
    <p className="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-white">{value}</p>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">
    <div className="text-[0.65rem] uppercase tracking-[0.18em] text-white/45">{label}</div>
    <div className="mt-1 text-sm text-white">{value}</div>
  </div>
);
