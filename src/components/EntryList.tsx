import { Trash2 } from "lucide-react";
import type { DayRecord, Project } from "../types";
import { formatHours } from "../lib/hours";
import { IconButton } from "./IconButton";

type EntryListProps = {
  day?: DayRecord;
  projects: Project[];
  onDelete: (entryId: string) => void;
};

export function EntryList({ day, projects, onDelete }: EntryListProps) {
  const entries = day?.entries ?? [];

  if (entries.length === 0) {
    return (
      <div className="soft-card p-6 text-center">
        <p className="text-base font-bold text-app-text">אין עדיין שעות ביום הזה</p>
        <p className="mt-1 text-sm text-app-secondary">לחיצה על הפלוס תפתח הזנה מהירה.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const project = projects.find((item) => item.id === entry.projectId);
        return (
          <article key={entry.id} className="soft-card flex items-center gap-4 p-4">
            <div
              className="h-12 w-2 rounded-full"
              style={{ backgroundColor: project?.color ?? "#6265D8" }}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-black text-app-text">{project?.name ?? "פרויקט שנמחק"}</h3>
              <p className="text-sm font-bold text-app-secondary">{formatHours(entry.hours)}</p>
              {entry.note ? <p className="mt-1 truncate text-sm text-app-secondary">{entry.note}</p> : null}
            </div>
            <IconButton label="מחק שורת שעות" onClick={() => onDelete(entry.id)} className="h-10 w-10 bg-app-soft shadow-none">
              <Trash2 size={18} />
            </IconButton>
          </article>
        );
      })}
    </div>
  );
}
