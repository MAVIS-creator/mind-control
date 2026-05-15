import { describe, expect, it } from "vitest";
import { createBoard } from "./createBoard";

describe("createBoard", () => {
  it("creates a valid set of pairs for the requested board", () => {
    const board = createBoard(["A", "B", "C", "D"], 2, 4);
    expect(board.cards).toHaveLength(8);

    const counts = board.cards.reduce<Record<string, number>>((acc, card) => {
      acc[card.symbol] = (acc[card.symbol] ?? 0) + 1;
      return acc;
    }, {});

    expect(Object.values(counts)).toEqual([2, 2, 2, 2]);
  });
});
