import type { DailyChallenge, Difficulty, EventType } from "@shared/types";

const events: EventType[] = ["sprint", "hurdles", "long-jump"];
const difficulties: Difficulty[] = ["easy", "normal", "hard"];

export function getTodayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createDailyChallenge(date = getTodayKey()): DailyChallenge {
  const seed = `split-second:${date}`;
  const random = mulberry32(hashString(seed));
  const event = events[Math.floor(random() * events.length)];
  const difficulty = difficulties[Math.floor(random() * difficulties.length)];
  const attemptsAllowed = difficulty === "hard" ? 5 : 4;
  const baseBpm = event === "sprint" ? 176 : event === "hurdles" ? 164 : 150;
  const windowByDifficulty: Record<Difficulty, number> = {
    easy: 150,
    normal: 118,
    hard: 92,
  };

  return {
    date,
    event,
    seed,
    attemptsAllowed,
    config: {
      wind: event === "long-jump" ? Number(((random() - 0.5) * 4).toFixed(1)) : undefined,
      rhythmBpm: Math.round(baseBpm + random() * 16 - 8),
      timingWindowMs: windowByDifficulty[difficulty],
      difficulty,
    },
  };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
