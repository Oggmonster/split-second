import Phaser from "phaser";
import type { DailyChallenge, ReplayRecord } from "@shared/types";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    const challenge = this.game.registry.get("challenge") as DailyChallenge;
    const ghost = this.game.registry.get("ghost") as ReplayRecord | undefined;

    this.scene.start(sceneForEvent(challenge.event), { challenge, ghost });
  }
}

function sceneForEvent(event: DailyChallenge["event"]) {
  if (event === "hurdles") return "HurdlesScene";
  if (event === "long-jump") return "LongJumpScene";
  return "SprintScene";
}
