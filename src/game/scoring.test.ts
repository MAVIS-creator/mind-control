import { describe, expect, it } from "vitest";
import { calculateScoreBreakdown, comboMultiplierFor } from "./scoring";

describe("scoring", () => {
  it("maps combos to escalating multipliers", () => {
    expect(comboMultiplierFor(1)).toBe(1);
    expect(comboMultiplierFor(2)).toBe(2);
    expect(comboMultiplierFor(3)).toBe(5);
    expect(comboMultiplierFor(5)).toBe(10);
  });

  it("produces a positive final score with bonuses and penalties", () => {
    const result = calculateScoreBreakdown({
      matches: 8,
      maxCombo: 4,
      mistakes: 2,
      accuracy: 88,
      timeRemaining: 16,
    });

    expect(result.finalScore).toBeGreaterThan(0);
    expect(result.baseScore).toBe(800);
    expect(result.mistakePenalty).toBe(70);
  });
});
