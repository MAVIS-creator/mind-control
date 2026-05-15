import type { BoardLayout, CardNode } from "./types";

const shuffle = <T,>(items: T[]) => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const createBoard = (
  symbols: string[],
  rows: number,
  columns: number,
): BoardLayout => {
  const totalCards = rows * columns;
  const pairCount = totalCards / 2;
  const selectedSymbols = symbols.slice(0, pairCount);

  const cards = shuffle(
    selectedSymbols.flatMap((symbol, pairIndex) => {
      const base = `${symbol}-${pairIndex}`;
      return [
        {
          id: `${base}-a`,
          symbol,
          matched: false,
          revealed: false,
        },
        {
          id: `${base}-b`,
          symbol,
          matched: false,
          revealed: false,
        },
      ] satisfies CardNode[];
    }),
  );

  return { rows, columns, cards };
};
