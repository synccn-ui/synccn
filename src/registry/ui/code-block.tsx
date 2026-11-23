"use client";

import type * as React from "react";
import { useMemo, useState } from "react";
import { highlight } from "sugar-high";
import { Check, Copy, FileCode2 } from "lucide-react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export interface CodeFile {
  /** Tab label, e.g. app.tsx. */
  name: string;
  code: string;
  /** 1-based line numbers to highlight. */
  highlight?: number[];
}

export interface CodeBlockProps {
  /** One tab per file. */
  files: CodeFile[];
  /** Show line numbers. */
  lineNumbers?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Syntax-highlighted code with file tabs, copy, line numbers and highlighted lines.
 * files: [{ name, code, highlight?: number[] }]. Uses the tiny sugar-high highlighter.
 */
export function CodeBlock({ files, lineNumbers = true, className }: CodeBlockProps) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const file = files[tab];
  const lines = useMemo(() => highlight(file.code.trimEnd()).split("\n"), [file.code]);
  const marks = new Set(file.highlight || []);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-white/10 bg-[oklch(0.17_0_0)] text-[13px] text-[oklch(0.92_0_0)]",
        className
      )}
      style={
        {
          "--sh-class": "oklch(0.82 0.1 230)",
          "--sh-identifier": "oklch(0.93 0 0)",
          "--sh-sign": "oklch(0.62 0 0)",
          "--sh-property": "oklch(0.82 0.09 230)",
          "--sh-entity": "oklch(0.8 0.12 160)",
          "--sh-jsxliterals": "oklch(0.9 0 0)",
          "--sh-string": "oklch(0.82 0.09 150)",
          "--sh-keyword": "oklch(0.75 0.14 340)",
          "--sh-comment": "oklch(0.5 0 0)",
        } as React.CSSProperties
      }
    >
      <div className="flex items-center border-b border-white/8 pr-1.5">
        <div role="tablist" className="flex min-w-0 flex-1 overflow-x-auto scrollbar-none">
          {files.map((f, i) => (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={i === tab}
              onClick={() => setTab(i)}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-1.5 px-3.5 font-mono text-xs transition-colors",
                i === tab ? "text-white" : "text-white/45 hover:text-white/80"
              )}
            >
              <FileCode2 className="size-3.5" />
              {f.name}
              {i === tab && <span className="absolute inset-x-2 bottom-0 h-px bg-white" />}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy code"}
          onClick={async () => {
            if (await copyText(file.code)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
          }}
          className="grid size-8 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-4 text-[oklch(0.78_0.15_155)]" /> : <Copy className="size-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto py-3 font-mono leading-[1.75] scrollbar-thin">
        <code className="grid min-w-max">
          {lines.map((l, i) => (
            <span
              key={i}
              className={cn(
                "block pr-6",
                marks.has(i + 1) ? "border-l-2 border-[oklch(0.78_0.12_230)] bg-white/[0.06] pl-[calc(1rem-2px)]" : "pl-4"
              )}
            >
              {lineNumbers && <span className="mr-5 inline-block w-5 select-none text-right text-white/22">{i + 1}</span>}
              <span dangerouslySetInnerHTML={{ __html: l || " " }} />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
