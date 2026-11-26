"use client";

import { useState } from "react";
import { ThemeToggle, useResolvedTheme, type ThemeMode } from "@/registry/ui/theme-toggle";
import { cn } from "@/lib/utils";

export default function ThemeToggleDemo() {
  const [theme, setTheme] = useState<ThemeMode>("system");
  const resolved = useResolvedTheme(theme);
  return (
    <div className="grid w-full max-w-sm justify-items-center gap-5">
      <div className="flex items-center gap-3">
        <ThemeToggle value={theme} onValueChange={setTheme} />
        <ThemeToggle variant="icon" value={theme} onValueChange={setTheme} />
      </div>
      {/* A preview card, so the demo doesn't change the whole site. */}
      <div className={cn("grid w-full gap-2 rounded-xl border p-4 transition-colors duration-300", resolved === "dark" ? "border-white/10 bg-[oklch(0.18_0_0)] text-white" : "border-black/10 bg-white text-black")}>
        <p className="text-sm font-medium">Preview: {theme === "system" ? `System (${resolved})` : resolved}</p>
        <div className={cn("h-2 w-2/3 rounded-full", resolved === "dark" ? "bg-white/15" : "bg-black/10")} />
        <div className={cn("h-2 w-1/2 rounded-full", resolved === "dark" ? "bg-white/15" : "bg-black/10")} />
      </div>
    </div>
  );
}
