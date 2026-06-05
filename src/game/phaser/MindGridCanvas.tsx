import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { GameSessionState } from "../types";
import { MindGridScene } from "./MindGridScene";

type MindGridCanvasProps = {
  state: GameSessionState;
  onReveal: (cardId: string) => void;
};

export const MindGridCanvas = ({ state, onReveal }: MindGridCanvasProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<MindGridScene | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return undefined;

    const scene = new MindGridScene();
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 760,
      height: 560,
      parent: hostRef.current,
      transparent: true,
      backgroundColor: "transparent",
      scene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.bind(state, onReveal);
  }, [onReveal, state]);

  return (
    <div className="glass-panel relative min-h-[280px] overflow-hidden rounded-[2rem] border border-white/70 p-2 shadow-[0_18px_36px_rgba(53,37,205,0.06)] sm:min-h-[500px] sm:rounded-[2.2rem] sm:p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(100,168,254,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.1),_transparent_30%)]" />
      <div ref={hostRef} className="relative mx-auto aspect-square w-full max-w-[920px] sm:aspect-[16/10]" />
    </div>
  );
};
