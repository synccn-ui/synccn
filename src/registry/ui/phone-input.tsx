"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
  /** # marks a digit. */
  mask: string;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", dial: "1", flag: "🇺🇸", mask: "(###) ###-####" },
  { code: "CA", name: "Canada", dial: "1", flag: "🇨🇦", mask: "(###) ###-####" },
  { code: "GB", name: "United Kingdom", dial: "44", flag: "🇬🇧", mask: "#### ######" },
  { code: "AU", name: "Australia", dial: "61", flag: "🇦🇺", mask: "### ### ###" },
  { code: "DE", name: "Germany", dial: "49", flag: "🇩🇪", mask: "### ########" },
  { code: "FR", name: "France", dial: "33", flag: "🇫🇷", mask: "# ## ## ## ##" },
  { code: "IN", name: "India", dial: "91", flag: "🇮🇳", mask: "##### #####" },
  { code: "JP", name: "Japan", dial: "81", flag: "🇯🇵", mask: "##-####-####" },
  { code: "BR", name: "Brazil", dial: "55", flag: "🇧🇷", mask: "(##) #####-####" },
  { code: "MX", name: "Mexico", dial: "52", flag: "🇲🇽", mask: "### ### ####" },
];

const applyMask = (digits: string, mask: string) => {
  let out = "";
  let i = 0;
  for (const ch of mask) {
    if (i >= digits.length) break;
    out += ch === "#" ? digits[i++] : ch;
  }
  return out;
};

export interface PhoneInputProps {
  /** ISO code of the country selected first, e.g. US. */
  defaultCountry?: string;
  /** Called on every change. */
  onChange?: (phone: { country: string; digits: string; e164: string; valid: boolean }) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Country picker plus a number field that formats as you type.
 * onChange receives { country, digits, e164, valid }.
 */
export function PhoneInput({ defaultCountry = "US", onChange, className }: PhoneInputProps) {
  const [code, setCode] = useState(defaultCountry);
  const [digits, setDigits] = useState("");
  const c = COUNTRIES.find((x) => x.code === code) ?? COUNTRIES[0];
  const max = c.mask.split("#").length - 1;
  const valid = digits.length === max;
  const shown = useMemo(() => applyMask(digits, c.mask), [digits, c.mask]);

  const emit = (d: string, cc: Country = c) =>
    onChange?.({ country: cc.code, digits: d, e164: `+${cc.dial}${d}`, valid: d.length === cc.mask.split("#").length - 1 });

  return (
    <div className={cn("grid w-full gap-1.5", className)}>
      <div className="flex h-9 w-full overflow-hidden rounded-md border border-input bg-background shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/25">
        <label className="relative flex shrink-0 items-center gap-1.5 border-r bg-muted/50 pl-2.5 pr-2 text-sm">
          <span aria-hidden>{c.flag}</span>
          <span className="tabular-nums text-muted-foreground">+{c.dial}</span>
          <select
            aria-label="Country"
            value={code}
            onChange={(e) => {
              const next = COUNTRIES.find((x) => x.code === e.target.value) ?? COUNTRIES[0];
              const d = digits.slice(0, next.mask.split("#").length - 1);
              setCode(next.code);
              setDigits(d);
              emit(d, next);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {COUNTRIES.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name} (+{x.dial})
              </option>
            ))}
          </select>
        </label>
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          aria-label="Phone number"
          aria-invalid={digits.length > 0 && !valid ? true : undefined}
          value={shown}
          placeholder={c.mask.replace(/#/g, "0")}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, max);
            setDigits(d);
            emit(d);
          }}
          className="min-w-0 flex-1 bg-transparent px-3 text-base tabular-nums outline-none placeholder:text-muted-foreground/60 sm:text-sm"
        />
      </div>
      <p className={cn("text-[13px]", digits && !valid ? "text-muted-foreground" : valid ? "text-success" : "text-muted-foreground")}>
        {valid
          ? `Looks good: +${c.dial} ${shown}`
          : digits
            ? `${max - digits.length} more digit${max - digits.length === 1 ? "" : "s"}`
            : `${c.name} number`}
      </p>
    </div>
  );
}
