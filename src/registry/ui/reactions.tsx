"use client";

import { useRef, useState } from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/lib/hooks";

const PICKS = ["👍", "❤️", "😂", "🎉", "😮", "🙏", "🔥", "👀"];

export interface ReactionsProps {
  /** Starting counts keyed by emoji. */
  defaultValue?: Record<string, number>;
  /** Emoji the current user has already used. */
  defaultMine?: string[];
  /** Called after every change. */
  onChange?: (counts: Record<string, number>, mine: string[]) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Emoji reactions with counts, your own reaction highlighted, and a picker to add more. */
export function Reactions({ defaultValue = {}, defaultMine = [], onChange, className }: ReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>(defaultValue);
  const [mine, setMine] = useState(() => new Set<string>(defaultMine));
  const [open, setOpen] = useState(false);
  const [pop, setPop] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  useClickOutside(root, () => setOpen(false), open);

  const toggle = (e: string) => {
    const has = mine.has(e);
    const next = { ...counts, [e]: Math.max(0, (counts[e] || 0) + (has ? -1 : 1)) };
    if (!next[e]) delete next[e];
    const m = new Set(mine);
    has ? m.delete(e) : m.add(e);
    setCounts(next);
    setMine(m);
    setPop(has ? null : e);
    onChange?.(next, [...m]);
  };

  return (
    <div ref={root} className={cn("relative flex flex-wrap items-center gap-1.5", className)}>
      {Object.entries(counts).map(([e, n]) => (
        <button
          key={e}
          type="button"
          aria-pressed={mine.has(e)}
          aria-label={`${e} ${n}`}
          onClick={() => toggle(e)}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-full border px-2 text-sm transition-colors",
            mine.has(e) ? "border-primary/50 bg-brand-soft" : "hover:bg-accent"
          )}
        >
          <span key={pop === e ? `${e}-pop` : e} className={cn(pop === e && "animate-[pop_.4s_cubic-bezier(.3,1.8,.5,1)]")}>
            {e}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">{n}</span>
        </button>
      ))}
      <button
        type="button"
        aria-label="Add reaction"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="grid size-7 place-items-center rounded-full border border-dashed text-muted-foreground hover:border-solid hover:bg-accent hover:text-foreground"
      >
        <SmilePlus className="size-3.5" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-50 mb-2 flex animate-in gap-0.5 rounded-full border bg-popover p-1 shadow-lg shadow-black/10"
        >
          {PICKS.map((e) => (
            <button
              key={e}
              type="button"
              role="menuitem"
              aria-label={`React with ${e}`}
              onClick={() => (toggle(e), setOpen(false))}
              className="grid size-8 place-items-center rounded-full text-lg transition-transform hover:scale-125 hover:bg-accent"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes pop{0%{transform:scale(.4)}60%{transform:scale(1.35)}100%{transform:scale(1)}}`}</style>
    </div>
  );
}
