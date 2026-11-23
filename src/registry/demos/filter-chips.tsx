"use client";

import { useState } from "react";
import { CircleDot, CircleCheck, CircleX, Clock } from "lucide-react";
import { FilterChips } from "@/registry/ui/filter-chips";

const all = [
  { id: 1, title: "Fix focus ring in Select", status: "open" },
  { id: 2, title: "Add range mode to Calendar", status: "done" },
  { id: 3, title: "Toast stacking on Safari", status: "progress" },
  { id: 4, title: "Docs typo on Theming page", status: "closed" },
  { id: 5, title: "Dark mode for Code Diff", status: "open" },
];

export default function FilterChipsDemo() {
  const [sel, setSel] = useState(["open"]);
  const shown = sel.length ? all.filter((i) => sel.includes(i.status)) : all;
  const count = (s: string) => all.filter((i) => i.status === s).length;
  return (
    <div className="grid w-full max-w-md gap-4">
      <FilterChips
        value={sel}
        onValueChange={setSel}
        options={[
          { value: "open", label: "Open", count: count("open"), icon: CircleDot },
          { value: "progress", label: "In progress", count: count("progress"), icon: Clock },
          { value: "done", label: "Done", count: count("done"), icon: CircleCheck },
          { value: "closed", label: "Closed", count: count("closed"), icon: CircleX },
        ]}
      />
      <ul className="grid divide-y rounded-xl border text-sm">
        {shown.map((i) => (
          <li key={i.id} className="animate-fade px-4 py-2.5">
            {i.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
