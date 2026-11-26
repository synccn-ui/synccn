"use client";

import { useState } from "react";
import { GitBranch, Trash2 } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { Popconfirm } from "@/registry/ui/popconfirm";

export default function PopconfirmDemo() {
  const [branches, setBranches] = useState(["feat/saved-views", "fix/proration", "chore/deps"]);
  return (
    <ul className="grid w-full max-w-sm divide-y rounded-xl border bg-card">
      {branches.map((b) => (
        <li key={b} className="flex items-center gap-2.5 px-3 py-2">
          <GitBranch className="size-4 text-muted-foreground" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-mono text-[13px]">{b}</span>
          <Popconfirm title="Delete this branch?" description="It's merged, so nothing is lost." confirmLabel="Delete" destructive side="bottom" align="end" onConfirm={() => new Promise<void>((r) => setTimeout(() => (setBranches((all) => all.filter((x) => x !== b)), r()), 600))}>
            <Button variant="ghost" size="icon-sm" aria-label={`Delete ${b}`}>
              <Trash2 />
            </Button>
          </Popconfirm>
        </li>
      ))}
      {branches.length === 0 && (
        <li className="px-3 py-6 text-center text-sm text-muted-foreground">
          All clean. <button type="button" className="underline underline-offset-4" onClick={() => setBranches(["feat/saved-views", "fix/proration", "chore/deps"])}>Reset</button>
        </li>
      )}
    </ul>
  );
}
