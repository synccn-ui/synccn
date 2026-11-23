"use client";

import { useState } from "react";
import type * as React from "react";
import { ChevronRight, File, FileCode2, FileJson, FileText, Folder, FolderOpen, Image } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileNode {
  name: string;
  children?: FileNode[];
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  js: FileCode2,
  jsx: FileCode2,
  ts: FileCode2,
  tsx: FileCode2,
  css: FileCode2,
  json: FileJson,
  md: FileText,
  png: Image,
  svg: Image,
};
const iconFor = (name: string) => ICONS[name.split(".").pop() ?? ""] || File;

export interface FileTreeProps {
  /** Top-level files and folders. */
  data: FileNode[];
  /** Folder paths open at first, e.g. "src/components". */
  defaultExpanded?: string[];
  /** Called with a file's path when it's chosen. */
  onSelect?: (path: string) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Expandable tree for files and folders, with keyboard support
 * (Up/Down to move, Right to open, Left to close, Enter to select).
 * data: [{ name, children?: [...] }]
 */
export function FileTree({ data, defaultExpanded = [], onSelect, className }: FileTreeProps) {
  const [open, setOpen] = useState(() => new Set(defaultExpanded));
  const [selected, setSelected] = useState<string | null>(null);

  const flat: (FileNode & { depth: number; path: string })[] = [];
  const walk = (nodes: FileNode[], depth: number, path: string): void =>
    nodes.forEach((n) => {
      const p = path ? `${path}/${n.name}` : n.name;
      flat.push({ ...n, depth, path: p });
      if (n.children && open.has(p)) walk(n.children, depth + 1, p);
    });
  walk(data, 0, "");

  const toggle = (p: string, force?: boolean) =>
    setOpen((s) => {
      const n = new Set(s);
      const want = force ?? !n.has(p);
      want ? n.add(p) : n.delete(p);
      return n;
    });

  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const node = flat[i];
    const focus = (j: number) => (e.currentTarget.parentElement?.children[j] as HTMLElement | undefined)?.focus();
    if (e.key === "ArrowDown") (e.preventDefault(), focus(Math.min(flat.length - 1, i + 1)));
    else if (e.key === "ArrowUp") (e.preventDefault(), focus(Math.max(0, i - 1)));
    else if (e.key === "ArrowRight" && node.children) (e.preventDefault(), toggle(node.path, true));
    else if (e.key === "ArrowLeft" && node.children) (e.preventDefault(), toggle(node.path, false));
  };

  return (
    <div role="tree" className={cn("grid rounded-xl border bg-card p-1.5 font-mono text-[13px]", className)}>
      {flat.map((n, i) => {
        const isOpen = open.has(n.path);
        const Icon = n.children ? (isOpen ? FolderOpen : Folder) : iconFor(n.name);
        return (
          <button
            key={n.path}
            type="button"
            role="treeitem"
            aria-expanded={n.children ? isOpen : undefined}
            aria-selected={selected === n.path}
            onKeyDown={(e) => onKey(e, i)}
            onClick={() => {
              if (n.children) toggle(n.path);
              else {
                setSelected(n.path);
                onSelect?.(n.path);
              }
            }}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md pr-2 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
              selected === n.path ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            style={{ paddingLeft: 6 + n.depth * 16 }}
          >
            <ChevronRight className={cn("size-3.5 shrink-0 transition-transform", !n.children && "invisible", isOpen && "rotate-90")} />
            <Icon className={cn("size-4 shrink-0", n.children && "text-foreground/80")} />
            <span className="truncate">{n.name}</span>
          </button>
        );
      })}
    </div>
  );
}
