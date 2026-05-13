import { Upload, X } from "lucide-react";
import { clsx } from "clsx";
import type { AppSettings } from "../types";
import { IconButton } from "./IconButton";

const weekdays = [
  { value: 0, label: "א׳" },
  { value: 1, label: "ב׳" },
  { value: 2, label: "ג׳" },
  { value: 3, label: "ד׳" },
  { value: 4, label: "ה׳" },
  { value: 5, label: "ו׳" },
  { value: 6, label: "ש׳" },
];

type SettingsSheetProps = {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onChange: (settings: AppSettings) => void;
  onImportBackup: (file: File, mode: "replace" | "merge") => Promise<void>;
};

export function SettingsSheet({ isOpen, settings, onClose, onChange, onImportBackup }: SettingsSheetProps) {
  if (!isOpen) return null;

  function patchSettings(patch: Partial<AppSettings>) {
    onChange({ ...settings, ...patch });
  }

  function toggleWorkingDay(day: number) {
    const exists = settings.workingDays.includes(day);
    patchSettings({ workingDays: exists ? settings.workingDays.filter((item) => item !== day) : [...settings.workingDays, day].sort() });
  }

  async function handleFile(file?: File | null) {
    if (!file) return;
    const replace = window.confirm("לייבא כגיבוי מלא ולהחליף נתונים קיימים? לחיצה על ביטול תנסה למזג את הנתונים במקום להחליף.");
    await onImportBackup(file, replace ? "replace" : "merge");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-app-dark/30 p-0 backdrop-blur-sm md:items-center md:p-8">
      <section className="max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-floating md:rounded-[2rem]" role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-app-secondary">התאמה אישית וגיבוי</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">הגדרות</h2>
          </div>
          <IconButton label="סגור" onClick={onClose} className="bg-app-soft shadow-none">
            <X size={20} />
          </IconButton>
        </div>

        <label className="mb-2 block text-sm font-black">יעד שעות יומי</label>
        <input type="number" min="0.5" step="0.5" value={settings.dailyTargetHours} onChange={(event) => patchSettings({ dailyTargetHours: Number(event.target.value) || 9 })} className="mb-5 w-full rounded-3xl border border-app-border bg-app-soft px-4 py-3 text-center text-2xl font-black" />

        <label className="mb-2 block text-sm font-black">ימי עבודה</label>
        <div className="mb-5 grid grid-cols-7 gap-2">
          {weekdays.map((day) => (
            <button key={day.value} type="button" onClick={() => toggleWorkingDay(day.value)} className={clsx("focus-ring rounded-full py-3 text-sm font-black", settings.workingDays.includes(day.value) ? "bg-app-dark text-white" : "bg-app-soft text-app-secondary")}>
              {day.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={() => patchSettings({ allowOverTargetHours: !settings.allowOverTargetHours })} className="focus-ring mb-5 flex w-full items-center justify-between rounded-3xl bg-app-soft px-4 py-4 text-right font-black">
          <span>לאפשר חריגה מהיעד</span>
          <span className={clsx("rounded-full px-3 py-1 text-xs", settings.allowOverTargetHours ? "bg-app-success text-white" : "bg-app-warmSoft text-app-text")}>{settings.allowOverTargetHours ? "כן" : "לא"}</span>
        </button>

        <div className="rounded-[1.75rem] bg-app-soft p-4">
          <h3 className="text-lg font-black">ייבוא גיבוי JSON</h3>
          <p className="mt-1 text-sm font-bold text-app-secondary">בחר קובץ גיבוי שיוצא מהאפליקציה. לפני הייבוא תתבקש לבחור החלפה או מיזוג.</p>
          <label className="pill-button focus-ring mt-4 w-full cursor-pointer gap-2 bg-app-dark text-white">
            <Upload size={18} />
            בחר קובץ גיבוי
            <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </label>
        </div>
      </section>
    </div>
  );
}
