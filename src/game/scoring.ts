import { CLASSIC_MODE_CONFIG } from "./config";
import type { ScoreBreakdown } from "./types";

export const comboMultiplierFor = (combo: number) => {
  if (combo <= 1) return 1;
  if (combo === 2) return 2;
  if (combo === 3) return 5;
  return 10;
};

export const calculateScoreBreakdown = ({
  matches,
  maxCombo,
  mistakes,
  accuracy,
  timeRemaining,
}: {
  matches: number;
  maxCombo: number;
  mistakes: number;
  accuracy: number;
  timeRemaining: number;
}): ScoreBreakdown => {
  const baseScore = matches * CLASSIC_MODE_CONFIG.baseMatchScore;
  const comboBonus = maxCombo * 75 * comboMultiplierFor(Math.max(1, maxCombo));
  const timeBonus = Math.max(0, Math.round(timeRemaining * CLASSIC_MODE_CONFIG.timeBonusMultiplier));
  const accuracyBonus = Math.round(accuracy * CLASSIC_MODE_CONFIG.accuracyBonusMultiplier);
  const mistakePenalty = mistakes * CLASSIC_MODE_CONFIG.mistakePenalty;
  const subtotal = baseScore + comboBonus + timeBonus + accuracyBonus - mistakePenalty;
  const finalScore = Math.max(
    0,
    Math.round(subtotal * CLASSIC_MODE_CONFIG.difficultyMultiplier),
  );

  return {
    baseScore,
    comboBonus,
    timeBonus,
    accuracyBonus,
    mistakePenalty,
    difficultyMultiplier: CLASSIC_MODE_CONFIG.difficultyMultiplier,
    finalScore,
  };
};
