"use client";

import type * as React from "react";
import { useId, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useEscape } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { Input } from "@/registry/ui/input";
import { Select } from "@/registry/ui/select";
import { Sheet } from "@/registry/ui/sheet";
import { Switch } from "@/registry/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui/tabs";
import { Textarea } from "@/registry/ui/textarea";

export interface InspectorTab {
  value: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

export interface InspectorDrawerProps {
  /** Whether the inspector is shown. */
  open: boolean;
  /** Called when it should close. */
  onOpenChange: (open: boolean) => void;
  /** Heading, usually the selected item's name. */
  title: React.ReactNode;
  /** Line under the title, e.g. an id or status. */
  subtitle?: React.ReactNode;
  /** Tabs. With one tab or none, `children` is shown instead. */
  tabs?: InspectorTab[];
  /** Content when there are no tabs. */
  children?: React.ReactNode;
  /** Buttons pinned to the bottom. */
  actions?: React.ReactNode;
  /** "modal" slides over the page with a backdrop; "inline" sits beside your content as a panel. */
  variant?: "modal" | "inline";
  /** Edge for the modal variant. */
  side?: "right" | "left" | "bottom";
  /** Extra classes for the root element. */
  className?: string;
}

function Body({ subtitle, tabs, children, actions }: Pick<InspectorDrawerProps, "subtitle" | "tabs" | "children" | "actions">) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {subtitle && <div className="-mt-3 mb-4 text-sm text-muted-foreground">{subtitle}</div>}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {tabs && tabs.length > 1 ? (
          <Tabs defaultValue={tabs[0].value} variant="underline">
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((t) => (
              <TabsContent key={t.value} value={t.value} className="pt-4">
                {t.content}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          (tabs?.[0]?.content ?? children)
        )}
      </div>
      {actions && <div className="mt-4 flex flex-wrap justify-end gap-2 border-t pt-4">{actions}</div>}
    </div>
  );
}

/**
 * Detail panel for whatever is selected in a table, board or dashboard. Tabs, collapsible
 * sections, editable properties and actions; as a modal sheet or an inline side panel.
 */
export function InspectorDrawer({ open, onOpenChange, title, subtitle, tabs, children, actions, variant = "modal", side = "right", className }: InspectorDrawerProps) {
  const titleId = useId();
  useEscape(() => onOpenChange(false), open && variant === "inline");
  if (variant === "modal") {
    return (
      <Sheet open={open} onOpenChange={onOpenChange} side={side} title={title} className={cn("flex flex-col sm:max-w-md", className)}>
        <Body subtitle={subtitle} tabs={tabs} actions={actions}>
          {children}
        </Body>
      </Sheet>
    );
  }
  if (!open) return null;
  return (
    <aside aria-labelledby={titleId} className={cn("flex w-full animate-fade flex-col rounded-xl border bg-card p-5 sm:w-96", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id={titleId} className="text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <button type="button" aria-label="Close inspector" onClick={() => onOpenChange(false)} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
          <X className="size-4" />
        </button>
      </div>
      <Body subtitle={subtitle} tabs={tabs} actions={actions}>
        {children}
      </Body>
    </aside>
  );
}

export interface InspectorSectionProps {
  /** Section heading; also the toggle. */
  title: React.ReactNode;
  /** Start expanded. Default true. */
  defaultOpen?: boolean;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Collapsible group inside an inspector. */
export function InspectorSection({ title, defaultOpen = true, children, className }: InspectorSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className={cn("border-b py-3 first:pt-0 last:border-0", className)}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">
        {title}
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <div id={id} hidden={!open} className="pt-3">
        {children}
      </div>
    </section>
  );
}

export interface InspectorField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "switch" | "readonly";
  options?: { value: string; label: string }[];
  /** Help text under the field. */
  hint?: string;
}

export type InspectorValues = Record<string, string | number | boolean>;

export interface InspectorPropertiesProps {
  /** Fields to edit, in order. */
  fields: InspectorField[];
  /** The saved values. Edits are compared against these. */
  values: InspectorValues;
  /** Called with all values when Save is pressed. */
  onSave?: (values: InspectorValues) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Editable property list with per-field change markers and a save bar for unsaved edits. */
export function InspectorProperties({ fields, values, onSave, className }: InspectorPropertiesProps) {
  const [draft, setDraft] = useState<InspectorValues>(values);
  const [base, setBase] = useState(values);
  // When the saved values change (another row selected), start over from them.
  if (base !== values) {
    setBase(values);
    setDraft(values);
  }
  const dirty = fields.filter((f) => draft[f.key] !== values[f.key]);
  const set = (k: string, v: string | number | boolean) => setDraft((d) => ({ ...d, [k]: v }));
  const uid = useId();

  return (
    <div className={cn("grid gap-4", className)}>
      {fields.map((f) => {
        const id = `${uid}-${f.key}`;
        const changed = draft[f.key] !== values[f.key];
        const label = (
          <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {f.label}
            {changed && (
              <>
                <span aria-hidden className="size-1.5 rounded-full bg-warning" />
                <span className="sr-only">(changed)</span>
              </>
            )}
          </label>
        );
        const v = draft[f.key];
        return (
          <div key={f.key} className="grid gap-1.5">
            {f.type === "switch" ? (
              <Switch id={id} checked={!!v} onCheckedChange={(on) => set(f.key, on)} label={<span className="flex items-center gap-1.5">{f.label}{changed && <span aria-hidden className="size-1.5 rounded-full bg-warning" />}</span>} />
            ) : (
              <>
                {label}
                {f.type === "readonly" ? (
                  <p id={id} className="text-sm">
                    {String(v ?? "")}
                  </p>
                ) : f.type === "textarea" ? (
                  <Textarea id={id} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} className="min-h-20 text-sm" />
                ) : f.type === "select" ? (
                  <Select aria-label={f.label} value={String(v ?? "")} onValueChange={(x) => set(f.key, x)} options={f.options ?? []} className="h-9" />
                ) : (
                  <Input id={id} type={f.type === "number" ? "number" : "text"} value={String(v ?? "")} onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className="h-9" />
                )}
              </>
            )}
            {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
          </div>
        );
      })}
      {dirty.length > 0 && (
        <div role="status" className="sticky bottom-0 flex items-center justify-between gap-2 rounded-lg border bg-popover p-2 pl-3 text-sm shadow-sm">
          <span>
            {dirty.length} unsaved {dirty.length === 1 ? "change" : "changes"}
          </span>
          <span className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setDraft(values)}>
              Discard
            </Button>
            <Button size="sm" onClick={() => onSave?.(draft)}>
              Save
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}
