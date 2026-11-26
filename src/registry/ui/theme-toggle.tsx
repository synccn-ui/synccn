"use client";

import { useEffect } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useControllable, useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeToggleProps {
  /** Controlled theme. */
  value?: ThemeMode;
  /**
   * Theme at first, when uncontrolled.
   * @default "system"
   */
  defaultValue?: ThemeMode;
  /** Called with the chosen theme. */
  onValueChange?: (theme: ThemeMode) => void;
  /**
   * "segmented" shows light, dark and system; "icon" is one button that flips between light and dark.
   * @default "segmented"
   */
  variant?: "segmented" | "icon";
  /**
   * Toggles the `dark` class on <html> to match. Turn off when your app applies the theme itself (next-themes and friends).
   * @default false
   */
  apply?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Resolves "system" to light or dark using the operating system's setting. */
export function useResolvedTheme(theme: ThemeMode): "light" | "dark" {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Light, dark and system switch, as a three-way segmented control or a single animated icon
 * button. Works with any theme setup; with `apply` it sets the `dark` class itself.
 */
export function ThemeToggle({ value, defaultValue = "system", onValueChange, variant = "segmented", apply = false, className }: ThemeToggleProps) {
  const [theme, setTheme] = useControllable<ThemeMode>({ value, defaultValue, onChange: onValueChange });
  const resolved = useResolvedTheme(theme);

  useEffect(() => {
    if (apply) document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [apply, resolved]);

  if (variant === "icon") {
    const dark = resolved === "dark";
    return (
      <button
        type="button"
        onClick={() => setTheme(dark ? "light" : "dark")}
        aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
        className={cn("relative grid size-9 place-items-center overflow-hidden rounded-md border border-input bg-background shadow-xs transition-colors hover:bg-accent", className)}
      >
        <Sun className={cn("absolute size-4 transition-all duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]", dark ? "-translate-y-6 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100")} />
        <Moon className={cn("absolute size-4 transition-all duration-500 ease-[cubic-bezier(.3,1.4,.5,1)]", dark ? "translate-y-0 rotate-0 opacity-100" : "translate-y-6 -rotate-90 opacity-0")} />
      </button>
    );
  }

  const index = OPTIONS.findIndex((o) => o.value === theme);
  return (
    <div role="radiogroup" aria-label="Theme" className={cn("relative grid w-fit grid-cols-3 rounded-full border bg-muted/60 p-0.5", className)}>
      <span aria-hidden className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/3)] rounded-full border bg-background shadow-xs transition-transform duration-300 ease-[cubic-bezier(.3,1.1,.4,1)]" style={{ transform: `translateX(${index * 100}%)` }} />
      {OPTIONS.map((o, i) => {
        const Icon = o.icon;
        const on = o.value === theme;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.label}
            title={o.label}
            tabIndex={on ? 0 : -1}
            onClick={() => setTheme(o.value)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              const next = OPTIONS[(i + d + OPTIONS.length) % OPTIONS.length];
              setTheme(next.value);
              (e.currentTarget.parentElement?.querySelectorAll("button")[OPTIONS.indexOf(next)] as HTMLButtonElement | undefined)?.focus();
            }}
            className={cn("relative z-[1] grid size-7 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-ring", on ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
