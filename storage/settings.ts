import { DEFAULT_SETTINGS } from "@shared/constants";
import type { GameSettings, PlayerProfile } from "@shared/types";
import { db } from "./db";

export async function getSettings(): Promise<GameSettings> {
  const settings = await db.settings.get("settings");
  if (settings) return settings;

  await db.settings.put(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: GameSettings) {
  await db.settings.put(settings);
  return settings;
}

export async function getPlayerProfile(): Promise<PlayerProfile> {
  const profile = await db.playerProfile.get("local");
  if (profile) return profile;

  const now = new Date().toISOString();
  const created: PlayerProfile = {
    id: "local",
    displayName: "Local Runner",
    createdAt: now,
    updatedAt: now,
  };
  await db.playerProfile.put(created);
  return created;
}

export async function savePlayerName(displayName: string): Promise<PlayerProfile> {
  const current = await getPlayerProfile();
  const updated = {
    ...current,
    displayName,
    updatedAt: new Date().toISOString(),
  };
  await db.playerProfile.put(updated);
  return updated;
}
