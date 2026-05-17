import Dexie, { type Table } from "dexie";
import type { Client, DayRecord, DayTemplate, Project, TimeEntry } from "../types";
import { createId } from "./id";
import { DEFAULT_TARGET_HOURS } from "./hours";

class TimesheetDatabase extends Dexie {
  projects!: Table<Project, string>;
  clients!: Table<Client, string>;
  days!: Table<DayRecord, string>;

  constructor() {
    super("maringo_timesheet_helper");
    this.version(1).stores({
      projects: "&id, name, isActive, isFavorite, order",
      days: "&date, submittedToMaringo, updatedAt",
    });
    this.version(2).stores({
      projects: "&id, name, isActive, isFavorite, order",
      clients: "&id, name, code, isActive, isFavorite, order",
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

const starterClients: Array<Pick<Client, "name" | "color" | "isFavorite"> & { code?: string }> = [
  { name: "NGG", code: "NGG", color: "#6265D8", isFavorite: true },
  { name: "פנימי", color: "#64B68A", isFavorite: true },
  { name: "לקוח חיצוני", color: "#E8AE7E", isFavorite: false },
  { name: "ללא לקוח", color: "#D7EAF7", isFavorite: true },
];

export async function seedDatabaseIfNeeded() {
  await Promise.all([seedProjectsIfNeeded(), seedClientsIfNeeded()]);
}

async function seedProjectsIfNeeded() {
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

export async function seedClientsIfNeeded() {
  const count = await db.clients.count();
  if (count > 0) return;

  const now = new Date().toISOString();
  await db.clients.bulkAdd(
    starterClients.map((client, index) => ({
      id: createId("client"),
      name: client.name,
      code: client.code,
      color: client.color,
      isFavorite: client.isFavorite,
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

export async function addClient(input: { name: string; code?: string; color?: string; isActive?: boolean; isFavorite?: boolean }) {
  const count = await db.clients.count();
  const now = new Date().toISOString();
  const client: Client = {
    id: createId("client"),
    name: input.name.trim(),
    code: input.code?.trim() || undefined,
    color: input.color || "#6265D8",
    isActive: input.isActive ?? true,
    isFavorite: input.isFavorite ?? false,
    order: count,
    createdAt: now,
  };
  await db.clients.add(client);
  return client;
}

export async function toggleProjectActive(project: Project) {
  await db.projects.update(project.id, { isActive: !project.isActive });
}

export async function toggleProjectFavorite(project: Project) {
  await db.projects.update(project.id, { isFavorite: !project.isFavorite });
}

export async function toggleClientActive(client: Client) {
  await db.clients.update(client.id, { isActive: !client.isActive });
}

export async function toggleClientFavorite(client: Client) {
  await db.clients.update(client.id, { isFavorite: !client.isFavorite });
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

export async function addTimeEntry(date: string, entry: Omit<TimeEntry, "id" | "createdAt">, targetHours = DEFAULT_TARGET_HOURS) {
  const day = await ensureDay(date, targetHours);
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

export async function updateTimeEntry(date: string, entryId: string, input: Omit<TimeEntry, "id" | "createdAt">) {
  const day = await db.days.get(date);
  if (!day) return;
  const now = new Date().toISOString();
  await db.days.update(date, {
    entries: day.entries.map((entry) => (entry.id === entryId ? { ...entry, ...input } : entry)),
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

export async function replaceDayEntries(
  date: string,
  entries: Array<Pick<TimeEntry, "projectId" | "clientId" | "hours" | "note">>,
  targetHours = DEFAULT_TARGET_HOURS,
) {
  const day = await ensureDay(date, targetHours);
  const now = new Date().toISOString();
  const nextEntries: TimeEntry[] = entries.map((entry) => ({
    id: createId("entry"),
    createdAt: now,
    projectId: entry.projectId,
    clientId: entry.clientId,
    hours: entry.hours,
    note: entry.note,
  }));

  await db.days.update(date, {
    targetHours: day.targetHours ?? targetHours,
    entries: nextEntries,
    submittedToMaringo: false,
    isNonWorkDay: false,
    updatedAt: now,
  });
}

export async function findPreviousDayWithEntries(date: string) {
  const previousDays = await db.days.where("date").below(date).reverse().toArray();
  return previousDays.find((day) => day.entries.length > 0);
}

export async function duplicatePreviousDayEntries(date: string, targetHours = DEFAULT_TARGET_HOURS) {
  const previousDay = await findPreviousDayWithEntries(date);
  if (!previousDay) return undefined;
  await replaceDayEntries(date, previousDay.entries, targetHours);
  return previousDay;
}

export async function applyDayTemplate(date: string, template: DayTemplate, targetHours = DEFAULT_TARGET_HOURS) {
  await replaceDayEntries(date, template.entries, targetHours);
}

export async function setSubmittedToMaringo(date: string, submitted: boolean, targetHours = DEFAULT_TARGET_HOURS) {
  await ensureDay(date, targetHours);
  await db.days.update(date, {
    submittedToMaringo: submitted,
    updatedAt: new Date().toISOString(),
  });
}

export async function setNonWorkDay(date: string, isNonWorkDay: boolean, targetHours = DEFAULT_TARGET_HOURS) {
  await ensureDay(date, targetHours);
  await db.days.update(date, {
    isNonWorkDay,
    submittedToMaringo: false,
    updatedAt: new Date().toISOString(),
  });
}

export async function exportAllData() {
  const [projects, clients, days] = await Promise.all([db.projects.toArray(), db.clients.toArray(), db.days.toArray()]);
  return {
    exportedAt: new Date().toISOString(),
    version: 2,
    projects,
    clients,
    days,
  };
}

type BackupData = {
  projects?: Project[];
  clients?: Client[];
  days?: DayRecord[];
};

export function validateBackupData(data: unknown): data is BackupData {
  if (!data || typeof data !== "object") return false;
  const backup = data as BackupData;
  const hasKnownArray = Array.isArray(backup.projects) || Array.isArray(backup.clients) || Array.isArray(backup.days);
  if (!hasKnownArray) return false;
  if (backup.projects && !backup.projects.every((project) => typeof project.id === "string" && typeof project.name === "string")) return false;
  if (backup.clients && !backup.clients.every((client) => typeof client.id === "string" && typeof client.name === "string")) return false;
  if (backup.days && !backup.days.every((day) => typeof day.date === "string" && Array.isArray(day.entries))) return false;
  return true;
}

export async function importBackupData(data: BackupData, mode: "replace" | "merge") {
  await db.transaction("rw", db.projects, db.clients, db.days, async () => {
    if (mode === "replace") {
      await Promise.all([db.projects.clear(), db.clients.clear(), db.days.clear()]);
    }
    if (data.projects) await db.projects.bulkPut(data.projects.map(normalizeProject));
    if (data.clients) await db.clients.bulkPut(data.clients.map(normalizeClient));
    if (data.days) await db.days.bulkPut(data.days.map(normalizeDay));
  });
  await seedDatabaseIfNeeded();
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    maringoCode: project.maringoCode || undefined,
    isActive: project.isActive ?? true,
    isFavorite: project.isFavorite ?? false,
    order: project.order ?? 0,
    color: project.color || "#6265D8",
    createdAt: project.createdAt || new Date().toISOString(),
  };
}

function normalizeClient(client: Client): Client {
  return {
    ...client,
    code: client.code || undefined,
    isActive: client.isActive ?? true,
    isFavorite: client.isFavorite ?? false,
    order: client.order ?? 0,
    color: client.color || "#6265D8",
    createdAt: client.createdAt || new Date().toISOString(),
  };
}

function normalizeDay(day: DayRecord): DayRecord {
  const now = new Date().toISOString();
  return {
    ...day,
    targetHours: Number(day.targetHours || DEFAULT_TARGET_HOURS),
    submittedToMaringo: day.submittedToMaringo ?? false,
    isNonWorkDay: day.isNonWorkDay ?? false,
    entries: day.entries ?? [],
    createdAt: day.createdAt || now,
    updatedAt: day.updatedAt || now,
  };
}
