"use client";

import type * as React from "react";
import { useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useAutoSide, useClickOutside, useControllable, useEscape } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface AIModel {
  id: string;
  name: string;
  /** One line on what it's good at. */
  description?: string;
  /** Short tags such as "Fast", "Reasoning" or "Vision". */
  badges?: string[];
  /** Context window in tokens, shown as 200K. */
  context?: number;
  icon?: React.ElementType;
  /** Shown but not selectable, e.g. on a lower plan. */
  disabled?: boolean;
}

export interface ModelSelectorProps {
  models: AIModel[];
  /** Controlled model id. */
  value?: string;
  /** Model id at first, when uncontrolled. Defaults to the first model. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /**
   * Which edge of the button the menu lines up with.
   * @default "start"
   */
  align?: "start" | "end";
  /** Extra classes for the root element. */
  className?: string;
}

const tokens = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}M` : `${Math.round(n / 1000)}K`);

/** Model picker for chat composers: names, descriptions, capability badges and context size, with full keyboard support. */
export function ModelSelector({ models, value, defaultValue, onValueChange, align = "start", className }: ModelSelectorProps) {
  const [current, setCurrent] = useControllable({ value, defaultValue: defaultValue ?? models[0]?.id ?? "", onChange: onValueChange });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const uid = useId();
  const side = useAutoSide(btn, list, open, "bottom");
  const selected = models.find((m) => m.id === current) ?? models[0];

  const close = (focus = true) => {
    setOpen(false);
    if (focus) btn.current?.focus();
  };
  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => close(), open);

  const openMenu = () => {
    setActive(Math.max(0, models.findIndex((m) => m.id === current)));
    setOpen(true);
    requestAnimationFrame(() => list.current?.focus());
  };
  const choose = (m: AIModel) => {
    if (m.disabled) return;
    setCurrent(m.id);
    close();
  };
  const move = (dir: 1 | -1) => {
    for (let i = 1; i <= models.length; i++) {
      const j = (active + dir * i + models.length) % models.length;
      if (!models[j].disabled) return setActive(j);
    }
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") (e.preventDefault(), move(1));
    else if (e.key === "ArrowUp") (e.preventDefault(), move(-1));
    else if (e.key === "Home") (e.preventDefault(), setActive(0));
    else if (e.key === "End") (e.preventDefault(), setActive(models.length - 1));
    else if (e.key === "Enter" || e.key === " ") (e.preventDefault(), choose(models[active]));
    else if (e.key === "Tab") close(false);
  };

  const Icon = selected?.icon;
  return (
    <div ref={root} className={cn("relative inline-block", className)}>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(e) => (e.key === "ArrowDown" || e.key === "ArrowUp") && (e.preventDefault(), openMenu())}
        className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors hover:bg-accent aria-expanded:bg-accent"
      >
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />}
        <span className="truncate">{selected?.name}</span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <ul
          ref={list}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label="Model"
          aria-activedescendant={`${uid}-${active}`}
          onKeyDown={onKey}
          className={cn(
            "absolute z-40 w-72 max-w-[calc(100vw-2rem)] animate-in rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg outline-none",
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
            align === "end" ? "right-0" : "left-0"
          )}
        >
          {models.map((m, i) => {
            const MIcon = m.icon;
            const isSel = m.id === current;
            return (
              <li
                key={m.id}
                id={`${uid}-${i}`}
                role="option"
                aria-selected={isSel}
                aria-disabled={m.disabled || undefined}
                onPointerEnter={() => !m.disabled && setActive(i)}
                onClick={() => choose(m)}
                className={cn("flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2", i === active && "bg-accent", m.disabled && "cursor-not-allowed opacity-50")}
              >
                <span className="mt-0.5 grid size-4 shrink-0 place-items-center text-muted-foreground" aria-hidden>
                  {MIcon && <MIcon className="size-4" />}
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {m.name}
                    {m.badges?.map((b) => (
                      <span key={b} className="rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                        {b}
                      </span>
                    ))}
                  </span>
                  {(m.description || m.context) && (
                    <span className="text-xs leading-snug text-muted-foreground">
                      {m.description}
                      {m.description && m.context ? " · " : ""}
                      {m.context ? `${tokens(m.context)} context` : ""}
                    </span>
                  )}
                </span>
                {isSel && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
