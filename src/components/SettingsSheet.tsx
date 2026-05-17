import { Download, Upload, X } from "lucide-react";
import { useState } from "react";
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

type PendingImport = {
  file: File;
  name: string;
};

type SettingsSheetProps = {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onChange: (settings: AppSettings) => void;
  onExportBackup: () => Promise<void>;
  onImportBackup: (file: File, mode: "replace" | "merge") => Promise<void>;
};

export function SettingsSheet({ isOpen, settings, onClose, onChange, onExportBackup, onImportBackup }: SettingsSheetProps) {
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  if (!isOpen) return null;

  function patchSettings(patch: Partial<AppSettings>) {
    onChange({ ...settings, ...patch });
  }

  function toggleWorkingDay(day: number) {
    const exists = settings.workingDays.includes(day);
    patchSettings({ workingDays: exists ? settings.workingDays.filter((item) => item !== day) : [...settings.workingDays, day].sort() });
  }

  function handleFile(file?: File | null) {
    if (!file) return;
    setPendingImport({ file, name: file.name });
  }

  async function confirmImport(mode: "replace" | "merge") {
    if (!pendingImport) return;
    await onImportBackup(pendingImport.file, mode);
    setPendingImport(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-app-dark/30 p-0 backdrop-blur-sm md:items-center md:p-8">
      <section className="max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-floating md:rounded-[2rem]" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-app-secondary">התאמה אישית וגיבוי</p>
            <h2 id="settings-title" className="text-2xl font-black tracking-[-0.04em]">הגדרות</h2>
          </div>
          <IconButton label="סגור" onClick={onClose} className="bg-app-soft shadow-none">
            <X size={20} />
          </IconButton>
        </div>

        <label className="mb-2 block text-sm font-black" htmlFor="daily-target-hours">יעד שעות יומי</label>
        <input id="daily-target-hours" type="number" min="0.5" step="0.5" value={settings.dailyTargetHours} onChange={(event) => patchSettings({ dailyTargetHours: Number(event.target.value) || 9 })} className="mb-5 w-full rounded-3xl border border-app-border bg-app-soft px-4 py-3 text-center text-2xl font-black" />

        <p className="mb-2 text-sm font-black">ימי עבודה</p>
        <div className="mb-5 grid grid-cols-7 gap-2" role="group" aria-label="בחירת ימי עבודה">
          {weekdays.map((day) => {
            const active = settings.workingDays.includes(day.value);
            return (
              <button key={day.value} type="button" aria-pressed={active} aria-label={`${active ? "הסר" : "הוסף"} יום ${day.label} מימי העבודה`} onClick={() => toggleWorkingDay(day.value)} className={clsx("focus-ring rounded-full py-3 text-sm font-black", active ? "bg-app-dark text-white" : "bg-app-soft text-app-secondary")}>
                {day.label}
              </button>
            );
          })}
        </div>

        <button type="button" aria-pressed={settings.allowOverTargetHours} onClick={() => patchSettings({ allowOverTargetHours: !settings.allowOverTargetHours })} className="focus-ring mb-5 flex w-full items-center justify-between rounded-3xl bg-app-soft px-4 py-4 text-right font-black">
          <span>לאפשר חריגה מהיעד</span>
          <span className={clsx("rounded-full px-3 py-1 text-xs", settings.allowOverTargetHours ? "bg-app-success text-white" : "bg-app-warmSoft text-app-text")}>{settings.allowOverTargetHours ? "כן" : "לא"}</span>
        </button>

        <div className="space-y-3 rounded-[1.75rem] bg-app-soft p-4">
          <div>
            <h3 className="text-lg font-black">גיבוי JSON</h3>
            <p className="mt-1 text-sm font-bold text-app-secondary">ייצוא מלא של פרויקטים, לקוחות וימים. הייבוא דורש אישור מפורש לפני שינוי נתונים.</p>
          </div>

          <button type="button" onClick={() => void onExportBackup()} className="pill-button focus-ring w-full gap-2 bg-white text-app-text">
            <Download size={18} />
            ייצוא גיבוי JSON
          </button>

          <label className="pill-button focus-ring w-full cursor-pointer gap-2 bg-app-dark text-white">
            <Upload size={18} />
            בחר קובץ גיבוי לייבוא
            <input type="file" accept="application/json,.json" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>

          {pendingImport ? (
            <div className="rounded-[1.5rem] bg-white p-4" role="alert">
              <p className="text-sm font-black text-app-text">לאשר ייבוא של {pendingImport.name}?</p>
              <p className="mt-1 text-xs font-bold text-app-secondary">מיזוג שומר נתונים קיימים. החלפה מוחקת את הנתונים המקומיים לפני הייבוא.</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button type="button" onClick={() => void confirmImport("merge")} className="pill-button focus-ring bg-app-dark text-white">מיזוג</button>
                <button type="button" onClick={() => void confirmImport("replace")} className="pill-button focus-ring bg-app-warmSoft text-app-text">החלפה</button>
                <button type="button" onClick={() => setPendingImport(null)} className="pill-button focus-ring bg-app-soft text-app-secondary">ביטול</button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
