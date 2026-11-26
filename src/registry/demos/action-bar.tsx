"use client";

import { useState } from "react";
import { Archive, Tag, Trash2 } from "lucide-react";
import { ActionBar } from "@/registry/ui/action-bar";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";
import { toast } from "@/registry/ui/toast";

const START = ["Q4 planning notes", "Invoice INV-2026-011", "Design review recording", "Onboarding checklist", "API keys rotation"];

export default function ActionBarDemo() {
  const [files, setFiles] = useState(START);
  const [sel, setSel] = useState<string[]>(["Invoice INV-2026-011"]);
  const act = (verb: string, remove = false) => {
    toast(`${verb} ${sel.length} ${sel.length === 1 ? "file" : "files"}`);
    if (remove) setFiles((f) => f.filter((x) => !sel.includes(x)));
    setSel([]);
  };
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-xl border bg-card pb-20">
      <ul className="divide-y">
        {files.map((f) => (
          <li key={f} className="px-4 py-2.5">
            <Checkbox label={f} checked={sel.includes(f)} onCheckedChange={(c) => setSel((s) => (c ? [...s, f] : s.filter((x) => x !== f)))} />
          </li>
        ))}
        {!files.length && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            Empty. <button type="button" className="underline underline-offset-4" onClick={() => setFiles(START)}>Reset</button>
          </li>
        )}
      </ul>
      <ActionBar count={sel.length} onClear={() => setSel([])} position="absolute">
        <Button size="sm" variant="ghost" aria-label="Tag" onClick={() => act("Tagged")}>
          <Tag /> <span className="hidden sm:inline">Tag</span>
        </Button>
        <Button size="sm" variant="ghost" aria-label="Archive" onClick={() => act("Archived", true)}>
          <Archive /> <span className="hidden sm:inline">Archive</span>
        </Button>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Delete" onClick={() => act("Deleted", true)}>
          <Trash2 /> <span className="hidden sm:inline">Delete</span>
        </Button>
      </ActionBar>
    </div>
  );
}
