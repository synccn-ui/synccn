"use client";

import type * as React from "react";
import { useState } from "react";
import { Keyboard, X } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface ShortcutRecorderProps {
  /** Controlled shortcut, written like "Mod+Shift+K". Mod means ⌘ on Mac and Ctrl elsewhere. */
  value?: string | null;
  /** Shortcut at first, when uncontrolled. */
  defaultValue?: string | null;
  /** Called with the new shortcut, or null when cleared. */
  onValueChange?: (value: string | null) => void;
  /** Shortcuts already in use, so clashes are flagged. */
  taken?: string[];
  /** Accessible name, e.g. "Open command menu". */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

const MODS = ["Mod", "Ctrl", "Alt", "Shift"] as const;
const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const keyName = (e: KeyboardEvent | React.KeyboardEvent) => {
  const k = e.key;
  if (k === " ") return "Space";
  if (k.length === 1) return k.toUpperCase();
  return { ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", Escape: "Esc" }[k] ?? k;
};

/** Turns "Mod+Shift+K" into the symbols for the person's platform: ⌘⇧K on a Mac, Ctrl+Shift+K elsewhere. */
export function formatShortcut(shortcut: string, mac = isMac()): string[] {
  return shortcut.split("+").map((p) => (mac ? { Mod: "⌘", Ctrl: "⌃", Alt: "⌥", Shift: "⇧" }[p] : { Mod: "Ctrl" }[p]) ?? p);
}

/** True when a keyboard event matches a shortcut like "Mod+K". */
export function matchesShortcut(e: KeyboardEvent, shortcut: string, mac = isMac()): boolean {
  const parts = shortcut.split("+");
  const key = parts[parts.length - 1];
  const want = new Set(parts.slice(0, -1));
  const mod = mac ? e.metaKey : e.ctrlKey;
  return (
    keyName(e) === key &&
    want.has("Mod") === mod &&
    want.has("Shift") === e.shiftKey &&
    want.has("Alt") === e.altKey &&
    want.has("Ctrl") === (mac ? e.ctrlKey : false)
  );
}

/**
 * Click and press keys to set a keyboard shortcut. Shows platform symbols, warns about
 * clashes and shortcuts without a modifier, and gives you a portable "Mod+K" string.
 */
export function ShortcutRecorder({ value, defaultValue = null, onValueChange, taken = [], "aria-label": ariaLabel = "Shortcut", className }: ShortcutRecorderProps) {
  const [shortcut, setShortcut] = useControllable<string | null>({ value, defaultValue, onChange: onValueChange });
  const [recording, setRecording] = useState(false);
  const [held, setHeld] = useState<string[]>([]);
  const [warning, setWarning] = useState("");
  const mac = isMac();

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!recording) {
      if (e.key === "Backspace" || e.key === "Delete") (e.preventDefault(), setShortcut(null));
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (e.key === "Escape" && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) return (setRecording(false), setHeld([]));
    const mods = [mac ? e.metaKey && "Mod" : e.ctrlKey && "Mod", mac && e.ctrlKey && "Ctrl", e.altKey && "Alt", e.shiftKey && "Shift"].filter(Boolean) as string[];
    if (["Meta", "Control", "Alt", "Shift"].includes(e.key)) return setHeld(mods);
    const combo = [...mods, keyName(e)].join("+");
    if (!mods.length && !/^F\d{1,2}$/.test(keyName(e))) return setWarning("Add a modifier like Ctrl, ⌘, Alt or Shift.");
    if (taken.includes(combo)) return setWarning(`${formatShortcut(combo, mac).join(mac ? "" : "+")} is already used.`);
    setWarning("");
    setShortcut(combo);
    setRecording(false);
    setHeld([]);
  };

  const keys = recording ? (held.length ? formatShortcut(held.join("+"), mac) : []) : shortcut ? formatShortcut(shortcut, mac) : [];
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`${ariaLabel}: ${shortcut ? formatShortcut(shortcut, mac).join(" ") : "none"}. ${recording ? "Press the new keys, or Escape to cancel." : "Press Enter to record."}`}
          onClick={() => (setRecording(true), setWarning(""))}
          onKeyDown={onKeyDown}
          onBlur={() => (setRecording(false), setHeld([]))}
          className={cn(
            "inline-flex h-9 min-w-40 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-sm shadow-xs outline-none transition-[border-color,box-shadow]",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20",
            recording && "border-ring ring-3 ring-ring/20"
          )}
        >
          <Keyboard className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          {keys.length ? (
            <span className="flex items-center gap-1">
              {keys.map((k, i) => (
                <kbd key={i} className="inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] border border-b-2 bg-muted px-1.5 font-sans text-xs font-medium">
                  {k}
                </kbd>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">{recording ? "Press keys…" : "Click to record"}</span>
          )}
          {recording && <span className="ml-auto size-2 shrink-0 animate-pulse rounded-full bg-destructive" aria-hidden />}
        </button>
        {shortcut && !recording && (
          <button type="button" aria-label={`Clear ${ariaLabel}`} onClick={() => setShortcut(null)} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>
      <p className={cn("min-h-4 text-xs", warning ? "text-destructive" : "text-muted-foreground")} aria-live="polite">
        {warning || (recording ? "Escape cancels" : "")}
      </p>
    </div>
  );
}
