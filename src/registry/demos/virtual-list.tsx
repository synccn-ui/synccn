"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { VirtualList } from "@/registry/ui/virtual-list";

const NAMES = ["synccn", "synccn", "synccn"];
const EVENTS = ["page_view", "sign_up", "checkout", "api_call", "login", "export"];
const ROWS = Array.from({ length: 100_000 }, (_, i) => ({ id: i + 1, event: EVENTS[(i * 7) % EVENTS.length], user: NAMES[i % 3], ms: 20 + ((i * 37) % 900) }));

export default function VirtualListDemo() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState({ start: 0, end: 0 });
  const rows = useMemo(() => (q ? ROWS.filter((r) => r.event.includes(q.toLowerCase()) || String(r.id).startsWith(q)) : ROWS), [q]);
  return (
    <div className="grid w-full max-w-lg overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-3">
        <Search className="size-4 text-muted-foreground" aria-hidden />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter 100,000 events" aria-label="Filter events" className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{rows.length.toLocaleString("en-US")}</span>
      </div>
      <VirtualList
        aria-label="Events"
        items={rows}
        itemHeight={40}
        height={320}
        getKey={(r) => r.id}
        onRangeChange={setRange}
        empty={<p className="p-6 text-center text-sm text-muted-foreground">No events match.</p>}
        renderItem={(r) => (
          <div className="flex h-full items-center gap-3 border-b px-3 text-sm">
            <span className="w-16 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">#{r.id}</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{r.event}</span>
            <span className="hidden w-16 text-muted-foreground sm:block">{r.user}</span>
            <span className="w-14 text-right tabular-nums text-muted-foreground">{r.ms} ms</span>
          </div>
        )}
      />
      <p className="border-t px-3 py-2 text-xs tabular-nums text-muted-foreground">Rendering rows {range.start + 1}–{range.end} only</p>
    </div>
  );
}
