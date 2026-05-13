import { X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { AppSettings, Client, DayRecord, Project, TimeEntry } from "../types";
import { formatDisplayDate } from "../lib/dates";
import { DEFAULT_TARGET_HOURS, formatHours, remainingHours, roundHours, sumEntries } from "../lib/hours";
import { IconButton } from "./IconButton";

type AddEntrySheetProps = {
  isOpen: boolean;
  date: string;
  day?: DayRecord;
  projects: Project[];
  clients: Client[];
  entryToEdit?: TimeEntry;
  settings: AppSettings;
  onClose: () => void;
  onSubmit: (input: { projectId: string; clientId?: string; hours: number; note?: string }) => Promise<void>;
};

const quickAmounts = [0.5, 1, 2, 3];

export function AddEntrySheet({ isOpen, date, day, projects, clients, entryToEdit, settings, onClose, onSubmit }: AddEntrySheetProps) {
  const activeProjects = useMemo(() => projects.filter((project) => project.isActive || project.id === entryToEdit?.projectId), [projects, entryToEdit]);
  const activeClients = useMemo(() => clients.filter((client) => client.isActive || client.id === entryToEdit?.clientId), [clients, entryToEdit]);
  const [projectId, setProjectId] = useState("");
  const [clientId, setClientId] = useState("");
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setProjectId(entryToEdit?.projectId ?? "");
    setClientId(entryToEdit?.clientId ?? clients.find((client) => client.name === "ללא לקוח")?.id ?? "");
    setHours(entryToEdit?.hours ?? Math.min(1, Math.max(0.5, remainingHours(day, day?.targetHours ?? settings.dailyTargetHours))));
    setNote(entryToEdit?.note ?? "");
  }, [clients, day, entryToEdit, isOpen, settings.dailyTargetHours]);

  const target = day?.targetHours ?? settings.dailyTargetHours ?? DEFAULT_TARGET_HOURS;
  const remaining = remainingHours(day, target);
  const currentTotal = sumEntries(day?.entries ?? []) - (entryToEdit?.hours ?? 0);
  const nextTotal = roundHours(currentTotal + hours);
  const willOverfill = nextTotal > target;
  const mode = entryToEdit ? "edit" : "add";

  if (!isOpen) return null;

  async function handleSubmit() {
    if (!projectId || hours <= 0) return;
    if (willOverfill && !settings.allowOverTargetHours) return;
    if (willOverfill && settings.allowOverTargetHours && !window.confirm(`היום עובר את מכסת ${target} השעות. לשמור כחריג?`)) return;
    await onSubmit({ projectId, clientId: clientId || undefined, hours, note: note.trim() || undefined });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-app-dark/30 p-0 backdrop-blur-sm md:items-center md:p-8">
      <section className="max-h-[94dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[2rem] bg-white p-5 shadow-floating md:rounded-[2rem]" role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-app-secondary">{formatDisplayDate(date)}</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">{mode === "edit" ? "עריכת שעות" : "הוספת שעות"}</h2>
            <p className="mt-1 text-sm text-app-secondary">נותרו {formatHours(remaining)} ביום הזה</p>
          </div>
          <IconButton label="סגור" onClick={onClose} className="bg-app-soft shadow-none">
            <X size={20} />
          </IconButton>
        </div>

        <Picker title="בחר לקוח" className="mb-4">
          {activeClients.length === 0 ? <p className="shrink-0 rounded-3xl bg-app-soft px-4 py-3 text-sm font-bold text-app-secondary">אין עדיין לקוחות. אפשר להוסיף בלשונית לקוחות.</p> : null}
          {activeClients.map((client) => (
            <button
              key={client.id}
              type="button"
              onClick={() => setClientId(client.id)}
              className={clsx(
                "focus-ring shrink-0 rounded-full border px-4 py-3 text-sm font-black transition active:scale-95",
                clientId === client.id ? "border-app-dark bg-app-dark text-white" : "border-app-border bg-app-soft text-app-text",
              )}
            >
              {client.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setClientId("")}
            className={clsx(
              "focus-ring shrink-0 rounded-full border px-4 py-3 text-sm font-black transition active:scale-95",
              !clientId ? "border-app-dark bg-app-dark text-white" : "border-app-border bg-app-soft text-app-text",
            )}
          >
            ללא לקוח
          </button>
        </Picker>

        <Picker title="בחר פרויקט" className="mb-5">
          {activeProjects.length === 0 ? <p className="shrink-0 rounded-3xl bg-app-soft px-4 py-3 text-sm font-bold text-app-secondary">אין פרויקטים פעילים. אפשר להוסיף בלשונית פרויקטים.</p> : null}
          {activeProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setProjectId(project.id)}
              className={clsx(
                "focus-ring shrink-0 rounded-full border px-4 py-3 text-sm font-black transition active:scale-95",
                projectId === project.id ? "border-app-dark bg-app-dark text-white" : "border-app-border bg-app-soft text-app-text",
              )}
            >
              {project.name}
            </button>
          ))}
        </Picker>

        <div className="mb-5 rounded-[1.75rem] bg-app-soft p-4">
          <label className="mb-3 block text-sm font-black">כמה שעות?</label>
          <div className="flex items-center justify-between gap-4">
            <button type="button" className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white text-2xl font-black shadow-soft" onClick={() => setHours((value) => Math.max(0.5, roundHours(value - 0.5)))}>
              −
            </button>
            <input inputMode="decimal" value={hours} onChange={(event) => setHours(Number(event.target.value) || 0)} className="w-28 rounded-3xl bg-white px-4 py-4 text-center text-3xl font-black tracking-[-0.05em] shadow-soft" aria-label="כמות שעות" />
            <button type="button" className="focus-ring grid h-12 w-12 place-items-center rounded-full bg-white text-2xl font-black shadow-soft" onClick={() => setHours((value) => roundHours(value + 0.5))}>
              +
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickAmounts.map((amount) => (
              <button type="button" key={amount} onClick={() => setHours(amount)} className="focus-ring rounded-full bg-white px-4 py-2 text-sm font-black shadow-soft transition active:scale-95">
                {amount}
              </button>
            ))}
            <button type="button" onClick={() => setHours(Math.max(0.5, remaining))} className="focus-ring rounded-full bg-app-primary px-4 py-2 text-sm font-black text-white shadow-soft transition active:scale-95">
              כל מה שנשאר
            </button>
          </div>
        </div>

        {willOverfill ? (
          <p className="mb-4 rounded-3xl bg-app-warmSoft px-4 py-3 text-sm font-bold text-app-text">
            שים לב: אחרי השמירה היום יעמוד על {formatHours(nextTotal)}, כלומר מעל המכסה{settings.allowOverTargetHours ? "." : " — חסום בהגדרות."}
          </p>
        ) : null}

        <label className="mb-2 block text-sm font-black">הערה אופציונלית</label>
        <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} className="mb-5 w-full resize-none rounded-[1.5rem] border border-app-border bg-white px-4 py-3 text-sm shadow-soft" placeholder="למשל: עבודה על מצגת, פגישות, עדכון תוכן..." />

        <button type="button" onClick={handleSubmit} disabled={!projectId || hours <= 0 || (willOverfill && !settings.allowOverTargetHours)} className="pill-button focus-ring w-full bg-app-dark text-white shadow-soft disabled:opacity-50">
          {mode === "edit" ? "שמור שינוי" : "הוסף ליום"}
        </button>
      </section>
    </div>
  );
}

function Picker({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-black">{title}</label>
      <div className="flex gap-2 overflow-x-auto pb-2">{children}</div>
    </div>
  );
}
