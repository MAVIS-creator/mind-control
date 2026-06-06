import { useEffect, useRef } from "react";
import type { GameEvent } from "./types";
import type { GamePreferences } from "../types";

const playTone = (
  context: AudioContext,
  tone: {
    frequency: number;
    duration: number;
    type: OscillatorType;
    gain: number;
  },
  volumeMultiplier: number,
) => {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = tone.type;
  oscillator.frequency.value = tone.frequency;
  volume.gain.setValueAtTime(0.0001, context.currentTime);
  volume.gain.exponentialRampToValueAtTime(tone.gain * volumeMultiplier, context.currentTime + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + tone.duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + tone.duration + 0.03);
};

type MusicNodes = {
  master: GainNode;
  padA: OscillatorNode;
  padB: OscillatorNode;
};

const stopMusic = (nodes: MusicNodes | null) => {
  if (!nodes) return;
  try {
    nodes.padA.stop();
    nodes.padB.stop();
  } catch {
    // Ignore double-stop during fast state changes.
  }
  nodes.master.disconnect();
};

export const useGameAudio = (events: GameEvent[], preferences: GamePreferences, status: "idle" | "running" | "won" | "lost" | "paused") => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const handledEventsRef = useRef<Set<number>>(new Set());
  const musicNodesRef = useRef<MusicNodes | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const AudioContextCtor =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor || audioContextRef.current) return;
    audioContextRef.current = new AudioContextCtor();
  }, []);

  useEffect(() => {
    const context = audioContextRef.current;
    if (!context) return;

    const volumeMultiplier = Math.max(0, Math.min(1, preferences.masterVolume / 100));
    const shouldPlayMusic = preferences.music && status === "running" && volumeMultiplier > 0;

    if (shouldPlayMusic && !musicNodesRef.current) {
      if (context.state === "suspended") {
        void context.resume();
      }

      const master = context.createGain();
      const padA = context.createOscillator();
      const padB = context.createOscillator();

      master.gain.value = 0.012 * volumeMultiplier;
      padA.type = "sine";
      padB.type = "triangle";
      padA.frequency.value = 174;
      padB.frequency.value = 261.63;
      padA.connect(master);
      padB.connect(master);
      master.connect(context.destination);
      padA.start();
      padB.start();
      musicNodesRef.current = { master, padA, padB };
    }

    if (musicNodesRef.current) {
      musicNodesRef.current.master.gain.value = shouldPlayMusic ? 0.012 * volumeMultiplier : 0.0001;
    }

    if (!shouldPlayMusic && musicNodesRef.current) {
      stopMusic(musicNodesRef.current);
      musicNodesRef.current = null;
    }
  }, [preferences.masterVolume, preferences.music, status]);

  useEffect(
    () => () => {
      stopMusic(musicNodesRef.current);
      musicNodesRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const context = audioContextRef.current;
    if (!context) return;
    const volumeMultiplier = Math.max(0, Math.min(1, preferences.masterVolume / 100));

    const freshEvents = events.filter((event) => !handledEventsRef.current.has(event.timestamp));
    for (const event of freshEvents) {
      handledEventsRef.current.add(event.timestamp);
      if (context.state === "suspended") {
        void context.resume();
      }

      if (preferences.haptics && typeof navigator !== "undefined" && "vibrate" in navigator) {
        if (event.type === "card_flipped") navigator.vibrate(10);
        if (event.type === "match_resolved") navigator.vibrate(Boolean(event.payload?.match) ? [16, 24, 16] : 24);
      }

      if (!preferences.soundEffects || volumeMultiplier <= 0) {
        continue;
      }

      if (event.type === "card_flipped") {
        playTone(context, { frequency: 470, duration: 0.08, type: "triangle", gain: 0.03 }, volumeMultiplier);
      }

      if (event.type === "match_resolved") {
        const matched = Boolean(event.payload?.match);
        if (matched) {
          playTone(context, { frequency: 560, duration: 0.12, type: "triangle", gain: 0.04 }, volumeMultiplier);
          playTone(context, { frequency: 760, duration: 0.16, type: "sine", gain: 0.025 }, volumeMultiplier);
        } else {
          playTone(context, { frequency: 220, duration: 0.16, type: "sawtooth", gain: 0.02 }, volumeMultiplier);
        }
      }

      if (event.type === "game_finished") {
        const won = Boolean(event.payload?.won);
        if (won) {
          playTone(context, { frequency: 680, duration: 0.14, type: "sine", gain: 0.03 }, volumeMultiplier);
          playTone(context, { frequency: 910, duration: 0.18, type: "triangle", gain: 0.025 }, volumeMultiplier);
        } else {
          playTone(context, { frequency: 180, duration: 0.22, type: "square", gain: 0.018 }, volumeMultiplier);
        }
      }
    }
  }, [events, preferences.haptics, preferences.masterVolume, preferences.soundEffects]);
};
