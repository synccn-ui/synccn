"use client";

import type * as React from "react";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "min" | "max" | "type"> {
  /** Controlled amount, as a number. null when empty. */
  value?: number | null;
  /** Amount at first, when uncontrolled. */
  defaultValue?: number | null;
  /** Called with the amount as a number (or null when cleared). */
  onValueChange?: (value: number | null) => void;
  /**
   * ISO currency code.
   * @default "USD"
   */
  currency?: string;
  /**
   * Locale for separators and the symbol's position.
   * @default "en-US"
   */
  locale?: string;
  /** Smallest amount allowed. Values below are clamped when the field loses focus. */
  min?: number;
  /** Largest amount allowed. */
  max?: number;
  /** Marks the field invalid. */
  invalid?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Money field that formats as you type (1,234.50), keeps the caret in place, accepts pasted
 * amounts like "$1,200" or "1.200,50", and gives you a plain number back.
 */
export function CurrencyInput({ value, defaultValue = null, onValueChange, currency = "USD", locale = "en-US", min, max, invalid, className, onBlur, ...props }: CurrencyInputProps) {
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency }), [locale, currency]);
  const parts = useMemo(() => fmt.formatToParts(1234.5), [fmt]);
  const group = parts.find((p) => p.type === "group")?.value ?? ",";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const symbol = parts.find((p) => p.type === "currency")?.value ?? currency;
  const symbolFirst = parts.findIndex((p) => p.type === "currency") < parts.findIndex((p) => p.type === "integer");
  const digits = fmt.resolvedOptions().maximumFractionDigits ?? 2;

  const toText = (n: number | null) => (n === null ? "" : new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n));
  const [inner, setInner] = useState<number | null>(defaultValue);
  const amount = value !== undefined ? value : inner;
  const [text, setText] = useState(() => toText(amount));
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const shown = focused ? text : toText(amount);

  const commit = (n: number | null) => {
    if (value === undefined) setInner(n);
    onValueChange?.(n);
  };

  // Parses what's typed: digits plus one decimal separator, ignoring grouping and symbols.
  const parse = (raw: string): { clean: string; n: number | null } => {
    let s = raw.replace(new RegExp(`[^0-9${decimal === "." ? "\\." : decimal}${group === "." ? "\\." : ""}-]`, "g"), "");
    if (group === ".") {
      // In 1.234,50 locales a lone dot with three digits after it is grouping.
      s = s.replace(/\.(?=\d{3}(\D|$))/g, "");
    }
    s = s.split(group).join("");
    const [int = "", ...rest] = s.split(decimal);
    const frac = rest.join("").slice(0, digits);
    const intDigits = int.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    if (!intDigits && !frac && !s.includes(decimal)) return { clean: "", n: null };
    const grouped = (intDigits || "0").replace(/\B(?=(\d{3})+(?!\d))/g, group);
    const clean = s.includes(decimal) && digits > 0 ? `${grouped}${decimal}${frac}` : grouped;
    return { clean, n: Number(`${intDigits || "0"}.${frac || "0"}`) };
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    const digitsBefore = el.value.slice(0, caret).replace(/[^0-9]/g, "").length + (el.value.slice(0, caret).includes(decimal) ? 1 : 0);
    const { clean, n } = parse(el.value);
    setText(clean);
    commit(n);
    requestAnimationFrame(() => {
      if (!ref.current) return;
      let count = 0;
      let pos = 0;
      const hasDec = el.value.slice(0, caret).includes(decimal);
      for (; pos < clean.length && count < digitsBefore; pos++) if (/\d/.test(clean[pos]) || (hasDec && clean[pos] === decimal)) count++;
      ref.current.setSelectionRange(pos, pos);
    });
  };

  return (
    <div
      className={cn(
        "flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-background text-sm shadow-xs transition-[border-color,box-shadow]",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20",
        invalid && "border-destructive focus-within:border-destructive focus-within:ring-destructive/20",
        className
      )}
    >
      {symbolFirst && <span className="pl-3 text-muted-foreground" aria-hidden>{symbol}</span>}
      <input
        ref={ref}
        inputMode="decimal"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        {...props}
        value={shown}
        onFocus={() => (setText(toText(amount)), setFocused(true))}
        onChange={onChange}
        onBlur={(e) => {
          setFocused(false);
          if (amount !== null) {
            const clamped = Math.min(max ?? Infinity, Math.max(min ?? -Infinity, amount));
            if (clamped !== amount) commit(clamped);
          }
          onBlur?.(e);
        }}
        className={cn("h-full min-w-0 flex-1 bg-transparent px-3 tabular-nums outline-none placeholder:text-muted-foreground", symbolFirst ? "pl-1.5" : "")}
      />
      {!symbolFirst && <span className="pr-3 text-muted-foreground" aria-hidden>{symbol}</span>}
      <span className="pr-3 text-xs font-medium text-muted-foreground">{currency}</span>
    </div>
  );
}
