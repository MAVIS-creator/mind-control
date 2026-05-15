import type { ScoreBreakdown } from "./types";

export const comboMultiplierFor = (combo: number) => {
  if (combo <= 1) return 1;
  if (combo === 2) return 2;
  if (combo === 3) return 5;
  return 10;
};

export const calculateScoreBreakdown = ({
  config,
  matches,
  maxCombo,
  mistakes,
  accuracy,
  timeRemaining,
}: {
  config: {
    baseMatchScore: number;
    timeBonusMultiplier: number;
    accuracyBonusMultiplier: number;
    mistakePenalty: number;
    difficultyMultiplier: number;
  };
  matches: number;
  maxCombo: number;
  mistakes: number;
  accuracy: number;
  timeRemaining: number;
}): ScoreBreakdown => {
  const baseScore = matches * config.baseMatchScore;
  const comboBonus = maxCombo * 75 * comboMultiplierFor(Math.max(1, maxCombo));
  const timeBonus = Math.max(0, Math.round(timeRemaining * config.timeBonusMultiplier));
  const accuracyBonus = Math.round(accuracy * config.accuracyBonusMultiplier);
  const mistakePenalty = mistakes * config.mistakePenalty;
  const subtotal = baseScore + comboBonus + timeBonus + accuracyBonus - mistakePenalty;
  const finalScore = Math.max(
    0,
    Math.round(subtotal * config.difficultyMultiplier),
  );

  return {
    baseScore,
    comboBonus,
    timeBonus,
    accuracyBonus,
    mistakePenalty,
    difficultyMultiplier: config.difficultyMultiplier,
    finalScore,
  };
};
