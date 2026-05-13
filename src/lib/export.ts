import type { Client, DayRecord, Project } from "../types";
import { formatDisplayDate, weekdayName } from "./dates";
import { exportAllData } from "./db";

export function downloadTextFile(filename: string, contents: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function dayToCopyText(day: DayRecord, projects: Project[], clients: Client[]): string {
  const lines = [`${weekdayName(day.date)} · ${formatDisplayDate(day.date)}`];
  day.entries.forEach((entry) => {
    const project = projects.find((item) => item.id === entry.projectId);
    const client = clients.find((item) => item.id === entry.clientId);
    lines.push(`${client?.name ?? "ללא לקוח"} — ${project?.name ?? "פרויקט שנמחק"}: ${entry.hours}`);
  });
  return lines.join("\n");
}

export function makeCsv(days: DayRecord[], projects: Project[], clients: Client[]): string {
  const rows = [["date", "display_date", "weekday", "client_name", "client_code", "project_name", "project_code", "hours", "note", "submitted_to_maringo"]];

  days
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((day) => {
      day.entries.forEach((entry) => {
        const project = projects.find((item) => item.id === entry.projectId);
        const client = clients.find((item) => item.id === entry.clientId);
        rows.push([
          day.date,
          formatDisplayDate(day.date),
          weekdayName(day.date),
          client?.name ?? "ללא לקוח",
          client?.code ?? "",
          project?.name ?? "פרויקט שנמחק",
          project?.maringoCode ?? "",
          String(entry.hours),
          entry.note ?? "",
          day.submittedToMaringo ? "yes" : "no",
        ]);
      });
    });

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export async function downloadBackupJson() {
  const data = await exportAllData();
  downloadTextFile(`maringo-helper-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), "application/json");
}

function escapeCsv(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}
