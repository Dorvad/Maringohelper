import { Bell, X } from "lucide-react";
import { IconButton } from "./IconButton";

type RemindersSheetProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function RemindersSheet({ isOpen, onClose }: RemindersSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-app-dark/30 p-0 backdrop-blur-sm md:items-center md:p-8">
      <section className="w-full max-w-[430px] rounded-t-[2rem] bg-white p-5 shadow-floating md:rounded-[2rem]" role="dialog" aria-modal="true">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-app-secondary">תזכורות</p>
            <h2 className="text-2xl font-black tracking-[-0.04em]">עדיין בלי נוטיפיקציות</h2>
          </div>
          <IconButton label="סגור" onClick={onClose} className="bg-app-soft shadow-none">
            <X size={20} />
          </IconButton>
        </div>
        <div className="rounded-[1.75rem] bg-app-soft p-5 text-center">
          <Bell className="mx-auto text-app-primary" size={28} />
          <p className="mt-3 text-sm font-bold text-app-secondary">בשלב הזה האפליקציה היא כלי מקומי ופשוט. בהמשך אפשר להוסיף תזכורת עדינה לסוף יום עבודה או לסוף חודש.</p>
        </div>
      </section>
    </div>
  );
}
