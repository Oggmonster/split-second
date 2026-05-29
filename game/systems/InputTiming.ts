import type { DailyChallenge, TimingInput } from "@shared/types";

export function expectedBeatMs(challenge: DailyChallenge): number {
  return 60000 / (challenge.config.rhythmBpm ?? 160);
}

export function judgeInput(
  challenge: DailyChallenge,
  atMs: number,
  inputIndex: number,
): Omit<TimingInput, "kind"> {
  const beat = expectedBeatMs(challenge);
  const target = 900 + inputIndex * beat;
  const offsetMs = atMs - target;
  const windowMs = challenge.config.timingWindowMs ?? 120;
  const quality = Math.max(0, 1 - Math.abs(offsetMs) / windowMs);

  return {
    atMs: Math.round(atMs),
    offsetMs: Math.round(offsetMs),
    quality: Math.round(quality * 1000) / 1000,
  };
}
