import { BarChart3, CalendarDays, FolderKanban, Home, Plus } from "lucide-react";
import { clsx } from "clsx";
import type { ViewKey } from "../types";

type BottomNavProps = {
  activeView: ViewKey;
  onChange: (view: ViewKey) => void;
  onAdd: () => void;
};

const navItems: Array<{ key: ViewKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "בית", icon: Home },
  { key: "month", label: "חודש", icon: CalendarDays },
  { key: "report", label: "דוח", icon: BarChart3 },
  { key: "projects", label: "פרויקטים", icon: FolderKanban },
];

export function BottomNav({ activeView, onChange, onAdd }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 h-[82px] w-full max-w-[430px] -translate-x-1/2 rounded-t-[2rem] bg-white/95 px-4 pt-2 shadow-[0_-10px_30px_rgba(45,42,90,0.10)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-5 items-start gap-1">
        {navItems.slice(0, 2).map((item) => (
          <NavButton key={item.key} label={item.label} icon={item.icon} active={activeView === item.key} onClick={() => onChange(item.key)} />
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="focus-ring mx-auto -mt-5 grid h-14 w-14 place-items-center rounded-full bg-app-primary text-white shadow-floating transition active:scale-95"
          aria-label="הוסף שעות"
        >
          <Plus size={26} />
        </button>

        {navItems.slice(2).map((item) => (
          <NavButton key={item.key} label={item.label} icon={item.icon} active={activeView === item.key} onClick={() => onChange(item.key)} />
        ))}
      </div>
    </nav>
  );
}

type NavButtonProps = {
  label: string;
  icon: typeof Home;
  active: boolean;
  onClick: () => void;
};

function NavButton({ label, icon: Icon, active, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "focus-ring flex h-16 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition active:scale-95",
        active ? "text-app-primary" : "text-app-secondary",
      )}
    >
      <Icon size={20} strokeWidth={active ? 2.8 : 2} />
      <span>{label}</span>
    </button>
  );
}
