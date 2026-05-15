import Phaser from "phaser";
import type { GameSessionState } from "../types";

export class MindGridScene extends Phaser.Scene {
  private onReveal?: (cardId: string) => void;

  private latestState?: GameSessionState;

  constructor() {
    super("mindgrid-scene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#17345a");
  }

  bind(
    state: GameSessionState,
    onReveal: (cardId: string) => void,
  ) {
    this.latestState = state;
    this.onReveal = onReveal;
    this.renderBoard();
  }

  private renderBoard() {
    if (!this.latestState) return;

    this.children.removeAll();

    const { board, timerRemaining, combo, mismatches, theme } = this.latestState;
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .rectangle(width / 2, height / 2, width * 0.94, height * 0.92, 0xf7fbff, 0.92)
      .setStrokeStyle(2, 0xc8d8ea, 0.8);

    const margin = 24;
    const gap = board.columns >= 6 ? 10 : 16;
    const cardSize = Math.min(
      (width - margin * 2 - gap * (board.columns - 1)) / board.columns,
      (height - margin * 2 - gap * (board.rows - 1)) / board.rows,
      board.columns >= 6 ? 72 : 92,
    );
    const gridWidth = cardSize * board.columns + gap * (board.columns - 1);
    const gridHeight = cardSize * board.rows + gap * (board.rows - 1);
    const startX = (width - gridWidth) / 2 + cardSize / 2;
    const startY = (height - gridHeight) / 2 + cardSize / 2;

    const threat = timerRemaining < 18 ? 0.3 : timerRemaining < 32 ? 0.18 : 0.08;
    if (mismatches > 0 || threat > 0.15) {
      this.add
        .rectangle(width / 2, height / 2, width, height, 0xf59e0b, Math.min(0.05 + mismatches * 0.02 + threat, 0.16))
        .setBlendMode(Phaser.BlendModes.ADD);
    }

    board.cards.forEach((card, index) => {
      const row = Math.floor(index / board.columns);
      const column = index % board.columns;
      const x = startX + column * (cardSize + gap);
      const y = startY + row * (cardSize + gap);

      const revealed = card.revealed || card.matched;
      const fillColor = card.matched ? 0xf59e0b : revealed ? 0x304859 : 0xb9c6d3;
      const textColor = card.matched || revealed ? "#fcfcfc" : "#304859";

      const tile = this.add
        .circle(x, y, cardSize / 2, fillColor, 0.97)
        .setStrokeStyle(revealed ? 2 : 0, 0xffffff, 0.65)
        .setInteractive({ useHandCursor: !card.matched && !card.revealed });

      tile.on("pointerdown", () => {
        if (!card.matched && !card.revealed) {
          this.onReveal?.(card.id);
        }
      });

      this.add
        .text(x, y, revealed ? card.symbol : "◈", {
          fontFamily: "Orbitron",
          fontSize: `${cardSize >= 90 ? 28 : cardSize >= 76 ? 22 : 18}px`,
          color: revealed ? textColor : theme === "icons" ? "#304859" : "#1f3147",
        })
        .setOrigin(0.5);
    });

    if (combo >= 2) {
      this.add
        .text(width - 26, 24, `COMBO x${combo}`, {
          fontFamily: "Orbitron",
          fontSize: "18px",
          color: "#f59e0b",
        })
        .setOrigin(1, 0)
        .setAlpha(0.92);
    }
  }
}
