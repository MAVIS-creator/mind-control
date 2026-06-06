import { describe, expect, it } from "vitest";
import { calculateRunXp, getLevelFromXp, getLevelProgress, getXpRequiredForLevel } from "./utils";

describe("progression helpers", () => {
  it("scales level thresholds gradually", () => {
    expect(getXpRequiredForLevel(1)).toBe(0);
    expect(getXpRequiredForLevel(2)).toBe(220);
    expect(getXpRequiredForLevel(5)).toBe(1720);
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(219)).toBe(1);
    expect(getLevelFromXp(220)).toBe(2);
    expect(getLevelFromXp(1719)).toBe(4);
    expect(getLevelFromXp(1720)).toBe(5);
  });

  it("awards smaller per-run xp and computes bounded progress", () => {
    expect(
      calculateRunXp({
        score: 12450,
        accuracy: 82,
        maxCombo: 5,
      }),
    ).toBeLessThan(100);

    const progress = getLevelProgress(300);
    expect(progress.level).toBe(2);
    expect(progress.progress).toBeGreaterThan(0);
    expect(progress.progress).toBeLessThanOrEqual(100);
  });
});
