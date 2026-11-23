"use client";

import { useMemo, useState } from "react";
import { FilterBuilder, filterToString, matchesFilter, type FilterField, type FilterGroup } from "@/registry/ui/filter-builder";

const fields: FilterField[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "trial", label: "Trial" },
      { value: "churned", label: "Churned" },
    ],
  },
  { key: "revenue", label: "Revenue", type: "number" },
  { key: "company", label: "Company", type: "text" },
  { key: "signup", label: "Signed up", type: "date" },
  { key: "verified", label: "Verified", type: "boolean" },
];

const rows = [
  { company: "Northwind", status: "active", revenue: 4200, signup: "2026-03-14", verified: true },
  { company: "Acme Labs", status: "active", revenue: 860, signup: "2026-06-02", verified: true },
  { company: "Globex", status: "trial", revenue: 0, signup: "2026-10-28", verified: false },
  { company: "Initech", status: "churned", revenue: 1300, signup: "2025-12-01", verified: true },
  { company: "Umbrella", status: "active", revenue: 15800, signup: "2026-01-19", verified: true },
  { company: "Hooli", status: "trial", revenue: 120, signup: "2026-11-02", verified: true },
];

const start: FilterGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "r1", field: "status", operator: "equals", value: "active" },
    { id: "r2", field: "revenue", operator: "gt", value: "1000" },
  ],
};

export default function FilterBuilderDemo() {
  const [filter, setFilter] = useState<FilterGroup>(start);
  const matched = useMemo(() => rows.filter((r) => matchesFilter(r, filter, fields)), [filter]);
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <FilterBuilder fields={fields} value={filter} onValueChange={setFilter} />
      <div className="grid gap-2 rounded-xl border p-4 text-sm">
        <p className="font-mono text-xs text-muted-foreground">{filterToString(filter, fields) || "No conditions: every row matches"}</p>
        <p className="font-medium">
          {matched.length} of {rows.length} companies match
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {matched.map((r) => (
            <li key={r.company} className="rounded-md bg-muted px-2 py-0.5 text-xs">
              {r.company}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
