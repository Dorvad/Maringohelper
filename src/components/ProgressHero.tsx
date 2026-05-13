import { Plus, Sparkles } from "lucide-react";
import { formatFullDate } from "../lib/dates";
import { DEFAULT_TARGET_HOURS, formatHours, remainingHours, sumEntries } from "../lib/hours";
import type { DayRecord } from "../types";

type ProgressHeroProps = {
  date: string;
  day?: DayRecord;
  targetHours?: number;
  onAdd: () => void;
};

export function ProgressHero({ date, day, targetHours = DEFAULT_TARGET_HOURS, onAdd }: ProgressHeroProps) {
  const target = day?.targetHours ?? targetHours;
  const total = sumEntries(day?.entries ?? []);
  const remaining = remainingHours(day, target);
  const percent = Math.min(100, Math.round((total / target) * 100));
  const completed = total === target;
  const over = total > target;

  return (
    <section className="soft-card mb-4 p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-app-secondary">{formatFullDate(date)}</p>
          <h2 className="mt-2 text-5xl font-black tracking-[-0.06em] text-app-text">
            {total}<span className="text-2xl text-app-secondary"> / {target}</span>
          </h2>
          <p className="mt-2 text-sm font-bold text-app-secondary">
            {completed
              ? "היום הושלם. אפשר להמשיך."
              : over
                ? `חריגה של ${formatHours(total - target)} מהמכסה`
                : `נותרו ${formatHours(remaining)} להשלמת היום`}
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-full bg-app-muted text-app-primary">
          <Sparkles size={22} />
        </div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-app-soft">
        <div
          className="h-full rounded-full bg-app-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
          aria-label={`${percent}% מהיום מולא`}
        />
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="pill-button focus-ring w-full gap-2 bg-app-dark text-white shadow-soft"
      >
        <Plus size={20} />
        הוסף שעות
      </button>
    </section>
  );
}
