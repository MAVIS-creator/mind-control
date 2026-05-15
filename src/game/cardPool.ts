import type { GameTheme } from "../types";

const NUMBER_SYMBOLS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
];

const ICON_SYMBOLS = [
  "★",
  "♠",
  "♣",
  "♥",
  "☀",
  "☁",
  "☕",
  "⚽",
  "♫",
  "✈",
  "⌛",
  "⚡",
  "☘",
  "✿",
  "❄",
  "⚓",
  "☂",
  "☎",
];

export const getCardSymbols = (theme: GameTheme) =>
  theme === "icons" ? ICON_SYMBOLS : NUMBER_SYMBOLS;
