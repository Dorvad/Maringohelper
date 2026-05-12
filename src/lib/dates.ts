const HEBREW_WEEKDAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HEBREW_SHORT_WEEKDAYS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatFullDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function weekdayName(isoDate: string): string {
  return HEBREW_WEEKDAYS[parseISODate(isoDate).getDay()];
}

export function monthKeyFromDate(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function shiftMonth(monthKey: string, diff: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + diff, 1);
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}`;
}

export function formatMonthTitle(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function getMonthDays(monthKey: string): string[] {
  const [year, month] = monthKey.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = `${index + 1}`.padStart(2, "0");
    return `${year}-${`${month}`.padStart(2, "0")}-${day}`;
  });
}

export function getCalendarCells(monthKey: string): Array<string | null> {
  const days = getMonthDays(monthKey);
  const firstDay = parseISODate(days[0]).getDay();
  return [...Array.from({ length: firstDay }, () => null), ...days];
}

export function isWeekend(isoDate: string): boolean {
  const day = parseISODate(isoDate).getDay();
  return day === 5 || day === 6;
}

export function getShortWeekdays(): string[] {
  return HEBREW_SHORT_WEEKDAYS;
}
