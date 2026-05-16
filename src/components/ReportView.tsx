import { CheckCircle2, Copy, Pencil } from "lucide-react";
import type { Client, DayRecord, Project, TimeEntry } from "../types";
import { formatDisplayDate, weekdayName } from "../lib/dates";
import { formatHours, getDayStatus, sumEntries } from "../lib/hours";
import { IconButton } from "./IconButton";

type ReportViewProps = {
  days: DayRecord[];
  projects: Project[];
  clients: Client[];
  onEdit: (entry: TimeEntry, date: string) => void;
  onCopy: (day: DayRecord) => void;
  onToggleSubmitted: (day: DayRecord) => void;
};

export function ReportView({ days, projects, clients, onEdit, onCopy, onToggleSubmitted }: ReportViewProps) {
  const reportDays = days
    .filter((day) => day.entries.length > 0 || day.isNonWorkDay)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (reportDays.length === 0) {
    return (
      <section className="soft-card p-6 text-center">
        <h2 className="text-xl font-black">אין עדיין נתונים לחודש הזה</h2>
        <p className="mt-2 text-sm text-app-secondary">בחר יום, הוסף שעות לפי לקוח ופרויקט, ואז מצב מרינגו יציג כאן את מה להעתיק.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {reportDays.map((day) => {
        const status = getDayStatus(day);
        return (
          <article key={day.date} className="soft-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-app-secondary">
                  {weekdayName(day.date)} · {formatDisplayDate(day.date)}
                </p>
                <h3 className="text-2xl font-black tracking-[-0.04em]">סה״כ {formatHours(sumEntries(day.entries))}</h3>
              </div>
              <StatusBadge status={status} submitted={day.submittedToMaringo} />
            </div>

            <div className="space-y-2">
              {day.entries.map((entry) => {
                const project = projects.find((item) => item.id === entry.projectId);
                const client = clients.find((item) => item.id === entry.clientId);
                return (
                  <div key={entry.id} className="rounded-2xl bg-app-soft px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-black text-app-secondary">{client?.name ?? "ללא לקוח"}</p>
                        <p className="truncate text-sm font-black text-app-text">{project?.name ?? "פרויקט שנמחק"}</p>
                        <p className="text-xs font-bold text-app-secondary">
                          {client?.code ? `לקוח: ${client.code}` : ""}
                          {client?.code && project?.maringoCode ? " · " : ""}
                          {project?.maringoCode ? `פרויקט: ${project.maringoCode}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <p className="text-sm font-black">{formatHours(entry.hours)}</p>
                        <button type="button" onClick={() => onEdit(entry, day.date)} className="focus-ring inline-flex h-9 items-center gap-1 rounded-full bg-white px-3 text-xs font-black text-app-text transition active:scale-95" aria-label="ערוך שורת שעות">
                          <Pencil size={15} />
                          עריכה
                        </button>
                      </div>
                    </div>
                    {entry.note ? <p className="mt-2 text-sm font-bold text-app-secondary">{entry.note}</p> : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => onCopy(day)} className="pill-button focus-ring flex-1 gap-2 bg-app-dark text-white">
                <Copy size={18} />
                העתק יום
              </button>
              <IconButton label={day.submittedToMaringo ? "בטל סימון כהוזן" : "סמן כהוזן במרינגו"} onClick={() => onToggleSubmitted(day)} className={day.submittedToMaringo ? "bg-app-success text-white" : "bg-app-soft shadow-none"}>
                <CheckCircle2 size={20} />
              </IconButton>
            </div>
          </article>
        );
      })}
    </section>
  );
}

type StatusBadgeProps = {
  status: string;
  submitted: boolean;
};

function StatusBadge({ status, submitted }: StatusBadgeProps) {
  if (submitted) return <span className="rounded-full bg-app-success px-3 py-2 text-xs font-black text-white">הוזן</span>;
  if (status === "complete") return <span className="rounded-full bg-app-primary px-3 py-2 text-xs font-black text-white">מלא</span>;
  if (status === "partial") return <span className="rounded-full bg-app-warmSoft px-3 py-2 text-xs font-black text-app-text">חסר</span>;
  if (status === "over") return <span className="rounded-full bg-app-danger px-3 py-2 text-xs font-black text-white">חריג</span>;
  return <span className="rounded-full bg-app-soft px-3 py-2 text-xs font-black text-app-secondary">ריק</span>;
}
