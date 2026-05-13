import type { AppSettings } from "../types";
import { DEFAULT_TARGET_HOURS } from "./hours";

const SETTINGS_KEY = "maringo_helper_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  dailyTargetHours: DEFAULT_TARGET_HOURS,
  workingDays: [0, 1, 2, 3, 4],
  allowOverTargetHours: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  const normalized = normalizeSettings(settings);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function normalizeSettings(input: Partial<AppSettings>): AppSettings {
  const dailyTargetHours = Number(input.dailyTargetHours);
  const workingDays = Array.isArray(input.workingDays)
    ? input.workingDays.filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
    : DEFAULT_SETTINGS.workingDays;

  return {
    dailyTargetHours: dailyTargetHours > 0 ? dailyTargetHours : DEFAULT_SETTINGS.dailyTargetHours,
    workingDays: workingDays.length > 0 ? Array.from(new Set(workingDays)).sort() : DEFAULT_SETTINGS.workingDays,
    allowOverTargetHours: input.allowOverTargetHours ?? DEFAULT_SETTINGS.allowOverTargetHours,
  };
}
