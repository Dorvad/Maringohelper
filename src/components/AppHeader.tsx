import { Bell, Download, Settings } from "lucide-react";
import { IconButton } from "./IconButton";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onExport: () => void;
};

export function AppHeader({ title, subtitle, onExport }: AppHeaderProps) {
  return (
    <header className="mb-7 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/80 text-lg font-black shadow-soft">
          ד
        </div>
        <div>
          <p className="text-sm font-bold text-app-secondary">היי, דור</p>
          <h1 className="max-w-[240px] text-3xl font-black leading-tight tracking-[-0.04em] text-app-text md:max-w-none">
            {title}
          </h1>
          {subtitle ? <p className="mt-1 text-sm text-app-secondary">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton label="ייצוא וגיבוי" onClick={onExport}>
          <Download size={20} />
        </IconButton>
        <IconButton label="התראות">
          <Bell size={20} />
        </IconButton>
        <IconButton label="הגדרות">
          <Settings size={20} />
        </IconButton>
      </div>
    </header>
  );
}
