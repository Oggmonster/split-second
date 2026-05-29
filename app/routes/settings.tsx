import { useEffect, useState } from "react";
import type { GameSettings, PlayerProfile } from "@shared/types";
import { getPlayerProfile, getSettings, savePlayerName, saveSettings } from "@storage/settings";

export function meta() {
  return [{ title: "Settings | Split Second" }];
}

export default function Settings() {
  const [settings, setSettings] = useState<GameSettings>();
  const [profile, setProfile] = useState<PlayerProfile>();

  useEffect(() => {
    Promise.all([getSettings(), getPlayerProfile()]).then(([savedSettings, savedProfile]) => {
      setSettings(savedSettings);
      setProfile(savedProfile);
    });
  }, []);

  async function updateSettings(patch: Partial<GameSettings>) {
    if (!settings) return;
    const next = await saveSettings({ ...settings, ...patch });
    setSettings(next);
  }

  async function updateName(displayName: string) {
    const next = await savePlayerName(displayName);
    setProfile(next);
  }

  return (
    <main className="page narrow-page">
      <p className="eyebrow">Local profile</p>
      <h2>Settings</h2>
      <div className="settings-panel">
        <label className="field-row">
          <span>
            <strong>Runner name</strong>
            <p>Used only on this device for now.</p>
          </span>
          <input
            value={profile?.displayName ?? ""}
            onChange={(event) => updateName(event.target.value)}
            aria-label="Runner name"
          />
        </label>

        <label className="field-row">
          <span>
            <strong>Ghost replay</strong>
            <p>Race against your best local replay for today.</p>
          </span>
          <span className="toggle">
            <input
              type="checkbox"
              checked={settings?.ghostEnabled ?? true}
              onChange={(event) => updateSettings({ ghostEnabled: event.target.checked })}
            />
            Enabled
          </span>
        </label>

        <label className="field-row">
          <span>
            <strong>Sound</strong>
            <p>Reserved for the timing tick and finish line cues.</p>
          </span>
          <span className="toggle">
            <input
              type="checkbox"
              checked={settings?.soundEnabled ?? true}
              onChange={(event) => updateSettings({ soundEnabled: event.target.checked })}
            />
            Enabled
          </span>
        </label>

        <label className="field-row">
          <span>
            <strong>Reduced motion</strong>
            <p>Stores the preference for future animation tuning.</p>
          </span>
          <span className="toggle">
            <input
              type="checkbox"
              checked={settings?.reducedMotion ?? false}
              onChange={(event) => updateSettings({ reducedMotion: event.target.checked })}
            />
            Enabled
          </span>
        </label>
      </div>
    </main>
  );
}
