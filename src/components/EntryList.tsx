import { Pencil, Trash2 } from "lucide-react";
import type { Client, DayRecord, Project, TimeEntry } from "../types";
import { formatHours } from "../lib/hours";
import { IconButton } from "./IconButton";

type EntryListProps = {
  day?: DayRecord;
  projects: Project[];
  clients: Client[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
};

export function EntryList({ day, projects, clients, onEdit, onDelete }: EntryListProps) {
  const entries = day?.entries ?? [];

  if (entries.length === 0) {
    return (
      <div className="soft-card p-6 text-center">
        <p className="text-base font-bold text-app-text">אין עדיין שעות ביום הזה</p>
        <p className="mt-1 text-sm text-app-secondary">לחיצה על הפלוס תפתח הזנה מהירה של לקוח, פרויקט ושעות.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const project = projects.find((item) => item.id === entry.projectId);
        const client = clients.find((item) => item.id === entry.clientId);
        return (
          <article key={entry.id} className="soft-card flex items-center gap-4 p-4">
            <div className="h-12 w-2 rounded-full" style={{ backgroundColor: client?.color ?? project?.color ?? "#6265D8" }} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-app-secondary">{client?.name ?? "ללא לקוח"}</p>
              <h3 className="truncate text-lg font-black text-app-text">{project?.name ?? "פרויקט שנמחק"}</h3>
              <p className="text-sm font-bold text-app-secondary">{formatHours(entry.hours)}</p>
              {entry.note ? <p className="mt-1 truncate text-sm text-app-secondary">{entry.note}</p> : null}
            </div>
            <div className="flex gap-2">
              <IconButton label="ערוך שורת שעות" onClick={() => onEdit(entry)} className="h-10 w-10 bg-app-soft shadow-none">
                <Pencil size={18} />
              </IconButton>
              <IconButton label="מחק שורת שעות" onClick={() => onDelete(entry.id)} className="h-10 w-10 bg-app-soft shadow-none">
                <Trash2 size={18} />
              </IconButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}
