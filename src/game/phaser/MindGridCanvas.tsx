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
    <div className="glass-panel relative min-h-[280px] overflow-hidden rounded-[2rem] p-2 sm:min-h-[380px] sm:p-5">
      <div ref={hostRef} className="mx-auto aspect-[1/1] w-full max-w-[760px] sm:aspect-[19/14]" />
    </div>
  );
};
