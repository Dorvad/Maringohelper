import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { clsx } from "clsx";
import type { DayRecord, Project } from "../types";
import { formatDisplayDate } from "../lib/dates";
import { DEFAULT_TARGET_HOURS, formatHours, remainingHours, roundHours, sumEntries } from "../lib/hours";
import { IconButton } from "./IconButton";

type AddEntrySheetProps = {
  isOpen: boolean;
  date: string;
  day?: DayRecord;
  projects: Project[];
  onClose: () => void;
  onSubmit: (input: { projectId: string; hours: number; note?: string }) => Promise<void>;
};

const quickAmounts = [0.5, 1, 2, 3];

export function AddEntrySheet({ isOpen, date, day, projects, onClose, onSubmit }: AddEntrySheetProps) {
  const activeProjects = useMemo(() => projects.filter((project) => project.isActive), [projects]);
  const [projectId, setProjectId] = useState("");
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");

  const target = day?.targetHours ?? DEFAULT_TARGET_HOURS;
  const remaining = remainingHours(day, target);
  const currentTotal = sumEntries(day?.entries ?? []);
  const nextTotal = roundHours(currentTotal + hours);
  const willOverfill = nextTotal > target;

  if (!isOpen) return null;

  async function handleSubmit() {
    if (!projectId || hours <= 0) return;
    if (willOverfill && !window.confirm("היום עובר את מכסת 9 השעות. לשמור כחריג?")) return;
    await onSubmit({ projectId, hours, note: note.trim() || undefined });
    setProjectId("");
    setHours(1);
    setNote("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-app-dark/30 p-0 backdrop-blur-sm md:items-center md:p-8">
      <section className="w-full max-w-[430px] rounded-t-[2rem] bg-white p-5 shadow-floating md:rounded-[2rem]" role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-app-secondary">{formatDisplayDate(date)}</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">הוספת שעות</h2>
            <p className="mt-1 text-sm text-app-secondary">נותרו {formatHours(remaining)} ביום הזה</p>
          </div>
          <IconButton label="סגור" onClick={onClose} className="bg-app-soft shadow-none">
            <X size={20} />
          </IconButton>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-black">בחר פרויקט</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {activeProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setProjectId(project.id)}
                className={clsx(
                  "focus-ring shrink-0 rounded-full border px-4 py-3 text-sm font-black transition active:scale-95",
                  projectId === project.id
                    ? "border-app-dark bg-app-dark text-white"
                    : "border-app-border bg-app-soft text-app-text",
                )}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 rounded-[1.75rem] bg-app-soft p-4">
          <label className="mb-3 block text-sm font-black">כמה שעות?</label>
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white text-2xl font-black shadow-soft"
              onClick={() => setHours((value) => Math.max(0.5, roundHours(value - 0.5)))}
            >
              −
            </button>
            <input
              inputMode="decimal"
              value={hours}
              onChange={(event) => setHours(Number(event.target.value) || 0)}
              className="w-28 rounded-3xl bg-white px-4 py-4 text-center text-3xl font-black tracking-[-0.05em] shadow-soft"
              aria-label="כמות שעות"
            />
            <button
              type="button"
              className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white text-2xl font-black shadow-soft"
              onClick={() => setHours((value) => roundHours(value + 0.5))}
            >
              +
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button
                type="button"
                key={amount}
                onClick={() => setHours(amount)}
                className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-black shadow-soft transition active:scale-95"
              >
                {amount}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setHours(Math.max(0.5, remaining))}
              className="focus-ring rounded-full bg-app-primary px-4 py-2 text-sm font-black text-white shadow-soft transition active:scale-95"
            >
              כל מה שנשאר
            </button>
          </div>
        </div>

        {willOverfill ? (
          <p className="mb-4 rounded-3xl bg-app-warmSoft px-4 py-3 text-sm font-bold text-app-text">
            שים לב: אחרי השמירה היום יעמוד על {formatHours(nextTotal)}, כלומר מעל המכסה.
          </p>
        ) : null}

        <label className="mb-2 block text-sm font-black">הערה אופציונלית</label>
        <textarea
          rows={2}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="mb-5 w-full resize-none rounded-[1.5rem] border border-app-border bg-white px-4 py-3 text-sm shadow-soft"
          placeholder="למשל: עבודה על מצגת, פגישות, עדכון תוכן..."
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!projectId || hours <= 0}
          className="pill-button focus-ring w-full bg-app-dark text-white shadow-soft"
        >
          הוסף ליום
        </button>
      </section>
    </div>
  );
}
