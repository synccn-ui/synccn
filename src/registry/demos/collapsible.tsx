"use client";

import { ChevronsUpDown } from "lucide-react";
import { Collapsible } from "@/registry/ui/collapsible";

const repos = ["synccn/ui", "synccn/cli", "synccn/themes", "synccn/blocks"];

export default function CollapsibleDemo() {
  return (
    <Collapsible
      className="w-full max-w-sm gap-2"
      trigger={({ open, toggle, ...aria }) => (
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-4 px-1">
            <p className="text-sm font-semibold">Michael starred 4 repositories</p>
            <button type="button" onClick={toggle} {...aria} aria-label={open ? "Show fewer" : "Show all"} className="grid size-8 place-items-center rounded-md hover:bg-accent">
              <ChevronsUpDown className="size-4" />
            </button>
          </div>
          <div className="rounded-lg border px-4 py-2.5 font-mono text-sm">{repos[0]}</div>
        </div>
      )}
    >
      <ul className="grid gap-2 pt-2">
        {repos.slice(1).map((r) => (
          <li key={r} className="rounded-lg border px-4 py-2.5 font-mono text-sm">
            {r}
          </li>
        ))}
      </ul>
    </Collapsible>
  );
}
