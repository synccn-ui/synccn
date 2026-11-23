"use client";

import { useRef, useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const BRANDS = [
  { id: "visa", name: "Visa", test: /^4/, gaps: [4, 8, 12], len: 16, cvc: 3 },
  { id: "mastercard", name: "Mastercard", test: /^(5[1-5]|2[2-7])/, gaps: [4, 8, 12], len: 16, cvc: 3 },
  { id: "amex", name: "Amex", test: /^3[47]/, gaps: [4, 10], len: 15, cvc: 4 },
  { id: "discover", name: "Discover", test: /^6(011|5)/, gaps: [4, 8, 12], len: 16, cvc: 3 },
];

const luhn = (n: string) => {
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = +n[i];
    if (alt) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
    alt = !alt;
  }
  return n.length > 11 && sum % 10 === 0;
};

export interface CardInputProps {
  /** Called on every change with the detected brand and whether all fields look valid. */
  onChange?: (state: { brand?: string; complete: boolean }) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Card number, expiry and CVC in one field. Detects the brand, formats as you
 * type, checks the number with the Luhn algorithm and moves focus forward.
 * This is UI only: send card details to your payment provider, never your own server.
 */
export function CardInput({ onChange, className }: CardInputProps) {
  const [num, setNum] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const brand = BRANDS.find((b) => b.test.test(num));
  const len = brand?.len || 16;
  const formatted = [...num].map((d, i) => ((brand?.gaps || [4, 8, 12]).includes(i) ? ` ${d}` : d)).join("");
  const numberDone = num.length === len;
  const numberOk = numberDone && luhn(num);
  const [mm, yy] = [exp.slice(0, 2), exp.slice(2)];
  const expOk = exp.length === 4 && +mm >= 1 && +mm <= 12 && new Date(2000 + +yy, +mm) > new Date();
  const cvcOk = cvc.length === (brand?.cvc || 3);
  const refs = useRef<{ exp?: HTMLInputElement | null; cvc?: HTMLInputElement | null }>({}).current;

  const emit = (n = num, e = exp, c = cvc) => onChange?.({ brand: brand?.id, complete: luhn(n) && e.length === 4 && c.length >= 3 });

  const error =
    numberDone && !numberOk
      ? "That card number isn't valid. Check the digits."
      : exp.length === 4 && !expOk
        ? "That expiry date has passed or isn't real."
        : "";

  return (
    <div className={cn("grid w-full gap-1.5", className)}>
      <div
        className={cn(
          "flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25",
          error && "border-destructive"
        )}
      >
        <span className="grid h-6 w-9 shrink-0 place-items-center rounded border bg-muted text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
          {brand ? brand.name.slice(0, 4) : <CreditCard className="size-3.5" />}
        </span>
        <input
          aria-label="Card number"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="1234 1234 1234 1234"
          value={formatted}
          onChange={(e) => {
            const d = e.target.value
              .replace(/\D/g, "")
              .slice(0, BRANDS.find((b) => b.test.test(e.target.value.replace(/\D/g, "")))?.len || 16);
            setNum(d);
            emit(d);
            if (d.length === (BRANDS.find((b) => b.test.test(d))?.len || 16)) refs.exp?.focus();
          }}
          className="min-w-0 flex-1 bg-transparent text-base tabular-nums outline-none placeholder:text-muted-foreground/60 sm:text-sm"
        />
        <input
          ref={(el) => {
              refs.exp = el;
            }}
          aria-label="Expiry date"
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM / YY"
          value={exp.length > 2 ? `${mm} / ${yy}` : mm}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 4);
            setExp(d);
            emit(num, d);
            if (d.length === 4) refs.cvc?.focus();
          }}
          className="w-[4.5rem] shrink-0 bg-transparent text-base tabular-nums outline-none placeholder:text-muted-foreground/60 sm:text-sm"
        />
        <input
          ref={(el) => {
              refs.cvc = el;
            }}
          aria-label="Security code"
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="CVC"
          value={cvc}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, brand?.cvc || 4);
            setCvc(d);
            emit(num, exp, d);
          }}
          className="w-10 shrink-0 bg-transparent text-base tabular-nums outline-none placeholder:text-muted-foreground/60 sm:text-sm"
        />
      </div>
      <p
        className={cn(
          "flex items-center gap-1.5 text-[13px]",
          error ? "text-destructive" : numberOk && expOk && cvcOk ? "text-success" : "text-muted-foreground"
        )}
      >
        {!error && <Lock className="size-3.5" />}
        {error || (numberOk && expOk && cvcOk ? "Card details look complete." : "Payments are encrypted.")}
      </p>
    </div>
  );
}
