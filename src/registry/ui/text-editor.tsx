"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Code, Heading2, Italic, Link2, List, ListOrdered, Quote, Redo2, Strikethrough, Underline, Undo2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  cmd: string;
  arg?: string;
  icon: LucideIcon;
  label: string;
  key?: string;
}

const TOOLS: (Tool | "|")[] = [
  { cmd: "bold", icon: Bold, label: "Bold", key: "b" },
  { cmd: "italic", icon: Italic, label: "Italic", key: "i" },
  { cmd: "underline", icon: Underline, label: "Underline", key: "u" },
  { cmd: "strikeThrough", icon: Strikethrough, label: "Strikethrough" },
  "|",
  { cmd: "formatBlock", arg: "h2", icon: Heading2, label: "Heading" },
  { cmd: "formatBlock", arg: "blockquote", icon: Quote, label: "Quote" },
  { cmd: "formatBlock", arg: "pre", icon: Code, label: "Code block" },
  "|",
  { cmd: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
  { cmd: "createLink", icon: Link2, label: "Link" },
  "|",
  { cmd: "undo", icon: Undo2, label: "Undo" },
  { cmd: "redo", icon: Redo2, label: "Redo" },
];

export interface TextEditorProps {
  /** Starting HTML. */
  defaultValue?: string;
  /** Called with the HTML after every change. */
  onChange?: (html: string) => void;
  /** Shown when empty. */
  placeholder?: string;
  /** Minimum editing height in pixels. */
  minHeight?: number;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Lightweight rich-text editor (contentEditable) with a formatting toolbar,
 * active-state buttons, keyboard shortcuts and a word count. onChange gets HTML.
 * For complex documents use a dedicated editor such as Tiptap.
 */
export function TextEditor({ defaultValue = "", onChange, placeholder = "Start writing…", minHeight = 160, className }: TextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Record<string, boolean | string>>({});
  const [words, setWords] = useState(0);
  const [linking, setLinking] = useState(false);
  const [url, setUrl] = useState("https://");
  const saved = useRef<Range | null>(null);

  const refresh = () => {
    const state: Record<string, boolean | string> = {};
    for (const t of TOOLS)
      if (t !== "|" && !t.arg) {
        try {
          state[t.cmd] = document.queryCommandState(t.cmd);
        } catch {
          /* unsupported */
        }
      }
    try {
      state.block = document.queryCommandValue("formatBlock").toLowerCase();
    } catch {
      /* unsupported */
    }
    setActive(state);
    const text = ref.current?.innerText.trim() || "";
    setWords(text ? text.split(/\s+/).length : 0);
  };

  useEffect(() => {
    ref.current!.innerHTML = defaultValue;
    refresh();
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const run = (t: Tool) => {
    ref.current!.focus();
    if (t.cmd === "createLink") {
      const sel = window.getSelection();
      saved.current = sel?.rangeCount ? sel.getRangeAt(0) : null;
      return setLinking(true);
    }
    const arg = t.arg && active.block === t.arg ? "p" : t.arg;
    document.execCommand(t.cmd, false, arg);
    refresh();
    onChange?.(ref.current!.innerHTML);
  };

  const isOn = (t: Tool) => (t.arg ? active.block === t.arg : active[t.cmd]);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border bg-card focus-within:border-ring/60 focus-within:ring-[3px] focus-within:ring-ring/15",
        className
      )}
    >
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
        {TOOLS.map((t, i) =>
          t === "|" ? (
            <span key={i} className="mx-1 h-5 w-px bg-border" />
          ) : (
            <button
              key={t.label}
              type="button"
              title={t.key ? `${t.label} (⌘${t.key.toUpperCase()})` : t.label}
              aria-label={t.label}
              aria-pressed={!!isOn(t)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => run(t)}
              className={cn(
                "grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                isOn(t) && "bg-accent text-foreground"
              )}
            >
              <t.icon className="size-4" />
            </button>
          )
        )}
      </div>
      {linking && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const sel = window.getSelection();
            if (sel && saved.current) {
              sel.removeAllRanges();
              sel.addRange(saved.current);
            }
            document.execCommand("createLink", false, url);
            setLinking(false);
            onChange?.(ref.current!.innerHTML);
          }}
          className="flex gap-2 border-b p-2"
        >
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-label="Link address"
            className="h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus:border-ring"
          />
          <button type="submit" className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
            Add link
          </button>
          <button
            type="button"
            onClick={() => setLinking(false)}
            className="h-8 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
        </form>
      )}
      <div
        ref={ref}
        role="textbox"
        aria-multiline="true"
        aria-label="Editor"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => (refresh(), onChange?.(ref.current!.innerHTML))}
        onKeyDown={(e) => {
          const t = TOOLS.find((x): x is Tool => x !== "|" && x.key === e.key.toLowerCase());
          if (t && (e.metaKey || e.ctrlKey)) (e.preventDefault(), run(t));
        }}
        style={{ minHeight }}
        className={cn(
          "max-h-96 overflow-y-auto px-4 py-3 text-[15px] leading-relaxed outline-none",
          "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
          "[&_h2]:mb-1 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          "[&_pre]:my-2 [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px]",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2"
        )}
      />
      <div className="flex justify-end border-t px-3 py-1.5 text-xs tabular-nums text-muted-foreground">
        {words} word{words === 1 ? "" : "s"}
      </div>
    </div>
  );
}
