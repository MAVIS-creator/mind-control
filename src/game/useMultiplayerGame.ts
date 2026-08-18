import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import type { MultiplayerRoom, PlayerProfile } from "../types";
import { createInitialGameState, resolveSelection, revealCard, tickGame } from "./engine";
import type { GameSessionState } from "./types";

export type QuickMessage =
  | "Nice move!"
  | "Good game!"
  | "Watch this!"
  | "Close one!"
  | "Your turn!"
  | "Well played!";

export type ActiveReaction = {
  id: string;
  senderId: string;
  senderName: string;
  message: QuickMessage;
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
  const [gameState, setGameState] = useState<GameSessionState>(() => {
    const initial = createInitialGameState({
      theme: room.theme,
      gridSize: room.gridSize,
      seed: room.seed,
    });
    return {
      ...initial,
      status: "running",
      moveLimit: room.gameMode === "speed_sprint" ? 999999 : initial.moveLimit,
    };
  });

  const [speedRaceWinnerId, setSpeedRaceWinnerId] = useState<string | null>(null);

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

  // Quick Chat Messages stream
  const [activeMessages, setActiveMessages] = useState<ActiveReaction[]>([]);

  // Presence state
  const [presenceMap, setPresenceMap] = useState<Record<string, PlayerPresenceState>>({});

  // Real-time dynamic network ping measurement
  const [pingMs, setPingMs] = useState<number>(0);

  // Per-turn shot clock for turn_based mode & stopwatch for coop
  const [turnShotClock, setTurnShotClock] = useState<number>(15);
  const [coopElapsedTime, setCoopElapsedTime] = useState<number>(0);

  // Rematch request status
  const [rematchRequestedBy, setRematchRequestedBy] = useState<string | null>(null);

  const channelRef = useRef<any>(null);

  useEffect(() => {
    const pingInterval = setInterval(() => {
      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "PING",
          payload: { timestamp: Date.now(), senderId: currentUserId },
        });
      }
    }, 2000);

    return () => clearInterval(pingInterval);
  }, [currentUserId]);

  // Helper to reveal a card and schedule resolution on BOTH local and remote actions
  const applyCardReveal = useCallback(
    (cardId: string) => {
      setGameState((prev) => {
        const next = revealCard(prev, cardId);

        if (next.selectedIds.length === 2) {
          setTimeout(() => {
            setGameState((stateBeforeResolve) => {
              if (stateBeforeResolve.selectedIds.length !== 2) return stateBeforeResolve;
              const resolved = resolveSelection(stateBeforeResolve);
              const card1 = stateBeforeResolve.board.cards.find(
                (c) => c.id === stateBeforeResolve.selectedIds[0],
              );
              const card2 = stateBeforeResolve.board.cards.find(
                (c) => c.id === stateBeforeResolve.selectedIds[1],
              );
              const isMatch = card1 && card2 && card1.symbol === card2.symbol;
              const totalPairs = resolved.board.cards.length / 2;
              const isSpeedWon = resolved.matches === totalPairs;

              if (room.gameMode === "turn_based") {
                if (isMatch) {
                  // Active turn player gets 1.5x score & keeps turn
                  const activePlayerId = currentTurnId;
                  setPlayerScores((prevScores) => ({
                    ...prevScores,
                    [activePlayerId]: (prevScores[activePlayerId] || 0) + 150 * (stateBeforeResolve.combo + 1),
                  }));
                } else {
                  // Mismatch: Host coordinates turn change
                  if (isHost) {
                    const nextTurn = currentTurnId === room.hostId ? room.guestId || room.hostId : room.hostId;
                    setCurrentTurnId(nextTurn);
                    if (channelRef.current) {
                      channelRef.current.send({
                        type: "broadcast",
                        event: "TURN_CHANGE",
                        payload: { nextTurnId: nextTurn },
                      });
                    }
                  }
                }
              } else if (room.gameMode === "coop") {
                if (isMatch) {
                  setCoopSharedScore((prev) => prev + 225 * (stateBeforeResolve.combo + 1));
                  setCoopCombinedCombo((prev) => prev + 1);
                } else {
                  setCoopCombinedCombo(0);
                }
              } else if (room.gameMode === "speed_sprint") {
                if (isSpeedWon) {
                  setSpeedRaceWinnerId(currentUserId);
                  if (channelRef.current) {
                    channelRef.current.send({
                      type: "broadcast",
                      event: "SPEED_RACE_FINISHED",
                      payload: {
                        winnerId: currentUserId,
                        senderId: currentUserId,
                        score: resolved.score,
                        matches: resolved.matches,
                        timeRemaining: resolved.timerRemaining,
                      },
                    });
                    channelRef.current.send({
                      type: "broadcast",
                      event: "GHOST_PROGRESS",
                      payload: {
                        senderId: currentUserId,
                        score: resolved.score,
                        matches: resolved.matches,
                        combo: resolved.combo,
                        accuracy: resolved.moves > 0 ? (resolved.matches / resolved.moves) * 100 : 0,
                        finished: true,
                        winnerId: currentUserId,
                      },
                    });
                    channelRef.current.send({
                      type: "broadcast",
                      event: "MATCH_FINISHED",
                      payload: {
                        winnerId: currentUserId,
                        senderId: currentUserId,
                        finalScore: resolved.score,
                        matches: resolved.matches,
                      },
                    });
                  }
                }
              }

              return resolved;
            });
          }, 400);
        }

        return next;
      });
    },
    [room.gameMode, currentTurnId, isHost, room.hostId, room.guestId, currentUserId],
  );

  // Handle card click / reveal logic according to mode
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gameState.status === "won" || gameState.status === "lost") return;
      if (room.gameMode === "speed_sprint" && (opponentGhost.finished || Boolean(speedRaceWinnerId))) return;

      if (room.gameMode === "turn_based") {
        if (currentTurnId !== currentUserId) return; // Not your turn!
        if (gameState.selectedIds.length >= 2) return;
      } else if (room.gameMode === "speed_sprint") {
        if (gameState.selectedIds.length >= 2) return;
      }

      // Broadcast move to partner ONLY in turn_based or coop modes
      if (channelRef.current && (room.gameMode === "turn_based" || room.gameMode === "coop")) {
        channelRef.current.send({
          type: "broadcast",
          event: "CARD_REVEAL",
          payload: { cardId, senderId: currentUserId },
        });
      }

      // Apply card reveal locally
      applyCardReveal(cardId);
    },
    [gameState.status, gameState.selectedIds.length, room.gameMode, currentTurnId, currentUserId, applyCardReveal, opponentGhost.finished, speedRaceWinnerId],
  );

  // Send speed sprint progress broadcast
  useEffect(() => {
    if (room.gameMode === "speed_sprint" && (gameState.status === "running" || gameState.status === "won")) {
      const accuracy = gameState.moves > 0 ? (gameState.matches / gameState.moves) * 100 : 0;
      const isWon = gameState.status === "won" || gameState.matches === (gameState.board.cards.length / 2);
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
            finished: isWon,
            winnerId: isWon ? currentUserId : undefined,
          },
        });
      }
    }
  }, [gameState.score, gameState.matches, gameState.combo, gameState.moves, gameState.status, room.gameMode, currentUserId, gameState.board.cards.length]);

  // Reset shot clock on turn change in turn_based mode
  useEffect(() => {
    if (room.gameMode === "turn_based") {
      setTurnShotClock(15);
    }
  }, [currentTurnId, room.gameMode]);

  // Mode-specific game timer tick loop
  useEffect(() => {
    if (gameState.status !== "running") return;

    if (room.gameMode === "turn_based") {
      const interval = setInterval(() => {
        setTurnShotClock((prev) => {
          if (prev <= 1) {
            // Shot clock expired: Host auto switches turn to opponent
            if (isHost) {
              const nextTurn = currentTurnId === room.hostId ? room.guestId || room.hostId : room.hostId;
              setCurrentTurnId(nextTurn);
              if (channelRef.current) {
                channelRef.current.send({
                  type: "broadcast",
                  event: "TURN_CHANGE",
                  payload: { nextTurnId: nextTurn },
                });
              }
            }
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (room.gameMode === "coop") {
      const interval = setInterval(() => {
        setCoopElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (room.gameMode === "speed_sprint") {
      if (isHost) {
        const interval = setInterval(() => {
          setGameState((prev) => {
            const next = tickGame(prev);
            if (channelRef.current) {
              channelRef.current.send({
                type: "broadcast",
                event: "TIMER_SYNC",
                payload: { timerRemaining: next.timerRemaining },
              });
            }
            return next;
          });
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [gameState.status, room.gameMode, isHost, currentTurnId, room.hostId, room.guestId]);

  // Send Quick Chat Message
  const sendQuickMessage = useCallback(
    (message: QuickMessage) => {
      const newChatMsg: ActiveReaction = {
        id: `chat-${Date.now()}-${Math.random()}`,
        senderId: currentUserId,
        senderName: userProfile.username,
        message,
        timestamp: Date.now(),
      };

      setActiveMessages((prev) => [...prev, newChatMsg]);

      if (channelRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event: "QUICK_MESSAGE",
          payload: newChatMsg,
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
      config: {
        presence: { key: currentUserId },
        broadcast: { self: false, ack: false },
      },
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
        if (room.gameMode !== "speed_sprint" && payload.senderId !== currentUserId) {
          applyCardReveal(payload.cardId);
        }
      })
      .on("broadcast", { event: "TIMER_SYNC" }, ({ payload }) => {
        if (!isHost && payload.timerRemaining !== undefined) {
          setGameState((prev) => ({ ...prev, timerRemaining: payload.timerRemaining }));
        }
      })
      .on("broadcast", { event: "TURN_CHANGE" }, ({ payload }) => {
        setCurrentTurnId(payload.nextTurnId);
      })
      .on("broadcast", { event: "SPEED_RACE_FINISHED" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          const winner = payload.winnerId || payload.senderId;
          setSpeedRaceWinnerId(winner);
          setGameState((prev) => (prev.status === "won" ? prev : { ...prev, status: "lost" }));
          setOpponentGhost((prev) => ({
            ...prev,
            finished: true,
            matches: payload.matches || (gameState.board.cards.length / 2),
            score: payload.score || prev.score,
          }));
        }
      })
      .on("broadcast", { event: "GHOST_PROGRESS" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          setOpponentGhost({
            score: payload.score,
            matches: payload.matches,
            combo: payload.combo,
            accuracy: payload.accuracy,
            finished: Boolean(payload.finished),
          });
          if (payload.finished) {
            const winner = payload.winnerId || payload.senderId;
            setSpeedRaceWinnerId(winner);
            setGameState((prev) => (prev.status === "won" ? prev : { ...prev, status: "lost" }));
          }
        }
      })
      .on("broadcast", { event: "MATCH_FINISHED" }, ({ payload }) => {
        if (payload.senderId !== currentUserId) {
          const winner = payload.winnerId || payload.senderId;
          setSpeedRaceWinnerId(winner);
          setGameState((prev) => (prev.status === "won" ? prev : { ...prev, status: "lost" }));
          setOpponentGhost((prev) => ({
            ...prev,
            finished: true,
            score: payload.finalScore || prev.score,
            matches: gameState.board.cards.length / 2,
          }));
        }
      })
      .on("broadcast", { event: "QUICK_MESSAGE" }, ({ payload }) => {
        setActiveMessages((prev) => [...prev, payload]);
      })
      .on("broadcast", { event: "PING" }, ({ payload }) => {
        if (payload.senderId !== currentUserId && channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "PONG",
            payload: { timestamp: payload.timestamp, senderId: payload.senderId },
          });
        }
      })
      .on("broadcast", { event: "PONG" }, ({ payload }) => {
        if (payload.senderId === currentUserId) {
          const elapsed = Date.now() - payload.timestamp;
          setPingMs(Math.max(1, elapsed));
        }
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
  }, [room.id, currentUserId, userProfile.username, userProfile.avatarId, room.hostId, applyCardReveal, gameState.board.cards.length]);

  // Clean old messages after 4s
  useEffect(() => {
    if (activeMessages.length === 0) return;
    const timer = setTimeout(() => {
      const now = Date.now();
      setActiveMessages((prev) => prev.filter((r) => now - r.timestamp < 4000));
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeMessages]);

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
    activeMessages,
    sendQuickMessage,
    rematchRequestedBy,
    sendRematchRequest,
    presenceMap,
    pingMs,
    turnShotClock,
    coopElapsedTime,
    speedRaceWinnerId,
  };
}
