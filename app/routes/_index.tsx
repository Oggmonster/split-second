import { Activity, CalendarDays, Medal, Play } from "lucide-react";
import { Link } from "react-router";
import { createDailyChallenge } from "@game/systems/DailyChallenge";
import { EVENTS } from "@shared/constants";

export function meta() {
  return [
    { title: "Split Second" },
    { name: "description", content: "A daily timing-based track and field web game." },
  ];
}

export default function Index() {
  const challenge = createDailyChallenge();
  const event = EVENTS[challenge.event];

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Daily timing challenge</p>
          <h1>Split Second</h1>
          <p className="hero-copy">
            One seeded event per day, a handful of attempts, and a ghost of your best run waiting
            just ahead. The MVP is local, fast, and built around that immediate feeling that the
            next attempt can be cleaner.
          </p>
          <div className="actions">
            <Link className="button" to="/play">
              <Play size={18} /> Run today
            </Link>
            <Link className="button secondary" to="/history">
              <CalendarDays size={18} /> Daily history
            </Link>
          </div>
        </div>
        <div className="track-preview" aria-label="Stylized track preview">
          <div className="stadium-sky">
            <span className="score-chip">
              <Activity size={16} />
              {event.label} / {challenge.config.rhythmBpm} BPM
            </span>
          </div>
          <div className="preview-lanes">
            <span style={{ "--lane": 0 } as React.CSSProperties} />
            <span style={{ "--lane": 1 } as React.CSSProperties} />
            <span style={{ "--lane": 2 } as React.CSSProperties} />
            <span style={{ "--lane": 3 } as React.CSSProperties} />
            <span style={{ "--lane": 4 } as React.CSSProperties} />
          </div>
        </div>
      </section>

      <section className="calendar-grid" aria-label="MVP loop">
        <article className="stat-card">
          <Medal size={22} />
          <strong>Local PBs</strong>
          <p>Scores, medals, and attempts stay in IndexedDB for quick iteration.</p>
        </article>
        <article className="stat-card">
          <Activity size={22} />
          <strong>Ghost Replay</strong>
          <p>Your best replay becomes the opponent for the next run.</p>
        </article>
        <article className="stat-card">
          <CalendarDays size={22} />
          <strong>Daily Seed</strong>
          <p>Every calendar date resolves to the same event and timing config.</p>
        </article>
      </section>
    </main>
  );
}
