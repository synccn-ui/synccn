"use client";

import { useState } from "react";
import { Badge } from "@/registry/ui/badge";
import { SortableList } from "@/registry/ui/sortable-list";

export default function SortableListDemo() {
  const [items, setItems] = useState([
    { id: "a", label: "Design review", owner: "synccn", tag: "Today" },
    { id: "b", label: "Ship pricing page", owner: "synccn", tag: "Tomorrow" },
    { id: "c", label: "Write release notes", owner: "synccn", tag: "Friday" },
    { id: "d", label: "Plan next sprint", owner: "synccn", tag: "Next week" },
  ]);
  return (
    <div className="grid w-full max-w-sm gap-2">
      <SortableList
        items={items}
        onChange={setItems}
        renderItem={(it, i) => (
          <div className="flex items-center justify-between gap-3">
            <div className="grid min-w-0">
              <span className="truncate text-sm font-medium">
                {i + 1}. {it.label}
              </span>
              <span className="text-xs text-muted-foreground">{it.owner}</span>
            </div>
            <Badge variant="secondary">{it.tag}</Badge>
          </div>
        )}
      />
      <p className="text-center text-xs text-muted-foreground">Drag the handles, or focus one and press Alt + ↑/↓.</p>
    </div>
  );
}
