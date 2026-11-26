"use client";

import { useId, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Source {
  title: string;
  url: string;
  /** The passage that was used. */
  snippet?: string;
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function Mark({ url, className }: { url: string; className?: string }) {
  const h = host(url);
  const hue = [...h].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className={cn("grid size-4 shrink-0 place-items-center rounded-[4px] text-[9px] font-bold uppercase text-white", className)} style={{ background: `oklch(0.55 0.13 ${hue})` }} aria-hidden>
      {h[0]}
    </span>
  );
}

export interface SourcesProps {
  sources: Source[];
  /** Open at first. */
  defaultOpen?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** "Used 4 sources" summary that opens into a numbered list of links, matching inline Citation numbers. */
export function Sources({ sources, defaultOpen = false, className }: SourcesProps) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  if (!sources.length) return null;
  return (
    <div className={cn("grid gap-2", className)}>
      <button type="button" aria-expanded={open} aria-controls={`${uid}-list`} onClick={() => setOpen((o) => !o)} className="-ml-1 inline-flex w-fit items-center gap-2 rounded-full border bg-card py-1 pl-1.5 pr-2.5 text-xs font-medium text-muted-foreground shadow-xs hover:text-foreground">
        <span className="flex -space-x-1">
          {sources.slice(0, 4).map((s) => (
            <Mark key={s.url} url={s.url} className="ring-2 ring-card" />
          ))}
        </span>
        Used {sources.length} {sources.length === 1 ? "source" : "sources"}
        <ChevronDown className={cn("size-3.5 transition-transform duration-200", !open && "-rotate-90")} aria-hidden />
      </button>
      {open && (
        <ol id={`${uid}-list`} className="grid animate-fade gap-1.5 sm:grid-cols-2">
          {sources.map((s, i) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer" className="group flex h-full min-w-0 gap-2.5 rounded-lg border bg-card p-2.5 transition-colors hover:bg-muted/50">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="grid min-w-0 gap-0.5">
                  <span className="line-clamp-2 text-[13px] font-medium leading-snug">{s.title}</span>
                  <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <Mark url={s.url} />
                    <span className="truncate">{host(s.url)}</span>
                    <ExternalLink className="size-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export interface CitationProps {
  /** Number shown, from 1. */
  index: number;
  source: Source;
  /** Extra classes for the root element. */
  className?: string;
}

/** Inline citation number. Hover or focus shows the source's title, site and quoted passage. */
export function Citation({ index, source, className }: CitationProps) {
  const uid = useId();
  return (
    <span className={cn("group/cite relative inline-block align-baseline", className)}>
      <a
        href={source.url}
        target="_blank"
        rel="noreferrer"
        aria-describedby={`${uid}-card`}
        aria-label={`Source ${index}: ${source.title}`}
        className="mx-0.5 inline-grid h-4 min-w-4 -translate-y-px place-items-center rounded-[5px] bg-muted px-1 align-middle text-[10px] font-semibold tabular-nums text-muted-foreground no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground focus-visible:outline-none"
      >
        {index}
      </a>
      <span id={`${uid}-card`} role="tooltip" className="absolute bottom-full left-1/2 z-30 mb-1.5 hidden w-64 max-w-[70vw] -translate-x-1/2 animate-in rounded-lg border bg-popover p-3 text-left text-popover-foreground shadow-lg group-hover/cite:grid group-focus-within/cite:grid">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mark url={source.url} />
          <span className="truncate">{host(source.url)}</span>
        </span>
        <span className="mt-1 text-[13px] font-medium leading-snug">{source.title}</span>
        {source.snippet && <span className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{source.snippet}</span>}
      </span>
    </span>
  );
}

