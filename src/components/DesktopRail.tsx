import { BarChart3, CalendarDays, FolderKanban, Home, Plus } from "lucide-react";
import { clsx } from "clsx";
import type { ViewKey } from "../types";

type DesktopRailProps = {
  activeView: ViewKey;
  onChange: (view: ViewKey) => void;
  onAdd: () => void;
};

const navItems: Array<{ key: ViewKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "בית", icon: Home },
  { key: "month", label: "חודש", icon: CalendarDays },
  { key: "report", label: "דוח מרינגו", icon: BarChart3 },
  { key: "projects", label: "פרויקטים", icon: FolderKanban },
];

export function DesktopRail({ activeView, onChange, onAdd }: DesktopRailProps) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col gap-4 bg-white/65 p-5 shadow-soft backdrop-blur-xl md:flex">
      <div className="mb-4 rounded-[2rem] bg-app-dark p-5 text-white">
        <p className="text-sm font-bold text-white/70">Maringo Helper</p>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.05em]">דוח שעות בלי כאב ראש</h2>
      </div>
      <button type="button" onClick={onAdd} className="pill-button focus-ring gap-2 bg-app-primary text-white shadow-soft">
        <Plus size={20} />
        הוסף שעות
      </button>
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={clsx(
                "focus-ring flex min-h-12 w-full items-center gap-3 rounded-full px-4 text-sm font-black transition active:scale-[0.99]",
                active ? "bg-app-dark text-white" : "text-app-secondary hover:bg-white",
              )}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
