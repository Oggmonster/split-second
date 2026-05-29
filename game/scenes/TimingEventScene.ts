import Phaser from "phaser";
import { EVENTS } from "@shared/constants";
import type { DailyChallenge, ReplayRecord, TimingInput } from "@shared/types";
import { judgeInput } from "@game/systems/InputTiming";
import { PHYSICS_CONFIG } from "@game/systems/PhysicsConfig";
import { createReplay } from "@game/systems/ReplayRecorder";
import { formatTime, scoreAttempt } from "@game/systems/Scoring";

type SceneData = {
  challenge: DailyChallenge;
  ghost?: ReplayRecord;
};

export abstract class TimingEventScene extends Phaser.Scene {
  protected challenge!: DailyChallenge;
  protected ghost?: ReplayRecord;
  private runner!: Phaser.GameObjects.Rectangle;
  private ghostRunner?: Phaser.GameObjects.Rectangle;
  private prompt!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private meterMarker!: Phaser.GameObjects.Rectangle;
  private meterTrack!: Phaser.GameObjects.Rectangle;
  private distanceText!: Phaser.GameObjects.Text;
  private distanceMarks: Array<{ distance: number; line: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text }> = [];
  private startMs = 0;
  private distance = 0;
  private speed = 6.8;
  private meterPosition = 0.5;
  private meterDirection = 1;
  private meterSpeed = 0.72;
  private inputs: TimingInput[] = [];
  private finished = false;
  private eventLengthMs = 30000;

  init(data: SceneData) {
    this.challenge = data.challenge;
    this.ghost = data.ghost;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.distanceMarks = [];
    this.distance = 0;
    this.speed = 6.8;
    this.meterPosition = 0.5;
    this.meterDirection = 1;
    this.meterSpeed = 0.72;
    this.inputs = [];
    this.finished = false;
    this.cameras.main.setBackgroundColor("#101812");
    this.drawVenue(width, height);

    this.runner = this.add.rectangle(width * 0.28, height * 0.66, 38, 16, 0xb8e044).setOrigin(0.5);
    if (this.ghost) {
      this.ghostRunner = this.add.rectangle(width * 0.28, height * 0.75, 30, 12, 0x51c9bd, 0.45).setOrigin(0.5);
    }

    this.add.text(24, 22, EVENTS[this.challenge.event].label, {
      color: "#f3f0e7",
      fontFamily: "Inter",
      fontSize: "26px",
      fontStyle: "800",
    });
    this.add.text(24, 55, this.subtitle(), {
      color: "#b8b3a7",
      fontFamily: "JetBrains Mono",
      fontSize: "14px",
    });

    this.prompt = this.add.text(width / 2, height - 96, this.initialPrompt(), {
      color: "#f3f0e7",
      fontFamily: "Inter",
      fontSize: "18px",
      fontStyle: "700",
    }).setOrigin(0.5);

    this.scoreText = this.add.text(width - 24, 24, this.challenge.event === "sprint" ? "0.000s" : "0000", {
      color: "#f0b95a",
      fontFamily: "JetBrains Mono",
      fontSize: "26px",
      fontStyle: "700",
    }).setOrigin(1, 0);

    this.distanceText = this.add.text(width - 24, 57, "0.0m / 100m", {
      color: "#b8b3a7",
      fontFamily: "JetBrains Mono",
      fontSize: "14px",
    }).setOrigin(1, 0);

    this.createMeter(width, height);
    this.input.keyboard?.on("keydown-SPACE", () => this.recordInput());
    this.input.on("pointerdown", () => this.recordInput());
    this.startMs = this.time.now;
  }

  update(time: number, delta: number) {
    if (this.finished) return;

    const elapsed = time - this.startMs;
    this.updateMeter(delta);

    if (this.challenge.event === "sprint") {
      this.speed = Math.max(4.7, Math.min(12.8, this.speed - 0.004 * (delta / 16.67)));
      this.distance += (this.speed * delta) / 1000;
    } else {
      const physics = PHYSICS_CONFIG[this.challenge.event];
      const lastQuality = this.inputs.at(-1)?.quality ?? 0.4;
      this.speed = Math.min(physics.topSpeed / 35, this.speed + (physics.acceleration / 35) * lastQuality);
      this.speed *= physics.drag;
      this.distance += (this.speed * delta) / 1000;
    }

    const progress = Math.min(1, this.distance / 100);
    this.updateDistanceMarks();
    this.runner.y = this.scale.height * 0.66 + Math.sin(elapsed / 90) * 4;

    if (this.ghostRunner && this.ghost) {
      const ghostProgress = Math.min(1, elapsed / this.ghost.durationMs);
      this.ghostRunner.x = this.scale.width * 0.28 + (ghostProgress - progress) * (this.scale.width * 0.62);
    }

    const live = scoreAttempt(this.challenge, this.inputs, elapsed);
    this.scoreText.setText(this.challenge.event === "sprint" ? formatTime(elapsed) : live.score.toString().padStart(4, "0"));
    this.distanceText.setText(`${Math.min(100, this.distance).toFixed(1)}m / 100m`);

    if (progress >= 1 || elapsed >= this.eventLengthMs) {
      this.finish(elapsed);
    }
  }

  protected recordInput(kind: TimingInput["kind"] = "stride") {
    if (this.finished) return;

    const elapsed = this.time.now - this.startMs;
    const judged = this.challenge.event === "sprint"
      ? this.judgeMeterInput(elapsed)
      : judgeInput(this.challenge, elapsed, this.inputs.length);
    const input = { ...judged, kind };
    this.inputs.push(input);

    this.applyInputEffect(input.quality);
    const color = input.quality > 0.82 ? "#b8e044" : input.quality > 0.45 ? "#f0b95a" : "#ea6b57";
    this.prompt.setText(input.quality > 0.82 ? "Sweet spot: accelerate" : input.quality > 0.45 ? "Hold pace" : "Poor timing: losing speed");
    this.prompt.setColor(color);
    this.tweens.add({
      targets: this.runner,
      scaleX: 1.35,
      duration: 80,
      yoyo: true,
    });
  }

  private finish(durationMs: number) {
    this.finished = true;
    const result = scoreAttempt(this.challenge, this.inputs, durationMs);
    const replay = createReplay(this.challenge, result.score, this.inputs, Math.round(durationMs));
    window.dispatchEvent(new CustomEvent("split-second:attempt-finished", {
      detail: {
        score: {
          date: this.challenge.date,
          event: this.challenge.event,
          seed: this.challenge.seed,
          score: result.score,
          timeMs: Math.round(durationMs),
          accuracy: result.accuracy,
          medal: result.medal,
          attemptNumber: 0,
          createdAt: new Date().toISOString(),
        },
        replay,
      },
    }));

    this.prompt.setText(`Finished: ${result.score.toString().padStart(4, "0")} (${result.medal})`);
    if (this.challenge.event === "sprint") {
      this.prompt.setText(`Finished: ${formatTime(result.score)} (${result.medal})`);
    }
    this.prompt.setColor("#f3f0e7");
  }

  private drawVenue(width: number, height: number) {
    this.add.rectangle(width / 2, height * 0.28, width, height * 0.56, 0x255549);
    this.add.rectangle(width / 2, height * 0.7, width, height * 0.42, 0xb35a36);

    for (let lane = 0; lane < 5; lane += 1) {
      const y = height * 0.54 + lane * 46;
      this.add.line(width / 2, y, 0, 0, width, 0, 0xf3f0e7, 0.32).setLineWidth(2);
    }

    for (let mark = 10; mark <= 100; mark += 10) {
      const line = this.add.rectangle(width + mark * 8, height * 0.66, mark === 100 ? 8 : 3, 180, 0xf3f0e7, mark === 100 ? 0.86 : 0.42);
      const label = this.add.text(width + mark * 8 + 8, height * 0.51, mark === 100 ? "FINISH" : `${mark}m`, {
        color: "#f3f0e7",
        fontFamily: "JetBrains Mono",
        fontSize: mark === 100 ? "16px" : "12px",
        fontStyle: mark === 100 ? "700" : "500",
      });
      this.distanceMarks.push({ distance: mark, line, label });
    }

    if (this.challenge.event === "hurdles") {
      for (let index = 0; index < 6; index += 1) {
        this.add.rectangle(220 + index * 105, height * 0.62, 10, 46, 0xf3f0e7, 0.72);
      }
    }

    if (this.challenge.event === "long-jump") {
      this.add.rectangle(width - 160, height * 0.65, 10, 132, 0xf3f0e7, 0.85);
      this.add.rectangle(width - 80, height * 0.68, 120, 88, 0xf0b95a, 0.42);
    }
  }

  private createMeter(width: number, height: number) {
    const y = height - 42;
    const trackWidth = Math.min(560, width - 96);
    const x = width / 2;

    this.meterTrack = this.add.rectangle(x, y, trackWidth, 18, 0x2f332c).setOrigin(0.5);
    this.add.rectangle(x, y, trackWidth * 0.24, 18, 0xea6b57).setOrigin(0.5);
    this.add.rectangle(x - trackWidth * 0.29, y, trackWidth * 0.18, 18, 0xf0b95a).setOrigin(0.5);
    this.add.rectangle(x + trackWidth * 0.29, y, trackWidth * 0.18, 18, 0xf0b95a).setOrigin(0.5);
    this.add.rectangle(x - trackWidth * 0.43, y, trackWidth * 0.1, 18, 0xb8e044).setOrigin(0.5);
    this.add.rectangle(x + trackWidth * 0.43, y, trackWidth * 0.1, 18, 0xb8e044).setOrigin(0.5);
    this.meterMarker = this.add.rectangle(x, y, 8, 34, 0xf3f0e7).setOrigin(0.5);
  }

  private updateMeter(delta: number) {
    this.meterPosition += this.meterDirection * this.meterSpeed * (delta / 1000);
    if (this.meterPosition >= 1) {
      this.meterPosition = 1;
      this.meterDirection = -1;
    } else if (this.meterPosition <= 0) {
      this.meterPosition = 0;
      this.meterDirection = 1;
    }

    const left = this.meterTrack.x - this.meterTrack.width / 2;
    this.meterMarker.x = left + this.meterPosition * this.meterTrack.width;
  }

  private judgeMeterInput(atMs: number): Omit<TimingInput, "kind"> {
    const edgeDistance = Math.min(this.meterPosition, 1 - this.meterPosition);
    const greenLimit = 0.1;
    const yellowLimit = 0.24;
    const quality = edgeDistance <= greenLimit
      ? 1
      : edgeDistance <= yellowLimit
        ? 0.58
        : 0.12;

    return {
      atMs: Math.round(atMs),
      offsetMs: Math.round((edgeDistance - greenLimit) * 1000),
      quality,
    };
  }

  private applyInputEffect(quality: number) {
    if (this.challenge.event !== "sprint") return;

    if (quality > 0.82) {
      this.speed = Math.min(12.8, this.speed + 0.78);
      this.meterSpeed = Math.min(1.85, this.meterSpeed + 0.08);
    } else if (quality > 0.45) {
      this.speed = Math.min(12.8, this.speed + 0.05);
    } else {
      this.speed = Math.max(4.7, this.speed - 0.72);
      this.meterSpeed = Math.max(0.52, this.meterSpeed - 0.07);
    }
  }

  private updateDistanceMarks() {
    const runnerX = this.scale.width * 0.28;
    const pixelsPerMeter = this.scale.width * 0.62 / 34;

    for (const mark of this.distanceMarks) {
      const x = runnerX + (mark.distance - this.distance) * pixelsPerMeter;
      mark.line.x = x;
      mark.label.x = x + 8;
      const visible = x > -80 && x < this.scale.width + 80;
      mark.line.setVisible(visible);
      mark.label.setVisible(visible);
    }
  }

  private subtitle() {
    if (this.challenge.event === "sprint") {
      return `${this.challenge.config.difficulty.toUpperCase()}  100M / SWEET-SPOT METER`;
    }

    return `${this.challenge.config.difficulty.toUpperCase()}  ${this.challenge.config.rhythmBpm} BPM`;
  }

  private initialPrompt() {
    if (this.challenge.event === "sprint") {
      return "Space / click in the green end zones";
    }

    return "Space / click on the pulse";
  }
}
