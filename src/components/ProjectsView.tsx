import { Star, StarOff, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";
import { clsx } from "clsx";
import type { Client, Project } from "../types";
import { IconButton } from "./IconButton";

type ProjectsViewProps = {
  projects: Project[];
  clients: Client[];
  onAddProject: (input: { name: string; maringoCode?: string; color?: string }) => Promise<unknown>;
  onAddClient: (input: { name: string; code?: string; color?: string; isActive?: boolean; isFavorite?: boolean }) => Promise<unknown>;
  onToggleProjectActive: (project: Project) => Promise<void>;
  onToggleProjectFavorite: (project: Project) => Promise<void>;
  onToggleClientActive: (client: Client) => Promise<void>;
  onToggleClientFavorite: (client: Client) => Promise<void>;
};

const colors = ["#6265D8", "#E8AE7E", "#64B68A", "#D7EAF7", "#E6A84F", "#D95F5F"];

export function ProjectsView(props: ProjectsViewProps) {
  const [tab, setTab] = useState<"projects" | "clients">("projects");

  return (
    <div className="space-y-4">
      <div className="soft-card grid grid-cols-2 gap-2 p-2">
        <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>פרויקטים</TabButton>
        <TabButton active={tab === "clients"} onClick={() => setTab("clients")}>לקוחות</TabButton>
      </div>

      {tab === "projects" ? <ProjectsTab {...props} /> : <ClientsTab {...props} />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={clsx("focus-ring rounded-full px-4 py-3 text-sm font-black transition", active ? "bg-app-dark text-white" : "bg-app-soft text-app-secondary")}>
      {children}
    </button>
  );
}

function ProjectsTab({ projects, onAddProject, onToggleProjectActive, onToggleProjectFavorite }: ProjectsViewProps) {
  const [name, setName] = useState("");
  const [maringoCode, setMaringoCode] = useState("");
  const [color, setColor] = useState(colors[0]);

  async function handleSubmit() {
    if (!name.trim()) return;
    await onAddProject({ name, maringoCode, color });
    setName("");
    setMaringoCode("");
    setColor(colors[0]);
  }

  return (
    <>
      <ManagementForm title="הוסף פרויקט" nameLabel="שם פרויקט" codeLabel="קוד במרינגו, אם יש" name={name} code={maringoCode} color={color} setName={setName} setCode={setMaringoCode} setColor={setColor} onSubmit={handleSubmit} submitLabel="שמור פרויקט" />

      <section className="space-y-3">
        {projects.length === 0 ? <EmptyState title="אין עדיין פרויקטים" text="הוסף פרויקט ראשון כדי לבחור אותו בהזנת שעות." /> : null}
        {projects.map((project) => (
          <article key={project.id} className="soft-card flex items-center gap-4 p-4">
            <span className="h-12 w-3 rounded-full" style={{ backgroundColor: project.color }} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-black">{project.name}</h3>
              <p className="text-sm font-bold text-app-secondary">
                {project.isActive ? "פעיל" : "מוסתר"}
                {project.maringoCode ? ` · ${project.maringoCode}` : ""}
              </p>
            </div>
            <IconButton label="סמן כמועדף" onClick={() => onToggleProjectFavorite(project)} className="h-10 w-10 bg-app-soft shadow-none">
              {project.isFavorite ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
            </IconButton>
            <IconButton label={project.isActive ? "הסתר פרויקט" : "הצג פרויקט"} onClick={() => onToggleProjectActive(project)} className="h-10 w-10 bg-app-soft shadow-none">
              {project.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
            </IconButton>
          </article>
        ))}
      </section>
    </>
  );
}

function ClientsTab({ clients, onAddClient, onToggleClientActive, onToggleClientFavorite }: ProjectsViewProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [isActive, setIsActive] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) return;
    await onAddClient({ name, code, color, isActive, isFavorite });
    setName("");
    setCode("");
    setColor(colors[0]);
    setIsActive(true);
    setIsFavorite(false);
  }

  return (
    <>
      <ManagementForm title="הוסף לקוח" nameLabel="שם לקוח" codeLabel="קוד לקוח, אם יש" name={name} code={code} color={color} setName={setName} setCode={setCode} setColor={setColor} onSubmit={handleSubmit} submitLabel="שמור לקוח">
        <div className="mb-4 grid grid-cols-2 gap-2">
          <TogglePill active={isActive} onClick={() => setIsActive((value) => !value)}>{isActive ? "פעיל" : "לא פעיל"}</TogglePill>
          <TogglePill active={isFavorite} onClick={() => setIsFavorite((value) => !value)}>{isFavorite ? "מועדף" : "לא מועדף"}</TogglePill>
        </div>
      </ManagementForm>

      <section className="space-y-3">
        {clients.length === 0 ? <EmptyState title="אין עדיין לקוחות" text="הוסף לקוחות כדי לתעד עבור מי עבדת. תמיד אפשר להשתמש גם בללא לקוח." /> : null}
        {clients.map((client) => (
          <article key={client.id} className="soft-card flex items-center gap-4 p-4">
            <span className="h-12 w-3 rounded-full" style={{ backgroundColor: client.color }} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-black">{client.name}</h3>
              <p className="text-sm font-bold text-app-secondary">
                {client.isActive ? "פעיל" : "מוסתר"}
                {client.code ? ` · ${client.code}` : ""}
              </p>
            </div>
            <IconButton label="סמן לקוח כמועדף" onClick={() => onToggleClientFavorite(client)} className="h-10 w-10 bg-app-soft shadow-none">
              {client.isFavorite ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
            </IconButton>
            <IconButton label={client.isActive ? "הסתר לקוח" : "הצג לקוח"} onClick={() => onToggleClientActive(client)} className="h-10 w-10 bg-app-soft shadow-none">
              {client.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
            </IconButton>
          </article>
        ))}
      </section>
    </>
  );
}

type ManagementFormProps = {
  title: string;
  nameLabel: string;
  codeLabel: string;
  name: string;
  code: string;
  color: string;
  submitLabel: string;
  children?: ReactNode;
  setName: (value: string) => void;
  setCode: (value: string) => void;
  setColor: (value: string) => void;
  onSubmit: () => void;
};

function ManagementForm({ title, nameLabel, codeLabel, name, code, color, submitLabel, children, setName, setCode, setColor, onSubmit }: ManagementFormProps) {
  return (
    <section className="soft-card p-5">
      <h2 className="mb-4 text-xl font-black tracking-[-0.04em]">{title}</h2>
      <label className="mb-2 block text-sm font-black">{nameLabel}</label>
      <input value={name} onChange={(event) => setName(event.target.value)} className="mb-3 w-full rounded-3xl border border-app-border bg-app-soft px-4 py-3 font-bold" placeholder="שם ברור וקצר" />
      <label className="mb-2 block text-sm font-black">{codeLabel}</label>
      <input value={code} onChange={(event) => setCode(event.target.value)} className="mb-3 w-full rounded-3xl border border-app-border bg-app-soft px-4 py-3 font-bold" placeholder="אופציונלי" dir="ltr" />
      <div className="mb-4 flex flex-wrap gap-2">
        {colors.map((item) => (
          <button type="button" key={item} onClick={() => setColor(item)} className="h-10 w-10 rounded-full ring-offset-2 transition active:scale-95" style={{ backgroundColor: item, outline: color === item ? "3px solid #24222A" : "none" }} aria-label={`בחר צבע ${item}`} />
        ))}
      </div>
      {children}
      <button type="button" onClick={onSubmit} disabled={!name.trim()} className="pill-button focus-ring w-full bg-app-dark text-white disabled:opacity-50">
        {submitLabel}
      </button>
    </section>
  );
}

function TogglePill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={clsx("focus-ring rounded-full px-4 py-3 text-sm font-black", active ? "bg-app-primary text-white" : "bg-app-soft text-app-secondary")}>
      {children}
    </button>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="soft-card p-6 text-center">
      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-1 text-sm text-app-secondary">{text}</p>
    </div>
  );
}
