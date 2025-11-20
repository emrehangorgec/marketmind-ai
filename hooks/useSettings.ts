"use client";

import { useState, useEffect } from "react";

export interface UserSettings {
  openRouterKey: string;
  alphaVantageKey: string;
  braveKey: string;
}

const SETTINGS_KEY = "marketmind.api_keys";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>({
    openRouterKey: "",
    alphaVantageKey: "",
    braveKey: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  return { settings, saveSettings };
}
