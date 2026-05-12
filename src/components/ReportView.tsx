import { CheckCircle2, Copy } from "lucide-react";
import type { DayRecord, Project } from "../types";
import { formatDisplayDate, weekdayName } from "../lib/dates";
import { formatHours, getDayStatus, sumEntries } from "../lib/hours";
import { IconButton } from "./IconButton";

type ReportViewProps = {
  days: DayRecord[];
  projects: Project[];
  onCopy: (day: DayRecord) => void;
  onToggleSubmitted: (day: DayRecord) => void;
};

export function ReportView({ days, projects, onCopy, onToggleSubmitted }: ReportViewProps) {
  const reportDays = days
    .filter((day) => day.entries.length > 0 || day.isNonWorkDay)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (reportDays.length === 0) {
    return (
      <section className="soft-card p-6 text-center">
        <h2 className="text-xl font-black">אין עדיין נתונים לחודש הזה</h2>
        <p className="mt-2 text-sm text-app-secondary">אחרי שתזין שעות, יופיע כאן מצב הזנה למרינגו.</p>
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
                return (
                  <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl bg-app-soft px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-app-text">{project?.name ?? "פרויקט שנמחק"}</p>
                      {project?.maringoCode ? <p className="text-xs font-bold text-app-secondary">קוד: {project.maringoCode}</p> : null}
                    </div>
                    <p className="shrink-0 text-sm font-black">{entry.hours}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => onCopy(day)} className="pill-button focus-ring flex-1 gap-2 bg-app-dark text-white">
                <Copy size={18} />
                העתק יום
              </button>
              <IconButton
                label={day.submittedToMaringo ? "בטל סימון כהוזן" : "סמן כהוזן במרינגו"}
                onClick={() => onToggleSubmitted(day)}
                className={day.submittedToMaringo ? "bg-app-success text-white" : "bg-app-soft shadow-none"}
              >
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
