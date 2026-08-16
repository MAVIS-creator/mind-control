import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrandMotionMark } from "../components/AppIcons";
import { Seo } from "../components/Seo";
import { createMultiplayerRoom, fetchOpenPublicRooms, joinMultiplayerRoom } from "../lib/multiplayer";
import { useAppContext } from "../state/AppContext";
import type { GameTheme, GridSize, MultiplayerGameMode, MultiplayerRoom } from "../types";

export const MultiplayerLobbyRoute = () => {
  const navigate = useNavigate();
  const { session } = useAppContext();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<MultiplayerGameMode>("turn_based");
  const [selectedGrid, setSelectedGrid] = useState<GridSize>("4x4");
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>("icons");

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [openRooms, setOpenRooms] = useState<MultiplayerRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

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
    let mounted = true;
    const loadRooms = async () => {
      try {
        const rooms = await fetchOpenPublicRooms();
        if (mounted) setOpenRooms(rooms);
      } catch (err) {
        console.error("Failed to load rooms", err);
      } finally {
        if (mounted) setLoadingRooms(false);
      }
    };
    loadRooms();
    const interval = setInterval(loadRooms, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const room = await createMultiplayerRoom(profile, {
        gameMode: selectedMode,
        gridSize: selectedGrid,
        theme: selectedTheme,
      });
      navigate(`/multiplayer/room/${room.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not create multiplayer room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    setIsJoining(true);
    setErrorMessage(null);
    try {
      const room = await joinMultiplayerRoom(roomCodeInput, profile);
      navigate(`/multiplayer/room/${room.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleDirectJoin = async (roomCode: string) => {
    setIsJoining(true);
    setErrorMessage(null);
    try {
      const room = await joinMultiplayerRoom(roomCode, profile);
      navigate(`/multiplayer/room/${room.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <Seo title="Multiplayer Lobby - MindGrid Neural Clash" description="Join online real-time multiplayer 1v1 duels, speed sprint races, and co-op memory grid battles." />

      {/* Decorative backdrop glows */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -left-12 top-8 h-[24rem] w-[24rem] rounded-full bg-[#8a70ff]/16 blur-[100px]" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[#64a8fe]/16 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[20rem] w-[20rem] rounded-full bg-[#6b00b7]/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl">
        {/* Top Header Navigation */}
        <header className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/40 pb-6 sm:flex-row sm:items-center">
          <div>
            <button
              onClick={() => navigate("/play")}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#3525cd] hover:underline"
            >
              ← Back to Main Menu
            </button>
            <h1 className="mt-1 font-display text-2xl font-black text-[#1e1b4b] sm:text-3xl">
              MULTIPLAYER NEURAL CLASH
            </h1>
            <p className="mt-1 text-xs text-[#525166] sm:text-sm">
              Real-time online memory grid battles. Choose your battle mode & challenge operatives.
            </p>
          </div>
          <BrandMotionMark className="w-36 sm:w-44" />
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm font-semibold text-red-600 shadow-sm">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Game Mode Breakdown Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div
            onClick={() => setSelectedMode("turn_based")}
            className={`cursor-pointer rounded-3xl p-5 transition-all ${
              selectedMode === "turn_based"
                ? "bg-white/90 shadow-[0_12px_32px_rgba(53,37,205,0.15)] ring-2 ring-[#4f46e5]"
                : "bg-white/60 hover:bg-white/80 border border-white/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#4f46e5]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#4f46e5]">
                1v1 Duel
              </span>
              <span className="text-xl">⚔️</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-[#1e1b4b]">Turn-Based Neural Duel</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#525166]">
              Take turns on a shared grid. Scoring pairs grants extra turns; missing hands control to opponent.
            </p>
          </div>

          <div
            onClick={() => setSelectedMode("speed_sprint")}
            className={`cursor-pointer rounded-3xl p-5 transition-all ${
              selectedMode === "speed_sprint"
                ? "bg-white/90 shadow-[0_12px_32px_rgba(53,37,205,0.15)] ring-2 ring-[#0284c7]"
                : "bg-white/60 hover:bg-white/80 border border-white/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#0284c7]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0284c7]">
                Speed Race
              </span>
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-[#1e1b4b]">Speed Sprint Race</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#525166]">
              Simultaneous race on identical grid seeds. Monitor opponent ghost progress in real-time.
            </p>
          </div>

          <div
            onClick={() => setSelectedMode("coop")}
            className={`cursor-pointer rounded-3xl p-5 transition-all ${
              selectedMode === "coop"
                ? "bg-white/90 shadow-[0_12px_32px_rgba(53,37,205,0.15)] ring-2 ring-[#7c3aed]"
                : "bg-white/60 hover:bg-white/80 border border-white/60"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-[#7c3aed]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#7c3aed]">
                Co-Op Sync
              </span>
              <span className="text-xl">🤝</span>
            </div>
            <h3 className="mt-3 font-display text-base font-bold text-[#1e1b4b]">Co-op Grid Sync</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#525166]">
              Work together on a shared grid. Combine combo scores and manage a joint move pool.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Create Room Box */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl lg:col-span-7">
            <h2 className="font-display text-lg font-bold text-[#1e1b4b] flex items-center gap-2">
              <span>🎮</span> Create New Match Room
            </h2>

            {/* Grid Size Selection */}
            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">Grid Matrix Size</label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {(["4x4", "5x6", "6x6"] as GridSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedGrid(size)}
                    className={`rounded-2xl py-3 text-xs font-bold transition-all ${
                      selectedGrid === size
                        ? "bg-[#3525cd] text-white shadow-md"
                        : "bg-white/70 hover:bg-white text-[#334155] border border-white/80"
                    }`}
                  >
                    {size} Matrix
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#475569]">Visual Theme</label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTheme("icons")}
                  className={`rounded-2xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    selectedTheme === "icons"
                      ? "bg-[#3525cd] text-white shadow-md"
                      : "bg-white/70 hover:bg-white text-[#334155] border border-white/80"
                  }`}
                >
                  <span>🎨</span> Cyber Icons
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTheme("numbers")}
                  className={`rounded-2xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    selectedTheme === "numbers"
                      ? "bg-[#3525cd] text-white shadow-md"
                      : "bg-white/70 hover:bg-white text-[#334155] border border-white/80"
                  }`}
                >
                  <span>🔢</span> Quantum Digits
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(79,70,229,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isCreating ? "Initializing Room..." : "Create Room & Lobby"}
            </button>
          </div>

          {/* Join Code Box & Public Rooms */}
          <div className="space-y-6 lg:col-span-5">
            {/* Enter Code */}
            <div className="glass-panel rounded-3xl p-6 shadow-xl">
              <h2 className="font-display text-lg font-bold text-[#1e1b4b] flex items-center gap-2">
                <span>🔑</span> Enter 6-Digit Room Code
              </h2>
              <form onSubmit={handleJoinByCode} className="mt-4 flex gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. CLASH9"
                  className="w-full rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3 text-center font-mono text-base font-bold uppercase tracking-widest text-[#1e1b4b] placeholder-[#94a3b8] focus:border-[#4f46e5] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30"
                />
                <button
                  type="submit"
                  disabled={isJoining || roomCodeInput.trim().length !== 6}
                  className="rounded-2xl bg-[#1e1b4b] px-6 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#312e81] disabled:opacity-40"
                >
                  {isJoining ? "..." : "Join"}
                </button>
              </form>
            </div>

            {/* Public Rooms Feed */}
            <div className="glass-panel rounded-3xl p-6 shadow-xl">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#334155] flex items-center justify-between">
                <span>📡 Open Lobbies ({openRooms.length})</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </h3>

              <div className="mt-4 max-h-60 space-y-3 overflow-y-auto pr-1">
                {loadingRooms ? (
                  <p className="text-center py-6 text-xs text-[#64748b]">Scanning frequency for open lobbies...</p>
                ) : openRooms.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[#64748b]">
                    No open public lobbies found. Create one above to invite players!
                  </p>
                ) : (
                  openRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded-2xl bg-white/80 p-3 border border-white/60 shadow-sm"
                    >
                      <div>
                        <p className="text-xs font-bold text-[#1e1b4b]">
                          {room.hostProfile?.username || "Host Agent"}
                        </p>
                        <p className="text-[10px] text-[#64748b] capitalize">
                          {room.gameMode.replace("_", " ")} • {room.gridSize} • {room.theme}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDirectJoin(room.roomCode)}
                        disabled={isJoining}
                        className="rounded-xl bg-[#4f46e5] px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#4338ca]"
                      >
                        Join Room
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
