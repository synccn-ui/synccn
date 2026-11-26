"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { Dialog } from "@/registry/ui/dialog";
import { formatShortcut } from "@/registry/ui/shortcut-recorder";

export interface ShortcutGroup {
  title: string;
  items: { label: string; /** Written like "Mod+K", "Shift+?" or "G then I". */ keys: string }[];
}

export interface ShortcutsDialogProps {
  groups: ShortcutGroup[];
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Key that opens the dialog when you're not typing in a field. Pass false to turn it off.
   * @default "?"
   */
  openWith?: string | false;
  /**
   * Heading.
   * @default "Keyboard shortcuts"
   */
  title?: string;
}

function Keys({ keys }: { keys: string }) {
  const steps = keys.split(" then ");
  return (
    <span className="flex shrink-0 items-center gap-1">
      {steps.map((s, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="px-0.5 text-[11px] text-muted-foreground">then</span>}
          {formatShortcut(s).map((k, j) => (
            <kbd key={j} className="inline-flex h-6 min-w-6 items-center justify-center rounded-[5px] border border-b-2 bg-muted px-1.5 font-sans text-xs font-medium">
              {k}
            </kbd>
          ))}
        </span>
      ))}
    </span>
  );
}

/**
 * The "?" cheat sheet: every shortcut in groups, searchable, with keys shown the way the
 * person's platform writes them. Opens with "?" by default.
 */
export function ShortcutsDialog({ groups, open, onOpenChange, openWith = "?", title = "Keyboard shortcuts" }: ShortcutsDialogProps) {
  const [isOpen, setOpen] = useControllable({ value: open, defaultValue: false, onChange: onOpenChange });
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!openWith) return;
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === openWith && !e.metaKey && !e.ctrlKey && !e.altKey) (e.preventDefault(), setOpen(true));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [openWith, setOpen]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return groups.map((g) => ({ ...g, items: g.items.filter((i) => !t || i.label.toLowerCase().includes(t) || g.title.toLowerCase().includes(t)) })).filter((g) => g.items.length);
  }, [groups, q]);

  return (
    <Dialog open={isOpen} onOpenChange={(o) => (setOpen(o), !o && setQ(""))} title={title} size="lg">
      <div className="grid gap-4">
        <label className="flex h-9 items-center gap-2 rounded-md border border-input px-3">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shortcuts" aria-label="Search shortcuts" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        </label>
        <div className="grid max-h-[55vh] gap-x-8 gap-y-5 overflow-y-auto sm:grid-cols-2">
          {shown.map((g) => (
            <section key={g.title} className="grid content-start gap-1">
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{g.title}</h3>
              <dl className="grid">
                {g.items.map((i) => (
                  <div key={i.label} className="flex items-center justify-between gap-3 border-b py-1.5 last:border-b-0">
                    <dt className="text-sm">{i.label}</dt>
                    <dd>
                      <Keys keys={i.keys} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          {!shown.length && <p className="text-sm text-muted-foreground">No shortcuts match.</p>}
        </div>
      </div>
    </Dialog>
  );
}
