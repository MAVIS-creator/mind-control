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
  const isTie = !winnerId || (myScore === opponentScore && room?.gameMode !== "coop");
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
    <div className="relative h-[100dvh] overflow-y-auto bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)]">
      <Seo title="Multiplayer Results - MindGrid" description="Post-match multiplayer score breakdown." />

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full bg-[#4f46e5]/10 blur-[100px]" />
        <div className="absolute bottom-10 right-0 h-[24rem] w-[24rem] rounded-full bg-[#862dd4]/10 blur-[100px]" />
      </div>

      <main className="mx-auto flex min-h-full max-w-4xl items-center justify-center px-4 py-6 sm:px-6 lg:py-10">
        <section className="relative w-full max-w-xl">
          <div className="glass-panel relative overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_54px_rgba(53,37,205,0.12)] sm:rounded-[2.4rem] sm:p-9">
            {/* Top Badge */}
            <div className="absolute right-0 top-0 rounded-bl-[1.4rem] rounded-tr-[2.4rem] bg-gradient-to-r from-[#4f46e5] to-[#3525cd] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md">
              {isCoop ? "CO-OP SYNC" : isWinner ? "MATCH WINNER" : isTie ? "STALEMATE" : "MATCH COMPLETE"}
            </div>

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3525cd]">Multiplayer Clash</p>
              <h1 className="mt-2 font-display text-[2.2rem] font-extrabold tracking-[-0.04em] text-[#111c2d] sm:mt-3 sm:text-[3.6rem]">
                {isCoop
                  ? "Co-Op Linked!"
                  : isWinner
                  ? "Victory Attained!"
                  : isTie
                  ? "Neural Stalemate!"
                  : "Defeat in Grid"}
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
                Mode: {room?.gameMode?.replace("_", " ") || "Neural Duel"}
              </p>
            </div>

            {/* Score Display Box */}
            <div className="mt-6 rounded-[1.6rem] border border-white/70 bg-white/50 px-5 py-6 text-center shadow-inner sm:mt-7 sm:rounded-[2rem] sm:px-6 sm:py-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7d8395]">
                {isCoop ? "Combined Team Score" : "Your Final Score"}
              </p>
              <p className="my-2 text-[3.2rem] font-black leading-none tracking-[-0.04em] text-[#3525cd] sm:text-[5rem]">
                {formatNumber(isCoop ? coopScore : myScore)}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-semibold text-[#3525cd]">
                <SparklesIcon className="h-4 w-4" />
                +{xpBonus} XP Awarded
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4">
              <ResultsTile
                icon={<GridIcon className="h-5 w-5" />}
                accent="text-[#0060ac]"
                label={isCoop ? "Team Score" : "Your Score"}
                value={formatNumber(isCoop ? coopScore : myScore)}
              />
              <ResultsTile
                icon={<TrophyIcon className="h-5 w-5" />}
                accent="text-[#6b00b7]"
                label={isCoop ? "Accuracy" : "Opponent Score"}
                value={isCoop ? `${accuracy.toFixed(0)}%` : formatNumber(opponentScore)}
              />
              <ResultsTile
                icon={<ClockIcon className="h-5 w-5" />}
                accent="text-[#0284c7]"
                label="Accuracy"
                value={`${accuracy.toFixed(0)}%`}
              />
              <ResultsTile
                icon={<SparklesIcon className="h-5 w-5" />}
                accent="text-emerald-600"
                label="Match Outcome"
                value={isCoop ? "Sync Clear" : isWinner ? "Winner" : isTie ? "Tie" : "2nd Place"}
              />
            </div>

            {/* XP Progress Card */}
            <div className="mt-5 rounded-[1.6rem] border border-white/70 bg-white/50 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <img src={avatar.image} alt="" className="h-12 w-12 rounded-full border-2 border-white bg-slate-100" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#111c2d]">{session?.profile.username}</span>
                    <span className="text-[#3525cd]">Level {progress.level} • {calculateRank(currentXp)}</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#d8e3fb]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#64a8fe] via-[#4f46e5] to-[#3525cd]"
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
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_36px_rgba(53,37,205,0.22)] transition hover:scale-[1.01]"
              >
                <PlayIcon className="h-4 w-4" />
                Play Again / Rematch
              </button>
              <button
                type="button"
                onClick={() => navigate("/multiplayer")}
                className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-[#dbdef0] bg-white/88 px-6 text-sm font-semibold uppercase tracking-[0.14em] text-[#495066] hover:bg-white"
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
  <div className="rounded-[1.4rem] border border-white/70 bg-white/60 p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <span className={accent}>{icon}</span>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7d8395]">{label}</p>
    </div>
    <p className="mt-2 text-xl font-bold tracking-[-0.04em] text-[#111c2d] sm:text-2xl">{value}</p>
  </div>
);
