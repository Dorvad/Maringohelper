import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { AlertTriangle, CalendarCheck2, CheckCircle2 } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { AddEntrySheet } from "./components/AddEntrySheet";
import { BottomNav } from "./components/BottomNav";
import { DesktopRail } from "./components/DesktopRail";
import { EntryList } from "./components/EntryList";
import { MonthGrid } from "./components/MonthGrid";
import { ProgressHero } from "./components/ProgressHero";
import { ProjectsView } from "./components/ProjectsView";
import { RemindersSheet } from "./components/RemindersSheet";
import { ReportView } from "./components/ReportView";
import { SettingsSheet } from "./components/SettingsSheet";
import {
  addClient,
  addProject,
  addTimeEntry,
  db,
  deleteTimeEntry,
  importBackupData,
  seedDatabaseIfNeeded,
  setSubmittedToMaringo,
  toggleClientActive,
  toggleClientFavorite,
  toggleProjectActive,
  toggleProjectFavorite,
  updateTimeEntry,
  validateBackupData,
} from "./lib/db";
import { dayToCopyText, downloadBackupJson, downloadTextFile, makeCsv } from "./lib/export";
import { formatHours, getDayStatus, remainingHours, sumEntries } from "./lib/hours";
import { formatDisplayDate, formatMonthTitle, getMonthDays, monthKeyFromDate, parseISODate, todayISO, weekdayName } from "./lib/dates";
import { loadSettings, saveSettings } from "./lib/settings";
import type { AppSettings, Client, DayRecord, Project, TimeEntry, ViewKey } from "./types";

export default function App() {
  const today = todayISO();
  const [activeView, setActiveView] = useState<ViewKey>("home");
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthKey, setMonthKey] = useState(monthKeyFromDate(today));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<{ date: string; entry: TimeEntry } | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    void seedDatabaseIfNeeded();
  }, []);

  const projects = useLiveQuery(() => db.projects.orderBy("order").toArray(), [], []);
  const clients = useLiveQuery(() => db.clients.orderBy("order").toArray(), [], []);
  const selectedDay = useLiveQuery(() => db.days.get(selectedDate), [selectedDate]);
  const sheetDate = entryToEdit?.date ?? selectedDate;
  const sheetDay = useLiveQuery(() => db.days.get(sheetDate), [sheetDate]);
  const monthDays = useLiveQuery(
    () => db.days.where("date").between(`${monthKey}-01`, `${monthKey}-31`, true, true).toArray(),
    [monthKey],
    [],
  );

  const monthCalendarDays = useMemo(() => getMonthDays(monthKey), [monthKey]);
  const monthByDate = useMemo(() => new Map((monthDays ?? []).map((day) => [day.date, day])), [monthDays]);
  const monthSummary = useMemo(() => buildMonthSummary(monthCalendarDays, monthByDate, settings), [monthCalendarDays, monthByDate, settings]);

  async function handleEntrySubmit(input: { projectId: string; clientId?: string; hours: number; note?: string }) {
    const targetDate = entryToEdit?.date ?? selectedDate;
    if (entryToEdit) {
      await updateTimeEntry(targetDate, entryToEdit.entry.id, input);
    } else {
      await addTimeEntry(targetDate, input, settings.dailyTargetHours);
    }
  }

  function handleEditEntry(entry: TimeEntry, date = selectedDate) {
    setSelectedDate(date);
    setMonthKey(monthKeyFromDate(date));
    setEntryToEdit({ date, entry });
    setIsAddOpen(true);
  }

  function handleCloseEntrySheet() {
    setIsAddOpen(false);
    setEntryToEdit(undefined);
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setMonthKey(monthKeyFromDate(date));
  }

  function handleSettingsChange(nextSettings: AppSettings) {
    setSettings(saveSettings(nextSettings));
  }

  function exportCsv() {
    const csv = makeCsv(monthDays ?? [], projects ?? [], clients ?? []);
    downloadTextFile(`maringo-report-${monthKey}.csv`, csv, "text/csv;charset=utf-8");
  }

  async function handleBackup() {
    await downloadBackupJson();
  }

  async function handleImportBackup(file: File, mode: "replace" | "merge") {
    try {
      const parsed = JSON.parse(await file.text());
      if (!validateBackupData(parsed)) {
        window.alert("קובץ הגיבוי לא נראה תקין.");
        return;
      }
      await importBackupData(parsed, mode);
      window.alert(mode === "replace" ? "הגיבוי יובא והחליף את הנתונים." : "הגיבוי מוזג לנתונים הקיימים.");
    } catch {
      window.alert("לא הצלחתי לקרוא את קובץ הגיבוי.");
    }
  }

  async function handleCopyDay(day: DayRecord) {
    const text = dayToCopyText(day, projects ?? [], clients ?? []);
    await navigator.clipboard.writeText(text);
    window.alert("הפירוט הועתק ללוח.");
  }

  async function handleToggleSubmitted(day: DayRecord) {
    await setSubmittedToMaringo(day.date, !day.submittedToMaringo, settings.dailyTargetHours);
  }

  const titleByView: Record<ViewKey, string> = {
    home: "בוא נסגור את היום.",
    month: "מבט חודשי.",
    report: "דוח להזנה במרינגו.",
    projects: "ניהול פרויקטים ולקוחות.",
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[1100px] bg-transparent md:flex md:gap-0">
      <DesktopRail activeView={activeView} onChange={setActiveView} onAdd={() => setIsAddOpen(true)} />

      <main className="app-shell flex-1 md:max-w-none md:bg-transparent md:shadow-none">
        <div className="app-page">
          <AppHeader title={titleByView[activeView]} subtitle={activeView === "report" ? formatMonthTitle(monthKey) : undefined} onExport={handleBackup} onReminders={() => setIsRemindersOpen(true)} onSettings={() => setIsSettingsOpen(true)} />

          {activeView === "home" ? (
            <HomeView date={selectedDate} today={today} day={selectedDay} monthDates={monthCalendarDays} monthDays={monthDays ?? []} projects={projects ?? []} clients={clients ?? []} settings={settings} monthSummary={monthSummary} onSelectDate={handleSelectDate} onAdd={() => setIsAddOpen(true)} onEdit={handleEditEntry} onDelete={(entryId) => deleteTimeEntry(selectedDate, entryId)} />
          ) : null}

          {activeView === "month" ? <MonthView monthKey={monthKey} today={today} days={monthDays ?? []} selectedDate={selectedDate} settings={settings} onMonthChange={setMonthKey} onSelectDate={handleSelectDate} onAdd={() => setIsAddOpen(true)} /> : null}

          {activeView === "report" ? (
            <div className="space-y-4">
              <section className="soft-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-app-secondary">{formatMonthTitle(monthKey)}</p>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">{monthSummary.submittedDays} ימים כבר סומנו כהוזנו</h2>
                </div>
                <button type="button" onClick={exportCsv} className="pill-button focus-ring bg-app-dark text-white">ייצוא CSV</button>
              </section>
              <ReportView days={monthDays ?? []} projects={projects ?? []} clients={clients ?? []} onEdit={handleEditEntry} onCopy={handleCopyDay} onToggleSubmitted={handleToggleSubmitted} />
            </div>
          ) : null}

          {activeView === "projects" ? (
            <ProjectsView projects={projects ?? []} clients={clients ?? []} onAddProject={addProject} onAddClient={addClient} onToggleProjectActive={toggleProjectActive} onToggleProjectFavorite={toggleProjectFavorite} onToggleClientActive={toggleClientActive} onToggleClientFavorite={toggleClientFavorite} />
          ) : null}
        </div>
      </main>

      <BottomNav activeView={activeView} onChange={setActiveView} onAdd={() => setIsAddOpen(true)} />
      <AddEntrySheet isOpen={isAddOpen} date={sheetDate} day={sheetDay} projects={projects ?? []} clients={clients ?? []} entryToEdit={entryToEdit?.entry} settings={settings} onClose={handleCloseEntrySheet} onSubmit={handleEntrySubmit} />
      <SettingsSheet isOpen={isSettingsOpen} settings={settings} onClose={() => setIsSettingsOpen(false)} onChange={handleSettingsChange} onImportBackup={handleImportBackup} />
      <RemindersSheet isOpen={isRemindersOpen} onClose={() => setIsRemindersOpen(false)} />
    </div>
  );
}

type HomeViewProps = {
  date: string;
  today: string;
  day?: DayRecord;
  monthDates: string[];
  monthDays: DayRecord[];
  projects: Project[];
  clients: Client[];
  settings: AppSettings;
  monthSummary: ReturnType<typeof buildMonthSummary>;
  onSelectDate: (date: string) => void;
  onAdd: () => void;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entryId: string) => void;
};

function HomeView({ date, today, day, monthDates, monthDays, projects, clients, settings, monthSummary, onSelectDate, onAdd, onEdit, onDelete }: HomeViewProps) {
  const remaining = remainingHours(day, settings.dailyTargetHours);
  const daysByDate = new Map(monthDays.map((monthDay) => [monthDay.date, monthDay]));
  const workQueue = monthDates
    .filter((monthDate) => monthDate <= today && settings.workingDays.includes(parseISODate(monthDate).getDay()))
    .map((monthDate) => {
      const record = daysByDate.get(monthDate);
      const status = getDayStatus(record, settings.dailyTargetHours);
      return { date: monthDate, status, remaining: remainingHours(record, settings.dailyTargetHours) };
    })
    .filter((item) => item.status === "empty" || item.status === "partial" || item.status === "over")
    .sort((a, b) => a.date.localeCompare(b.date));
  const urgentQueue = workQueue.slice(0, 5);
  const selectedIsToday = date === today;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
      <div>
        <ProgressHero date={date} day={day} targetHours={settings.dailyTargetHours} isToday={selectedIsToday} onAdd={onAdd} />

        <section className="mb-4 grid gap-3 sm:grid-cols-3">
          <FocusMetric label="נותרו ביום" value={remaining} tone={remaining === 0 ? "success" : "warm"} hint={selectedIsToday ? "לתאריך של היום" : "לתאריך הנבחר"} />
          <FocusMetric label="ימים להשלמה" value={workQueue.length} tone={workQueue.length === 0 ? "success" : "warm"} hint="עד היום בחודש" />
          <FocusMetric label="הוזנו במרינגו" value={monthSummary.submittedDays} tone="primary" hint="בחודש הנוכחי" />
        </section>

        <WorkQueueCard items={urgentQueue} totalCount={workQueue.length} onSelectDate={onSelectDate} onAdd={onAdd} />
      </div>

      <section className="soft-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-app-secondary">מה כבר מולא</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">פירוט היום</h2>
          </div>
          <span className="rounded-full bg-app-soft px-3 py-2 text-xs font-black text-app-secondary">{getStatusLabel(getDayStatus(day, settings.dailyTargetHours))}</span>
        </div>
        <EntryList day={day} projects={projects} clients={clients} onEdit={onEdit} onDelete={onDelete} />
      </section>
    </div>
  );
}

type FocusMetricProps = {
  label: string;
  value: string | number;
  hint: string;
  tone: "primary" | "success" | "warm";
};

function FocusMetric({ label, value, hint, tone }: FocusMetricProps) {
  const toneClass = tone === "success" ? "bg-app-success text-white" : tone === "warm" ? "bg-app-warmSoft text-app-text" : "bg-app-muted text-app-primary";

  return (
    <div className="glass-card min-h-[118px] p-4">
      <div className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-black ${toneClass}`}>{label}</div>
      <p className="text-4xl font-black tracking-[-0.06em] text-app-text">{value}</p>
      <p className="mt-1 text-xs font-bold text-app-secondary">{hint}</p>
    </div>
  );
}

type WorkQueueItem = {
  date: string;
  status: string;
  remaining: number;
};

type WorkQueueCardProps = {
  items: WorkQueueItem[];
  totalCount: number;
  onSelectDate: (date: string) => void;
  onAdd: () => void;
};

function WorkQueueCard({ items, totalCount, onSelectDate, onAdd }: WorkQueueCardProps) {
  return (
    <section className="soft-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-app-secondary">מעקב מילוי למרינגו</p>
          <h2 className="text-2xl font-black tracking-[-0.04em]">מה צריך להשלים עכשיו</h2>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-app-dark px-3 py-2 text-xs font-black text-white">
          <AlertTriangle size={15} />
          {totalCount}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[1.5rem] bg-app-soft p-4">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-app-success text-white">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-base font-black text-app-text">אין שעות חסרות עד היום.</p>
          <p className="mt-1 text-sm font-bold text-app-secondary">השלב הבא הוא לעבור לדוח מרינגו, להעתיק יום־יום ולסמן כהוזן.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.date}
              type="button"
              onClick={() => {
                onSelectDate(item.date);
                onAdd();
              }}
              className="focus-ring flex w-full items-center justify-between gap-3 rounded-[1.5rem] bg-app-soft px-4 py-3 text-right transition active:scale-[0.99]"
            >
              <span>
                <span className="block text-sm font-black text-app-text">{weekdayName(item.date)} · {formatDisplayDate(item.date)}</span>
                <span className="block text-xs font-bold text-app-secondary">{item.status === "over" ? "חריגה — מומלץ לבדוק" : "לחיצה תפתח מילוי ליום"}</span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-black text-app-text">
                {item.status === "over" ? "חריג" : `חסר ${formatHours(item.remaining)}`}
              </span>
            </button>
          ))}
          {totalCount > items.length ? <p className="px-2 text-xs font-bold text-app-secondary">ועוד {totalCount - items.length} ימים מופיעים במבט החודשי.</p> : null}
        </div>
      )}
    </section>
  );
}

type MonthViewProps = {
  monthKey: string;
  today: string;
  days: DayRecord[];
  selectedDate: string;
  settings: AppSettings;
  onMonthChange: (monthKey: string) => void;
  onSelectDate: (date: string) => void;
  onAdd: () => void;
};

function MonthView({ monthKey, today, days, selectedDate, settings, onMonthChange, onSelectDate, onAdd }: MonthViewProps) {
  const daysByDate = new Map(days.map((day) => [day.date, day]));
  const missing = getMonthDays(monthKey).filter((date) => {
    if (date > today) return false;
    const day = daysByDate.get(date);
    const status = getDayStatus(day, settings.dailyTargetHours);
    if (!settings.workingDays.includes(parseISODate(date).getDay())) return false;
    return status === "partial" || status === "over" || status === "empty";
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <MonthGrid monthKey={monthKey} days={days} selectedDate={selectedDate} targetHours={settings.dailyTargetHours} todayDate={today} onMonthChange={onMonthChange} onSelectDate={onSelectDate} />

      <section className="soft-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-app-muted text-app-primary"><CalendarCheck2 size={22} /></div>
          <div>
            <p className="text-sm font-bold text-app-secondary">ימים שדורשים טיפול עד היום</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">{missing.length} ימים</h2>
          </div>
        </div>
        <div className="max-h-[460px] space-y-2 overflow-auto pe-1">
          {missing.slice(0, 16).map((date) => {
            const day = daysByDate.get(date);
            const remaining = remainingHours(day, settings.dailyTargetHours);
            return (
              <button key={date} type="button" onClick={() => { onSelectDate(date); onAdd(); }} className="focus-ring flex w-full items-center justify-between rounded-3xl bg-app-soft px-4 py-3 text-right transition active:scale-[0.99]">
                <span className="font-black">{date.slice(-2)}.{date.slice(5, 7)}</span>
                <span className="text-sm font-bold text-app-secondary">חסרות {formatHours(remaining)}</span>
              </button>
            );
          })}
          {missing.length === 0 ? <p className="rounded-3xl bg-app-soft p-4 text-sm font-bold text-app-secondary">אין ימים חסרים לחודש הזה. אם חסר משהו, בחר יום בלוח והוסף שעות.</p> : null}
        </div>
      </section>
    </div>
  );
}

function buildMonthSummary(monthDates: string[], daysByDate: Map<string, DayRecord>, settings: AppSettings) {
  let totalHours = 0;
  let completeDays = 0;
  let partialDays = 0;
  let emptyWorkDays = 0;
  let submittedDays = 0;

  monthDates.forEach((date) => {
    const day = daysByDate.get(date);
    const status = getDayStatus(day, settings.dailyTargetHours);
    totalHours += sumEntries(day?.entries ?? []);
    if (status === "complete") completeDays += 1;
    if (status === "partial" || status === "over") partialDays += 1;
    if (status === "empty" && settings.workingDays.includes(parseISODate(date).getDay())) emptyWorkDays += 1;
    if (day?.submittedToMaringo) submittedDays += 1;
  });

  return { totalHours, completeDays, partialDays, emptyWorkDays, submittedDays };
}

function getStatusLabel(status: string) {
  if (status === "complete") return "היום הושלם";
  if (status === "partial") return "חסר";
  if (status === "over") return "חריג";
  if (status === "nonWork") return "לא יום עבודה";
  return "ריק";
}
