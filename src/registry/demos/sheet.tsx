"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { Input, Label } from "@/registry/ui/input";
import { Sheet } from "@/registry/ui/sheet";
import { Switch } from "@/registry/ui/switch";

export default function SheetDemo() {
  const [side, setSide] = useState<"left" | "right" | "bottom" | null>(null);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(["left", "right", "bottom"] as const).map((s) => (
        <Button key={s} variant="outline" onClick={() => setSide(s)} className="capitalize">
          Open {s}
        </Button>
      ))}
      <Sheet open={!!side} onOpenChange={() => setSide(null)} side={side || "right"} title="Profile settings" description="Changes save when you close the panel.">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sh-name">Name</Label>
            <Input id="sh-name" defaultValue="synccn" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sh-user">Username</Label>
            <Input id="sh-user" defaultValue="@synccn" />
          </div>
          <Switch label="Show my profile publicly" defaultChecked />
          <Button className="mt-2" onClick={() => setSide(null)}>
            Done
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
