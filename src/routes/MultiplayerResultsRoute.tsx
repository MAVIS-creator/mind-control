import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ClockIcon,
  GridIcon,
  PlayIcon,
  SparklesIcon,
  TrophyIcon,
} from "../components/AppIcons";
import { Seo } from "../components/Seo";
import { avatarOptions } from "../data/avatars";
import { saveSession } from "../lib/auth";
import { updateRoomConfig } from "../lib/multiplayer";
import { supabase } from "../lib/supabase";
import { calculateRank, formatDuration, formatNumber, formatPercent, getLevelProgress } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

type MultiplayerResultsState = {
  room?: any;
  myScore?: number;
  opponentScore?: number;
  winnerId?: string | null;
  accuracy?: number;
  coopScore?: number;
  duration?: number;
  myMatches?: number;
  opponentMatches?: number;
  totalPairs?: number;
};

export const MultiplayerResultsRoute = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setSession } = useAppContext();

  const state = (location.state || {}) as MultiplayerResultsState;
  const { room, myScore = 0, opponentScore = 0, winnerId, accuracy = 0, coopScore = 0, duration = 0 } = state;

  const currentUserId = session?.profile.id || "guest-user";
  const isWinner = winnerId === currentUserId;
  const isSpeedRace = room?.gameMode === "speed_sprint";
  const isTie = !isSpeedRace && (!winnerId || (myScore === opponentScore && room?.gameMode !== "coop"));
  const isCoop = room?.gameMode === "coop";

  const xpBonus = isWinner ? 375 : isCoop ? 450 : 150;
  const [xpSaved, setXpSaved] = useState(false);

  useEffect(() => {
    if (session && !xpSaved) {
      setXpSaved(true);
      const newXp = (session.profile.xp || 0) + xpBonus;
      const newRank = calculateRank(newXp);
      const updatedProfile = { ...session.profile, xp: newXp, rank: newRank };
      const nextSession = { ...session, profile: updatedProfile };
      setSession(nextSession);
      saveSession(nextSession);
      if (supabase) {
        supabase.from("profiles").update({ xp: newXp, rank: newRank }).eq("id", session.profile.id);
      }
    }
  }, [session, xpSaved, xpBonus, setSession]);

  const avatar = session
    ? avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0]
    : avatarOptions[0];

  const currentXp = session?.profile.xp ?? 0;
  const progress = getLevelProgress(currentXp);

  return (
    <div className="relative h-[100dvh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#e0e4ff_0%,_#f8faff_42%,_#dbeafe_100%)] dark:bg-none dark:bg-slate-950 dark:text-slate-100">
      <Seo title="Multiplayer Results - MindGrid" description="Post-match multiplayer score breakdown." />

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[#2406e2]/12 dark:bg-[#2406e2]/5 blur-[100px]" />
        <div className="absolute bottom-10 right-0 h-[24rem] w-[24rem] rounded-full bg-[#1c05b3]/10 dark:bg-[#1c05b3]/5 blur-[100px]" />
      </div>

      <main className="mx-auto flex min-h-full max-w-4xl items-center justify-center px-4 py-6 sm:px-6 lg:py-10">
        <section className="relative w-full max-w-xl">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_54px_rgba(28, 5, 179,0.12)] sm:rounded-[2.4rem] sm:p-9 dark:border-slate-800 dark:bg-slate-900/90">
            {/* Top Badge */}
            <div className="absolute right-0 top-0 rounded-bl-[1.4rem] rounded-tr-[2.4rem] bg-gradient-to-r from-[#1c05b3] to-[#140494] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md">
              {isCoop ? "CO-OP SYNC" : isWinner ? "MATCH WINNER" : isTie ? "STALEMATE" : "MATCH COMPLETE"}
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#1c05b3] dark:text-[#2406e2]">
                {isSpeedRace ? "Speed Race Results" : "Multiplayer Clash"}
              </p>
              <h1 className="mt-2 font-display text-[2.2rem] font-extrabold tracking-[-0.04em] text-[#0f172a] dark:text-white sm:mt-3 sm:text-[3.6rem]">
                {isCoop
                  ? "Co-Op Linked!"
                  : isSpeedRace
                  ? isWinner
                    ? "Speed Race Victory!"
                    : "Speed Race Defeat"
                  : isWinner
                  ? "Victory Attained!"
                  : isTie
                  ? "Neural Stalemate!"
                  : "Defeat in Grid"}
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#64748b] dark:text-slate-400">
                {isSpeedRace
                  ? isWinner
                    ? "You opened all pairs first!"
                    : "Opponent opened all pairs first!"
                  : `Mode: ${room?.gameMode?.replace("_", " ") || "Neural Duel"}`}
              </p>
            </div>

            {/* Score Display Box */}
            <div className="mt-6 rounded-[1.6rem] border border-white/70 bg-white/50 px-5 py-6 text-center shadow-inner sm:mt-7 sm:rounded-[2rem] sm:px-6 sm:py-7 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#64748b] dark:text-slate-400">
                {isCoop ? "Combined Team Score" : "Your Final Score"}
              </p>
              <p className="my-2 text-[3.2rem] font-black leading-none tracking-[-0.04em] text-[#140494] dark:text-[#2406e2] sm:text-[5rem]">
                {formatNumber(isCoop ? coopScore : myScore)}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#e0e4ff] px-4 py-2 text-sm font-semibold text-[#120282] dark:bg-slate-800 dark:text-[#c7ceff]">
                <SparklesIcon className="h-4 w-4" />
                +{xpBonus} XP Awarded
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
              {isSpeedRace ? (
                <>
                  <ResultsTile
                    icon={<GridIcon className="h-5 w-5" />}
                    accent="text-[#120282]"
                    label="Your Pairs Cleared"
                    value={`${state.myMatches ?? (isWinner ? (state.totalPairs || 8) : 0)}/${state.totalPairs || 8}`}
                  />
                  <ResultsTile
                    icon={<TrophyIcon className="h-5 w-5" />}
                    accent="text-[#1c05b3]"
                    label="Opponent Pairs"
                    value={`${state.opponentMatches ?? (isWinner ? 0 : (state.totalPairs || 8))}/${state.totalPairs || 8}`}
                  />
                  <ResultsTile
                    icon={<ClockIcon className="h-5 w-5" />}
                    accent="text-[#120282]"
                    label="Accuracy"
                    value={`${accuracy.toFixed(0)}%`}
                  />
                  <ResultsTile
                    icon={<SparklesIcon className="h-5 w-5" />}
                    accent="text-emerald-600"
                    label="Race Outcome"
                    value={isWinner ? "1st Place (Winner)" : "2nd Place"}
                  />
                </>
              ) : (
                <>
                  <ResultsTile
                    icon={<GridIcon className="h-5 w-5" />}
                    accent="text-[#120282]"
                    label={isCoop ? "Team Score" : "Your Score"}
                    value={formatNumber(isCoop ? coopScore : myScore)}
                  />
                  <ResultsTile
                    icon={<TrophyIcon className="h-5 w-5" />}
                    accent="text-[#1c05b3]"
                    label={isCoop ? "Accuracy" : "Opponent Score"}
                    value={isCoop ? `${accuracy.toFixed(0)}%` : formatNumber(opponentScore)}
                  />
                  <ResultsTile
                    icon={<ClockIcon className="h-5 w-5" />}
                    accent="text-[#120282]"
                    label="Accuracy"
                    value={`${accuracy.toFixed(0)}%`}
                  />
                  <ResultsTile
                    icon={<SparklesIcon className="h-5 w-5" />}
                    accent="text-emerald-600"
                    label="Match Outcome"
                    value={isCoop ? "Sync Clear" : isWinner ? "Winner" : isTie ? "Tie" : "2nd Place"}
                  />
                </>
              )}
            </div>

            {/* XP Progress Card */}
            <div className="mt-5 rounded-[1.6rem] border border-white/70 bg-white/50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <img src={avatar.image} alt="" className="h-12 w-12 rounded-full border-2 border-white bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#0f172a] dark:text-white">{session?.profile.username}</span>
                    <span className="text-[#120282] dark:text-[#2406e2]">Level {progress.level} • {calculateRank(currentXp)}</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#e0e4ff]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2406e2] via-[#1c05b3] to-[#140494]"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={async () => {
                  const targetRoomId = room?.id || roomId;
                  if (targetRoomId) {
                    await updateRoomConfig(targetRoomId, {
                      status: "waiting",
                      hostReady: false,
                      guestReady: false,
                      winner_id: null,
                      seed: Math.floor(Math.random() * 1000000),
                      createdAt: new Date().toISOString(),
                    });
                    navigate(`/multiplayer/room/${targetRoomId}`);
                  } else {
                    navigate("/multiplayer");
                  }
                }}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#1c05b3] to-[#140494] px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(28, 5, 179,0.22)] transition hover:scale-[1.01]"
              >
                <PlayIcon className="h-4 w-4" />
                Play Again / Rematch
              </button>
              <button
                type="button"
                onClick={() => navigate("/multiplayer")}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-white/88 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#475569] hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Multiplayer Lobby
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const ResultsTile = ({
  icon,
  accent,
  label,
  value,
}: {
  icon: ReactNode;
  accent: string;
  label: string;
  value: string;
}) => (
  <div className="rounded-[1.4rem] border border-white/70 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
    <div className="flex items-center gap-2">
      <span className={accent}>{icon}</span>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">{label}</p>
    </div>
    <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-[#111c2d] dark:text-white sm:text-2xl">{value}</p>
  </div>
);
