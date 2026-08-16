import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { authApi } from "../lib/auth";
import { formatNumber, formatPercent, getLevelProgress, isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { PlayerSnapshot } from "../types";

export const ProfileRoute = () => {
  const { session, updateEmail } = useAppContext();
  const { userId } = useParams();
  const safeProfile = session?.profile ?? {
    id: "",
    username: "",
    email: "",
    avatarId: avatarOptions[0].id,
    xp: 0,
    rank: "Neural Rookie" as const,
    createdAt: new Date().toISOString(),
    isAdmin: false,
  };
  const targetUserId = userId ?? safeProfile.id;
  const isOwnProfile = targetUserId === safeProfile.id;
  const [email, setEmail] = useState(safeProfile.email);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<PlayerSnapshot | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const loadSnapshot = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      try {
        const nextSnapshot = await authApi.fetchPlayerSnapshot(targetUserId);
        if (!cancelled) {
          setSnapshot(nextSnapshot);
          if (isOwnProfile) {
            setEmail(nextSnapshot.profile.email);
          }
        }
      } catch (nextError) {
        if (!cancelled) {
          setProfileError(nextError instanceof Error ? nextError.message : "Unable to load player profile.");
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    };

    void loadSnapshot();
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, session, targetUserId]);

  const handleEmailUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateEmail(email);
      setMessage("Email updated. Check your inbox if verification is required.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update email.");
    } finally {
      setSaving(false);
    }
  };

  const resolvedSnapshot = snapshot ?? {
    profile: safeProfile,
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageScore: 0,
      bestScore: 0,
      bestAccuracy: 0,
      bestCombo: 0,
      totalPoints: 0,
    },
    recentRuns: [],
  };

  const avatar = avatarOptions.find((entry) => entry.id === resolvedSnapshot.profile.avatarId) ?? avatarOptions[0];
  const level = getLevelProgress(resolvedSnapshot.profile.xp);
  const [profileMode, setProfileMode] = useState<"single" | "multiplayer">("single");

  const mpWins = resolvedSnapshot.stats.multiplayerWins ?? 0;
  const mpLosses = resolvedSnapshot.stats.multiplayerLosses ?? 0;
  const mpTotal = resolvedSnapshot.stats.multiplayerTotal ?? 0;
  const mpWinRate = mpTotal ? (mpWins / mpTotal) * 100 : 0;

  const currentHighlights = useMemo(() => {
    if (profileMode === "multiplayer") {
      return [
        ["Multiplayer Wins", formatNumber(mpWins)],
        ["Multiplayer Defeats", formatNumber(mpLosses)],
        ["Multiplayer Win Rate", formatPercent(mpWinRate)],
        ["Total Battles", formatNumber(mpTotal)],
        ["Co-Op Sync Clears", formatNumber(resolvedSnapshot.stats.coopClears ?? 0)],
        ["Best Single Combo", `x${resolvedSnapshot.stats.bestCombo}`],
      ];
    }
    return [
      ["Win Rate", formatPercent(resolvedSnapshot.stats.winRate)],
      ["Games Played", formatNumber(resolvedSnapshot.stats.totalGames)],
      ["Best Score", formatNumber(resolvedSnapshot.stats.bestScore)],
      ["Average Score", formatNumber(resolvedSnapshot.stats.averageScore)],
      ["Best Accuracy", formatPercent(resolvedSnapshot.stats.bestAccuracy)],
      ["Best Combo", `x${resolvedSnapshot.stats.bestCombo}`],
    ];
  }, [mpLosses, mpTotal, mpWinRate, mpWins, profileMode, resolvedSnapshot.stats]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  return (
    <AppShell session={session} active={null}>
      <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        {loadingProfile ? (
          <div className="glass-panel flex min-h-[20rem] items-center justify-center rounded-[2rem] px-6 py-10 text-center text-[#5a6174]">
            Loading player profile...
          </div>
        ) : profileError ? (
          <div className="glass-panel rounded-[2rem] px-6 py-10 text-center text-rose-700">
            {profileError}
          </div>
        ) : (
          <>
            <section className="glass-panel rounded-[2rem] p-6 shadow-[0_14px_34px_rgba(53,37,205,0.08)] sm:p-8 lg:p-10">
              <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
                <div className="relative mx-auto w-full max-w-[220px]">
                  <div
                    className={`rounded-full p-[4px] transition-all duration-300 ${
                      resolvedSnapshot.profile.isAdmin && resolvedSnapshot.profile.isBetaTester
                        ? "bg-gradient-to-r from-sky-400 via-indigo-500 to-amber-400 shadow-[0_0_35px_rgba(14,165,233,0.45)]"
                        : resolvedSnapshot.profile.isAdmin
                        ? "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(14,165,233,0.4)]"
                        : resolvedSnapshot.profile.isBetaTester
                        ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                        : "bg-[#e2dfff]"
                    }`}
                  >
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="w-full rounded-full border-4 border-white bg-slate-100 shadow-xl"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-4xl tracking-[-0.05em] text-slate-900 sm:text-5xl">
                      {resolvedSnapshot.profile.username}
                    </h1>
                    {resolvedSnapshot.profile.isAdmin && (
                      <span className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md border border-sky-300">
                        Founder Architect
                      </span>
                    )}
                    {resolvedSnapshot.profile.isBetaTester && (
                      <span className="rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md border border-amber-300">
                        Neural Tester
                      </span>
                    )}
                    {!isOwnProfile ? (
                      <Link
                        to="/hall-of-fame"
                        className="rounded-full border border-[#d7dcf5] bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#3525cd]"
                      >
                        Back to Ranks
                      </Link>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[1.45rem] text-[#464555]">{resolvedSnapshot.profile.rank}</p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3525cd]">
                        XP Level
                      </span>
                      <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Lvl {level.level} • {resolvedSnapshot.profile.xp} XP
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-[#d8e3fb] p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#3525cd] to-[#64a8fe]"
                        style={{ width: `${Math.max(8, level.progress)}%` }}
                      />
                    </div>
                    <p className="text-base text-[#464555]">
                      Progress to Level {level.level + 1} ({level.nextLevelXp} XP).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mode Selector Pill Switch */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex rounded-full bg-white/80 p-1.5 shadow-sm border border-slate-200">
                <button
                  type="button"
                  onClick={() => setProfileMode("single")}
                  className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    profileMode === "single"
                      ? "bg-[#3525cd] text-white shadow-md"
                      : "text-[#64748b] hover:text-[#1e1b4b]"
                  }`}
                >
                  Single Player Stats
                </button>
                <button
                  type="button"
                  onClick={() => setProfileMode("multiplayer")}
                  className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                    profileMode === "multiplayer"
                      ? "bg-[#3525cd] text-white shadow-md"
                      : "text-[#64748b] hover:text-[#1e1b4b]"
                  }`}
                >
                  Multiplayer Clash Stats
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {currentHighlights.map(([title, value]) => (
                <div key={title} className="glass-panel rounded-[1.6rem] p-5 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
                  <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">{title}</div>
                  <div className="mt-3 text-lg font-semibold text-slate-900">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="glass-panel rounded-[1.8rem] p-6 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
                <h2 className="text-lg font-semibold text-slate-900">
                  {profileMode === "multiplayer" ? "Multiplayer Clash Overview" : "Single Player Overview"}
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {(profileMode === "multiplayer"
                    ? [
                        ["Multiplayer Wins", formatNumber(mpWins)],
                        ["Multiplayer Defeats", formatNumber(mpLosses)],
                        ["Total Battles", formatNumber(mpTotal)],
                        ["Co-Op Sync Clears", formatNumber(resolvedSnapshot.stats.coopClears ?? 0)],
                      ]
                    : [
                        ["Wins", formatNumber(resolvedSnapshot.stats.wins)],
                        ["Losses", formatNumber(resolvedSnapshot.stats.losses)],
                        ["Total Points", formatNumber(resolvedSnapshot.stats.totalPoints)],
                        ["Joined", new Date(resolvedSnapshot.profile.createdAt).toLocaleDateString("en-GB")],
                      ]
                  ).map(([title, value]) => (
                    <div key={title} className="rounded-[1.3rem] border border-[#e0e6f4] bg-white/68 px-4 py-4">
                      <div className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-500">{title}</div>
                      <div className="mt-2 text-base font-semibold text-slate-900">{value}</div>
                    </div>
                  ))}
                </div>
              </section>

              {isOwnProfile ? (
                <section className="glass-panel rounded-[1.8rem] p-6 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
                  <h2 className="text-lg font-semibold text-slate-900">Account Email</h2>
                  <p className="mt-2 text-sm leading-7 text-[#5a6174]">
                    Change the email attached to your account anytime here.
                  </p>

                  <form className="mt-5 flex flex-col gap-4" onSubmit={handleEmailUpdate}>
                    <label className="block flex-1">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">
                        Email
                      </span>
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-14 w-full rounded-[1.2rem] border border-[#dfe4f2] bg-[#f8f9ff] px-4 text-sm text-[#1f2740] outline-none transition focus:border-[#c5c2ff] focus:ring-4 focus:ring-[#ebe9ff]"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={saving}
                      className="h-14 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(53,37,205,0.2)] disabled:opacity-60"
                    >
                      {saving ? "Saving..." : "Update Email"}
                    </button>
                  </form>

                  {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
                  {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
                </section>
              ) : (
                <section className="glass-panel rounded-[1.8rem] p-6 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Form</h2>
                  <div className="mt-5 space-y-3">
                    {resolvedSnapshot.recentRuns.slice(0, 4).map((run) => (
                      <div key={run.id} className="rounded-[1.3rem] border border-[#e0e6f4] bg-white/68 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-900">
                            {run.gridSize} • {run.matchType === "numbers" ? "Numbers" : run.matchType === "icons" ? "Icons" : "Legacy"}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                              run.won ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {run.won ? "Win" : "Loss"}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-[#5a6174]">
                          Score {formatNumber(run.score)} • Accuracy {formatPercent(run.accuracy)} • Combo x{run.maxCombo}
                        </div>
                      </div>
                    ))}
                    {!resolvedSnapshot.recentRuns.length ? (
                      <p className="text-sm text-[#5a6174]">No public runs recorded yet.</p>
                    ) : null}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
};
