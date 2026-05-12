import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { CalendarCheck2 } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { AddEntrySheet } from "./components/AddEntrySheet";
import { BottomNav } from "./components/BottomNav";
import { DesktopRail } from "./components/DesktopRail";
import { EntryList } from "./components/EntryList";
import { MonthGrid } from "./components/MonthGrid";
import { ProgressHero } from "./components/ProgressHero";
import { ProjectsView } from "./components/ProjectsView";
import { ReportView } from "./components/ReportView";
import { StatCard } from "./components/StatCard";
import { addProject, addTimeEntry, db, deleteTimeEntry, seedDatabaseIfNeeded, setSubmittedToMaringo, toggleProjectActive, toggleProjectFavorite } from "./lib/db";
import { dayToCopyText, downloadBackupJson, downloadTextFile, makeCsv } from "./lib/export";
import { DEFAULT_TARGET_HOURS, formatHours, getDayStatus, remainingHours, sumEntries } from "./lib/hours";
import { formatMonthTitle, getMonthDays, isWeekend, monthKeyFromDate, todayISO } from "./lib/dates";
import type { DayRecord, Project, ViewKey } from "./types";

export default function App() {
  const today = todayISO();
  const [activeView, setActiveView] = useState<ViewKey>("home");
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthKey, setMonthKey] = useState(monthKeyFromDate(today));
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    void seedDatabaseIfNeeded();
  }, []);

  const projects = useLiveQuery(() => db.projects.orderBy("order").toArray(), [], []);
  const selectedDay = useLiveQuery(() => db.days.get(selectedDate), [selectedDate]);
  const monthDays = useLiveQuery(
    () => db.days.where("date").between(`${monthKey}-01`, `${monthKey}-31`, true, true).toArray(),
    [monthKey],
    [],
  );

  const monthCalendarDays = useMemo(() => getMonthDays(monthKey), [monthKey]);
  const monthByDate = useMemo(() => new Map((monthDays ?? []).map((day) => [day.date, day])), [monthDays]);
  const monthSummary = useMemo(() => buildMonthSummary(monthCalendarDays, monthByDate), [monthCalendarDays, monthByDate]);

  async function handleAddEntry(input: { projectId: string; hours: number; note?: string }) {
    await addTimeEntry(selectedDate, input);
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setMonthKey(monthKeyFromDate(date));
  }

  function exportCsv() {
    const csv = makeCsv(monthDays ?? [], projects ?? []);
    downloadTextFile(`maringo-report-${monthKey}.csv`, csv, "text/csv;charset=utf-8");
  }

  async function handleBackup() {
    await downloadBackupJson();
  }

  async function handleCopyDay(day: DayRecord) {
    const text = dayToCopyText(day, projects ?? []);
    await navigator.clipboard.writeText(text);
    window.alert("הפירוט הועתק ללוח.");
  }

  async function handleToggleSubmitted(day: DayRecord) {
    await setSubmittedToMaringo(day.date, !day.submittedToMaringo);
  }

  const titleByView: Record<ViewKey, string> = {
    home: "בוא נסגור את היום.",
    month: "מבט חודשי.",
    report: "דוח להזנה במרינגו.",
    projects: "הפרויקטים שלך.",
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[1100px] bg-transparent md:flex md:gap-0">
      <DesktopRail activeView={activeView} onChange={setActiveView} onAdd={() => setIsAddOpen(true)} />

      <main className="app-shell flex-1 md:max-w-none md:bg-transparent md:shadow-none">
        <div className="app-page">
          <AppHeader
            title={titleByView[activeView]}
            subtitle={activeView === "report" ? formatMonthTitle(monthKey) : undefined}
            onExport={handleBackup}
          />

          {activeView === "home" ? (
            <HomeView
              date={selectedDate}
              day={selectedDay}
              projects={projects ?? []}
              monthSummary={monthSummary}
              onAdd={() => setIsAddOpen(true)}
              onDelete={(entryId) => deleteTimeEntry(selectedDate, entryId)}
            />
          ) : null}

          {activeView === "month" ? (
            <MonthView
              monthKey={monthKey}
              days={monthDays ?? []}
              selectedDate={selectedDate}
              onMonthChange={setMonthKey}
              onSelectDate={handleSelectDate}
              onAdd={() => setIsAddOpen(true)}
            />
          ) : null}

          {activeView === "report" ? (
            <div className="space-y-4">
              <section className="soft-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-app-secondary">{formatMonthTitle(monthKey)}</p>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">{monthSummary.submittedDays} ימים כבר סומנו כהוזנו</h2>
                </div>
                <button type="button" onClick={exportCsv} className="pill-button focus-ring bg-app-dark text-white">
                  ייצוא CSV
                </button>
              </section>
              <ReportView days={monthDays ?? []} projects={projects ?? []} onCopy={handleCopyDay} onToggleSubmitted={handleToggleSubmitted} />
            </div>
          ) : null}

          {activeView === "projects" ? (
            <ProjectsView
              projects={projects ?? []}
              onAddProject={addProject}
              onToggleActive={toggleProjectActive}
              onToggleFavorite={toggleProjectFavorite}
            />
          ) : null}
        </div>
      </main>

      <BottomNav activeView={activeView} onChange={setActiveView} onAdd={() => setIsAddOpen(true)} />
      <AddEntrySheet
        isOpen={isAddOpen}
        date={selectedDate}
        day={selectedDay}
        projects={projects ?? []}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddEntry}
      />
    </div>
  );
}

type HomeViewProps = {
  date: string;
  day?: DayRecord;
  projects: Project[];
  monthSummary: ReturnType<typeof buildMonthSummary>;
  onAdd: () => void;
  onDelete: (entryId: string) => void;
};

function HomeView({ date, day, projects, monthSummary, onAdd, onDelete }: HomeViewProps) {
  const total = sumEntries(day?.entries ?? []);
  const remaining = remainingHours(day, DEFAULT_TARGET_HOURS);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div>
        <ProgressHero date={date} day={day} onAdd={onAdd} />
        <div className="mb-5 grid grid-cols-2 gap-3">
          <StatCard label="היום" value={total} hint="שעות מולאו" />
          <StatCard label="נותרו" value={remaining} hint="להשלמה" />
          <StatCard label="החודש" value={monthSummary.totalHours} hint="שעות סה״כ" />
          <StatCard label="חסרים" value={monthSummary.partialDays + monthSummary.emptyWorkDays} hint="ימים לבדיקה" />
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-black tracking-[-0.04em]">הפירוט של היום</h2>
          <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-black text-app-secondary">{getStatusLabel(getDayStatus(day))}</span>
        </div>
        <EntryList day={day} projects={projects} onDelete={onDelete} />
      </section>
    </div>
  );
}

type MonthViewProps = {
  monthKey: string;
  days: DayRecord[];
  selectedDate: string;
  onMonthChange: (monthKey: string) => void;
  onSelectDate: (date: string) => void;
  onAdd: () => void;
};

function MonthView({ monthKey, days, selectedDate, onMonthChange, onSelectDate, onAdd }: MonthViewProps) {
  const daysByDate = new Map(days.map((day) => [day.date, day]));
  const missing = getMonthDays(monthKey).filter((date) => {
    const day = daysByDate.get(date);
    const status = getDayStatus(day);
    if (status === "empty" && isWeekend(date)) return false;
    return status === "partial" || status === "over" || status === "empty";
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <MonthGrid monthKey={monthKey} days={days} selectedDate={selectedDate} onMonthChange={onMonthChange} onSelectDate={onSelectDate} />

      <section className="soft-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-app-muted text-app-primary">
            <CalendarCheck2 size={22} />
          </div>
          <div>
            <p className="text-sm font-bold text-app-secondary">ימים שדורשים טיפול</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">{missing.length} ימים</h2>
          </div>
        </div>
        <div className="max-h-[460px] space-y-2 overflow-auto pe-1">
          {missing.slice(0, 16).map((date) => {
            const day = daysByDate.get(date);
            const remaining = remainingHours(day, DEFAULT_TARGET_HOURS);
            return (
              <button
                key={date}
                type="button"
                onClick={() => {
                  onSelectDate(date);
                  onAdd();
                }}
                className="focus-ring flex w-full items-center justify-between rounded-3xl bg-app-soft px-4 py-3 text-right transition active:scale-[0.99]"
              >
                <span className="font-black">{date.slice(-2)}.{date.slice(5, 7)}</span>
                <span className="text-sm font-bold text-app-secondary">חסרות {formatHours(remaining)}</span>
              </button>
            );
          })}
          {missing.length === 0 ? <p className="rounded-3xl bg-app-soft p-4 text-sm font-bold text-app-secondary">החודש נראה מסודר.</p> : null}
        </div>
      </section>
    </div>
  );
}

function buildMonthSummary(monthDates: string[], daysByDate: Map<string, DayRecord>) {
  let totalHours = 0;
  let completeDays = 0;
  let partialDays = 0;
  let emptyWorkDays = 0;
  let submittedDays = 0;

  monthDates.forEach((date) => {
    const day = daysByDate.get(date);
    const status = getDayStatus(day);
    totalHours += sumEntries(day?.entries ?? []);
    if (status === "complete") completeDays += 1;
    if (status === "partial" || status === "over") partialDays += 1;
    if (status === "empty" && !isWeekend(date)) emptyWorkDays += 1;
    if (day?.submittedToMaringo) submittedDays += 1;
  });

  return {
    totalHours,
    completeDays,
    partialDays,
    emptyWorkDays,
    submittedDays,
  };
}

function getStatusLabel(status: string) {
  if (status === "complete") return "היום הושלם";
  if (status === "partial") return "חסר";
  if (status === "over") return "חריג";
  if (status === "nonWork") return "לא יום עבודה";
  return "ריק";
}
