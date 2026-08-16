import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Seo } from "../components/Seo";
import { fetchRoomDetails, leaveMultiplayerRoom, updateRoomConfig } from "../lib/multiplayer";
import { supabase } from "../lib/supabase";
import { useAppContext } from "../state/AppContext";
import type { MultiplayerRoom } from "../types";

export const MultiplayerRoomRoute = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { session } = useAppContext();

  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState(600);

  useEffect(() => {
    if (!room || room.status !== "waiting") return;
    const created = new Date(room.createdAt).getTime();

    const updateTimer = () => {
      const elapsedSec = Math.floor((Date.now() - created) / 1000);
      const remaining = Math.max(0, 600 - elapsedSec);
      setTimeLeftSec(remaining);

      if (remaining <= 0) {
        alert("Lobby session expired after 10 minutes of inactivity.");
        navigate("/multiplayer");
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [room, navigate]);

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

  const isHost = room?.hostId === profile.id;
  const isGuest = room?.guestId === profile.id;

  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!roomId) return;
    let mounted = true;

    const load = async () => {
      try {
        const details = await fetchRoomDetails(roomId);
        if (mounted) {
          setRoom(details);
          if (details?.status === "playing") {
            navigate(`/multiplayer/play/${details.id}`);
          }
        }
      } catch (err) {
        console.error("Room fetch error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // Setup Supabase Realtime DB & Presence listener
    let channel: any = null;
    let presenceChannel: any = null;
    if (supabase) {
      channel = supabase
        .channel(`room_meta_${roomId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "multiplayer_rooms", filter: `id=eq.${roomId}` },
          () => {
            load();
          },
        )
        .subscribe();

      presenceChannel = supabase.channel(`presence_room_${roomId}`, {
        config: { presence: { key: profile.id } },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          const ids = Object.keys(state);
          setOnlineUserIds(ids);

          // Auto clear guest if disconnected
          if (room?.hostId === profile.id && room?.guestId && !ids.includes(room.guestId)) {
            updateRoomConfig(roomId, { guestReady: false });
          }
        })
        .subscribe((status: string) => {
          if (status === "SUBSCRIBED") {
            presenceChannel.track({
              userId: profile.id,
              username: profile.username,
              onlineAt: new Date().toISOString(),
            });
          }
        });
    }

    const interval = setInterval(load, 2500);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (channel && supabase) supabase.removeChannel(channel);
      if (presenceChannel && supabase) supabase.removeChannel(presenceChannel);
    };
  }, [roomId, navigate, profile.id, profile.username, room?.hostId, room?.guestId]);

  const copyRoomCode = () => {
    if (room?.roomCode) {
      navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleReady = async () => {
    if (!room) return;
    const isHostReady = isHost ? !room.hostReady : room.hostReady;
    const isGuestReady = isGuest ? !room.guestReady : room.guestReady;

    await updateRoomConfig(room.id, {
      hostReady: isHostReady,
      guestReady: isGuestReady,
    });

    setRoom((prev) =>
      prev
        ? {
            ...prev,
            hostReady: isHostReady,
            guestReady: isGuestReady,
          }
        : prev,
    );
  };

  const handleStartMatch = async () => {
    if (!room) return;
    if (!room.guestId) {
      setErrorMsg("Waiting for a second player to join before starting.");
      return;
    }

    await updateRoomConfig(room.id, {
      status: "playing",
      currentTurnId: room.hostId,
    });

    navigate(`/multiplayer/play/${room.id}`);
  };

  const handleLeave = async () => {
    if (room) {
      await leaveMultiplayerRoom(room.id, profile.id);
    }
    navigate("/multiplayer");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9ff] dark:bg-slate-950 dark:text-slate-100">
        <p className="font-display text-sm font-bold uppercase tracking-widest text-[#3525cd] dark:text-indigo-400">
          Connecting to Room Frequency...
        </p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9f9ff] dark:bg-slate-950 dark:text-slate-100 px-4 text-center">
        <h2 className="font-display text-xl font-bold text-[#1e1b4b] dark:text-white">Room Not Found</h2>
        <p className="mt-2 text-sm text-[#64748b] dark:text-slate-300">This lobby may have expired or been disbanded.</p>
        <button
          onClick={() => navigate("/multiplayer")}
          className="mt-4 rounded-xl bg-[#4f46e5] px-5 py-2.5 text-xs font-bold text-white"
        >
          Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] dark:bg-slate-950 dark:bg-none dark:text-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <Seo title={`Room ${room.roomCode} - MindGrid Multiplayer`} description="Pre-game multiplayer lobby room." />

      <div className="mx-auto max-w-4xl">
        {/* Header bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleLeave}
            className="text-xs font-semibold uppercase tracking-wider text-[#3525cd] dark:text-indigo-400 hover:underline"
          >
            ← Disband / Leave Room
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 border border-amber-500/20">
              Lobby Timeout: {Math.floor(timeLeftSec / 60).toString().padStart(2, "0")}:{(timeLeftSec % 60).toString().padStart(2, "0")}
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Lobby Live
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-center text-sm font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Room Code Card */}
        <div className="glass-panel text-center rounded-3xl p-6 shadow-xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">Room Access Code</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="font-mono text-4xl font-black tracking-widest text-[#1e1b4b]">
              {room.roomCode}
            </span>
            <button
              onClick={copyRoomCode}
              className="rounded-xl bg-[#4f46e5]/10 px-3 py-2 text-xs font-bold text-[#4f46e5] hover:bg-[#4f46e5]/20 transition-all"
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <p className="mt-2 text-xs text-[#64748b]">
            Share this 6-digit code with your friend to join your game.
          </p>
        </div>

        {/* Mode Details Pill */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider">
          <span className="rounded-xl bg-white/80 px-4 py-2 text-[#3525cd] shadow-sm border border-white/60">
            Mode: {room.gameMode.replace("_", " ")}
          </span>
          <span className="rounded-xl bg-white/80 px-4 py-2 text-[#3525cd] shadow-sm border border-white/60">
            Matrix: {room.gridSize}
          </span>
          <span className="rounded-xl bg-white/80 px-4 py-2 text-[#3525cd] shadow-sm border border-white/60">
            Theme: {room.theme}
          </span>
        </div>

        {/* Players Side by Side */}
        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          {/* Host Player Card */}
          <div className="glass-panel rounded-3xl p-6 text-center shadow-lg border-2 border-indigo-500/20">
            <span className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-3">
              Room Host
            </span>
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-[#4f46e5] to-[#7c3aed] p-1 shadow-md">
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-[#1e1b4b]">
                {room.hostProfile?.username?.charAt(0).toUpperCase() || "H"}
              </div>
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-[#1e1b4b]">
              {room.hostProfile?.username || "Host Operative"}
            </h3>
            <p className="text-xs text-[#64748b]">{room.hostProfile?.rank || "Neural Rookie"}</p>

            <div className="mt-4">
              <span
                className={`inline-block rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                  room.hostReady
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                }`}
              >
                {room.hostReady ? "Ready for Battle" : "Not Ready"}
              </span>
            </div>
          </div>

          {/* Guest Player Card */}
          <div className="glass-panel rounded-3xl p-6 text-center shadow-lg border-2 border-sky-500/20">
            <span className="inline-block rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-3">
              Challenger
            </span>

            {room.guestId && room.guestProfile && (onlineUserIds.length === 0 || onlineUserIds.includes(room.guestId)) ? (
              <>
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-[#0284c7] to-[#06b6d4] p-1 shadow-md">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl font-black text-[#1e1b4b]">
                    {room.guestProfile.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-[#1e1b4b]">
                  {room.guestProfile.username}
                </h3>
                <p className="text-xs text-[#64748b]">{room.guestProfile.rank || "Neural Rookie"}</p>

                <div className="mt-4">
                  <span
                    className={`inline-block rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      room.guestReady
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {room.guestReady ? "Ready for Battle" : "Not Ready"}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-6">
                <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-slate-200 text-2xl text-[#64748b]">
                  ◌
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#64748b]">
                  Waiting for Opponent...
                </p>
                <p className="mt-1 text-[11px] text-[#94a3b8]">Share room code to invite a friend</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={toggleReady}
            className={`rounded-2xl px-8 py-4 font-display text-sm font-bold uppercase tracking-wider shadow-md transition-all ${
              (isHost && room.hostReady) || (isGuest && room.guestReady)
                ? "bg-slate-700 text-white"
                : "bg-emerald-600 text-white hover:bg-emerald-500"
            }`}
          >
            {(isHost && room.hostReady) || (isGuest && room.guestReady)
              ? "Cancel Ready Status"
              : "Toggle Ready Status"}
          </button>

          {isHost && (
            <button
              onClick={handleStartMatch}
              className="rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#7c3aed] px-10 py-4 font-display text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105"
            >
              Start Multiplayer Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
