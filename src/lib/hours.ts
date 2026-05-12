import type { DayRecord, DayStatus, TimeEntry } from "../types";

export const DEFAULT_TARGET_HOURS = 9;

export function sumEntries(entries: TimeEntry[] = []): number {
  return roundHours(entries.reduce((total, entry) => total + Number(entry.hours || 0), 0));
}

export function roundHours(value: number): number {
  return Math.round(value * 100) / 100;
}

export function remainingHours(day?: DayRecord, targetHours = DEFAULT_TARGET_HOURS): number {
  return roundHours(Math.max(0, (day?.targetHours ?? targetHours) - sumEntries(day?.entries ?? [])));
}

export function getDayStatus(day?: DayRecord, targetHours = DEFAULT_TARGET_HOURS): DayStatus {
  if (!day) return "empty";
  if (day.isNonWorkDay) return "nonWork";
  const target = day.targetHours ?? targetHours;
  const total = sumEntries(day.entries);
  if (total === 0) return "empty";
  if (total < target) return "partial";
  if (total === target) return "complete";
  return "over";
}

export function formatHours(hours: number): string {
  const value = Number.isInteger(hours) ? `${hours}` : `${hours.toFixed(2).replace(/0$/, "")}`;
  return `${value} שעות`;
}
