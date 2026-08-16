import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { MultiplayerGameMode, MultiplayerRoom, PlayerProfile } from "../types";
import { createInitialGameState, resolveSelection, revealCard, tickGame } from "./engine";
import type { GameSessionState } from "./types";

export type ReactionEmoji = "🧠" | "⚡" | "🔥" | "💀" | "👑" | "🎯";

export type ActiveReaction = {
  id: string;
  senderId: string;
  senderName: string;
  emoji: ReactionEmoji;
  timestamp: number;
};

export type PlayerPresenceState = {
  userId: string;
  username: string;
  avatarId: string;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
};

export type GhostState = {
  score: number;
  matches: number;
  combo: number;
  accuracy: number;
  finished: boolean;
  finalTime?: number;
};

export function useMultiplayerGame(
  room: MultiplayerRoom,
  currentUserId: string,
  userProfile: PlayerProfile,
) {
  const isHost = room.hostId === currentUserId;
  const isGuest = room.guestId === currentUserId;
  const opponentProfile = isHost ? room.guestProfile : room.hostProfile;

  // Initialize board state with shared seed
  const [gameState, setGameState] = useState<GameSessionState>(() =>
    createInitialGameState({
      theme: room.theme,
      gridSize: room.gridSize,
      seed: room.seed,
    }),
  );

  // Scores state for turn-based and coop modes
  const [playerScores, setPlayerScores] = useState<{ [id: string]: number }>({
    [room.hostId]: 0,
    ...(room.guestId ? { [room.guestId]: 0 } : {}),
  });

  // Current turn ID for turn-based duel
  const [currentTurnId, setCurrentTurnId] = useState<string>(
    room.currentTurnId || room.hostId,
  );

  // Opponent ghost progress for Speed Sprint
  const [opponentGhost, setOpponentGhost] = useState<GhostState>({
    score: 0,
    matches: 0,
    combo: 0,
    accuracy: 0,
    finished: false,
  });

  // Co-op shared metrics
  const [coopSharedScore, setCoopSharedScore] = useState<number>(0);
  const [coopCombinedCombo, setCoopCombinedCombo] = useState<number>(0);

  // Reactions stream
  const [reactions, setReactions] = useState<ActiveReaction[]>([]);

  // Presence state
  const [presenceMap, setPresenceMap] = useState<Record<string, PlayerPresenceState>>({});

  // Rematch request status
  const [rematchRequestedBy, setRematchRequestedBy] = useState<string | null>(null);

  const channelRef = useRef<any>(null);

  // Handle card click / reveal logic according to mode
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gameState.status === "won" || gameState.status === "lost") return;

      if (room.gameMode === "turn_based") {
        if (currentTurnId !== currentUserId) return; // Not your turn!
        if (gameState.selectedIds.length >= 2) return;
      }

      // Local reveal
      setGameState((prev) => {
        const next = revealCard(prev, cardId);

        // Broadcast move to partner
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "CARD_REVEAL",
            payload: { cardId, senderId: currentUserId },
          });
        }

        // Auto resolve selection if 2 cards revealed
        if (next.selectedIds.length === 2) {
          setTimeout(() => {
            setGameState((stateBeforeResolve) => {
              const resolved = resolveSelection(stateBeforeResolve);
              const card1 = stateBeforeResolve.board.cards.find(
                (c) => c.id === stateBeforeResolve.selectedIds[0],
              );
              const card2 = stateBeforeResolve.board.cards.find(
                (c) => c.id === stateBeforeResolve.selectedIds[1],
              );
              const isMatch = card1 && card2 && card1.symbol === card2.symbol;

              if (room.gameMode === "turn_based") {
                if (isMatch) {
                  // Keep turn & award score
                  setPlayerScores((prevScores) => ({
                    ...prevScores,
                    [currentUserId]: (prevScores[currentUserId] || 0) + 100 * (stateBeforeResolve.combo + 1),
                  }));
                } else {
                  // Switch turn to opponent
                  const nextTurn = isHost ? room.guestId || room.hostId : room.hostId;
                  setCurrentTurnId(nextTurn);
                  if (channelRef.current) {
                    channelRef.current.send({
                      type: "broadcast",
                      event: "TURN_CHANGE",
                      payload: { nextTurnId: nextTurn },
                    });
                  }
                }
              } else if (room.gameMode === "coop") {
                if (isMatch) {
                  setCoopSharedScore((prev) => prev + 150 * (stateBeforeResolve.combo + 1));
                  setCoopCombinedCombo((prev) => prev + 1);
                } else {
                  setCoopCombinedCombo(0);
                }
              }

              return resolved;
            });
          }, 800);
        }

        return next;
      });
    },
    [gameState.status, gameState.selectedIds.length, room.gameMode, currentTurnId, currentUserId, isHost, room.guestId, room.hostId],
  );

  // Send speed sprint progress broadcast
  useEffect(() => {
    if (room.gameMode === "speed_sprint" && gameState.status === "running") {
      const accuracy = gameState.moves > 0 ? (gameState.matches / gameState.moves) * 100 : 0;
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "GHOST_PROGRESS",
          payload: {
            senderId: currentUserId,
            score: gameState.score,
            matches: gameState.matches,
            combo: gameState.combo,
            accuracy,
            finished: gameState.status === "won",
          },
        });
      }
    }
  }, [gameState.score, gameState.matches, gameState.combo, gameState.moves, gameState.status, room.gameMode, currentUserId]);

  // Game timer tick loop
  useEffect(() => {
    if (gameState.status !== "running") return;

    const interval = setInterval(() => {
      setGameState((prev) => tickGame(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.status]);

  // Send Emoji Reaction
  const sendEmojiReaction = useCallback(
    (emoji: ReactionEmoji) => {
      const newReaction: ActiveReaction = {
        id: `react-${Date.now()}-${Math.random()}`,
        senderId: currentUserId,
        senderName: userProfile.username,
        emoji,
        timestamp: Date.now(),
      };

      setReactions((prev) => [...prev, newReaction]);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "EMOJI_REACTION",
          payload: newReaction,
        });
      }
    },
    [currentUserId, userProfile.username],
  );

  // Request Rematch
  const sendRematchRequest = useCallback(() => {
    setRematchRequestedBy(currentUserId);
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "REMATCH_REQUEST",
        payload: { senderId: currentUserId },
      });
    }
  }, [currentUserId]);

  // Setup Supabase Realtime channel
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase.channel(`room_${room.id}`, {
      config: { presence: { key: currentUserId } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const mapped: Record<string, PlayerPresenceState> = {};
        Object.keys(state).forEach((key) => {
          const pres = state[key]?.[0] as any;
          if (pres) {
            mapped[key] = {
              userId: key,
              username: pres.username || "Player",
              avatarId: pres.avatarId || "cyber_grid",
              isHost: key === room.hostId,
              isReady: Boolean(pres.isReady),
              connected: true,
            };
          }
        });
        setPresenceMap(mapped);
      })
      .on("broadcast", { event: "CARD_REVEAL" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          setGameState((prev) => revealCard(prev, payload.cardId));
        }
      })
      .on("broadcast", { event: "TURN_CHANGE" }, ({ payload }) => {
        setCurrentTurnId(payload.nextTurnId);
      })
      .on("broadcast", { event: "GHOST_PROGRESS" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          setOpponentGhost({
            score: payload.score,
            matches: payload.matches,
            combo: payload.combo,
            accuracy: payload.accuracy,
            finished: payload.finished,
          });
        }
      })
      .on("broadcast", { event: "EMOJI_REACTION" }, ({ payload }) => {
        setReactions((prev) => [...prev, payload]);
      })
      .on("broadcast", { event: "REMATCH_REQUEST" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          setRematchRequestedBy(payload.senderId);
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          channel.track({
            username: userProfile.username,
            avatarId: userProfile.avatarId,
            isReady: true,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, currentUserId, userProfile.username, userProfile.avatarId, room.hostId]);

  // Clean old reactions after 3.5s
  useEffect(() => {
    if (reactions.length === 0) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setReactions((prev) => prev.filter((r) => now - r.timestamp < 3500));
    }, 3500);
    return () => clearTimeout(timer);
  }, [reactions]);

  return {
    gameState,
    handleCardClick,
    isHost,
    isGuest,
    opponentProfile,
    currentTurnId,
    isMyTurn: room.gameMode === "turn_based" ? currentTurnId === currentUserId : true,
    playerScores,
    opponentGhost,
    coopSharedScore,
    coopCombinedCombo,
    reactions,
    sendEmojiReaction,
    rematchRequestedBy,
    sendRematchRequest,
    presenceMap,
  };
}
