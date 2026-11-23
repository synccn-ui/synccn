"use client";

import { useState } from "react";
import { Plus, Search, Settings } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Tour } from "@/registry/ui/tour";
import { toast } from "@/registry/ui/toast";

export default function TourDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="flex items-center gap-2 rounded-xl border p-2">
        <div id="tour-search" className="flex h-9 flex-1 items-center gap-2 rounded-md border px-3 text-sm text-muted-foreground">
          <Search className="size-4" /> Search
        </div>
        <Button id="tour-new" size="sm">
          <Plus /> New
        </Button>
        <Button id="tour-settings" size="icon-sm" variant="ghost" aria-label="Settings">
          <Settings />
        </Button>
      </div>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-fit justify-self-center">
        Start the tour
      </Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onFinish={() => toast.success("Tour complete")}
        steps={[
          { target: "#tour-search", title: "Find anything", body: "Search files, people and settings from one place." },
          { target: "#tour-new", title: "Create something", body: "Start a project, a doc or a board." },
          { target: "#tour-settings", title: "Make it yours", body: "Change your theme, notifications and shortcuts here." },
        ]}
      />
    </div>
  );
}
