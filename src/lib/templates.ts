import type { DayTemplate, TimeEntry } from "../types";
import { createId } from "./id";

const TEMPLATES_KEY = "maringo_helper_day_templates";

export function loadDayTemplates(): DayTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTemplate).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function saveCurrentDayAsTemplate(input: { name: string; sourceDate: string; entries: TimeEntry[] }): DayTemplate[] {
  const now = new Date().toISOString();
  const nextTemplate: DayTemplate = {
    id: createId("template"),
    name: input.name.trim() || `תבנית ${input.sourceDate}`,
    sourceDate: input.sourceDate,
    entries: cloneTemplateEntries(input.entries),
    createdAt: now,
  };
  const nextTemplates = [nextTemplate, ...loadDayTemplates()].slice(0, 8);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(nextTemplates));
  return nextTemplates;
}

export function deleteDayTemplate(templateId: string): DayTemplate[] {
  const nextTemplates = loadDayTemplates().filter((template) => template.id !== templateId);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(nextTemplates));
  return nextTemplates;
}

export function cloneTemplateEntries(entries: TimeEntry[]): Array<Pick<TimeEntry, "projectId" | "clientId" | "hours" | "note">> {
  return entries.map((entry) => ({
    projectId: entry.projectId,
    clientId: entry.clientId,
    hours: entry.hours,
    note: entry.note,
  }));
}

function isTemplate(value: unknown): value is DayTemplate {
  if (!value || typeof value !== "object") return false;
  const template = value as DayTemplate;
  return typeof template.id === "string" && typeof template.name === "string" && Array.isArray(template.entries);
}
