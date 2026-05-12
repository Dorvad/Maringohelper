export type ViewKey = "home" | "month" | "report" | "projects";

export type Project = {
  id: string;
  name: string;
  maringoCode?: string;
  color: string;
  isActive: boolean;
  isFavorite: boolean;
  order: number;
  createdAt: string;
};

export type TimeEntry = {
  id: string;
  projectId: string;
  hours: number;
  note?: string;
  createdAt: string;
};

export type DayRecord = {
  date: string;
  targetHours: number;
  submittedToMaringo: boolean;
  isNonWorkDay: boolean;
  note?: string;
  entries: TimeEntry[];
  createdAt: string;
  updatedAt: string;
};

export type DayStatus = "empty" | "partial" | "complete" | "over" | "nonWork";

export type MonthSummary = {
  monthKey: string;
  totalHours: number;
  completeDays: number;
  partialDays: number;
  emptyWorkDays: number;
  submittedDays: number;
  projectTotals: Array<{
    projectId: string;
    hours: number;
  }>;
};
