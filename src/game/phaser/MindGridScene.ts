import Phaser from "phaser";
import type { GameSessionState } from "../types";

export class MindGridScene extends Phaser.Scene {
  private onReveal?: (cardId: string) => void;

  private latestState?: GameSessionState;

  constructor() {
    super("mindgrid-scene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#050816");
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

    const { board, timerRemaining, combo, mismatches } = this.latestState;
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .rectangle(width / 2, height / 2, width * 0.88, height * 0.88, 0x081124, 0.92)
      .setStrokeStyle(2, 0x66f6ff, 0.18);

    const margin = 24;
    const gap = 12;
    const cardWidth = Math.min((width - margin * 2 - gap * (board.columns - 1)) / board.columns, 112);
    const cardHeight = Math.min((height - margin * 2 - gap * (board.rows - 1)) / board.rows, 112);
    const gridWidth = cardWidth * board.columns + gap * (board.columns - 1);
    const gridHeight = cardHeight * board.rows + gap * (board.rows - 1);
    const startX = (width - gridWidth) / 2 + cardWidth / 2;
    const startY = (height - gridHeight) / 2 + cardHeight / 2;

    const threat = timerRemaining < 18 ? 0.3 : timerRemaining < 32 ? 0.18 : 0.08;
    if (mismatches > 0 || threat > 0.15) {
      this.add
        .rectangle(width / 2, height / 2, width, height, 0xff1ca8, Math.min(0.12 + mismatches * 0.02 + threat, 0.22))
        .setBlendMode(Phaser.BlendModes.ADD);
    }

    board.cards.forEach((card, index) => {
      const row = Math.floor(index / board.columns);
      const column = index % board.columns;
      const x = startX + column * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      const revealed = card.revealed || card.matched;
      const fillColor = card.matched ? 0x1fe39f : revealed ? 0x142647 : 0x0b1224;
      const borderColor = card.matched ? 0x6cf7ff : revealed ? 0xc35fff : 0x5a66ff;
      const alpha = card.matched ? 0.94 : 0.88;

      const tile = this.add
        .rectangle(x, y, cardWidth, cardHeight, fillColor, alpha)
        .setStrokeStyle(2, borderColor, revealed ? 0.95 : 0.55)
        .setInteractive({ useHandCursor: !card.matched && !card.revealed });

      tile.on("pointerdown", () => {
        if (!card.matched && !card.revealed) {
          this.onReveal?.(card.id);
        }
      });

      this.add
        .text(x, y, revealed ? card.symbol : "◈", {
          fontFamily: "Orbitron",
          fontSize: `${revealed ? 34 : 28}px`,
          color: revealed ? "#f6fbff" : "#7f90d6",
        })
        .setOrigin(0.5);
    });

    if (combo >= 2) {
      this.add
        .text(width - 26, 24, `COMBO x${combo}`, {
          fontFamily: "Orbitron",
          fontSize: "18px",
          color: "#6cf7ff",
        })
        .setOrigin(1, 0)
        .setAlpha(0.92);
    }
  }
}
