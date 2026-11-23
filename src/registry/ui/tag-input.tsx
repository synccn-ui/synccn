"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useControllable } from "@/lib/hooks";

export interface TagInputProps {
  /** Controlled tags. */
  value?: string[];
  /** Initial tags when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new tags. */
  onValueChange?: (tags: string[]) => void;
  /** Shown when empty. */
  placeholder?: string;
  /** Most tags allowed. */
  max?: number;
  /** Offered as the user types. */
  suggestions?: string[];
  /** Extra classes for the root element. */
  className?: string;
}

/** Type and press Enter or comma to add a tag. Backspace removes the last one. */
export function TagInput({
  value,
  defaultValue = [],
  onValueChange,
  placeholder = "Add a tag…",
  max,
  suggestions = [],
  className,
}: TagInputProps) {
  const [tags, setTags] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const full = max != null && tags.length >= max;

  const add = (t: string) => {
    const v = t.trim();
    if (!v || tags.includes(v) || full) return;
    setTags([...tags, v]);
    setText("");
  };

  const matches = text ? suggestions.filter((s) => s.toLowerCase().includes(text.toLowerCase()) && !tags.includes(s)).slice(0, 5) : [];

  return (
    <div className={cn("relative w-full", className)}>
      <div
        onClick={() => input.current?.focus()}
        className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25"
      >
        {tags.map((t) => (
          <span key={t} className="inline-flex animate-in items-center gap-1 rounded-md bg-secondary py-0.5 pl-2 pr-1 text-xs font-medium">
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={(e) => {
                e.stopPropagation();
                setTags(tags.filter((x) => x !== t));
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={input}
          value={text}
          disabled={full}
          onChange={(e) => setText(e.target.value.replace(",", ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && tags.length) setTags(tags.slice(0, -1));
          }}
          placeholder={full ? `Limit of ${max} reached` : tags.length ? "" : placeholder}
          className="min-w-24 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
      </div>
      {matches.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full animate-in rounded-lg border bg-popover p-1 shadow-lg shadow-black/5">
          {matches.map((m) => (
            <li key={m}>
              <button type="button" onClick={() => add(m)} className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
