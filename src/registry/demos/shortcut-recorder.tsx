"use client";

import { useEffect, useState } from "react";
import { ShortcutRecorder, formatShortcut, matchesShortcut } from "@/registry/ui/shortcut-recorder";

export default function ShortcutRecorderDemo() {
  const [search, setSearch] = useState<string | null>("Mod+K");
  const [sidebar, setSidebar] = useState<string | null>("Mod+B");
  const [hits, setHits] = useState(0);

  useEffect(() => {
    if (!search) return;
    const on = (e: KeyboardEvent) => {
      if (document.activeElement?.closest("[data-recorder]")) return;
      if (matchesShortcut(e, search)) (e.preventDefault(), setHits((h) => h + 1));
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [search]);

  return (
    <div className="grid w-full max-w-sm gap-4">
      {[
        { label: "Search", value: search, set: setSearch, taken: sidebar ? [sidebar] : [] },
        { label: "Toggle sidebar", value: sidebar, set: setSidebar, taken: search ? [search] : [] },
      ].map((r) => (
        <div key={r.label} data-recorder className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <p className="pt-2 text-sm font-medium">{r.label}</p>
          <ShortcutRecorder aria-label={r.label} value={r.value} onValueChange={r.set} taken={r.taken} />
        </div>
      ))}
      <p className="text-center text-[13px] text-muted-foreground" aria-live="polite">
        {search ? `Press ${formatShortcut(search).join(" ")} anywhere: triggered ${hits} ${hits === 1 ? "time" : "times"}` : "No search shortcut set"}
      </p>
    </div>
  );
}
