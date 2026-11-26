"use client";

import type * as React from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface StreamingTextProps {
  /** The full text so far. It can keep growing while a response streams in. */
  text: string;
  /**
   * Reveals the text gradually. Off shows it all at once (and so does reduced motion).
   * @default true
   */
  animate?: boolean;
  /**
   * Characters revealed per second.
   * @default 90
   */
  speed?: number;
  /** Shows a blinking caret at the end, for example while the model is still writing. */
  caret?: boolean;
  /** Called once everything in `text` is visible. */
  onDone?: () => void;
  /** Extra classes for the root element. */
  className?: string;
}

function inline(s: string, key: string) {
  // **bold** and `code`
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") && p.length > 4 ? (
      <strong key={`${key}-${i}`} className="font-semibold">
        {p.slice(2, -2)}
      </strong>
    ) : p.startsWith("`") && p.endsWith("`") && p.length > 2 ? (
      <code key={`${key}-${i}`} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
        {p.slice(1, -1)}
      </code>
    ) : (
      <Fragment key={`${key}-${i}`}>{p}</Fragment>
    )
  );
}

export interface MarkdownLiteProps {
  /** Text with paragraphs, "- " lists, **bold** and `code`. */
  children: string;
  /** Rendered after the last line, such as a caret. */
  tail?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** The small slice of Markdown chat answers use: paragraphs, "- " and "1. " lists, **bold** and `code`. */
export function MarkdownLite({ children, tail, className }: MarkdownLiteProps) {
  const LIST = /^\s*(?:[-*]|\d+\.)\s/;
  // Split into runs of list lines and runs of other lines, so "Two options:" followed by "- a" works without a blank line.
  const blocks: { list: boolean; ordered: boolean; lines: string[]; fresh?: boolean }[] = [];
  for (const para of children.split(/\n{2,}/)) {
    for (const line of para.split("\n")) {
      const list = LIST.test(line);
      const prev = blocks[blocks.length - 1];
      if (prev && prev.list === list && !prev.fresh) prev.lines.push(line);
      else blocks.push({ list, ordered: list && /^\s*\d+\./.test(line), lines: [line] });
    }
    if (blocks.length) blocks[blocks.length - 1].fresh = true;
  }
  return (
    <div className={cn("grid gap-3 text-sm leading-relaxed", className)}>
      {blocks.map((b, bi) => {
        const isLast = bi === blocks.length - 1;
        if (b.list) {
          const Tag = b.ordered ? "ol" : "ul";
          return (
            <Tag key={bi} className={cn("grid gap-1 pl-5", b.ordered ? "list-decimal" : "list-disc", "marker:text-muted-foreground")}>
              {b.lines.map((l, li) => (
                <li key={li}>
                  {inline(l.replace(LIST, ""), `${bi}-${li}`)}
                  {isLast && li === b.lines.length - 1 && tail}
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={bi} className="whitespace-pre-wrap">
            {inline(b.lines.join("\n"), String(bi))}
            {isLast && tail}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Text that types itself out like a model's answer, with a caret and light Markdown.
 * Pass a growing `text` to follow a real stream; it catches up smoothly instead of jumping.
 */
export function StreamingText({ text, animate = true, speed = 90, caret = false, onDone, className }: StreamingTextProps) {
  const [n, setN] = useState(animate ? 0 : text.length);
  const prev = useRef(text);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    // A new answer (not a continuation) starts again from the top.
    if (!text.startsWith(prev.current.slice(0, Math.min(prev.current.length, n)))) setN(0);
    prev.current = text;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!animate || reduce) {
      setN(text.length);
      return;
    }
    const step = Math.max(1, Math.round(speed / 30));
    const t = setInterval(() => {
      setN((c) => {
        if (c >= text.length) {
          clearInterval(t);
          return c;
        }
        // Finish the current word so text doesn't flicker mid-word.
        let next = Math.min(text.length, c + step);
        while (next < text.length && /\S/.test(text[next]) && next - c < step + 12) next++;
        return next;
      });
    }, 1000 / 30);
    return () => clearInterval(t);
  }, [text, animate, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const finished = n >= text.length;
  useEffect(() => {
    if (finished && text) done.current?.();
  }, [finished, text]);

  const showCaret = caret || !finished;
  return (
    <div className={className} aria-busy={!finished || undefined}>
      <MarkdownLite tail={showCaret ? <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[0.5ch] translate-y-[0.2em] animate-blink rounded-[1px] bg-foreground/70" /> : null}>{text.slice(0, n)}</MarkdownLite>
    </div>
  );
}
