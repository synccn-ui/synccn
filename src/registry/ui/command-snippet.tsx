"use client";

import type * as React from "react";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface CommandSnippetProps {
  /** The command written for npm, e.g. `npm install motion` or `npx shadcn@latest add button`. Converted for each manager. */
  command: string;
  /**
   * Managers offered, in order.
   * @default ["pnpm", "npm", "yarn", "bun"]
   */
  managers?: PackageManager[];
  /** Controlled manager. */
  value?: PackageManager;
  /** Manager at first, when uncontrolled and nothing is saved. Defaults to the first of `managers`. */
  defaultValue?: PackageManager;
  /** Called when the person picks a manager. */
  onValueChange?: (manager: PackageManager) => void;
  /**
   * Saves the choice in localStorage under this key and keeps every snippet with the same key in step. Pass false to turn off.
   * @default "package-manager"
   */
  storageKey?: string | false;
  /** Extra classes for the root element. */
  className?: string;
}

const ALL: PackageManager[] = ["pnpm", "npm", "yarn", "bun"];

/** Rewrites an npm command for another package manager. */
export function convertCommand(command: string, manager: PackageManager): string {
  const cmd = command.trim();
  if (manager === "npm") return cmd;
  const m = (re: RegExp) => cmd.match(re);
  let r: RegExpMatchArray | null;
  if ((r = m(/^npx\s+(.*)$/))) return { pnpm: `pnpm dlx ${r[1]}`, yarn: `yarn dlx ${r[1]}`, bun: `bunx --bun ${r[1]}` }[manager];
  if ((r = m(/^npm\s+(?:install|i|add)\s+(?:--save-dev|-D)\s+(.*)$/))) return { pnpm: `pnpm add -D ${r[1]}`, yarn: `yarn add -D ${r[1]}`, bun: `bun add -d ${r[1]}` }[manager];
  if ((r = m(/^npm\s+(?:install|i|add)\s+(?:-g|--global)\s+(.*)$/))) return { pnpm: `pnpm add -g ${r[1]}`, yarn: `yarn global add ${r[1]}`, bun: `bun add -g ${r[1]}` }[manager];
  if ((r = m(/^npm\s+(?:install|i|add)\s+(.+)$/))) return `${manager} add ${r[1]}`;
  if (m(/^npm\s+(?:install|i|ci)$/)) return `${manager} install`;
  if ((r = m(/^npm\s+(?:uninstall|remove|rm)\s+(.*)$/))) return `${manager} remove ${r[1]}`;
  if ((r = m(/^npm\s+run\s+(.*)$/))) return manager === "bun" ? `bun run ${r[1]}` : `${manager} ${r[1]}`;
  if ((r = m(/^npm\s+create\s+(.*)$/))) return `${manager} create ${r[1].replace(/\s--\s/, " ")}`;
  if ((r = m(/^npm\s+(.*)$/))) return `${manager} ${r[1]}`;
  return cmd;
}

// One tiny store per storage key, so every snippet on the page switches together.
const listeners = new Map<string, Set<() => void>>();
const read = (key: string): PackageManager | null => {
  try {
    const v = localStorage.getItem(key);
    return v && (ALL as string[]).includes(v) ? (v as PackageManager) : null;
  } catch {
    return null;
  }
};
const write = (key: string, v: PackageManager) => {
  try {
    localStorage.setItem(key, v);
  } catch {
    // Storage can be blocked; the choice still applies until reload.
  }
  listeners.get(key)?.forEach((l) => l());
};

/**
 * An install command with npm, pnpm, yarn and bun tabs and a copy button.
 * Write the command once for npm; the others are worked out, and the choice is remembered.
 */
export function CommandSnippet({ command, managers = ALL, value, defaultValue, onValueChange, storageKey = "package-manager", className }: CommandSnippetProps) {
  const fallback = defaultValue && managers.includes(defaultValue) ? defaultValue : managers[0];
  const [local, setLocal] = useState<PackageManager>(fallback);
  const subscribe = useCallback(
    (cb: () => void) => {
      if (!storageKey) return () => {};
      const set = listeners.get(storageKey) ?? new Set();
      set.add(cb);
      listeners.set(storageKey, set);
      const onStorage = (e: StorageEvent) => e.key === storageKey && cb();
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [storageKey]
  );
  const saved = useSyncExternalStore(
    subscribe,
    () => (storageKey ? read(storageKey) : null),
    () => null
  );
  const pm = value ?? (saved && managers.includes(saved) ? saved : local);
  const [copied, setCopied] = useState(false);
  const text = convertCommand(command, pm);

  const choose = (m: PackageManager) => {
    setLocal(m);
    if (storageKey && value === undefined) write(storageKey, m);
    onValueChange?.(m);
  };

  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!n) return;
    e.preventDefault();
    const next = managers[(i + n + managers.length) % managers.length];
    choose(next);
    (e.currentTarget.parentElement?.querySelector(`[data-pm="${next}"]`) as HTMLElement | null)?.focus();
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.17_0_0)] text-left text-[oklch(0.92_0_0)]", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pl-2 pr-1.5">
        <div role="tablist" aria-label="Package manager" className="flex min-w-0 overflow-x-auto">
          {managers.map((m, i) => (
            <button
              key={m}
              data-pm={m}
              type="button"
              role="tab"
              aria-selected={pm === m}
              tabIndex={pm === m ? 0 : -1}
              onClick={() => choose(m)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "relative h-9 shrink-0 px-2.5 font-mono text-[12.5px] transition-colors outline-none focus-visible:text-white",
                pm === m ? "text-white" : "text-white/45 hover:text-white/80",
                "after:absolute after:inset-x-2 after:bottom-0 after:h-px after:rounded-full after:transition-colors",
                pm === m ? "after:bg-white" : "after:bg-transparent"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy command"}
          onClick={async () => {
            if (await copyText(text)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
          className="grid size-7 shrink-0 place-items-center rounded-md text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3.5 text-[oklch(0.78_0.15_155)]" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <div role="tabpanel" aria-label={`${pm} command`} className="flex items-start gap-2.5 overflow-x-auto px-3.5 py-3 font-mono text-[13px]">
        <Terminal className="mt-0.5 size-3.5 shrink-0 text-white/35" aria-hidden />
        <code className="whitespace-pre">{text}</code>
      </div>
    </div>
  );
}
