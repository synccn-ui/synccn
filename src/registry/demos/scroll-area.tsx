"use client";

import { ScrollArea } from "@/registry/ui/scroll-area";

const tags = Array.from({ length: 40 }, (_, i) => `v2.${40 - i}.0`);
const colors = ["oklch(0.7 0.15 250)", "oklch(0.7 0.18 300)", "oklch(0.75 0.15 60)", "oklch(0.7 0.15 160)", "oklch(0.68 0.2 20)", "oklch(0.72 0.12 200)"];

export default function ScrollAreaDemo() {
  return (
    <div className="grid w-full max-w-md gap-5">
      <ScrollArea className="h-64">
        <div className="p-4">
          <p className="mb-3 text-sm font-semibold">Releases</p>
          {tags.map((t) => (
            <div key={t} className="border-b py-2 font-mono text-sm last:border-0">
              {t}
            </div>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea orientation="horizontal">
        <div className="flex w-max gap-3 p-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="grid h-24 w-36 place-items-end rounded-lg p-2 text-xs font-medium text-white" style={{ background: colors[i % colors.length] }}>
              Swatch {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
