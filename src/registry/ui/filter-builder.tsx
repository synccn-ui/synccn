"use client";

import { useId } from "react";
import { FolderPlus, Plus, Trash2 } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Select } from "@/registry/ui/select";

export type FilterFieldType = "text" | "number" | "select" | "date" | "boolean";

export interface FilterField {
  /** Row property this field reads. */
  key: string;
  /** Name shown in the field picker. */
  label: string;
  /** Decides the operators and the value input. */
  type: FilterFieldType;
  /** Choices for "select" fields. */
  options?: { value: string; label: string }[];
}

export interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  combinator: "and" | "or";
  rules: (FilterRule | FilterGroup)[];
}

/** Operators per field type: id, the label shown, and whether it needs a value. */
export const OPERATORS: Record<FilterFieldType, { id: string; label: string; needsValue: boolean }[]> = {
  text: [
    { id: "contains", label: "contains", needsValue: true },
    { id: "equals", label: "is", needsValue: true },
    { id: "not_equals", label: "is not", needsValue: true },
    { id: "starts_with", label: "starts with", needsValue: true },
    { id: "empty", label: "is empty", needsValue: false },
  ],
  number: [
    { id: "eq", label: "=", needsValue: true },
    { id: "neq", label: "≠", needsValue: true },
    { id: "gt", label: ">", needsValue: true },
    { id: "gte", label: "≥", needsValue: true },
    { id: "lt", label: "<", needsValue: true },
    { id: "lte", label: "≤", needsValue: true },
  ],
  select: [
    { id: "equals", label: "is", needsValue: true },
    { id: "not_equals", label: "is not", needsValue: true },
  ],
  date: [
    { id: "before", label: "is before", needsValue: true },
    { id: "after", label: "is after", needsValue: true },
    { id: "on", label: "is on", needsValue: true },
  ],
  boolean: [
    { id: "true", label: "is yes", needsValue: false },
    { id: "false", label: "is no", needsValue: false },
  ],
};

const isGroup = (r: FilterRule | FilterGroup): r is FilterGroup => "rules" in r;
let seq = 0;
const nextId = () => `f${Date.now().toString(36)}${(seq++).toString(36)}`;

/** An empty group to start from. */
export const emptyFilter = (): FilterGroup => ({ id: "root", combinator: "and", rules: [] });

const day = (v: unknown) => {
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

function test(rule: FilterRule, row: Record<string, unknown>, fields: FilterField[]) {
  const field = fields.find((f) => f.key === rule.field);
  if (!field) return true;
  const op = OPERATORS[field.type].find((o) => o.id === rule.operator);
  // Rules still being filled in don't filter anything out.
  if (!op || (op.needsValue && rule.value === "")) return true;
  const raw = row[field.key];
  switch (field.type) {
    case "number": {
      const a = Number(raw);
      const b = Number(rule.value);
      return { eq: a === b, neq: a !== b, gt: a > b, gte: a >= b, lt: a < b, lte: a <= b }[rule.operator] ?? true;
    }
    case "date": {
      const a = day(raw);
      const b = day(rule.value);
      if (a == null || b == null) return false;
      return { before: a < b, after: a > b, on: a === b }[rule.operator] ?? true;
    }
    case "boolean":
      return rule.operator === "true" ? !!raw : !raw;
    default: {
      const a = String(raw ?? "").toLowerCase();
      const b = rule.value.toLowerCase();
      return { contains: a.includes(b), equals: a === b, not_equals: a !== b, starts_with: a.startsWith(b), empty: a === "" }[rule.operator] ?? true;
    }
  }
}

/** True when `row` passes `group`. Empty groups match everything. */
export function matchesFilter(row: Record<string, unknown>, group: FilterGroup, fields: FilterField[]): boolean {
  if (group.rules.length === 0) return true;
  const results = group.rules.map((r) => (isGroup(r) ? matchesFilter(row, r, fields) : test(r, row, fields)));
  return group.combinator === "and" ? results.every(Boolean) : results.some(Boolean);
}

/** Readable form, e.g. `Status is Active AND (Revenue > 1000 OR Plan is Pro)`. */
export function filterToString(group: FilterGroup, fields: FilterField[], nested = false): string {
  const parts = group.rules
    .map((r) => {
      if (isGroup(r)) return r.rules.length ? filterToString(r, fields, true) : "";
      const f = fields.find((x) => x.key === r.field);
      if (!f) return "";
      const op = OPERATORS[f.type].find((o) => o.id === r.operator);
      if (!op || (op.needsValue && r.value === "")) return "";
      const val = f.options?.find((o) => o.value === r.value)?.label ?? r.value;
      return `${f.label} ${op.label}${op.needsValue ? ` ${val}` : ""}`;
    })
    .filter(Boolean);
  const text = parts.join(` ${group.combinator.toUpperCase()} `);
  return nested && parts.length > 1 ? `(${text})` : text;
}

/** Number of complete rules, for badges like "Filters (3)". */
export function countRules(group: FilterGroup): number {
  return group.rules.reduce((n, r) => n + (isGroup(r) ? countRules(r) : r.value !== "" || r.operator === "empty" || r.operator === "true" || r.operator === "false" ? 1 : 0), 0);
}

export interface FilterBuilderProps {
  /** Fields people can filter on. */
  fields: FilterField[];
  /** Controlled filter. */
  value?: FilterGroup;
  /** Initial filter when uncontrolled. */
  defaultValue?: FilterGroup;
  /** Called with the new filter on every change. */
  onValueChange?: (value: FilterGroup) => void;
  /** How deep groups can nest. 1 means no nested groups. */
  maxDepth?: number;
  /** Extra classes for the root element. */
  className?: string;
}

function Rule({ rule, fields, onChange, onRemove }: { rule: FilterRule; fields: FilterField[]; onChange: (r: FilterRule) => void; onRemove: () => void }) {
  const id = useId();
  const field = fields.find((f) => f.key === rule.field) ?? fields[0];
  const ops = OPERATORS[field.type];
  const op = ops.find((o) => o.id === rule.operator) ?? ops[0];
  return (
    <div role="group" aria-label={`Rule: ${field.label}`} className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Field"
        value={field.key}
        onValueChange={(key) => {
          const f = fields.find((x) => x.key === key) ?? fields[0];
          onChange({ ...rule, field: key, operator: OPERATORS[f.type][0].id, value: f.type === "select" ? (f.options?.[0]?.value ?? "") : "" });
        }}
        options={fields.map((f) => ({ value: f.key, label: f.label }))}
        className="h-9 w-36"
      />
      <Select aria-label="Operator" value={op.id} onValueChange={(o) => onChange({ ...rule, operator: o })} options={ops.map((o) => ({ value: o.id, label: o.label }))} className="h-9 w-32" />
      {op.needsValue &&
        (field.type === "select" ? (
          <Select aria-label="Value" value={rule.value} onValueChange={(v) => onChange({ ...rule, value: v })} options={field.options ?? []} placeholder="Choose…" className="h-9 w-36" />
        ) : (
          <Input
            id={id}
            aria-label="Value"
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            value={rule.value}
            onChange={(e) => onChange({ ...rule, value: e.target.value })}
            placeholder="Value"
            className="h-9 w-40"
          />
        ))}
      <Button variant="ghost" size="icon-sm" aria-label="Remove rule" onClick={onRemove}>
        <Trash2 />
      </Button>
    </div>
  );
}

function Group({ group, fields, depth, maxDepth, onChange, onRemove }: { group: FilterGroup; fields: FilterField[]; depth: number; maxDepth: number; onChange: (g: FilterGroup) => void; onRemove?: () => void }) {
  const set = (i: number, r: FilterRule | FilterGroup) => onChange({ ...group, rules: group.rules.map((x, j) => (j === i ? r : x)) });
  const remove = (i: number) => onChange({ ...group, rules: group.rules.filter((_, j) => j !== i) });
  const f = fields[0];
  const newRule = (): FilterRule => ({ id: nextId(), field: f.key, operator: OPERATORS[f.type][0].id, value: f.type === "select" ? (f.options?.[0]?.value ?? "") : "" });
  return (
    <div role="group" aria-label={depth === 1 ? "Filter" : "Condition group"} className={cn("grid gap-2", depth > 1 && "rounded-lg border border-dashed bg-muted/30 p-3")}>
      {group.rules.length === 0 && depth === 1 && <p className="text-sm text-muted-foreground">No conditions yet. Add one to start filtering.</p>}
      {group.rules.map((r, i) => (
        <div key={r.id} className="flex items-start gap-2">
          <div className="w-14 shrink-0 pt-2 text-xs font-medium text-muted-foreground">
            {i === 0 ? (
              "Where"
            ) : i === 1 ? (
              <button
                type="button"
                onClick={() => onChange({ ...group, combinator: group.combinator === "and" ? "or" : "and" })}
                aria-label={`Combine with ${group.combinator === "and" ? "OR" : "AND"} instead`}
                className="rounded border px-1.5 py-0.5 font-mono uppercase text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                {group.combinator}
              </button>
            ) : (
              <span className="px-1.5 font-mono uppercase">{group.combinator}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {isGroup(r) ? (
              <Group group={r} fields={fields} depth={depth + 1} maxDepth={maxDepth} onChange={(g) => set(i, g)} onRemove={() => remove(i)} />
            ) : (
              <Rule rule={r} fields={fields} onChange={(x) => set(i, x)} onRemove={() => remove(i)} />
            )}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => onChange({ ...group, rules: [...group.rules, newRule()] })}>
          <Plus /> Add condition
        </Button>
        {depth < maxDepth && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...group, rules: [...group.rules, { id: nextId(), combinator: group.combinator === "and" ? "or" : "and", rules: [newRule()] }] })}>
            <FolderPlus /> Add group
          </Button>
        )}
        {onRemove && (
          <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={onRemove}>
            <Trash2 /> Remove group
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Visual query builder: conditions joined by AND or OR, nested groups, operators that
 * fit each field type. Pair `matchesFilter` with the value to filter rows, and
 * `filterToString` to show or log it.
 */
export function FilterBuilder({ fields, value, defaultValue, onValueChange, maxDepth = 2, className }: FilterBuilderProps) {
  const [filter, setFilter] = useControllable({ value, defaultValue: defaultValue ?? emptyFilter(), onChange: onValueChange });
  return (
    <div className={cn("grid gap-3 rounded-xl border bg-card p-4", className)}>
      <Group group={filter} fields={fields} depth={1} maxDepth={maxDepth} onChange={setFilter} />
    </div>
  );
}
