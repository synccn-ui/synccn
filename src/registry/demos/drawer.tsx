"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Drawer } from "@/registry/ui/drawer";
import { toast } from "@/registry/ui/toast";

export default function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(350);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="Move goal" description="Set your daily activity goal. Drag the handle down to close.">
        <div className="grid justify-items-center gap-6">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Decrease" onClick={() => setGoal((g) => Math.max(100, g - 10))}>
              <Minus />
            </Button>
            <div className="grid min-w-32 text-center">
              <span className="text-6xl font-semibold tabular-nums tracking-tighter">{goal}</span>
              <span className="text-xs uppercase text-muted-foreground">calories per day</span>
            </div>
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Increase" onClick={() => setGoal((g) => Math.min(800, g + 10))}>
              <Plus />
            </Button>
          </div>
          <div className="grid w-full gap-2">
            <Button
              onClick={() => {
                setOpen(false);
                toast.success(`Goal set to ${goal}`);
              }}
            >
              Save goal
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
