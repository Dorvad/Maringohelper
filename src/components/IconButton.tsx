import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
};

export function IconButton({ label, children, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        "focus-ring grid h-12 w-12 place-items-center rounded-full bg-white/85 text-app-text shadow-soft transition active:scale-95",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
