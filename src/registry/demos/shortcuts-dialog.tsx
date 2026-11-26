"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { ShortcutsDialog } from "@/registry/ui/shortcuts-dialog";

export default function ShortcutsDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid justify-items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Keyboard /> Keyboard shortcuts
      </Button>
      <p className="text-[13px] text-muted-foreground">
        Or press <kbd className="rounded border bg-muted px-1.5 font-sans text-xs">?</kbd> anywhere on this page
      </p>
      <ShortcutsDialog
        open={open}
        onOpenChange={setOpen}
        groups={[
          { title: "General", items: [{ label: "Command menu", keys: "Mod+K" }, { label: "Search", keys: "/" }, { label: "Shortcuts", keys: "?" }, { label: "Toggle sidebar", keys: "Mod+B" }] },
          { title: "Navigation", items: [{ label: "Go to inbox", keys: "G then I" }, { label: "Go to projects", keys: "G then P" }, { label: "Next item", keys: "J" }, { label: "Previous item", keys: "K" }] },
          { title: "Editing", items: [{ label: "Save", keys: "Mod+S" }, { label: "Undo", keys: "Mod+Z" }, { label: "Redo", keys: "Mod+Shift+Z" }, { label: "Bold", keys: "Mod+B" }] },
          { title: "Issues", items: [{ label: "New issue", keys: "C" }, { label: "Assign to me", keys: "I" }, { label: "Change status", keys: "S" }, { label: "Set priority", keys: "P" }] },
        ]}
      />
    </div>
  );
}
