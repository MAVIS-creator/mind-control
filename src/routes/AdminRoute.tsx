import type { JSX } from "react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeftIcon, RefreshIcon, TrophyIcon, UserIcon } from "../components/AppIcons";
import { useAppContext } from "../state/AppContext";
import type { ReviewStatus } from "../types";

export const AdminRoute = () => {
  const { session, leaderboard, updateRun, deleteRun } = useAppContext();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  if (!session) return <Navigate to="/login" replace />;

  if (!session.profile.isAdmin) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="glass-panel rounded-[2.4rem] p-8 text-center shadow-[0_22px_48px_rgba(53,37,205,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7d8395]">Admin access</p>
            <h1 className="mt-4 font-display text-[2.8rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">
              This account cannot open the review desk.
            </h1>
            <p className="mt-4 text-[1rem] leading-8 text-[#5a6174]">
              Sign in with an admin-enabled account if you need to moderate runs or inspect fair-play flags.
            </p>
            <Link
              to="/play"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Game Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="glass-panel flex flex-col gap-4 rounded-[2.4rem] px-6 py-6 shadow-[0_22px_48px_rgba(53,37,205,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7d8395]">Admin review desk</p>
            <h1 className="mt-3 font-display text-[2.8rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">
              Review saved runs
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/play"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9deee] bg-white/86 px-5 py-3 text-sm font-semibold text-[#495066]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Hub
            </Link>
            <Link
              to="/hall-of-fame"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-5 py-3 text-sm font-semibold text-white"
            >
              <TrophyIcon className="h-4 w-4" />
              View Ranks
            </Link>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Total runs" value={`${leaderboard.length}`} icon={<TrophyIcon className="h-5 w-5" />} />
          <AdminStatCard label="Flagged" value={`${flaggedCount}`} icon={<RefreshIcon className="h-5 w-5" />} />
          <AdminStatCard label="Pending" value={`${pendingCount}`} icon={<RefreshIcon className="h-5 w-5" />} />
          <AdminStatCard label="Reviewer" value={session.profile.username} icon={<UserIcon className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="glass-panel overflow-hidden rounded-[2rem] shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
            <div className="flex items-center justify-between border-b border-[#ececf6] px-6 py-5">
              <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1a2340]">Review queue</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">Sorted by risk</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-[#f7f8ff] text-xs uppercase tracking-[0.18em] text-[#7d8395]">
                  <tr>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedRuns.map((entry) => (
                    <tr key={entry.id} className="border-t border-[#edf0f8] text-sm text-[#1f2740]">
                      <td className="px-6 py-4">
                        <div className="font-semibold">{entry.username}</div>
                        <div className="text-xs text-[#7d8395]">{new Date(entry.playedAt).toLocaleString("en-GB")}</div>
                      </td>
                      <td className="px-6 py-4 uppercase">{entry.mode}</td>
                      <td className="px-6 py-4 font-semibold text-[#3525cd]">{entry.score.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                            entry.audit.reviewedStatus === "flagged"
                              ? "bg-rose-100 text-rose-700"
                              : entry.audit.reviewedStatus === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {entry.audit.reviewedStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(entry.id);
                            setNote(entry.audit.reviewedNote);
                          }}
                          className="rounded-full border border-[#dce1f0] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#3525cd]"
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

          <section className="glass-panel rounded-[2rem] p-6 shadow-[0_16px_36px_rgba(53,37,205,0.06)]">
            <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#1a2340]">Selected run</h2>
            {selected ? (
              <div className="mt-5 space-y-4">
                <InfoRow label="Player" value={selected.username} />
                <InfoRow label="Score" value={`${selected.score.toLocaleString()}`} />
                <InfoRow label="Accuracy" value={`${selected.accuracy}%`} />
                <InfoRow label="Max combo" value={`x${selected.maxCombo}`} />
                <InfoRow label="Duration" value={`${selected.duration}s`} />
                <InfoRow label="Suspicion score" value={`${selected.audit.suspicionScore}`} />
                <div className="rounded-[1.5rem] border border-[#e5e8f5] bg-[#fbfbff] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">Reasons</div>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[#5a6174]">
                    {selected.audit.suspicionReasons.length ? (
                      selected.audit.suspicionReasons.map((reason) => <li key={reason}>• {reason}</li>)
                    ) : (
                      <li>No flags recorded.</li>
                    )}
                  </ul>
                </div>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">Review note</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={5}
                    className="w-full rounded-[1.4rem] border border-[#dfe4f2] bg-[#f8f9ff] px-4 py-3 text-sm text-[#1f2740] outline-none transition focus:border-[#c5c2ff] focus:ring-4 focus:ring-[#ebe9ff]"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => void applyReview("approved")}
                    className="rounded-full bg-emerald-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyReview("flagged")}
                    className="rounded-full bg-rose-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700"
                  >
                    Flag
                  </button>
                  <button
                    type="button"
                    onClick={() => void applyReview("pending")}
                    className="rounded-full bg-[#eef2ff] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#3525cd]"
                  >
                    Reset
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRun(selected.id)}
                  className="w-full rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700"
                >
                  Delete Run
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-[1.6rem] border border-[#e5e8f5] bg-[#fbfbff] p-5 text-sm leading-7 text-[#5a6174]">
                Pick a run from the queue to inspect flags, write notes, or moderate the result.
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
  <div className="glass-panel rounded-[1.7rem] p-5 shadow-[0_16px_32px_rgba(53,37,205,0.05)]">
    <div className="inline-flex rounded-2xl bg-[#eef2ff] p-2 text-[#3525cd]">{icon}</div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">{label}</p>
    <p className="mt-2 text-[1.9rem] font-bold tracking-[-0.04em] text-[#1a2340]">{value}</p>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.4rem] border border-[#e4e8f5] bg-[#fbfbff] px-4 py-3">
    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">{label}</div>
    <div className="mt-1 text-sm text-[#1f2740]">{value}</div>
  </div>
);
