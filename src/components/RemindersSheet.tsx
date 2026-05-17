import { Bell, BellRing, Clock, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton } from "./IconButton";

type RemindersSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ReminderSettings = {
  enabled: boolean;
  time: string;
  endOfMonth: boolean;
};

const REMINDERS_KEY = "maringo_helper_reminders";
const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: false,
  time: "17:30",
  endOfMonth: true,
};

export function RemindersSheet({ isOpen, onClose }: RemindersSheetProps) {
  const [settings, setSettings] = useState<ReminderSettings>(() => loadReminderSettings());
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() => getNotificationPermission());

  useEffect(() => {
    if (!isOpen) return;
    setSettings(loadReminderSettings());
    setPermission(getNotificationPermission());
  }, [isOpen]);

  if (!isOpen) return null;

  function save(next: ReminderSettings) {
    setSettings(next);
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(next));
  }

  async function enableReminders() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      save({ ...settings, enabled: true });
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    if (nextPermission === "granted") {
      save({ ...settings, enabled: true });
      new Notification("Maringo Helper", { body: "תזכורת מקומית הופעלה. כדאי לסגור שעות לפני סוף היום." });
    }
  }

  const statusText = settings.enabled ? `פעיל בכל יום עבודה סביב ${settings.time}` : "כבוי — לא יוצגו תזכורות";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-app-dark/30 p-0 backdrop-blur-sm md:items-center md:p-8">
      <section className="w-full max-w-[430px] rounded-t-[2rem] bg-white p-5 shadow-floating md:rounded-[2rem]" role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-app-secondary">תזכורות</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">משוב עדין לסוף יום</h2>
          </div>
          <IconButton label="סגור" onClick={onClose} className="bg-app-soft shadow-none">
            <X size={20} />
          </IconButton>
        </div>

        <div className="rounded-[1.75rem] bg-app-soft p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-app-primary">
              {settings.enabled ? <BellRing size={24} /> : <Bell size={24} />}
            </div>
            <div>
              <h3 className="text-lg font-black">{statusText}</h3>
              <p className="text-sm font-bold text-app-secondary">ההגדרה נשמרת בדפדפן הזה בלבד, בלי שרת ובלי סנכרון.</p>
            </div>
          </div>

          <label className="mb-2 flex items-center gap-2 text-sm font-black">
            <Clock size={16} />
            שעה מומלצת לתזכורת
          </label>
          <input type="time" value={settings.time} onChange={(event) => save({ ...settings, time: event.target.value })} className="mb-4 w-full rounded-3xl border border-app-border bg-white px-4 py-3 text-center text-xl font-black" />

          <button type="button" onClick={() => save({ ...settings, endOfMonth: !settings.endOfMonth })} className="focus-ring mb-4 flex w-full items-center justify-between rounded-3xl bg-white px-4 py-3 text-right font-black">
            <span>להזכיר גם בסוף חודש לעבור למצב מרינגו</span>
            <span className="rounded-full bg-app-muted px-3 py-1 text-xs text-app-primary">{settings.endOfMonth ? "כן" : "לא"}</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={enableReminders} className="pill-button focus-ring bg-app-dark text-white">הפעל</button>
            <button type="button" onClick={() => save({ ...settings, enabled: false })} className="pill-button focus-ring bg-white text-app-text">כבה</button>
          </div>

          {permission === "denied" ? <p className="mt-3 rounded-2xl bg-app-warmSoft p-3 text-sm font-bold text-app-text">הדפדפן חסם התראות. אפשר להפעיל הרשאה בהגדרות האתר.</p> : null}
          {permission === "unsupported" ? <p className="mt-3 rounded-2xl bg-app-warmSoft p-3 text-sm font-bold text-app-text">הדפדפן לא תומך בהתראות, אבל ההעדפה נשמרה כתזכורת חזותית באפליקציה.</p> : null}
        </div>
      </section>
    </div>
  );
}

function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return DEFAULT_REMINDERS;
    return { ...DEFAULT_REMINDERS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDERS;
  }
}

function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
