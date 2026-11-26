"use client";

import { useState } from "react";
import { CurrencyInput } from "@/registry/ui/currency-input";
import { Label } from "@/registry/ui/input";

export default function CurrencyInputDemo() {
  const [usd, setUsd] = useState<number | null>(1250.5);
  const [eur, setEur] = useState<number | null>(980);
  return (
    <div className="grid w-full max-w-xs gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="price-usd">Price</Label>
        <CurrencyInput id="price-usd" value={usd} onValueChange={setUsd} min={0} max={100000} placeholder="0.00" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="price-eur">Preis</Label>
        <CurrencyInput id="price-eur" value={eur} onValueChange={setEur} currency="EUR" locale="de-DE" placeholder="0,00" />
      </div>
      <p className="text-[13px] tabular-nums text-muted-foreground">
        Values: <code className="font-mono text-foreground">{String(usd)}</code> and <code className="font-mono text-foreground">{String(eur)}</code>
      </p>
    </div>
  );
}
