"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface TypewriterProps {
  /** Phrases to type. */
  words: string[];
  /** Milliseconds per typed character. */
  typeSpeed?: number;
  /** Milliseconds per deleted character. */
  deleteSpeed?: number;
  /** Milliseconds a phrase stays complete. */
  pause?: number;
  /** Start again after the last phrase. */
  loop?: boolean;
  /** Classes for the cursor. */
  cursorClassName?: string;
  /** Extra classes for the root element. */
  className?: string;
}

/** Types each phrase, pauses, deletes it, then moves to the next. */
export function Typewriter({
  words,
  typeSpeed = 70,
  deleteSpeed = 35,
  pause = 1400,
  loop = true,
  className,
  cursorClassName,
}: TypewriterProps) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    let t: ReturnType<typeof setTimeout> | undefined;
    if (!deleting && text === word) {
      if (!loop && i === words.length - 1) return;
      t = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === "") {
      setDeleting(false);
      setI((x) => x + 1);
    } else {
      t = setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteSpeed : typeSpeed
      );
    }
    return () => clearTimeout(t);
  }, [text, deleting, i, words, typeSpeed, deleteSpeed, pause, loop]);

  return (
    <span className={cn("inline-flex items-baseline", className)} aria-label={words.join(", ")}>
      <span aria-hidden>{text}</span>
      <span
        aria-hidden
        className={cn("ml-0.5 inline-block h-[0.9em] w-[2px] translate-y-[0.1em] animate-blink bg-primary", cursorClassName)}
      />
    </span>
  );
}
