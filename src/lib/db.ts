import Dexie, { type Table } from "dexie";
import type { DayRecord, Project, TimeEntry } from "../types";
import { createId } from "./id";
import { DEFAULT_TARGET_HOURS } from "./hours";

class TimesheetDatabase extends Dexie {
  projects!: Table<Project, string>;
  days!: Table<DayRecord, string>;

  constructor() {
    super("maringo_timesheet_helper");
    this.version(1).stores({
      projects: "&id, name, isActive, isFavorite, order",
      days: "&date, submittedToMaringo, updatedAt",
    });
  }
}

export const db = new TimesheetDatabase();

const starterProjects: Array<Pick<Project, "name" | "color" | "isFavorite">> = [
  { name: "פיתוח תוכן", color: "#6265D8", isFavorite: true },
  { name: "ניהול פרויקט", color: "#E8AE7E", isFavorite: true },
  { name: "AI וכלים דיגיטליים", color: "#64B68A", isFavorite: true },
  { name: "פגישות ותיאום", color: "#D7EAF7", isFavorite: false },
];

export async function seedDatabaseIfNeeded() {
  const count = await db.projects.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  await db.projects.bulkAdd(
    starterProjects.map((project, index) => ({
      id: createId("project"),
      name: project.name,
      color: project.color,
      isFavorite: project.isFavorite,
      isActive: true,
      order: index,
      createdAt: now,
    })),
  );
}

export async function addProject(input: { name: string; maringoCode?: string; color?: string }) {
  const count = await db.projects.count();
  const now = new Date().toISOString();
  const project: Project = {
    id: createId("project"),
    name: input.name.trim(),
    maringoCode: input.maringoCode?.trim() || undefined,
    color: input.color || "#6265D8",
    isActive: true,
    isFavorite: false,
    order: count,
    createdAt: now,
  };
  await db.projects.add(project);
  return project;
}

export async function toggleProjectActive(project: Project) {
  await db.projects.update(project.id, { isActive: !project.isActive });
}

export async function toggleProjectFavorite(project: Project) {
  await db.projects.update(project.id, { isFavorite: !project.isFavorite });
}

export async function ensureDay(date: string, targetHours = DEFAULT_TARGET_HOURS): Promise<DayRecord> {
  const existing = await db.days.get(date);
  if (existing) return existing;

  const now = new Date().toISOString();
  const day: DayRecord = {
    date,
    targetHours,
    submittedToMaringo: false,
    isNonWorkDay: false,
    entries: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.days.put(day);
  return day;
}

export async function addTimeEntry(date: string, entry: Omit<TimeEntry, "id" | "createdAt">) {
  const day = await ensureDay(date);
  const now = new Date().toISOString();
  const nextEntry: TimeEntry = {
    id: createId("entry"),
    createdAt: now,
    ...entry,
  };

  await db.days.update(date, {
    entries: [...day.entries, nextEntry],
    submittedToMaringo: false,
    updatedAt: now,
  });
}

export async function deleteTimeEntry(date: string, entryId: string) {
  const day = await db.days.get(date);
  if (!day) return;
  await db.days.update(date, {
    entries: day.entries.filter((entry) => entry.id !== entryId),
    submittedToMaringo: false,
    updatedAt: new Date().toISOString(),
  });
}

export async function setSubmittedToMaringo(date: string, submitted: boolean) {
  await ensureDay(date);
  await db.days.update(date, {
    submittedToMaringo: submitted,
    updatedAt: new Date().toISOString(),
  });
}

export async function setNonWorkDay(date: string, isNonWorkDay: boolean) {
  await ensureDay(date);
  await db.days.update(date, {
    isNonWorkDay,
    submittedToMaringo: false,
    updatedAt: new Date().toISOString(),
  });
}

export async function exportAllData() {
  const [projects, days] = await Promise.all([db.projects.toArray(), db.days.toArray()]);
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    projects,
    days,
  };
}
