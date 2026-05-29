import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatResult } from "@game/systems/Scoring";
import { EVENTS } from "@shared/constants";
import type { DailyChallengeHistory } from "@shared/types";
import { getDailyHistory } from "@storage/scores";

export function meta() {
  return [{ title: "History | Split Second" }];
}

export default function History() {
  const [history, setHistory] = useState<DailyChallengeHistory[]>([]);

  useEffect(() => {
    getDailyHistory().then(setHistory);
  }, []);

  return (
    <main className="page narrow-page">
      <p className="eyebrow">Local calendar</p>
      <h2>Daily history</h2>
      <p>
        This is the v1 leaderboard: a local record of seeded challenges, attempts, personal bests,
        and medals stored in IndexedDB.
      </p>

      <div className="calendar-grid">
        {history.length === 0 ? (
          <article className="stat-card">
            <CalendarDays size={22} />
            <strong>No runs yet</strong>
            <p>Complete today’s event to start building your calendar.</p>
          </article>
        ) : history.map((day) => (
          <article className="stat-card" key={day.date}>
            <span className="metric-label">{day.date}</span>
            <strong>{EVENTS[day.event].label}</strong>
            <p>
              Best <span className="mono">{formatResult(day.bestScore, day.event)}</span> / Attempts{" "}
              <span className="mono">{day.attemptsUsed}/{day.attemptsAllowed}</span>
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
