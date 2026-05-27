import Phaser from "phaser";
import type { GameSessionState } from "../types";

export class MindGridScene extends Phaser.Scene {
  private onReveal?: (cardId: string) => void;

  private latestState?: GameSessionState;

  private isReady = false;
  private revealState = new Map<string, boolean>();

  constructor() {
    super("mindgrid-scene");
  }

  create() {
    this.isReady = true;
    this.cameras.main.setBackgroundColor("#eef3ff");
    this.renderBoard();
  }

  bind(
    state: GameSessionState,
    onReveal: (cardId: string) => void,
  ) {
    this.latestState = state;
    this.onReveal = onReveal;

    if (!this.isReady) {
      return;
    }

    this.renderBoard();
  }

  private renderBoard() {
    if (!this.latestState || !this.isReady || !this.children) return;

    this.children.removeAll();

    const { board, timerRemaining, combo, mismatches } = this.latestState;
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.rectangle(width / 2, height / 2, width * 0.96, height * 0.94, 0xf5f7ff, 0.94);

    const frame = this.add.graphics();
    frame.lineStyle(2, 0xe3e8f7, 0.95);
    frame.fillStyle(0xf9fbff, 0.86);
    frame.fillRoundedRect(width * 0.04, height * 0.05, width * 0.92, height * 0.9, 28);
    frame.strokeRoundedRect(width * 0.04, height * 0.05, width * 0.92, height * 0.9, 28);

    const margin = 24;
    const gap = board.columns >= 6 ? 12 : 18;
    const cardSize = Math.min(
      (width - margin * 2 - gap * (board.columns - 1)) / board.columns,
      (height - margin * 2 - gap * (board.rows - 1)) / board.rows,
      board.columns >= 6 ? 88 : 110,
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
      const fillColor = card.matched ? 0x3d32da : revealed ? 0x4f46e5 : 0xffffff;
      const textColor = card.matched || revealed ? "#fcfcfc" : "#c5c3f5";

      const tile = this.add
        .rectangle(x, y, cardSize, cardSize, fillColor, 0.98)
        .setStrokeStyle(revealed ? 2 : 2, revealed ? 0xd9dff8 : 0xe4e8f5, 0.96)
        .setInteractive({ useHandCursor: !card.matched && !card.revealed });

      tile.on("pointerdown", () => {
        if (!card.matched && !card.revealed) {
          this.onReveal?.(card.id);
        }
      });

      if (!revealed) {
        const iconGap = Math.max(cardSize * 0.09, 6);
        const iconSize = Math.max(cardSize * 0.12, 9);
        const offset = iconSize / 2 + iconGap / 2;
        const icon = this.add.graphics();
        icon.lineStyle(2.2, 0xd2cff7, 1);
        [
          [-offset, -offset],
          [offset, -offset],
          [-offset, offset],
          [offset, offset],
        ].forEach(([dx, dy]) => {
          icon.strokeRoundedRect(x + dx - iconSize / 2, y + dy - iconSize / 2, iconSize, iconSize, 3);
        });
      }

      if (revealed) {
        const symbolText = this.add
          .text(x, y, card.symbol, {
            fontFamily: "Inter",
            fontSize: `${cardSize >= 102 ? 34 : cardSize >= 88 ? 28 : 22}px`,
            color: textColor,
            fontStyle: card.matched ? "700" : "600",
          })
          .setOrigin(0.5);

        const wasRevealed = this.revealState.get(card.id) ?? false;
        if (!wasRevealed) {
          tile.setScale(1, 1);
          symbolText.setScale(0.1, 1);
          this.tweens.add({
            targets: tile,
            scaleX: { from: 0.05, to: 1 },
            duration: 160,
            ease: "Sine.easeInOut",
          });
          this.tweens.add({
            targets: symbolText,
            scaleX: { from: 0.05, to: 1 },
            duration: 190,
            ease: "Back.easeOut",
          });
        }
      }
      this.revealState.set(card.id, revealed);
    });

    if (combo >= 2) {
      this.add
        .text(width - 26, 24, `COMBO x${combo}`, {
          fontFamily: "Inter",
          fontSize: "18px",
          color: "#f59e0b",
        })
        .setOrigin(1, 0)
        .setAlpha(0.92);
    }
  }
}
