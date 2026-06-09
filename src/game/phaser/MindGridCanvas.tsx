import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import type { GameSessionState } from "../types";
import { MindGridScene } from "./MindGridScene";

type MindGridCanvasProps = {
  state: GameSessionState;
  onReveal: (cardId: string) => void;
};

export const MindGridCanvas = ({ state, onReveal }: MindGridCanvasProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<MindGridScene | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 760, height: 560 });
  const { rows, columns } = state.board;

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;

    const update = () => {
      const nextWidth = Math.max(260, Math.floor(node.clientWidth - 2));
      const availableHeight = Math.max(280, Math.floor(node.clientHeight - 2));
      const compact = nextWidth < 420;
      const ratio = Math.max(rows / columns, 0.84);
      const widthBasedHeight = compact
        ? Math.max(320, Math.round(nextWidth * Math.max(ratio + 0.06, 1)))
        : Math.max(420, Math.round(nextWidth * Math.min(0.76, ratio + 0.08)));
      const nextHeight = Math.min(widthBasedHeight, availableHeight);

      setCanvasSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : { width: nextWidth, height: nextHeight },
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [columns, rows]);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return undefined;

    const scene = new MindGridScene();
    sceneRef.current = scene;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: canvasSize.width,
      height: canvasSize.height,
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
  }, [canvasSize.height, canvasSize.width]);

  useEffect(() => {
    if (!gameRef.current) return;
    gameRef.current.scale.resize(canvasSize.width, canvasSize.height);
    sceneRef.current?.bind(state, onReveal);
  }, [canvasSize.height, canvasSize.width, onReveal, state]);

  useEffect(() => {
    sceneRef.current?.bind(state, onReveal);
  }, [onReveal, state]);

  return (
    <div
      ref={containerRef}
      className="glass-panel relative flex h-full min-h-[320px] min-w-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/70 p-2 shadow-[0_18px_36px_rgba(53,37,205,0.06)] sm:min-h-[420px] sm:rounded-[2.2rem] sm:p-4 lg:p-5"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(100,168,254,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.1),_transparent_30%)]" />
      <div
        ref={hostRef}
        className="relative mx-auto min-w-0 max-w-full overflow-hidden"
        style={{
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          maxWidth: "100%",
        }}
      />
    </div>
  );
};
