import type { TimingInput } from "@shared/types";
import { TimingEventScene } from "./TimingEventScene";

export class LongJumpScene extends TimingEventScene {
  constructor() {
    super("LongJumpScene");
  }

  protected recordInput(kind: TimingInput["kind"] = "takeoff") {
    super.recordInput(kind);
  }
}
