import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  BrandMarkIcon,
  ClockIcon,
  GridIcon,
  RefreshIcon,
  SparklesIcon,
} from "../components/AppIcons";
import { Seo } from "../components/Seo";
import { avatarOptions } from "../data/avatars";
import { MindGridCanvas } from "../game/phaser/MindGridCanvas";
import { useMultiplayerGame, type QuickMessage } from "../game/useMultiplayerGame";
import { fetchRoomDetails, leaveMultiplayerRoom, updateRoomConfig } from "../lib/multiplayer";
import { formatDuration, formatNumber } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { MultiplayerRoom } from "../types";

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
    activeMessages,
    sendQuickMessage,
  } = useMultiplayerGame(room, userId, profile);

  const [gameFinished, setGameFinished] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const totalPairs = gameState.board.cards.length / 2;
  const isFinished = gameState.matches === totalPairs || gameState.status === "won" || gameState.status === "lost";

  const avatar = avatarOptions.find((entry) => entry.id === profile.avatarId) ?? avatarOptions[0];

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

      updateRoomConfig(room.id, {
        status: "finished",
        winner_id: winnerId,
        scores: playerScores,
      });

      setTimeout(() => {
        navigate(`/multiplayer/results/${room.id}`, {
          state: {
            room,
            myScore: gameState.score,
            opponentScore:
              room.gameMode === "speed_sprint"
                ? opponentGhost.score
                : (isHost ? playerScores[room.guestId || ""] || 0 : playerScores[room.hostId] || 0),
            winnerId,
            accuracy: gameState.moves > 0 ? (gameState.matches / gameState.moves) * 100 : 0,
            coopScore: coopSharedScore,
          },
        });
      }, 1500);
    }
  }, [isFinished, gameFinished, room, playerScores, gameState, opponentGhost, isHost, userId, coopSharedScore, navigate]);

  const quickMessagesList: QuickMessage[] = [
    "Nice move!",
    "Good game!",
    "Watch this!",
    "Close one!",
    "Your turn!",
    "Well played!",
  ];

  const handleConfirmQuit = async () => {
    setShowQuitModal(false);
    await leaveMultiplayerRoom(room.id, userId);
    navigate("/multiplayer");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[linear-gradient(180deg,#f6f8ff_0%,#eef4ff_100%)] lg:h-screen lg:max-h-screen lg:overflow-hidden">
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

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-indigo-100 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#dc2626]">
              <ArrowLeftIcon className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#1e1b4b]">Quit Multiplayer Match?</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#64748b]">
              Are you sure you want to leave this battle? Forfeiting will end your active multiplayer session.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowQuitModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-[#334155] hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmQuit}
                className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-bold text-white hover:bg-red-700 shadow-md"
              >
                Yes, Quit Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header / HUD (Identical to Single Player) */}
      <header className="shrink-0 border-b border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(248,251,255,0.98),rgba(238,245,255,0.94))] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
          <div className="flex min-w-0 items-center justify-between gap-2 lg:flex-1 lg:justify-start">
            <Link to="/play" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <BrandMarkIcon className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" />
              <span className="truncate font-display text-[1.45rem] font-extrabold text-[#3525cd] sm:text-[2rem]">
                MindGrid
              </span>
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-[33rem] items-center justify-between gap-2 rounded-[1.5rem] border border-white/80 bg-white/62 px-3 py-2 shadow-[0_16px_36px_rgba(53,37,205,0.08)] sm:gap-4 sm:px-5 lg:w-auto lg:max-w-none lg:justify-center lg:rounded-full">
            <HudStat label="Time" value={formatDuration(gameState.timerRemaining)} />
            <HudStat label="Moves" value={`${gameState.moves}`} />
            <HudStat label="Pairs" value={`${gameState.matches}/${totalPairs}`} />
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full border border-[#b9d2f4] bg-[#d7e7fb] text-[#0058a8] shadow-inner sm:h-16 sm:w-16">
              <span className="text-[0.62rem] font-semibold uppercase">Combo</span>
              <span className="text-[1.25rem] font-bold sm:text-[1.45rem]">x{Math.max(gameState.combo, 1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 lg:flex-1 lg:justify-end">
            <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-3 py-2 text-white shadow-[0_14px_30px_rgba(53,37,205,0.18)] sm:gap-2 sm:px-4 sm:py-2.5">
              <SparklesIcon className="h-4 w-4" />
              <span className="truncate text-[0.74rem] font-semibold tracking-[0.03em] sm:text-sm">{profile.xp} XP</span>
            </div>
            <img src={avatar.image} alt="" className="h-10 w-10 rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </header>

      {/* Main Playground Content */}
      <main className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1 overflow-visible px-3 py-2 sm:px-6 sm:py-3 lg:max-h-[calc(100vh-8.5rem)] lg:overflow-hidden lg:px-8 xl:px-10">
        <div className="grid min-h-0 w-full gap-3 lg:grid-cols-[minmax(0,1fr)_18.5rem] xl:gap-4">
          {/* Left Playground Column */}
          <section className="flex min-h-0 min-w-0 flex-col gap-3 lg:grid lg:grid-rows-[auto_minmax(0,1fr)_auto]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowQuitModal(true)}
                className="inline-flex items-center gap-2 rounded-full border border-[#dbdef0] bg-white/88 px-4 py-2.5 text-xs font-semibold text-[#495066] hover:bg-white"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back / Disband Match
              </button>

              <span className="rounded-full bg-[#4f46e5]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#3525cd] border border-[#4f46e5]/20">
                {room.gameMode === "speed_sprint"
                  ? `SPEED SPRINT RACE (${room.gridSize.toUpperCase()} MATRIX)`
                  : room.gameMode === "coop"
                  ? "CO-OP GRID SYNC"
                  : "TURN-BASED 1v1 DUEL"}
              </span>
            </div>

            {/* Playable Canvas Board (Phaser Engine Matching Single Player Image 2) */}
            <div className="min-h-0 lg:flex lg:flex-1 lg:items-center lg:justify-center">
              <MindGridCanvas state={gameState} onReveal={handleCardClick} />
            </div>

            {/* Quick Messages Bar */}
            <div className="glass-panel flex flex-wrap items-center justify-center gap-2 rounded-2xl p-2.5 shadow-sm">
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
          </section>

          {/* Right Sidebar: Match & Live Opponent Progress (Same as Single Player Sidebar) */}
          <aside className="grid grid-cols-2 gap-3 lg:flex lg:flex-col lg:gap-3 xl:min-h-0">
            {/* Card 1: Live Progress & Opponent Ghost Updates */}
            <div className="glass-panel rounded-[1.4rem] p-4 sm:rounded-[1.6rem]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3f4457]">
                {room.gameMode === "speed_sprint" ? "Speed Race Progress" : "Match Progress"}
              </p>

              {/* Your Board Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#1a2340]">
                  <span>You ({gameState.matches}/{totalPairs} pairs)</span>
                  <span className="text-[#3525cd]">{gameState.score} pts</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#d9e5fb]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#64a8fe] via-[#4f46e5] to-[#3525cd] transition-all duration-300"
                    style={{ width: `${(gameState.matches / totalPairs) * 100}%` }}
                  />
                </div>
              </div>

              {/* Opponent Progress (Updated Live via WebSockets) */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-[#5a6174]">
                  <span>
                    {opponentProfile?.username || "Opponent"} (
                    {room.gameMode === "speed_sprint"
                      ? `${opponentGhost.matches}/${totalPairs} pairs`
                      : `${playerScores[isHost ? room.guestId || "" : room.hostId] || 0} pts`}
                    )
                  </span>
                  <span>{room.gameMode === "speed_sprint" ? opponentGhost.score : playerScores[isHost ? room.guestId || "" : room.hostId] || 0} pts</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 opacity-80"
                    style={{
                      width: `${
                        room.gameMode === "speed_sprint"
                          ? (opponentGhost.matches / totalPairs) * 100
                          : totalPairs > 0
                          ? ((playerScores[isHost ? room.guestId || "" : room.hostId] || 0) / totalPairs) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-[1.15rem] border border-[#d7dcf5] bg-[#f3f4ff] px-3 py-2.5 text-xs leading-5 text-[#3525cd]">
                {room.gameMode === "speed_sprint"
                  ? "Sprint Race: Play on your own board as fast as possible. First to clear all pairs wins!"
                  : isMyTurn
                  ? "It's your turn to match pairs!"
                  : `Waiting for ${opponentProfile?.username || "opponent"}'s move...`}
              </div>
            </div>

            {/* Card 2: Battle Stats */}
            <div className="glass-panel rounded-[1.4rem] p-4 sm:rounded-[1.6rem]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3f4457]">Battle Stats</p>
              <div className="mt-3 space-y-2">
                <SideStat icon={<GridIcon className="h-4 w-4" />} label="Score" value={formatNumber(gameState.score)} />
                <SideStat icon={<ClockIcon className="h-4 w-4" />} label="Mistakes" value={`${gameState.mismatches}`} />
                <SideStat icon={<SparklesIcon className="h-4 w-4" />} label="Best combo" value={`x${gameState.maxCombo}`} />
                <SideStat icon={<RefreshIcon className="h-4 w-4" />} label="Moves" value={`${gameState.moves}`} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const HudStat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[#788299]">{label}</p>
    <p className="mt-0.5 text-[0.95rem] font-bold text-[#1a2340] sm:text-base">{value}</p>
  </div>
);

const SideStat = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between text-xs text-[#2e3650]">
    <div className="flex items-center gap-2 text-[#788299]">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-bold text-[#1b2441]">{value}</span>
  </div>
);
