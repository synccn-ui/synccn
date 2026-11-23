"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { CookieConsent, type CookiePreferences } from "@/registry/ui/cookie-consent";

export default function CookieConsentDemo() {
  const [k, setK] = useState(0);
  const [saved, setSaved] = useState<CookiePreferences | null>(null);
  return (
    <div className="grid w-full max-w-md justify-items-center gap-3">
      <CookieConsent key={k} onSave={setSaved} />
      {saved && (
        <div className="grid justify-items-center gap-2 text-center text-sm text-muted-foreground">
          <p>
            Saved: {Object.entries(saved).filter(([, v]) => v).map(([k]) => k).join(", ")}
          </p>
          <Button size="sm" variant="outline" onClick={() => (setSaved(null), setK(k + 1))}>
            <RotateCcw /> Show again
          </Button>
        </div>
      )}
    </div>
  );
}
