"use client";

import { useEffect, useState } from "react";
import { Pause, Play, Trash2 } from "lucide-react";
import { LogViewer, type LogLine } from "@/registry/ui/log-viewer";

const T0 = Date.UTC(2026, 10, 26, 15, 4, 12);
const SEED: LogLine[] = [
  { id: "s1", time: T0, level: "info", source: "build", message: "Cloning github.com/example/web (branch: main, commit: 4f2a9c1)" },
  { id: "s2", time: T0 + 820, level: "info", source: "build", message: "Installing dependencies with pnpm 10.4.0" },
  { id: "s3", time: T0 + 6210, level: "debug", source: "build", message: "Resolved 1,284 packages in 5.3s (cache hit 96%)" },
  { id: "s4", time: T0 + 6730, level: "warn", source: "build", message: "Peer dependency react@^18 wanted by legacy-chart, found 19.3.1" },
  { id: "s5", time: T0 + 11200, level: "info", source: "build", message: "Compiled 412 modules in 4.4s" },
  { id: "s6", time: T0 + 11900, level: "info", source: "deploy", message: "Uploading 86 static assets to iad1, fra1, hnd1" },
];

const STREAM: Omit<LogLine, "time">[] = [
  { level: "info", source: "deploy", message: "Assigned preview URL web-4f2a9c1.example.app" },
  { level: "debug", source: "edge", message: "GET /api/health 200 3ms" },
  { level: "info", source: "edge", message: "GET / 200 41ms cache=MISS region=iad1" },
  { level: "error", source: "fn", message: "TypeError: Cannot read properties of undefined (reading 'plan')\n    at getBilling (app/billing/page.tsx:18:22)" },
  { level: "warn", source: "edge", message: "Slow response: GET /dashboard took 1,240ms (p95 budget 800ms)" },
  { level: "info", source: "edge", message: "GET /pricing 200 18ms cache=HIT region=fra1" },
  { level: "debug", source: "fn", message: "Cold start in 212ms (memory 1024 MB)" },
];

export default function LogViewerDemo() {
  const [lines, setLines] = useState<LogLine[]>(SEED);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    let i = 0;
    const t = setInterval(() => {
      const next = STREAM[i++ % STREAM.length];
      setLines((l) => [...l, { ...next, id: `l${Date.now()}`, time: Date.now() }]);
    }, 1400);
    return () => clearInterval(t);
  }, [running]);

  const btn = "grid size-7 place-items-center rounded-md text-white/60 hover:bg-white/5 hover:text-white";
  return (
    <LogViewer
      className="max-w-2xl"
      lines={lines}
      height={280}
      title="web · production"
      actions={
        <>
          <button type="button" className={btn} aria-label={running ? "Pause stream" : "Resume stream"} onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button type="button" className={btn} aria-label="Clear logs" onClick={() => setLines([])}>
            <Trash2 className="size-3.5" />
          </button>
        </>
      }
    />
  );
}
