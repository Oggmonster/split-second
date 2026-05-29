import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { createDailyChallenge } from "@game/systems/DailyChallenge";
import { createPhaserGame, type SplitSecondGame } from "@game/PhaserGame";
import { formatResult } from "@game/systems/Scoring";
import { EVENTS } from "@shared/constants";
import type { AttemptResult, DailyChallengeHistory, ScoreRecord } from "@shared/types";
import { ensureDailyHistory, getPersonalBests, getTodayBest, getTodayScores, saveAttempt } from "@storage/scores";
import { getBestReplay } from "@storage/replays";
import { getSettings } from "@storage/settings";

export function meta() {
  return [{ title: "Play | Split Second" }];
}

export default function Play() {
  const challenge = useMemo(() => createDailyChallenge(), []);
  const event = EVENTS[challenge.event];
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<SplitSecondGame | null>(null);
  const [attempts, setAttempts] = useState<ScoreRecord[]>([]);
  const [best, setBest] = useState<ScoreRecord | undefined>();
  const [history, setHistory] = useState<DailyChallengeHistory | undefined>();
  const [personalBests, setPersonalBests] = useState<ScoreRecord[]>([]);
  const [runKey, setRunKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      const [savedHistory, todayScores, todayBest, eventBests] = await Promise.all([
        ensureDailyHistory(challenge),
        getTodayScores(challenge.date),
        getTodayBest(challenge.date),
        getPersonalBests(),
      ]);
      if (!mounted) return;
      setHistory(savedHistory);
      setAttempts(todayScores);
      setBest(todayBest);
      setPersonalBests(eventBests);
    }

    loadStats();
    return () => {
      mounted = false;
    };
  }, [challenge]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;

    async function startGame() {
      const settings = await getSettings();
      const ghost = settings.ghostEnabled ? await getBestReplay(challenge.date) : undefined;
      if (!active || !container) return;
      gameRef.current?.destroy(true);
      gameRef.current = await createPhaserGame(container, challenge, ghost);
    }

    startGame();

    return () => {
      active = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      container.innerHTML = "";
    };
  }, [challenge, runKey]);

  useEffect(() => {
    async function onFinished(event: Event) {
      const detail = (event as CustomEvent<AttemptResult>).detail;
      setIsSaving(true);
      const saved = await saveAttempt(challenge, detail);
      const [savedHistory, todayScores, todayBest, eventBests] = await Promise.all([
        ensureDailyHistory(challenge),
        getTodayScores(challenge.date),
        getTodayBest(challenge.date),
        getPersonalBests(),
      ]);
      setAttempts(todayScores);
      setBest(todayBest);
      setHistory(savedHistory);
      setPersonalBests(eventBests);
      setIsSaving(false);
      if (saved.attemptNumber < challenge.attemptsAllowed) {
        window.setTimeout(() => setRunKey((key) => key + 1), 1400);
      }
    }

    window.addEventListener("split-second:attempt-finished", onFinished);
    return () => window.removeEventListener("split-second:attempt-finished", onFinished);
  }, [challenge]);

  const attemptsUsed = history?.attemptsUsed ?? attempts.length;
  const attemptsLeft = Math.max(0, challenge.attemptsAllowed - attemptsUsed);
  const resultLabel = challenge.event === "sprint" ? "Best time" : "Best score";

  return (
    <main className="page">
      <div className="dashboard-grid">
        <section className="game-panel">
          <div className="game-header">
            <div>
              <h2>{event.label}</h2>
              <div className="meta-line">
                {challenge.date} / {challenge.config.difficulty} / {challenge.config.rhythmBpm} BPM
                {challenge.config.wind ? ` / wind ${challenge.config.wind} m/s` : ""}
              </div>
            </div>
            <button
              className="button secondary"
              type="button"
              disabled={attemptsLeft <= 0 || isSaving}
              onClick={() => setRunKey((key) => key + 1)}
              title="Restart current attempt"
            >
              <RotateCcw size={17} /> Restart
            </button>
          </div>
          <div ref={containerRef} className="game-container" />
        </section>

        <aside className="side-panel">
          <section className="panel-section">
            <h3>Today</h3>
            <div className="metrics">
              <div>
                <div className="metric-label">{resultLabel}</div>
                <div className="metric-value">{formatResult(best?.score, challenge.event)}</div>
              </div>
              <div>
                <div className="metric-label">Attempts left</div>
                <div className="metric-value">{attemptsLeft}</div>
              </div>
              <div>
                <div className="metric-label">Medal</div>
                <div className="metric-value">{best?.medal ?? "none"}</div>
              </div>
              <div>
                <div className="metric-label">Accuracy</div>
                <div className="metric-value">{best ? `${best.accuracy}%` : "--"}</div>
              </div>
            </div>
          </section>

          <section className="panel-section">
            <h3>Attempts</h3>
            <ul className="attempt-list">
              {attempts.length === 0 ? (
                <li><span>No attempts yet</span><span className="mono">--</span></li>
              ) : attempts.map((attempt) => (
                <li key={attempt.id ?? attempt.createdAt}>
                  <span>Attempt {attempt.attemptNumber}</span>
                  <span className="mono">{formatResult(attempt.score, attempt.event)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel-section">
            <h3><Trophy size={17} /> Personal bests</h3>
            <ul className="event-list">
              {personalBests.length === 0 ? (
                <li><span>Run an event</span><span className="mono">--</span></li>
              ) : personalBests.map((record) => (
                <li key={record.event}>
                  <span>{EVENTS[record.event].shortLabel}</span>
                  <span className="mono">{formatResult(record.score, record.event)}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
