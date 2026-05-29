export type EventType = "sprint" | "hurdles" | "long-jump";
export type Difficulty = "easy" | "normal" | "hard";

export type DailyChallenge = {
  date: string;
  event: EventType;
  seed: string;
  attemptsAllowed: number;
  config: {
    wind?: number;
    rhythmBpm?: number;
    timingWindowMs?: number;
    difficulty: Difficulty;
  };
};

export type TimingInput = {
  atMs: number;
  offsetMs: number;
  quality: number;
  kind: "stride" | "jump" | "takeoff";
};

export type ScoreRecord = {
  id?: number;
  date: string;
  event: EventType;
  seed: string;
  score: number;
  timeMs: number;
  accuracy: number;
  medal: Medal;
  attemptNumber: number;
  createdAt: string;
};

export type ReplayRecord = {
  id?: number;
  date: string;
  event: EventType;
  seed: string;
  score: number;
  inputs: TimingInput[];
  durationMs: number;
  createdAt: string;
};

export type PlayerProfile = {
  id: "local";
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export type GameSettings = {
  id: "settings";
  soundEnabled: boolean;
  ghostEnabled: boolean;
  reducedMotion: boolean;
};

export type DailyChallengeHistory = {
  date: string;
  event: EventType;
  seed: string;
  attemptsUsed: number;
  attemptsAllowed: number;
  bestScore?: number;
  completedAt?: string;
};

export type Medal = "none" | "bronze" | "silver" | "gold";

export type AttemptResult = {
  score: ScoreRecord;
  replay: ReplayRecord;
};
