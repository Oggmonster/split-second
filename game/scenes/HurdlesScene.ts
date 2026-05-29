import type { TimingInput } from "@shared/types";
import { TimingEventScene } from "./TimingEventScene";

export class HurdlesScene extends TimingEventScene {
  constructor() {
    super("HurdlesScene");
  }

  protected recordInput(kind: TimingInput["kind"] = "jump") {
    super.recordInput(kind);
  }
}
