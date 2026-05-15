import { useEffect, useRef } from "react";
import type { GameEvent } from "./types";

const playTone = (
  context: AudioContext,
  tone: {
    frequency: number;
    duration: number;
    type: OscillatorType;
    gain: number;
  },
) => {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  oscillator.type = tone.type;
  oscillator.frequency.value = tone.frequency;
  volume.gain.setValueAtTime(0.0001, context.currentTime);
  volume.gain.exponentialRampToValueAtTime(tone.gain, context.currentTime + 0.01);
  volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + tone.duration);
  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + tone.duration + 0.03);
};

export const useGameAudio = (events: GameEvent[]) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const handledEventsRef = useRef<Set<number>>(new Set());

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

    const freshEvents = events.filter((event) => !handledEventsRef.current.has(event.timestamp));
    for (const event of freshEvents) {
      handledEventsRef.current.add(event.timestamp);
      if (context.state === "suspended") {
        void context.resume();
      }

      if (event.type === "card_flipped") {
        playTone(context, { frequency: 470, duration: 0.08, type: "triangle", gain: 0.03 });
      }

      if (event.type === "match_resolved") {
        const matched = Boolean(event.payload?.match);
        if (matched) {
          playTone(context, { frequency: 560, duration: 0.12, type: "triangle", gain: 0.04 });
          playTone(context, { frequency: 760, duration: 0.16, type: "sine", gain: 0.025 });
        } else {
          playTone(context, { frequency: 220, duration: 0.16, type: "sawtooth", gain: 0.02 });
        }
      }

      if (event.type === "game_finished") {
        const won = Boolean(event.payload?.won);
        if (won) {
          playTone(context, { frequency: 680, duration: 0.14, type: "sine", gain: 0.03 });
          playTone(context, { frequency: 910, duration: 0.18, type: "triangle", gain: 0.025 });
        } else {
          playTone(context, { frequency: 180, duration: 0.22, type: "square", gain: 0.018 });
        }
      }
    }
  }, [events]);
};
