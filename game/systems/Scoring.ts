import { MEDAL_SCORE } from "@shared/constants";
import type { DailyChallenge, Medal, TimingInput } from "@shared/types";

export function scoreAttempt(challenge: DailyChallenge, inputs: TimingInput[], durationMs: number) {
  const accuracy = accuracyForInputs(inputs);

  if (challenge.event === "sprint") {
    const timeMs = Math.round(durationMs);
    return {
      score: timeMs,
      accuracy,
      medal: medalForSprintTime(timeMs),
    };
  }

  const requiredInputs = challenge.event === "hurdles" ? 16 : 12;
  const completion = Math.min(1, inputs.length / requiredInputs);
  const normalizedAccuracy = accuracy / 100;
  const speedBonus = Math.max(0, 1 - Math.max(0, durationMs - 24000) / 21000);
  const windAdjustment = challenge.event === "long-jump" ? 1 + (challenge.config.wind ?? 0) * 0.012 : 1;
  const score = Math.round((6500 * normalizedAccuracy + 2500 * completion + 1000 * speedBonus) * windAdjustment);

  return {
    score: Math.max(0, Math.min(9999, score)),
    accuracy,
    medal: medalForScore(score),
  };
}

export function medalForScore(score: number): Medal {
  if (score >= MEDAL_SCORE.gold) return "gold";
  if (score >= MEDAL_SCORE.silver) return "silver";
  if (score >= MEDAL_SCORE.bronze) return "bronze";
  return "none";
}

export function formatScore(score?: number): string {
  return score === undefined ? "--" : score.toString().padStart(4, "0");
}

export function formatTime(timeMs?: number): string {
  if (timeMs === undefined) return "--";

  const seconds = Math.floor(timeMs / 1000);
  const milliseconds = Math.floor(timeMs % 1000);
  return `${seconds}.${milliseconds.toString().padStart(3, "0")}s`;
}

export function formatResult(score?: number, event?: DailyChallenge["event"]): string {
  if (event === "sprint") return formatTime(score);
  return formatScore(score);
}

function accuracyForInputs(inputs: TimingInput[]) {
  if (inputs.length === 0) return 0;

  const qualityTotal = inputs.reduce((sum, input) => sum + input.quality, 0);
  return Math.round((qualityTotal / inputs.length) * 1000) / 10;
}

function medalForSprintTime(timeMs: number): Medal {
  if (timeMs <= 10500) return "gold";
  if (timeMs <= 12000) return "silver";
  if (timeMs <= 14000) return "bronze";
  return "none";
}
