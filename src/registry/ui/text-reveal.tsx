"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TextRevealProps {
  /** The text. Words light up one after another. */
  text: string;
  /**
   * "scroll" ties the reveal to scrolling; "view" plays it once when the text comes into view.
   * @default "scroll"
   */
  trigger?: "scroll" | "view";
  /**
   * Seconds for the whole reveal, with trigger "view".
   * @default 1.6
   */
  duration?: number;
  /** Extra classes for the root element. */
  className?: string;
}

const scrollParent = (el: HTMLElement | null): HTMLElement | null => {
  for (let p = el?.parentElement; p; p = p.parentElement) if (/(auto|scroll)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight) return p;
  return null;
};

/**
 * Paragraph whose words brighten as you scroll through it (or once, when it comes into
 * view). Works in the page or inside any scrolling container. Static with reduced motion.
 */
export function TextReveal({ text, trigger = "scroll", duration = 1.6, className }: TextRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [progress, setProgress] = useState(0);
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setProgress(1);
    if (trigger === "view") {
      let raf = 0;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / (duration * 1000));
          setProgress(p);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }, { threshold: 0.4 });
      io.observe(el);
      return () => (io.disconnect(), cancelAnimationFrame(raf));
    }
    const box = scrollParent(el);
    const update = () => {
      const r = el.getBoundingClientRect();
      const view = box ? box.getBoundingClientRect() : { top: 0, height: window.innerHeight };
      // 0 when the text's top reaches 85% down the view, 1 when its bottom reaches 40%.
      const start = view.top + view.height * 0.85;
      const end = view.top + view.height * 0.4;
      const p = (start - r.top) / (start - end + r.height);
      setProgress(Math.max(0, Math.min(1, p)));
    };
    update();
    const target: HTMLElement | Window = box ?? window;
    target.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => (target.removeEventListener("scroll", update), window.removeEventListener("resize", update));
  }, [trigger, duration, text]);

  return (
    <p ref={ref} className={cn("text-2xl font-semibold leading-snug tracking-tight", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => {
          const o = Math.max(0, Math.min(1, progress * words.length - i));
          return (
            <span key={i} className="transition-opacity duration-150" style={{ opacity: 0.15 + o * 0.85 }}>
              {w}{" "}
            </span>
          );
        })}
      </span>
    </p>
  );
}
