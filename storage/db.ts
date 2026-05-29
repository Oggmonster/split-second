import Dexie, { type Table } from "dexie";
import type {
  DailyChallengeHistory,
  GameSettings,
  PlayerProfile,
  ReplayRecord,
  ScoreRecord,
} from "@shared/types";

export class SplitSecondDB extends Dexie {
  scores!: Table<ScoreRecord, number>;
  replays!: Table<ReplayRecord, number>;
  settings!: Table<GameSettings, string>;
  dailyChallenges!: Table<DailyChallengeHistory, string>;
  playerProfile!: Table<PlayerProfile, string>;

  constructor() {
    super("split-second");
    this.version(1).stores({
      scores: "++id, date, event, seed, score, createdAt",
      replays: "++id, date, event, seed, score, createdAt",
      settings: "id",
      dailyChallenges: "date, event, seed",
      playerProfile: "id",
    });
  }
}

export const db = new SplitSecondDB();
