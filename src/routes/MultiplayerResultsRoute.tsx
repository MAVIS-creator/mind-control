import { useLocation, useNavigate, useParams } from "react";
import { BrandMotionMark } from "../components/AppIcons";
import { Seo } from "../components/Seo";
import { useAppContext } from "../state/AppContext";

export const MultiplayerResultsRoute = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAppContext();

  const state = location.state || {};
  const { room, myScore = 0, opponentScore = 0, winnerId, accuracy = 0, coopScore = 0 } = state;

  const currentUserId = session?.profile.id || "guest-user";
  const isWinner = winnerId === currentUserId;
  const isTie = !winnerId || (myScore === opponentScore && room?.gameMode !== "coop");
  const isCoop = room?.gameMode === "coop";

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <Seo title="Multiplayer Results - MindGrid" description="Post-match multiplayer score breakdown." />

      <div className="mx-auto max-w-2xl text-center">
        <BrandMotionMark className="mx-auto mb-6 w-36 sm:w-44" />

        {/* Victory / Defeat Badge */}
        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-[#4f46e5]/10 border border-[#4f46e5]/20 px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#3525cd]">
              {isCoop ? "CO-OP SYNC" : isWinner ? "MATCH WINNER" : isTie ? "STALEMATE" : "MATCH COMPLETED"}
            </span>
          </div>

          <h1 className="font-display text-3xl font-black uppercase tracking-wider text-[#1e1b4b]">
            {isCoop
              ? "CO-OP LINK CLEARED!"
              : isWinner
              ? "VICTORY ATTAINED!"
              : isTie
              ? "NEURAL STALEMATE!"
              : "DEFEAT IN THE GRID"}
          </h1>

          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            Mode: {room?.gameMode?.replace("_", " ") || "Multiplayer Battle"}
          </p>

          {/* Scores comparison */}
          <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl bg-white/70 p-6 shadow-inner border border-white/60">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">Your Score</p>
              <p className="font-mono text-3xl font-black text-[#3525cd]">{isCoop ? coopScore : myScore}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                {isCoop ? "Accuracy" : "Opponent Score"}
              </p>
              <p className="font-mono text-3xl font-black text-[#1e1b4b]">
                {isCoop ? `${accuracy.toFixed(0)}%` : opponentScore}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate(`/multiplayer/room/${roomId}`)}
              className="rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] px-8 py-4 font-display text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105"
            >
              Play Again / Rematch
            </button>
            <button
              onClick={() => navigate("/multiplayer")}
              className="rounded-2xl bg-white/80 border border-slate-200 px-8 py-4 font-display text-xs font-bold uppercase tracking-wider text-[#1e1b4b] hover:bg-white transition-all"
            >
              Multiplayer Lobby
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
