import type { EventType } from "@shared/types";

export const PHYSICS_CONFIG: Record<EventType, { acceleration: number; topSpeed: number; drag: number }> = {
  sprint: {
    acceleration: 15,
    topSpeed: 430,
    drag: 0.985,
  },
  hurdles: {
    acceleration: 13,
    topSpeed: 390,
    drag: 0.98,
  },
  "long-jump": {
    acceleration: 14,
    topSpeed: 410,
    drag: 0.982,
  },
};
