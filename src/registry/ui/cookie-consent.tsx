"use client";

import { useState } from "react";
import { Cookie } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/registry/ui/switch";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CATS: { id: keyof CookiePreferences; label: string; description: string; locked?: boolean }[] = [
  { id: "necessary", label: "Necessary", description: "Keeps the site working. Always on.", locked: true },
  { id: "analytics", label: "Analytics", description: "Helps us see which pages people use." },
  { id: "marketing", label: "Marketing", description: "Lets us measure ads and campaigns." },
];

export interface CookieConsentProps {
  /** Called with the visitor's choices. Store them yourself. */
  onSave?: (prefs: CookiePreferences) => void;
  /** Link to your cookie policy. */
  policyHref?: string;
  /** Fixed pins it to the bottom-left of the screen. */
  position?: "inline" | "fixed";
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Cookie banner with Accept all, Reject all and a Customise view.
 * onSave receives { necessary, analytics, marketing }. Store the choice yourself.
 */
export function CookieConsent({ onSave, policyHref = "#", position = "inline", className }: CookieConsentProps) {
  const [view, setView] = useState("banner");
  const [prefs, setPrefs] = useState<CookiePreferences>({ necessary: true, analytics: false, marketing: false });
  const [done, setDone] = useState(false);
  if (done) return null;
  const save = (p: CookiePreferences) => {
    onSave?.(p);
    setDone(true);
  };
  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className={cn(
        "w-full max-w-md animate-in rounded-2xl border bg-popover p-5 text-popover-foreground shadow-2xl shadow-black/20",
        position === "fixed" && "fixed bottom-4 left-4 z-[90] w-[calc(100%-2rem)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full border bg-background">
          <Cookie className="size-4" />
        </span>
        <div className="grid gap-1">
          <p className="font-semibold">{view === "banner" ? "We use cookies" : "Cookie settings"}</p>
          <p className="text-sm text-muted-foreground">
            {view === "banner"
              ? "Some keep the site working; others help us improve it. You choose which ones we use."
              : "Turn categories on or off. You can change this later."}{" "}
            <a href={policyHref} className="font-medium text-foreground underline underline-offset-4">
              Cookie policy
            </a>
          </p>
        </div>
      </div>
      {view === "custom" && (
        <ul className="mt-4 grid animate-fade divide-y rounded-xl border">
          {CATS.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 p-3">
              <div className="grid gap-0.5">
                <span className="text-sm font-medium">{c.label}</span>
                <span className="text-xs text-muted-foreground">{c.description}</span>
              </div>
              <Switch
                checked={prefs[c.id]}
                disabled={c.locked}
                onCheckedChange={(v) => setPrefs({ ...prefs, [c.id]: v })}
                aria-label={c.label}
              />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {view === "banner" ? (
          <>
            <button type="button" onClick={() => setView("custom")} className="h-9 rounded-md px-3 text-sm font-medium hover:bg-accent">
              Customise
            </button>
            <button
              type="button"
              onClick={() => save({ necessary: true, analytics: false, marketing: false })}
              className="ml-auto h-9 rounded-md border bg-background px-3 text-sm font-medium hover:bg-accent"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => save({ necessary: true, analytics: true, marketing: true })}
              className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Accept all
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setView("banner")} className="h-9 rounded-md px-3 text-sm font-medium hover:bg-accent">
              Back
            </button>
            <button
              type="button"
              onClick={() => save(prefs)}
              className="ml-auto h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save choices
            </button>
          </>
        )}
      </div>
    </div>
  );
}
