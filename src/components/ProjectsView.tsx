import { Star, StarOff, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { Project } from "../types";
import { IconButton } from "./IconButton";

type ProjectsViewProps = {
  projects: Project[];
  onAddProject: (input: { name: string; maringoCode?: string; color?: string }) => Promise<unknown>;
  onToggleActive: (project: Project) => Promise<void>;
  onToggleFavorite: (project: Project) => Promise<void>;
};

const projectColors = ["#6265D8", "#E8AE7E", "#64B68A", "#D7EAF7", "#E6A84F", "#D95F5F"];

export function ProjectsView({ projects, onAddProject, onToggleActive, onToggleFavorite }: ProjectsViewProps) {
  const [name, setName] = useState("");
  const [maringoCode, setMaringoCode] = useState("");
  const [color, setColor] = useState(projectColors[0]);

  async function handleSubmit() {
    if (!name.trim()) return;
    await onAddProject({ name, maringoCode, color });
    setName("");
    setMaringoCode("");
    setColor(projectColors[0]);
  }

  return (
    <div className="space-y-4">
      <section className="soft-card p-5">
        <h2 className="mb-4 text-xl font-black tracking-[-0.04em]">הוסף פרויקט</h2>
        <label className="mb-2 block text-sm font-black">שם פרויקט</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mb-3 w-full rounded-3xl border border-app-border bg-app-soft px-4 py-3 font-bold"
          placeholder="למשל: אופק / פיתוח תוכן / לקוח A"
        />
        <label className="mb-2 block text-sm font-black">קוד במרינגו, אם יש</label>
        <input
          value={maringoCode}
          onChange={(event) => setMaringoCode(event.target.value)}
          className="mb-3 w-full rounded-3xl border border-app-border bg-app-soft px-4 py-3 font-bold"
          placeholder="אופציונלי"
          dir="ltr"
        />
        <div className="mb-4 flex flex-wrap gap-2">
          {projectColors.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setColor(item)}
              className="h-10 w-10 rounded-full ring-offset-2 transition active:scale-95"
              style={{ backgroundColor: item, outline: color === item ? "3px solid #24222A" : "none" }}
              aria-label={`בחר צבע ${item}`}
            />
          ))}
        </div>
        <button type="button" onClick={handleSubmit} disabled={!name.trim()} className="pill-button focus-ring w-full bg-app-dark text-white">
          שמור פרויקט
        </button>
      </section>

      <section className="space-y-3">
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
            <IconButton label="סמן כמועדף" onClick={() => onToggleFavorite(project)} className="h-10 w-10 bg-app-soft shadow-none">
              {project.isFavorite ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
            </IconButton>
            <IconButton label={project.isActive ? "הסתר פרויקט" : "הצג פרויקט"} onClick={() => onToggleActive(project)} className="h-10 w-10 bg-app-soft shadow-none">
              {project.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
            </IconButton>
          </article>
        ))}
      </section>
    </div>
  );
}
