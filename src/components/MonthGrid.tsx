import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import type { DayRecord } from "../types";
import { formatMonthTitle, getCalendarCells, getShortWeekdays, shiftMonth } from "../lib/dates";
import { getDayStatus, sumEntries } from "../lib/hours";
import { IconButton } from "./IconButton";

type MonthGridProps = {
  monthKey: string;
  days: DayRecord[];
  selectedDate: string;
  onMonthChange: (monthKey: string) => void;
  onSelectDate: (date: string) => void;
};

export function MonthGrid({ monthKey, days, selectedDate, onMonthChange, onSelectDate }: MonthGridProps) {
  const daysByDate = new Map(days.map((day) => [day.date, day]));
  const cells = getCalendarCells(monthKey);

  return (
    <section className="soft-card p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <IconButton label="החודש הבא" className="bg-app-soft shadow-none" onClick={() => onMonthChange(shiftMonth(monthKey, 1))}>
          <ChevronRight size={20} />
        </IconButton>
        <h2 className="text-xl font-black tracking-[-0.04em]">{formatMonthTitle(monthKey)}</h2>
        <IconButton label="החודש הקודם" className="bg-app-soft shadow-none" onClick={() => onMonthChange(shiftMonth(monthKey, -1))}>
          <ChevronLeft size={20} />
        </IconButton>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-xs font-black text-app-secondary">
        {getShortWeekdays().map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          const day = daysByDate.get(date);
          const status = getDayStatus(day);
          const active = selectedDate === date;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className={clsx(
                "focus-ring relative min-h-14 rounded-full px-1 py-2 text-center text-xs font-black transition active:scale-95",
                active && "bg-app-dark text-white shadow-soft",
                !active && status === "complete" && "bg-app-primary text-white",
                !active && status === "partial" && "bg-app-warmSoft text-app-text",
                !active && status === "over" && "bg-app-danger text-white",
                !active && status === "empty" && "bg-app-soft text-app-secondary",
                !active && status === "nonWork" && "bg-white text-app-secondary ring-1 ring-app-border",
              )}
            >
              <span className="block text-sm">{Number(date.slice(-2))}</span>
              <span className="block text-[10px] opacity-80">{day ? sumEntries(day.entries) : ""}</span>
              {day?.submittedToMaringo ? (
                <span className="absolute left-1 top-1 h-2 w-2 rounded-full bg-app-success ring-2 ring-white" />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
