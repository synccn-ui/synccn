"use client";

import { CategoryBar } from "@/registry/ui/data-viz";

export default function CategoryBarDemo() {
  return (
    <div className="grid w-full max-w-lg gap-3 rounded-xl border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">Storage</span>
        <span className="text-sm tabular-nums text-muted-foreground">68.4 GB of 100 GB</span>
      </div>
      <CategoryBar
        format={(v) => `${v} GB`}
        data={[
          { label: "Video", value: 31.2 },
          { label: "Photos", value: 18.5 },
          { label: "Documents", value: 9.7 },
          { label: "Apps", value: 9 },
        ]}
      />
    </div>
  );
}
