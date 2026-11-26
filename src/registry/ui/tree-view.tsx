"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Minus } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  label: React.ReactNode;
  icon?: React.ElementType;
  /** Small text after the label, such as a count. */
  meta?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  data: TreeNode[];
  /**
   * "checkbox" checks leaves and shows parents as checked or partly checked; "single" selects one node.
   * @default "checkbox"
   */
  selectionMode?: "checkbox" | "single";
  /** Controlled checked leaf ids (checkbox) or the selected id in a one-item array (single). */
  value?: string[];
  /** Selection at first, when uncontrolled. */
  defaultValue?: string[];
  /** Called with the new selection. */
  onValueChange?: (value: string[]) => void;
  /** Ids of nodes open at first. */
  defaultExpanded?: string[];
  /** Accessible name for the tree. */
  "aria-label"?: string;
  /** Extra classes for the root element. */
  className?: string;
}

const leavesOf = (n: TreeNode): string[] => (n.children?.length ? n.children.flatMap(leavesOf) : n.disabled ? [] : [n.id]);

/**
 * Generic tree with expand and collapse, tri-state checkboxes that cascade to children,
 * or single selection, plus full keyboard support. Use it for permissions, categories, folders.
 */
export function TreeView({ data, selectionMode = "checkbox", value, defaultValue = [], onValueChange, defaultExpanded = [], "aria-label": ariaLabel = "Tree", className }: TreeViewProps) {
  const [selected, setSelected] = useControllable<string[]>({ value, defaultValue, onChange: onValueChange });
  const [open, setOpen] = useState(() => new Set(defaultExpanded));
  const [focus, setFocus] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const sel = useMemo(() => new Set(selected), [selected]);

  const flat: { node: TreeNode; depth: number; parent: string | null; pos: number; size: number }[] = [];
  const walk = (nodes: TreeNode[], depth: number, parent: string | null) =>
    nodes.forEach((n, i) => {
      flat.push({ node: n, depth, parent, pos: i + 1, size: nodes.length });
      if (n.children?.length && open.has(n.id)) walk(n.children, depth + 1, n.id);
    });
  walk(data, 0, null);

  const state = (n: TreeNode): boolean | "mixed" => {
    if (selectionMode === "single") return sel.has(n.id);
    const leaves = leavesOf(n);
    if (!leaves.length) return sel.has(n.id);
    const on = leaves.filter((l) => sel.has(l)).length;
    return on === 0 ? false : on === leaves.length ? true : "mixed";
  };

  const toggleCheck = (n: TreeNode) => {
    if (n.disabled) return;
    if (selectionMode === "single") return setSelected([n.id]);
    const leaves = leavesOf(n);
    const all = state(n) === true;
    const next = new Set(sel);
    leaves.forEach((l) => (all ? next.delete(l) : next.add(l)));
    setSelected([...next]);
  };

  const toggleOpen = (id: string, force?: boolean) =>
    setOpen((s) => {
      const n = new Set(s);
      (force ?? !n.has(id)) ? n.add(id) : n.delete(id);
      return n;
    });

  const moveTo = (id: string) => {
    setFocus(id);
    root.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus();
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const { node, parent } = flat[i];
    const has = !!node.children?.length;
    if (e.key === "ArrowDown" && flat[i + 1]) (e.preventDefault(), moveTo(flat[i + 1].node.id));
    else if (e.key === "ArrowUp" && flat[i - 1]) (e.preventDefault(), moveTo(flat[i - 1].node.id));
    else if (e.key === "ArrowRight" && has) (e.preventDefault(), open.has(node.id) ? flat[i + 1] && moveTo(flat[i + 1].node.id) : toggleOpen(node.id, true));
    else if (e.key === "ArrowLeft") (e.preventDefault(), has && open.has(node.id) ? toggleOpen(node.id, false) : parent && moveTo(parent));
    else if (e.key === "Home") (e.preventDefault(), moveTo(flat[0].node.id));
    else if (e.key === "End") (e.preventDefault(), moveTo(flat[flat.length - 1].node.id));
    else if (e.key === " ") (e.preventDefault(), toggleCheck(node));
    else if (e.key === "Enter") (e.preventDefault(), has && selectionMode === "checkbox" ? toggleOpen(node.id) : toggleCheck(node));
  };

  const tabStop = focus && flat.some((f) => f.node.id === focus) ? focus : flat[0]?.node.id;
  return (
    <div ref={root} role="tree" aria-label={ariaLabel} aria-multiselectable={selectionMode === "checkbox" || undefined} className={cn("grid rounded-xl border bg-card p-1.5 text-sm", className)}>
      {flat.map(({ node, depth, pos, size }, i) => {
        const has = !!node.children?.length;
        const o = open.has(node.id);
        const st = state(node);
        const Icon = node.icon;
        return (
          <div
            key={node.id}
            data-id={node.id}
            role="treeitem"
            aria-level={depth + 1}
            aria-posinset={pos}
            aria-setsize={size}
            aria-expanded={has ? o : undefined}
            aria-checked={selectionMode === "checkbox" ? st : undefined}
            aria-selected={selectionMode === "single" ? st === true : undefined}
            aria-disabled={node.disabled || undefined}
            tabIndex={node.id === tabStop ? 0 : -1}
            onKeyDown={(e) => onKey(e, i)}
            onFocus={() => setFocus(node.id)}
            onClick={() => (selectionMode === "single" ? toggleCheck(node) : has ? toggleOpen(node.id) : toggleCheck(node))}
            className={cn(
              "flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md pr-2 outline-none transition-colors",
              "hover:bg-muted/60 focus-visible:bg-accent focus-visible:shadow-[inset_0_0_0_1.5px_var(--ring)]",
              selectionMode === "single" && st === true && "bg-brand-soft text-foreground hover:bg-brand-soft",
              node.disabled && "cursor-not-allowed opacity-50"
            )}
            style={{ paddingLeft: 6 + depth * 18 }}
          >
            <span
              className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-accent"
              onClick={(e) => has && (e.stopPropagation(), toggleOpen(node.id))}
              aria-hidden
            >
              {has && <ChevronRight className={cn("size-3.5 transition-transform duration-150", o && "rotate-90")} />}
            </span>
            {selectionMode === "checkbox" && (
              <span
                aria-hidden
                onClick={(e) => (e.stopPropagation(), toggleCheck(node))}
                className={cn("grid size-4 shrink-0 place-items-center rounded border transition-colors", st ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 bg-background")}
              >
                {st === true ? <Check className="size-3" strokeWidth={3} /> : st === "mixed" ? <Minus className="size-3" strokeWidth={3} /> : null}
              </span>
            )}
            {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
            <span className="min-w-0 flex-1 truncate">{node.label}</span>
            {node.meta && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{node.meta}</span>}
          </div>
        );
      })}
    </div>
  );
}
