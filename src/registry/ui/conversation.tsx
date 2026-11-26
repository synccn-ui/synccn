"use client";

import type * as React from "react";
import { Children, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConversationProps {
  /** Messages. */
  children?: React.ReactNode;
  /**
   * Keeps the newest message in view while the person is at the bottom, including while it streams.
   * @default true
   */
  follow?: boolean;
  /** Shown when there are no children, such as suggestions. */
  empty?: React.ReactNode;
  /** Accessible name. */
  "aria-label"?: string;
  /** Extra classes for the root element. Give it a height (h-96, flex-1…); the messages scroll inside it. */
  className?: string;
}

/**
 * Scrolling message list for chat: sticks to the bottom as answers stream in, stops when
 * the person scrolls up to read, and shows a button to jump back down.
 */
export function Conversation({ children, follow = true, empty, "aria-label": ariaLabel = "Conversation", className }: ConversationProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const el = scroller.current;
    const inner = content.current;
    if (!el || !inner) return;
    const ro = new ResizeObserver(() => {
      if (follow && stick.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(inner);
    return () => ro.disconnect();
  }, [follow]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    stick.current = bottom;
    setAway(!bottom);
  };

  const hasChildren = Children.toArray(children).length > 0;
  return (
    <div className={cn("relative grid min-h-0 grid-rows-[minmax(0,1fr)]", className)}>
      <div ref={scroller} onScroll={onScroll} role="log" aria-label={ariaLabel} aria-relevant="additions" className="h-full min-h-0 overflow-y-auto overscroll-contain">
        <div ref={content} className="grid gap-6 p-4">
          {hasChildren ? children : empty}
        </div>
      </div>
      {away && (
        <button
          type="button"
          aria-label="Scroll to the latest message"
          onClick={() => {
            const el = scroller.current;
            stick.current = true;
            el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
          }}
          className="absolute bottom-3 left-1/2 grid size-8 -translate-x-1/2 animate-in place-items-center rounded-full border bg-background shadow-md hover:bg-accent"
        >
          <ArrowDown className="size-4" />
        </button>
      )}
    </div>
  );
}
