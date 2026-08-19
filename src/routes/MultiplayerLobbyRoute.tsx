import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Seo } from "../components/Seo";
import { createMultiplayerRoom, fetchOpenPublicRooms, joinMultiplayerRoom } from "../lib/multiplayer";
import { isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { GameTheme, GridSize, MultiplayerGameMode, MultiplayerRoom } from "../types";

export const MultiplayerLobbyRoute = () => {
  const navigate = useNavigate();
  const { session, isGamingRestricted } = useAppContext();

  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<MultiplayerGameMode>("turn_based");
  const [selectedGrid, setSelectedGrid] = useState<GridSize>("4x4");
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>("icons");

  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [openRooms, setOpenRooms] = useState<MultiplayerRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

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
    if (isGamingRestricted) {
      setErrorMessage("Rest Break Active: Please wait for your 2-hour healthy gaming cooldown to finish.");
      return;
    }
    setIsCreating(true);
    setErrorMessage(null);
    try {
      const room = await createMultiplayerRoom(session.profile, {
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
      const room = await joinMultiplayerRoom(roomCodeInput, session.profile);
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
      const room = await joinMultiplayerRoom(roomCode, session.profile);
      navigate(`/multiplayer/room/${room.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <AppShell session={session} active="home">
      <Seo
        title="Multiplayer Lobby - MindGrid Neural Clash"
        description="Join online real-time multiplayer 1v1 duels, speed sprint races, and co-op memory grid battles."
      />

      <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f8faff_42%,_#dbeafe_100%)] dark:bg-none dark:bg-slate-950 px-3 py-5 pb-32 sm:px-6 sm:py-8 sm:pb-36 md:pb-10">
        <div className="mx-auto max-w-5xl">
          <div className="glass-panel rounded-[2rem] px-4 py-6 shadow-[0_18px_40px_rgba(37,99,235,0.08)] sm:rounded-[2.5rem] sm:px-8 sm:py-8 md:px-12">
            
            {/* Top Navigation Toggle: Single Player vs Multiplayer */}
            <div className="mb-8 h-1 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-blue-400" />

            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-full bg-[#f0f9ff] dark:bg-slate-900/90 p-1.5 shadow-inner">
                <Link
                  to="/play"
                  className="rounded-full px-6 py-2.5 text-sm font-semibold text-[#475569] dark:text-slate-300 hover:text-[#0284c7] dark:hover:text-white transition-all"
                >
                  Single Player
                </Link>
                <button
                  type="button"
                  className="rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]"
                >
                  Multiplayer Clash
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm font-semibold text-red-600 shadow-sm">
                {errorMessage}
              </div>
            )}

            {/* Game Mode Breakdown Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div
                onClick={() => setSelectedMode("turn_based")}
                className={`cursor-pointer rounded-3xl p-5 transition-all ${
                  selectedMode === "turn_based"
                    ? "bg-white/90 shadow-[0_12px_32px_rgba(37,99,235,0.15)] ring-2 ring-[#2563eb] dark:bg-slate-900 dark:ring-sky-500"
                    : "bg-white/60 hover:bg-white/80 border border-white/60 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-[#2563eb]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#2563eb] dark:bg-blue-950 dark:text-sky-400">
                    1v1 Duel
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-[#0f172a] dark:text-white">Turn-Based Neural Duel</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-slate-300">
                  Take turns on a shared grid. Scoring pairs grants extra turns; missing hands control to opponent.
                </p>
              </div>

              <div
                onClick={() => setSelectedMode("speed_sprint")}
                className={`cursor-pointer rounded-3xl p-5 transition-all ${
                  selectedMode === "speed_sprint"
                    ? "bg-white/90 shadow-[0_12px_32px_rgba(37,99,235,0.15)] ring-2 ring-[#0284c7] dark:bg-slate-900 dark:ring-sky-500"
                    : "bg-white/60 hover:bg-white/80 border border-white/60 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-[#0284c7]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:bg-sky-950 dark:text-sky-400">
                    Speed Race
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-[#0f172a] dark:text-white">Speed Sprint Race</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-slate-300">
                  Simultaneous race on identical grid seeds. First to open all pairs wins immediately with unlimited moves!
                </p>
              </div>

              <div
                onClick={() => setSelectedMode("coop")}
                className={`cursor-pointer rounded-3xl p-5 transition-all ${
                  selectedMode === "coop"
                    ? "bg-white/90 shadow-[0_12px_32px_rgba(37,99,235,0.15)] ring-2 ring-[#0284c7] dark:bg-slate-900 dark:ring-sky-500"
                    : "bg-white/60 hover:bg-white/80 border border-white/60 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-xl bg-[#0284c7]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0284c7] dark:bg-blue-950 dark:text-sky-400">
                    Co-Op Sync
                  </span>
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-[#0f172a] dark:text-white">Co-op Grid Sync</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#475569] dark:text-slate-300">
                  Work together on a shared grid. Combine combo scores and manage a joint move pool.
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
              {/* Create Room Box */}
              <div className="rounded-3xl bg-white/70 dark:bg-slate-900/90 p-6 shadow-md border border-white/80 dark:border-slate-800 lg:col-span-7">
                <h2 className="font-display text-lg font-bold text-[#0f172a] dark:text-white">
                  Create New Match Room
                </h2>

                {/* Grid Size Selection */}
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400">Grid Matrix Size</label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {(["4x4", "5x6", "6x6"] as GridSize[]).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedGrid(size)}
                        className={`rounded-2xl py-3 text-xs font-bold transition-all ${
                          selectedGrid === size
                            ? "bg-[#2563eb] text-white shadow-md"
                            : "bg-white hover:bg-slate-50 text-[#334155] border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {size} Matrix
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="mt-5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#475569] dark:text-slate-400">Visual Theme</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTheme("icons")}
                      className={`rounded-2xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        selectedTheme === "icons"
                          ? "bg-[#2563eb] text-white shadow-md"
                          : "bg-white hover:bg-slate-50 text-[#334155] border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Icons
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTheme("numbers")}
                      className={`rounded-2xl py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        selectedTheme === "numbers"
                          ? "bg-[#2563eb] text-white shadow-md"
                          : "bg-white hover:bg-slate-50 text-[#334155] border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                      }`}
                    >
                      Numbers
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#2563eb] via-[#0284c7] to-[#0369a1] py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isCreating ? "Initializing Room..." : "Create Room & Lobby"}
                </button>
              </div>

              {/* Join Code Box & Public Rooms */}
              <div className="space-y-6 lg:col-span-5">
                {/* Enter Code */}
                <div className="rounded-3xl bg-white/70 dark:bg-slate-900/90 p-6 shadow-md border border-white/80 dark:border-slate-800">
                  <h2 className="font-display text-lg font-bold text-[#0f172a] dark:text-white">
                    Enter 6-Digit Room Code
                  </h2>
                  <form onSubmit={handleJoinByCode} className="mt-4 flex gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. CLASH9"
                      className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 text-center font-mono text-base font-bold uppercase tracking-widest text-[#0f172a] placeholder-[#94a3b8] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={isJoining || roomCodeInput.trim().length !== 6}
                      className="rounded-2xl bg-[#0f172a] px-6 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-[#1e293b] disabled:opacity-40"
                    >
                      {isJoining ? "..." : "Join"}
                    </button>
                  </form>
                </div>

                {/* Public Rooms Feed */}
                <div className="rounded-3xl bg-white/70 dark:bg-slate-900/90 p-6 shadow-md border border-white/80 dark:border-slate-800">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#334155] dark:text-slate-300 flex items-center justify-between">
                    <span>Open Lobbies ({openRooms.length})</span>
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
                          className="flex items-center justify-between rounded-2xl bg-white p-3 border border-slate-100 shadow-sm"
                        >
                          <div>
                            <p className="text-xs font-bold text-[#0f172a]">
                              {room.hostProfile?.username || "Host Agent"}
                            </p>
                            <p className="text-[10px] text-[#64748b] capitalize">
                              {room.gameMode.replace("_", " ")} • {room.gridSize} • {room.theme}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDirectJoin(room.roomCode)}
                            disabled={isJoining}
                            className="rounded-xl bg-[#2563eb] px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-[#1d4ed8]"
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
      </div>
    </AppShell>
  );
};
