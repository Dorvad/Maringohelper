import { AlertTriangle, CheckCircle2, CircleDot, Plus, Target } from "lucide-react";
import { clsx } from "clsx";
import { formatFullDate } from "../lib/dates";
import { DEFAULT_TARGET_HOURS, formatHours, remainingHours, sumEntries } from "../lib/hours";
import type { DayRecord } from "../types";

type ProgressHeroProps = {
  date: string;
  day?: DayRecord;
  targetHours?: number;
  isToday?: boolean;
  onAdd: () => void;
};

export function ProgressHero({ date, day, targetHours = DEFAULT_TARGET_HOURS, isToday = false, onAdd }: ProgressHeroProps) {
  const target = day?.targetHours ?? targetHours;
  const total = sumEntries(day?.entries ?? []);
  const remaining = remainingHours(day, target);
  const percent = Math.min(100, Math.round((total / target) * 100));
  const completed = total === target;
  const over = total > target;
  const empty = total === 0;
  const statusTone = completed ? "success" : over ? "danger" : empty ? "warm" : "primary";

  return (
    <section className="soft-card relative mb-4 overflow-hidden p-5 sm:p-6">
      <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-app-muted/80 blur-2xl" aria-hidden="true" />
      <div className="relative z-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={clsx("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black", isToday ? "bg-app-dark text-white" : "bg-app-soft text-app-secondary")}>
                <CircleDot size={14} />
                {isToday ? "היום" : "יום נבחר"}
              </span>
              {day?.submittedToMaringo ? <span className="rounded-full bg-app-success px-3 py-1 text-xs font-black text-white">הוזן במרינגו</span> : null}
            </div>
            <p className="text-sm font-bold text-app-secondary">{formatFullDate(date)}</p>
          </div>
          <StatusPill completed={completed} over={over} empty={empty} />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-sm font-black text-app-secondary">צריך למלא עוד</p>
            <h2 className={clsx("mt-1 text-6xl font-black tracking-[-0.07em]", statusTone === "danger" ? "text-app-danger" : "text-app-text")}>
              {over ? `+${formatHours(total - target).replace(" שעות", "")}` : formatHours(remaining).replace(" שעות", "")}
              <span className="me-1 text-2xl text-app-secondary">ש׳</span>
            </h2>
            <p className="mt-2 text-sm font-bold text-app-secondary">
              {completed
                ? "היעד היומי הושלם — עכשיו אפשר לסמן במרינגו כשמעתיקים."
                : over
                  ? `חריגה של ${formatHours(total - target)} מהמכסה היומית.`
                  : `מולאו ${formatHours(total)} מתוך יעד של ${formatHours(target)}.`}
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-app-soft p-4 sm:min-w-36">
            <div className="flex items-center gap-2 text-sm font-black text-app-secondary">
              <Target size={18} />
              יעד יומי
            </div>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em]">{target}</p>
            <p className="text-xs font-bold text-app-secondary">שעות</p>
          </div>
        </div>

        <div className="my-5 h-4 overflow-hidden rounded-full bg-app-soft" aria-label={`${percent}% מהיום מולא`}>
          <div
            className={clsx("h-full rounded-full transition-all duration-500 ease-out", completed ? "bg-app-success" : over ? "bg-app-danger" : "bg-app-primary")}
            style={{ width: `${percent}%` }}
          />
        </div>

        <button type="button" onClick={onAdd} className="pill-button focus-ring w-full gap-2 bg-app-dark text-white shadow-soft sm:w-auto">
          <Plus size={20} />
          {empty ? "התחל למלא שעות" : "הוסף שעות ליום"}
        </button>
      </div>
    </section>
  );
}

type StatusPillProps = {
  completed: boolean;
  over: boolean;
  empty: boolean;
};

function StatusPill({ completed, over, empty }: StatusPillProps) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-app-success px-3 py-2 text-xs font-black text-white">
        <CheckCircle2 size={15} />
        מלא ומוכן
      </span>
    );
  }

  if (over) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-app-danger px-3 py-2 text-xs font-black text-white">
        <AlertTriangle size={15} />
        חריגה לבדיקה
      </span>
    );
  }

  return <span className="rounded-full bg-app-warmSoft px-3 py-2 text-xs font-black text-app-text">{empty ? "עדיין ריק" : "בתהליך"}</span>;
}
