"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonSize, type ButtonVariant } from "@/registry/ui/button";

export interface RippleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "variant" | "size"> {
  /** Visual style, as for Button. */
  variant?: ButtonVariant;
  /** Size, as for Button. */
  size?: ButtonSize;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Button that emits a ripple from the point of the click. */
export function RippleButton({ children, className, variant = "default", size, onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; d: number }[]>([]);
  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const d = Math.max(r.width, r.height);
    const id = Date.now() + Math.random();
    setRipples((p) => [...p, { id, x: e.clientX - r.left - d / 2, y: e.clientY - r.top - d / 2, d }]);
    setTimeout(() => setRipples((p) => p.filter((x) => x.id !== id)), 650);
  };
  return (
    <button
      onPointerDown={onDown}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }), "relative overflow-hidden", className)}
      {...props}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden
          className="pointer-events-none absolute animate-ripple rounded-full bg-current"
          style={{ left: r.x, top: r.y, width: r.d, height: r.d }}
        />
      ))}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
}

export interface MagneticProps {
  /** How far the child follows the pointer, 0–1. */
  strength?: number;
  /** Content to render. */
  children?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/** Pulls its child toward the pointer when it comes close. */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: React.PointerEvent<HTMLSpanElement>) => {
    const r = ref.current!.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    ref.current!.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const leave = () => (ref.current!.style.transform = "translate(0,0)");
  return (
    <span
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn("inline-block p-3 transition-transform duration-300 ease-[cubic-bezier(.3,1.5,.6,1)]", className)}
    >
      {children}
    </span>
  );
}
