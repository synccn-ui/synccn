"use client";

import type * as React from "react";
import { useId, useMemo, useRef, useState } from "react";
import { AtSign, CornerDownLeft } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface MentionPerson {
  id: string;
  name: string;
  /** Shown after the name in suggestions, such as a role or email. */
  detail?: string;
  /** Image URL. Initials are used without one. */
  avatar?: string;
}

export interface MentionInputProps {
  /** People who can be mentioned. */
  people: MentionPerson[];
  /** Controlled text. */
  value?: string;
  /** Text at first, when uncontrolled. */
  defaultValue?: string;
  /** Called with the text on every change. */
  onValueChange?: (value: string) => void;
  /** Called with the text and mentioned people on Ctrl/⌘+Enter. Shows a send hint when set. */
  onSubmit?: (value: string, mentioned: MentionPerson[]) => void;
  /**
   * Character that starts a mention.
   * @default "@"
   */
  trigger?: string;
  /**
   * Suggestions shown at once.
   * @default 6
   */
  maxSuggestions?: number;
  /** Placeholder text. */
  placeholder?: string;
  /**
   * Visible lines.
   * @default 3
   */
  rows?: number;
  /** Accessible name. */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** People whose `@Name` appears in the text, in the order they're first mentioned. */
export function extractMentions(text: string, people: MentionPerson[], trigger = "@"): MentionPerson[] {
  return people
    .map((p) => ({ p, i: text.indexOf(`${trigger}${p.name}`) }))
    .filter(({ i, p }) => i >= 0 && !/\w/.test(text[i + trigger.length + p.name.length] ?? ""))
    .sort((a, b) => a.i - b.i)
    .map(({ p }) => p);
}

const initials = (n: string) =>
  n
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/**
 * Textarea with @mentions: type the trigger to get suggestions, pick with the arrow keys
 * and Enter or Tab, and see who will be notified. Ctrl/⌘+Enter submits.
 */
export function MentionInput({ people, value, defaultValue = "", onValueChange, onSubmit, trigger = "@", maxSuggestions = 6, placeholder, rows = 3, "aria-label": ariaLabel, className }: MentionInputProps) {
  const [text, setText] = useControllable({ value, defaultValue, onChange: onValueChange });
  const [query, setQuery] = useState<{ start: number; term: string } | null>(null);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);
  const uid = useId();

  const matches = useMemo(() => {
    if (!query) return [];
    const t = query.term.toLowerCase();
    return people
      .filter((p) => p.name.toLowerCase().includes(t) || p.detail?.toLowerCase().includes(t))
      .sort((a, b) => Number(!a.name.toLowerCase().startsWith(t)) - Number(!b.name.toLowerCase().startsWith(t)))
      .slice(0, maxSuggestions);
  }, [people, query, maxSuggestions]);
  const open = !!query && matches.length > 0;
  const mentioned = useMemo(() => extractMentions(text, people, trigger), [text, people, trigger]);

  // Looks for a trigger before the caret that starts a word. Names with spaces keep matching while they still fit someone.
  const detect = (v: string, caret: number) => {
    const before = v.slice(0, caret);
    const at = before.lastIndexOf(trigger);
    if (at < 0 || (at > 0 && !/[\s([{]/.test(before[at - 1]))) return setQuery(null);
    const term = before.slice(at + trigger.length);
    if (term.length > 30 || (/\s/.test(term) && !people.some((p) => p.name.toLowerCase().startsWith(term.toLowerCase())))) return setQuery(null);
    setQuery({ start: at, term });
    setActive(0);
  };

  const insert = (p: MentionPerson) => {
    const el = ref.current;
    if (!query || !el) return;
    const caret = el.selectionStart;
    const next = `${text.slice(0, query.start)}${trigger}${p.name} ${text.slice(caret)}`;
    const pos = query.start + trigger.length + p.name.length + 1;
    setText(next);
    setQuery(null);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (open) {
      if (e.key === "ArrowDown") return e.preventDefault(), setActive((a) => (a + 1) % matches.length);
      if (e.key === "ArrowUp") return e.preventDefault(), setActive((a) => (a - 1 + matches.length) % matches.length);
      if (e.key === "Enter" || e.key === "Tab") return e.preventDefault(), insert(matches[active]);
      if (e.key === "Escape") return e.preventDefault(), setQuery(null);
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && onSubmit) {
      e.preventDefault();
      onSubmit(text, mentioned);
    }
  };

  const mentionButton = () => {
    const el = ref.current;
    if (!el) return;
    const caret = el.selectionStart;
    const space = caret > 0 && !/\s/.test(text[caret - 1]) ? " " : "";
    const next = `${text.slice(0, caret)}${space}${trigger}${text.slice(caret)}`;
    const pos = caret + space.length + trigger.length;
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(pos, pos);
      detect(next, pos);
    });
  };

  return (
    <div className={cn("relative grid w-full gap-1.5 text-left", className)}>
      <div className="rounded-lg border border-input bg-background shadow-xs transition-[border-color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
        <textarea
          ref={ref}
          value={text}
          rows={rows}
          placeholder={placeholder}
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${uid}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
          onChange={(e) => {
            setText(e.target.value);
            detect(e.target.value, e.target.selectionStart);
          }}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => ["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) && detect(text, e.currentTarget.selectionStart)}
          onClick={(e) => detect(text, e.currentTarget.selectionStart)}
          onBlur={() => setQuery(null)}
          className="block w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        />
        <div className="flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 border-t px-2 py-1.5 text-xs text-muted-foreground">
          <button type="button" aria-label="Mention someone" onClick={mentionButton} className="grid size-6 place-items-center rounded hover:bg-accent hover:text-foreground">
            <AtSign className="size-3.5" />
          </button>
          {mentioned.length > 0 ? (
            <span className="min-w-0 flex-1 truncate">
              Notifies <span className="font-medium text-foreground">{mentioned.map((p) => p.name).join(", ")}</span>
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate">Type {trigger} to mention someone</span>
          )}
          {onSubmit && (
            <span className="ml-auto hidden shrink-0 items-center gap-1 sm:inline-flex">
              <kbd className="rounded border bg-muted px-1 font-sans text-[10px]">Ctrl</kbd>
              <CornerDownLeft className="size-3" aria-hidden /> to send
            </span>
          )}
        </div>
      </div>

      <ul id={`${uid}-list`} role="listbox" aria-label="People" hidden={!open} className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 animate-in overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg">
        {matches.map((p, i) => (
          <li
            key={p.id}
            id={`${uid}-opt-${i}`}
            role="option"
            aria-selected={i === active}
            onPointerDown={(e) => (e.preventDefault(), insert(p))}
            onPointerEnter={() => setActive(i)}
            className={cn("flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm", i === active && "bg-accent")}
          >
            {p.avatar ? (
              <img src={p.avatar} alt="" className="size-6 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-semibold" aria-hidden>
                {initials(p.name)}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
            {p.detail && <span className="min-w-0 shrink truncate text-xs text-muted-foreground">{p.detail}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
