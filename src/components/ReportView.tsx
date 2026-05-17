import { CheckCircle2, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { AppSettings, Client, DayRecord, Project, TimeEntry } from "../types";
import { formatDisplayDate, parseISODate, weekdayName } from "../lib/dates";
import { formatHours, getDayStatus, remainingHours, sumEntries } from "../lib/hours";
import { IconButton } from "./IconButton";

type ReportFilter = "all" | "notSubmitted" | "missing" | "submitted";

type ReportViewProps = {
  monthDates: string[];
  days: DayRecord[];
  projects: Project[];
  clients: Client[];
  settings: AppSettings;
  onSelectDate: (date: string) => void;
  onAdd: () => void;
  onEdit: (entry: TimeEntry, date: string) => void;
  onDelete: (date: string, entryId: string) => void;
  onCopy: (day: DayRecord) => void;
  onToggleSubmitted: (day: DayRecord) => void;
};

export function ReportView({ monthDates, days, projects, clients, settings, onSelectDate, onAdd, onEdit, onDelete, onCopy, onToggleSubmitted }: ReportViewProps) {
  const [filter, setFilter] = useState<ReportFilter>("notSubmitted");
  const daysByDate = useMemo(() => new Map(days.map((day) => [day.date, day])), [days]);
  const reportDays = useMemo(() => buildReportDays(monthDates, daysByDate, settings, filter), [daysByDate, filter, monthDates, settings]);

  return (
    <section className="space-y-3" aria-label="דוח מרינגו לפי ימים">
      <div className="soft-card p-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="סינון דוח מרינגו">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>הכול</FilterButton>
          <FilterButton active={filter === "notSubmitted"} onClick={() => setFilter("notSubmitted")}>לא הוזן</FilterButton>
          <FilterButton active={filter === "missing"} onClick={() => setFilter("missing")}>חסר</FilterButton>
          <FilterButton active={filter === "submitted"} onClick={() => setFilter("submitted")}>הוזן</FilterButton>
        </div>
      </div>

      {reportDays.length === 0 ? (
        <section className="soft-card p-6 text-center">
          <h2 className="text-xl font-black">אין ימים להצגה בסינון הזה</h2>
          <p className="mt-2 text-sm text-app-secondary">אפשר להחליף סינון, לבחור יום ולהוסיף שעות, ואז לחזור למצב מרינגו.</p>
        </section>
      ) : null}

      {reportDays.map((day) => {
        const status = getDayStatus(day, settings.dailyTargetHours);
        const total = sumEntries(day.entries);
        const isMissing = status === "empty" || status === "partial" || status === "over";
        return (
          <article key={day.date} className="soft-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-app-secondary">
                  {weekdayName(day.date)} · {formatDisplayDate(day.date)}
                </p>
                <h3 className="text-2xl font-black tracking-[-0.04em]">סה״כ {formatHours(total)}</h3>
                {isMissing ? <p className="mt-1 text-sm font-bold text-app-secondary">נשארו {formatHours(remainingHours(day, settings.dailyTargetHours))} עד יעד היום.</p> : null}
              </div>
              <StatusBadge status={status} submitted={day.submittedToMaringo} />
            </div>

            {day.entries.length > 0 ? (
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
                          <IconButton label="מחק שורת שעות" onClick={() => onDelete(day.date, entry.id)} className="h-9 w-9 bg-white shadow-none">
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </div>
                      {entry.note ? <p className="mt-2 text-sm font-bold text-app-secondary">{entry.note}</p> : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-app-warmSoft px-4 py-3">
                <p className="text-sm font-black text-app-text">אין שעות ביום הזה.</p>
                <p className="text-xs font-bold text-app-secondary">פתח הזנה כדי להשלים אותו לפני העתקה למרינגו.</p>
              </div>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              {day.entries.length > 0 ? (
                <button type="button" onClick={() => onCopy(day)} className="pill-button focus-ring gap-2 bg-app-dark text-white">
                  <Copy size={18} />
                  העתק יום
                </button>
              ) : (
                <button type="button" onClick={() => { onSelectDate(day.date); onAdd(); }} className="pill-button focus-ring gap-2 bg-app-dark text-white">
                  <Plus size={18} />
                  הוסף שעות
                </button>
              )}
              <button
                type="button"
                onClick={() => onToggleSubmitted(day)}
                disabled={day.entries.length === 0}
                className={clsx("pill-button focus-ring gap-2", day.submittedToMaringo ? "bg-app-success text-white" : "bg-app-soft text-app-text", day.entries.length === 0 && "opacity-60")}
                aria-pressed={day.submittedToMaringo}
              >
                <CheckCircle2 size={18} />
                {day.entries.length === 0 ? "חסר מילוי" : day.submittedToMaringo ? "הוזן במרינגו" : "סמן כהוזן"}
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function buildReportDays(monthDates: string[], daysByDate: Map<string, DayRecord>, settings: AppSettings, filter: ReportFilter) {
  return monthDates
    .filter((date) => settings.workingDays.includes(parseISODate(date).getDay()) || Boolean(daysByDate.get(date)?.entries.length) || Boolean(daysByDate.get(date)?.isNonWorkDay))
    .map((date) => daysByDate.get(date) ?? makeEmptyDay(date, settings.dailyTargetHours))
    .filter((day) => {
      const status = getDayStatus(day, settings.dailyTargetHours);
      const hasReportContent = day.entries.length > 0 || day.isNonWorkDay;
      if (filter === "submitted") return day.submittedToMaringo;
      if (filter === "notSubmitted") return hasReportContent && !day.submittedToMaringo;
      if (filter === "missing") return status === "empty" || status === "partial" || status === "over";
      return hasReportContent;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function makeEmptyDay(date: string, targetHours: number): DayRecord {
  const now = new Date().toISOString();
  return {
    date,
    targetHours,
    submittedToMaringo: false,
    isNonWorkDay: false,
    entries: [],
    createdAt: now,
    updatedAt: now,
  };
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} className={clsx("focus-ring rounded-full px-4 py-3 text-sm font-black", active ? "bg-app-dark text-white" : "bg-app-soft text-app-secondary")}>
      {children}
    </button>
  );
}

type StatusBadgeProps = {
  status: string;
  submitted: boolean;
};

function StatusBadge({ status, submitted }: StatusBadgeProps) {
  if (submitted) return <span className="rounded-full bg-app-success px-3 py-2 text-xs font-black text-white">הוזן במרינגו</span>;
  if (status === "complete") return <span className="rounded-full bg-app-primary px-3 py-2 text-xs font-black text-white">מלא — ממתין לסימון</span>;
  if (status === "partial") return <span className="rounded-full bg-app-warmSoft px-3 py-2 text-xs font-black text-app-text">חסר שעות</span>;
  if (status === "over") return <span className="rounded-full bg-app-danger px-3 py-2 text-xs font-black text-white">חריג לבדיקה</span>;
  if (status === "nonWork") return <span className="rounded-full bg-app-soft px-3 py-2 text-xs font-black text-app-secondary">יום ללא עבודה</span>;
  return <span className="rounded-full bg-app-soft px-3 py-2 text-xs font-black text-app-secondary">ריק</span>;
}
