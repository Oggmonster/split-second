import { db } from "./db";

export async function getBestReplay(date: string) {
  const replays = await db.replays.where("date").equals(date).toArray();
  return replays.sort((left, right) => {
    if (left.event === "sprint" || right.event === "sprint") {
      return left.score - right.score;
    }

    return right.score - left.score;
  })[0];
}
