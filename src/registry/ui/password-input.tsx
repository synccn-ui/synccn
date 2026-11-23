"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

const RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  { label: "One symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];
const LEVELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const TONES = ["bg-destructive", "bg-destructive", "bg-warning", "bg-success/70", "bg-success"];

export interface PasswordInputProps extends Omit<Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">, "showStrength" | "rules"> {
  /** Show the meter and rules checklist. */
  showStrength?: boolean;
  /** Checks shown in the list; strength is the number passed. */
  rules?: PasswordRule[];
  /** Extra classes for the root element. */
  className?: string;
}

/** Password field with show/hide, a strength meter and a rules checklist. */
export function PasswordInput({
  value,
  onChange,
  showStrength = true,
  rules = RULES,
  placeholder = "Enter a password",
  className,
  ...props
}: PasswordInputProps) {
  const [inner, setInner] = useState("");
  const v = String(value ?? inner);
  const [show, setShow] = useState(false);
  const id = useId();
  const passed = rules.filter((r) => r.test(v)).length;
  const score = v ? passed : 0;

  return (
    <div className={cn("grid w-full gap-2.5", className)}>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={v}
          onChange={(e) => (value === undefined && setInner(e.target.value), onChange?.(e))}
          placeholder={placeholder}
          autoComplete="new-password"
          aria-describedby={showStrength ? `${id}-s` : undefined}
          className="h-9 w-full rounded-md border border-input bg-background px-3 pr-10 text-base shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/25 sm:text-sm"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {showStrength && (
        <div id={`${id}-s`} className="grid gap-2.5" aria-live="polite">
          <div className="flex items-center gap-3">
            <div className="grid flex-1 grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={cn("h-1 rounded-full transition-colors duration-300", i < score ? TONES[score] : "bg-muted")} />
              ))}
            </div>
            <span className="w-16 text-right text-xs text-muted-foreground">{v ? LEVELS[score] : ""}</span>
          </div>
          <ul className="grid gap-1 text-[13px] sm:grid-cols-2">
            {rules.map((r) => {
              const ok = r.test(v);
              return (
                <li
                  key={r.label}
                  className={cn("flex items-center gap-1.5 transition-colors", ok ? "text-foreground" : "text-muted-foreground")}
                >
                  {ok ? <Check className="size-3.5 text-success" /> : <X className="size-3.5" />}
                  {r.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
