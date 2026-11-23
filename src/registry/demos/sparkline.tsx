"use client";

import { Sparkline } from "@/registry/ui/charts";

const rows = [
  { sym: "CORE", price: "184.20", chg: "+2.4%", v: [10, 12, 11, 14, 13, 15, 17, 16, 19] },
  { sym: "GRID", price: "62.05", chg: "−1.1%", v: [20, 19, 21, 18, 17, 18, 16, 17, 15] },
  { sym: "NODE", price: "9.87", chg: "+0.6%", v: [5, 6, 5, 6, 7, 6, 7, 7, 8] },
];

export default function SparklineDemo() {
  return (
    <div className="grid w-full max-w-xs divide-y rounded-xl border bg-card">
      {rows.map((r) => (
        <div key={r.sym} className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="w-14 text-sm font-semibold">{r.sym}</p>
          <Sparkline values={r.v} width={80} />
          <div className="grid text-right">
            <span className="text-sm tabular-nums">{r.price}</span>
            <span className={r.chg.startsWith("+") ? "text-xs text-success" : "text-xs text-destructive"}>{r.chg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
