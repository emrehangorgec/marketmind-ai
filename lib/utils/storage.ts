import { AnalysisRecord } from "@/lib/types/analysis";

const ANALYSES_KEY = "marketmind.analyses";
const WATCHLIST_KEY = "marketmind.watchlist";
const SETTINGS_KEY = "marketmind.settings";

const isBrowser = () => typeof window !== "undefined";

export function getStoredAnalyses(): AnalysisRecord[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ANALYSES_KEY);
    return raw ? (JSON.parse(raw) as AnalysisRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveAnalysis(record: AnalysisRecord) {
  if (!isBrowser()) return;
  const analyses = getStoredAnalyses();
  const next = [record, ...analyses.filter((item) => item.symbol !== record.symbol)].slice(
    0,
    10
  );
  window.localStorage.setItem(ANALYSES_KEY, JSON.stringify(next));
}

export function getWatchlist(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(WATCHLIST_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(symbols: string[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(symbols));
}

export type UserSettings = {
  theme: "light" | "dark";
  defaultTimeframe: string;
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  defaultTimeframe: "1d",
};

export function getSettings(): UserSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as UserSettings) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<UserSettings>) {
  if (!isBrowser()) return;
  const next = { ...getSettings(), ...settings };
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}
