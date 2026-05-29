import type { EventType, Medal } from "./types";

export const EVENTS: Record<EventType, { label: string; shortLabel: string; distance: string }> = {
  sprint: {
    label: "100m Sprint",
    shortLabel: "Sprint",
    distance: "100m",
  },
  hurdles: {
    label: "Hurdles",
    shortLabel: "Hurdles",
    distance: "110m",
  },
  "long-jump": {
    label: "Long Jump",
    shortLabel: "Long Jump",
    distance: "Run-up",
  },
};

export const MEDAL_SCORE: Record<Exclude<Medal, "none">, number> = {
  bronze: 7000,
  silver: 8200,
  gold: 9300,
};

export const DEFAULT_SETTINGS = {
  id: "settings",
  soundEnabled: true,
  ghostEnabled: true,
  reducedMotion: false,
} as const;
