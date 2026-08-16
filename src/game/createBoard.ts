import type { BoardLayout, CardNode } from "./types";

const createPRNG = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const shuffle = <T,>(items: T[], seed?: number) => {
  const next = [...items];
  const random = seed !== undefined ? createPRNG(seed) : Math.random;
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const createBoard = (
  symbols: string[],
  rows: number,
  columns: number,
  seed?: number,
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
    seed,
  );

  return { rows, columns, cards };
};

