"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface EditableTextProps {
  /** Controlled value. */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  /** Called with the saved value. */
  onValueChange?: (value: string) => void;
  /** Element used to display the text. */
  as?: React.ElementType;
  /** Shown when empty. */
  placeholder?: string;
  /** Return an error message to block saving. */
  validate?: (value: string) => string | undefined;
  /** Extra classes for the input. */
  inputClassName?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Text that turns into a field when clicked. Enter saves, Escape cancels,
 * and clicking away saves. Empty values are rejected.
 */
export function EditableText({
  value,
  defaultValue = "",
  onValueChange,
  as: Tag = "span",
  placeholder = "Click to edit",
  validate,
  className,
  inputClassName,
}: EditableTextProps) {
  const [v, setV] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(v);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(v);
      setError("");
      requestAnimationFrame(() => input.current?.select());
    }
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    const t = draft.trim();
    const problem = !t ? "This can't be empty." : validate?.(t);
    if (problem) return setError(problem);
    setV(t);
    setEditing(false);
  };

  if (editing)
    return (
      <span className="inline-grid gap-1">
        <span className="inline-flex items-center gap-1">
          <input
            ref={input}
            value={draft}
            onChange={(e) => (setDraft(e.target.value), setError(""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.preventDefault(), save());
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={(e) => !(e.relatedTarget as HTMLElement | null)?.dataset?.editAction && save()}
            aria-invalid={!!error || undefined}
            aria-label="Edit text"
            className={cn(
              "h-8 min-w-40 rounded-md border border-ring bg-background px-2 text-base outline-none ring-[3px] ring-ring/25 sm:text-sm",
              error && "border-destructive ring-destructive/20",
              inputClassName
            )}
            style={{ width: `${Math.max(10, draft.length + 2)}ch` }}
          />
          <button
            type="button"
            data-edit-action
            aria-label="Save"
            onClick={save}
            className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"
          >
            <Check className="size-3.5" />
          </button>
          <button
            type="button"
            data-edit-action
            aria-label="Cancel"
            onClick={() => setEditing(false)}
            className="grid size-8 place-items-center rounded-md border hover:bg-accent"
          >
            <X className="size-3.5" />
          </button>
        </span>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </span>
    );

  return (
    <Tag
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === "F2") && (e.preventDefault(), setEditing(true))}
      title="Click to edit"
      className={cn(
        "group inline-flex cursor-text items-center gap-2 rounded-md px-1 -mx-1 transition-colors hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-ring",
        !v && "text-muted-foreground",
        className
      )}
    >
      {v || placeholder}
      <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </Tag>
  );
}
