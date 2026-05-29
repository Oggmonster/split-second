import type { AttemptResult, DailyChallenge, DailyChallengeHistory, ScoreRecord } from "@shared/types";
import { db } from "./db";

export async function saveAttempt(challenge: DailyChallenge, result: AttemptResult) {
  const existingAttempts = await db.scores.where("date").equals(challenge.date).count();
  const score: ScoreRecord = {
    ...result.score,
    attemptNumber: existingAttempts + 1,
  };

  await db.transaction("rw", db.scores, db.replays, db.dailyChallenges, async () => {
    await db.scores.add(score);
    await db.replays.add(result.replay);
    const current = await db.dailyChallenges.get(challenge.date);
    const bestScore = bestScoreForEvent(challenge.event, current?.bestScore, score.score);
    const history: DailyChallengeHistory = {
      date: challenge.date,
      event: challenge.event,
      seed: challenge.seed,
      attemptsUsed: existingAttempts + 1,
      attemptsAllowed: challenge.attemptsAllowed,
      bestScore,
      completedAt: existingAttempts + 1 >= challenge.attemptsAllowed ? new Date().toISOString() : current?.completedAt,
    };
    await db.dailyChallenges.put(history);
  });

  return score;
}

export async function ensureDailyHistory(challenge: DailyChallenge) {
  const current = await db.dailyChallenges.get(challenge.date);
  if (current) return current;

  const history: DailyChallengeHistory = {
    date: challenge.date,
    event: challenge.event,
    seed: challenge.seed,
    attemptsUsed: 0,
    attemptsAllowed: challenge.attemptsAllowed,
  };
  await db.dailyChallenges.put(history);
  return history;
}

export async function getTodayScores(date: string) {
  return db.scores.where("date").equals(date).reverse().sortBy("createdAt");
}

export async function getTodayBest(date: string) {
  const scores = await db.scores.where("date").equals(date).toArray();
  return sortBestFirst(scores)[0];
}

export async function getPersonalBests() {
  const scores = await db.scores.toArray();
  return Object.values(
    scores.reduce<Record<string, ScoreRecord>>((best, score) => {
      const current = best[score.event];
      if (!current || isBetterScore(score.event, score.score, current.score)) {
        best[score.event] = score;
      }
      return best;
    }, {}),
  );
}

export async function getDailyHistory() {
  return db.dailyChallenges.orderBy("date").reverse().toArray();
}

function sortBestFirst(scores: ScoreRecord[]) {
  return scores.sort((left, right) => {
    if (left.event === "sprint" || right.event === "sprint") {
      return left.score - right.score;
    }

    return right.score - left.score;
  });
}

function bestScoreForEvent(event: ScoreRecord["event"], currentScore: number | undefined, nextScore: number) {
  if (currentScore === undefined) return nextScore;
  return isBetterScore(event, nextScore, currentScore) ? nextScore : currentScore;
}

function isBetterScore(event: ScoreRecord["event"], nextScore: number, currentScore: number) {
  return event === "sprint" ? nextScore < currentScore : nextScore > currentScore;
}
