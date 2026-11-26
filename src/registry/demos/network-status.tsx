"use client";

import { useState } from "react";
import { NetworkStatus, useOnline } from "@/registry/ui/network-status";
import { Switch } from "@/registry/ui/switch";

export default function NetworkStatusDemo() {
  const real = useOnline();
  const [simulateOffline, setSimulateOffline] = useState(false);
  return (
    <div className="grid w-full max-w-sm justify-items-center gap-4">
      <div className="flex w-full items-center justify-between rounded-xl border bg-card px-4 py-3">
        <div className="grid">
          <p className="text-sm font-medium">Simulate offline</p>
          <p className="text-xs text-muted-foreground">Your real connection: {real ? "online" : "offline"}</p>
        </div>
        <Switch aria-label="Simulate offline" checked={simulateOffline} onCheckedChange={setSimulateOffline} />
      </div>
      <div className="h-11">
        <NetworkStatus position="inline" online={simulateOffline ? false : real} />
      </div>
    </div>
  );
}
