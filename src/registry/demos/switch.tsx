"use client";

import { useState } from "react";
import { Switch } from "@/registry/ui/switch";

export default function SwitchDemo() {
  const [on, setOn] = useState(true);
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="flex items-center justify-between rounded-lg border p-3.5">
        <div className="grid gap-0.5">
          <p className="text-sm font-medium">Auto-sync</p>
          <p className="text-[13px] text-muted-foreground">{on ? "Changes sync every minute" : "Sync is paused"}</p>
        </div>
        <Switch checked={on} onCheckedChange={setOn} aria-label="Auto-sync" />
      </div>
      <div className="flex items-center gap-5">
        <Switch size="sm" defaultChecked aria-label="Small" />
        <Switch aria-label="Default" />
        <Switch size="lg" defaultChecked aria-label="Large" />
        <Switch disabled aria-label="Disabled" />
      </div>
    </div>
  );
}
