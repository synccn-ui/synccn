"use client";

import { useState } from "react";
import { JsonViewer } from "@/registry/ui/json-viewer";

const response = {
  id: "evt_1Q8xRk",
  type: "invoice.paid",
  livemode: false,
  created: 1795680000,
  data: {
    customer: { id: "cus_4821", name: "synccn", email: "synccn@example.com", tags: ["pro", "annual"] },
    amount: 4800,
    currency: "usd",
    lines: [
      { description: "Pro plan × 4 seats", amount: 4800, period: { start: "2026-11-01", end: "2026-12-01" } },
      { description: "Proration", amount: 0, discount: null },
    ],
  },
  request: { id: "req_93kd", "idempotency-key": "8b1f…c2" },
};

export default function JsonViewerDemo() {
  const [path, setPath] = useState("root");
  return (
    <div className="grid w-full max-w-lg gap-2">
      <JsonViewer data={response} defaultExpandDepth={2} rootName="event" onSelect={(p) => setPath(p)} />
      <p className="text-center text-[13px] text-muted-foreground">
        Focused <code className="font-mono text-foreground">{path}</code> · use the arrow keys to move
      </p>
    </div>
  );
}
