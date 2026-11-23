"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

type SetValue<T> = (next: T | ((prev: T) => T)) => void;

/**
 * Lets a component be controlled (value + onChange) or uncontrolled (defaultValue).
 * Returns the current value and a setter that works in both modes.
 */
export function useControllable<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, SetValue<T>] {
  const [inner, setInner] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = (isControlled ? value : inner) as T;
  const setValue = useCallback<SetValue<T>>(
    (next) => {
      const v = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
      if (!isControlled) setInner(v);
      onChange?.(v);
    },
    [current, isControlled, onChange]
  );
  return [current, setValue];
}

type ElementRef = RefObject<HTMLElement | null>;

/** Calls `handler` when a pointer goes down outside every element in `refs`. */
export function useClickOutside(refs: ElementRef | ElementRef[], handler: (e: PointerEvent) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const list = Array.isArray(refs) ? refs : [refs];
    const onDown = (e: PointerEvent) => {
      if (list.some((r) => r.current && r.current.contains(e.target as Node))) return;
      handler(e);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [refs, handler, enabled]);
}

/** Calls `handler` when Escape is pressed. */
export function useEscape(handler: (e: KeyboardEvent) => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handler(e);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handler, enabled]);
}

/** Stops the page from scrolling while `enabled` is true. */
export function useLockScroll(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [enabled]);
}

/** Keeps an element mounted while its exit animation plays. */
export function usePresence(open: boolean, duration = 160): { mounted: boolean; closing: boolean } {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => {
        setMounted(false);
        setClosing(false);
      }, duration);
      return () => clearTimeout(t);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return { mounted, closing };
}

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.2 }
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return [ref, inView];
}

/** Subscribes to a CSS media query. Returns false during server rendering. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );
  // Server and first client render agree on false, so hydration never mismatches.
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Keeps Tab focus inside a container while active, and restores focus afterwards. */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const prev = document.activeElement as HTMLElement | null;
    const sel = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const first = el.querySelector<HTMLElement>("[data-autofocus]") || el.querySelector<HTMLElement>(sel);
    (first || el).focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = [...el.querySelectorAll<HTMLElement>(sel)].filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const a = items[0];
      const b = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [ref, active]);
}

/**
 * Picks "top" or "bottom" for a floating layer so it isn't cut off by the
 * viewport or by any vertically clipping ancestor of the anchor.
 */
export function useAutoSide(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  mounted: boolean,
  preferred: "top" | "bottom" = "bottom"
): "top" | "bottom" {
  const [side, setSide] = useState(preferred);
  useLayoutEffect(() => {
    if (!mounted) return setSide(preferred);
    const a = anchorRef.current;
    const f = floatingRef.current;
    if (!a || !f) return;
    const ar = a.getBoundingClientRect();
    const need = f.offsetHeight + 10;
    let top = 0;
    let bottom = window.innerHeight;
    for (let el = a.parentElement; el && el !== document.body; el = el.parentElement) {
      const st = getComputedStyle(el);
      if (/(hidden|auto|scroll|clip)/.test(st.overflowY)) {
        const r = el.getBoundingClientRect();
        top = Math.max(top, r.top);
        bottom = Math.min(bottom, r.bottom);
      }
    }
    const below = bottom - ar.bottom;
    const above = ar.top - top;
    setSide(below < need && above > below ? "top" : "bottom");
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps
  return side;
}

const noop = () => () => {};

/** False during server rendering and hydration, true afterwards. Use it to guard portals. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
}

/**
 * The current time, read in the browser only: null while server rendering and
 * during hydration, then the real time. With `interval` (ms) it keeps updating.
 * Reading the clock during render breaks prerendering in Next.js (Cache
 * Components) and causes hydration mismatches, so time-based components use this.
 */
export function useNow(interval?: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    if (!interval) return;
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}
