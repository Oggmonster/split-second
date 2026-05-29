import type Phaser from "phaser";
import type { DailyChallenge, ReplayRecord } from "@shared/types";

export type SplitSecondGame = Phaser.Game;

export async function createPhaserGame(
  parent: HTMLElement,
  challenge: DailyChallenge,
  ghost?: ReplayRecord,
): Promise<SplitSecondGame> {
  const PhaserModule = await import("phaser");
  const PhaserRuntime = PhaserModule.default;
  const { BootScene } = await import("./scenes/BootScene");
  const { SprintScene } = await import("./scenes/SprintScene");
  const { HurdlesScene } = await import("./scenes/HurdlesScene");
  const { LongJumpScene } = await import("./scenes/LongJumpScene");
  const { MenuScene } = await import("./scenes/MenuScene");

  const game = new PhaserRuntime.Game({
    type: PhaserRuntime.AUTO,
    parent,
    width: parent.clientWidth,
    height: parent.clientHeight,
    backgroundColor: "#101812",
    scale: {
      mode: PhaserRuntime.Scale.RESIZE,
      autoCenter: PhaserRuntime.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, SprintScene, HurdlesScene, LongJumpScene],
  });

  game.registry.set("challenge", challenge);
  game.registry.set("ghost", ghost);

  return game;
}
