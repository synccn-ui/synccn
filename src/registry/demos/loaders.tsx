"use client";

import { Loader } from "@/registry/ui/loaders";

export default function LoadersDemo() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {(["dots", "bars", "pulse", "ring", "orbit", "typing"] as const).map((v) => (
        <div key={v} className="grid h-24 w-24 place-items-center gap-2 rounded-xl border">
          <Loader variant={v} />
          <span className="text-xs text-muted-foreground">{v}</span>
        </div>
      ))}
    </div>
  );
}
