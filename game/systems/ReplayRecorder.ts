import type { DailyChallenge, ReplayRecord, TimingInput } from "@shared/types";

export function createReplay(
  challenge: DailyChallenge,
  score: number,
  inputs: TimingInput[],
  durationMs: number,
): ReplayRecord {
  return {
    date: challenge.date,
    event: challenge.event,
    seed: challenge.seed,
    score,
    inputs,
    durationMs,
    createdAt: new Date().toISOString(),
  };
}
