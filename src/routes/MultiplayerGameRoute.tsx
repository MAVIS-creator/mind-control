import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { useMultiplayerGame, type QuickMessage } from "../game/useMultiplayerGame";
import { fetchRoomDetails, updateRoomConfig } from "../lib/multiplayer";
import { useAppContext } from "../state/AppContext";
import type { CardNode, MultiplayerRoom } from "../types";

export const MultiplayerGameRoute = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { session } = useAppContext();

  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [loading, setLoading] = useState(true);

  const profile = session?.profile || {
    id: "guest-user",
    username: "Neural Agent",
    email: "",
    avatarId: "cyber_grid",
    xp: 150,
    rank: "Neural Rookie",
    createdAt: new Date().toISOString(),
    isAdmin: false,
  };

  useEffect(() => {
    if (!roomId) return;
    let mounted = true;

    fetchRoomDetails(roomId).then((details) => {
      if (mounted) {
        setRoom(details);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [roomId]);

  if (loading || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff]">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-[#3525cd]">
          Synchronizing Multiplayer Board...
        </p>
      </div>
    );
  }

  return <LiveMultiplayerCanvas room={room} userId={profile.id} profile={profile} navigate={navigate} />;
};

const LiveMultiplayerCanvas = ({
  room,
  userId,
  profile,
  navigate,
}: {
  room: MultiplayerRoom;
  userId: string;
  profile: any;
  navigate: any;
}) => {
  const {
    gameState,
    handleCardClick,
    isHost,
    opponentProfile,
    isMyTurn,
    playerScores,
    opponentGhost,
    coopSharedScore,
    coopCombinedCombo,
    activeMessages,
    sendQuickMessage,
  } = useMultiplayerGame(room, userId, profile);

  const [gameFinished, setGameFinished] = useState(false);

  const totalPairs = gameState.board.cards.length / 2;
  const isFinished = gameState.matches === totalPairs || gameState.status === "won" || gameState.status === "lost";

  useEffect(() => {
    if (isFinished && !gameFinished) {
      setGameFinished(true);

      // Determine winner
      let winnerId: string | null = null;
      if (room.gameMode === "turn_based") {
        const hostScore = playerScores[room.hostId] || 0;
        const guestScore = room.guestId ? playerScores[room.guestId] || 0 : 0;
        if (hostScore > guestScore) winnerId = room.hostId;
        else if (guestScore > hostScore) winnerId = room.guestId;
      } else if (room.gameMode === "speed_sprint") {
        if (gameState.status === "won" && !opponentGhost.finished) {
          winnerId = userId;
        } else if (opponentGhost.finished && gameState.status !== "won") {
          winnerId = isHost ? room.guestId : room.hostId;
        } else {
          winnerId = gameState.score > opponentGhost.score ? userId : (isHost ? room.guestId : room.hostId);
        }
      } else {
        winnerId = room.hostId; // Co-op win
      }

      if (isHost) {
        updateRoomConfig(room.id, {
          status: "finished",
          scores: playerScores,
        });
      }

      setTimeout(() => {
        navigate(`/multiplayer/results/${room.id}`, {
          state: {
            room,
            myScore: gameState.score,
            opponentScore: room.gameMode === "speed_sprint" ? opponentGhost.score : (isHost ? playerScores[room.guestId || ""] || 0 : playerScores[room.hostId] || 0),
            winnerId,
            accuracy: gameState.moves > 0 ? (gameState.matches / gameState.moves) * 100 : 0,
            coopScore: coopSharedScore,
          },
        });
      }, 1500);
    }
  }, [isFinished, gameFinished, room, playerScores, gameState, opponentGhost, isHost, userId, coopSharedScore, navigate]);

  const gridColsClass =
    gameState.board.columns === 6
      ? "grid-cols-6"
      : gameState.board.columns === 5
      ? "grid-cols-5"
      : "grid-cols-4";

  const quickMessagesList: QuickMessage[] = [
    "Nice move!",
    "Good game!",
    "Watch this!",
    "Close one!",
    "Your turn!",
    "Well played!",
  ];

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4 py-6">
      <Seo title="Live Multiplayer Battle - MindGrid" description="Realtime multiplayer memory game." />

      {/* Floating Quick Messages Overlay */}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex flex-col items-center gap-2">
        {activeMessages.map((msg) => (
          <div
            key={msg.id}
            className="animate-bounce rounded-2xl bg-white/95 border border-[#3525cd]/20 px-5 py-2.5 text-xs font-bold text-[#1e1b4b] shadow-xl backdrop-blur-md"
          >
            <span className="text-[#3525cd] mr-1">{msg.senderName}:</span> "{msg.message}"
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Top Header / HUD */}
        <div className="glass-panel mb-6 rounded-3xl p-4 sm:p-6 shadow-xl">
          {/* Mode 1: 1v1 Turn-Based Neural Duel HUD */}
          {room.gameMode === "turn_based" && (
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${isMyTurn ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                  <span className={`font-display text-sm font-black uppercase tracking-wider ${isMyTurn ? "text-emerald-600" : "text-[#64748b]"}`}>
                    {isMyTurn ? "YOUR TURN TO MOVE" : `${(opponentProfile?.username || "OPPONENT").toUpperCase()}'S TURN`}
                  </span>
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                  Combo: <span className="font-mono text-base text-[#3525cd]">x{gameState.combo + 1}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-4">
                <div className={`rounded-2xl p-3 text-center transition-all ${isMyTurn ? "bg-emerald-500/10 border border-emerald-500/30 shadow-sm" : "bg-white/60"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">You ({profile.username})</p>
                  <p className="font-mono text-xl font-black text-[#1e1b4b]">{playerScores[userId] || 0} pts</p>
                </div>
                <div className={`rounded-2xl p-3 text-center transition-all ${!isMyTurn ? "bg-indigo-500/10 border border-indigo-500/30 shadow-sm" : "bg-white/60"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">{opponentProfile?.username || "Opponent"}</p>
                  <p className="font-mono text-xl font-black text-[#1e1b4b]">
                    {playerScores[isHost ? room.guestId || "" : room.hostId] || 0} pts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Speed Sprint HUD */}
          {room.gameMode === "speed_sprint" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-display text-xs font-black uppercase tracking-wider text-[#0284c7]">
                  SIMULTANEOUS SPEED RACE
                </span>
                <span className="font-mono text-xs font-bold text-[#64748b]">
                  Timer: {gameState.timerRemaining}s
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#1e1b4b] mb-1">
                    <span>You ({gameState.matches}/{totalPairs} pairs)</span>
                    <span>Score: {gameState.score}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#0284c7] to-[#06b6d4] transition-all duration-300"
                      style={{ width: `${(gameState.matches / totalPairs) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-[#64748b] mb-1">
                    <span>{opponentProfile?.username || "Opponent Ghost"} ({opponentGhost.matches}/{totalPairs} pairs)</span>
                    <span>Score: {opponentGhost.score}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 opacity-70"
                      style={{ width: `${(opponentGhost.matches / totalPairs) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mode 3: Co-op Grid Sync HUD */}
          {room.gameMode === "coop" && (
            <div className="text-center">
              <span className="font-display text-xs font-black uppercase tracking-wider text-[#7c3aed]">
                CO-OP NEURAL LINK
              </span>
              <div className="mt-2 flex justify-center items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Combined Score</p>
                  <p className="font-mono text-2xl font-black text-[#1e1b4b]">{coopSharedScore + gameState.score}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Combo Streak</p>
                  <p className="font-mono text-2xl font-black text-[#7c3aed]">x{coopCombinedCombo + gameState.combo}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Pairs Cleared</p>
                  <p className="font-mono text-2xl font-black text-emerald-600">{gameState.matches} / {totalPairs}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Grid */}
        <div className={`grid gap-3 sm:gap-4 ${gridColsClass} mb-6`}>
          {gameState.board.cards.map((card: CardNode) => {
            const isSelected = gameState.selectedIds.includes(card.id);
            const isClickable = !card.matched && !card.revealed && (room.gameMode !== "turn_based" || isMyTurn);

            return (
              <button
                key={card.id}
                onClick={() => isClickable && handleCardClick(card.id)}
                disabled={!isClickable}
                className={`aspect-square rounded-2xl sm:rounded-3xl p-2 font-display text-xl sm:text-2xl font-bold transition-all duration-300 shadow-md ${
                  card.matched
                    ? "bg-emerald-500/20 text-emerald-700 border-2 border-emerald-500/40 opacity-70"
                    : card.revealed || isSelected
                    ? "bg-white text-[#3525cd] ring-4 ring-[#4f46e5]/40 rotate-y-180 scale-105"
                    : "bg-gradient-to-tr from-[#3525cd] via-[#4f46e5] to-[#7c3aed] text-white hover:scale-105 active:scale-95 border border-white/20"
                }`}
              >
                <div className="flex h-full w-full items-center justify-center">
                  {card.revealed || card.matched ? card.symbol : "◌"}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Messages Bar (No Emojis) */}
        <div className="glass-panel flex flex-wrap items-center justify-center gap-2 rounded-2xl p-3 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] mr-2">Quick Message:</span>
          {quickMessagesList.map((msg) => (
            <button
              key={msg}
              onClick={() => sendQuickMessage(msg)}
              className="rounded-xl bg-white/80 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#1e1b4b] hover:bg-[#3525cd] hover:text-white transition-all shadow-sm active:scale-95"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
