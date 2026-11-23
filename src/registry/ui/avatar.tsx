"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type AvatarSize = "xs" | "sm" | "md" | "lg";
export type AvatarStatus = "online" | "away" | "busy" | "offline";

const sizes = { xs: "size-6 text-[10px]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" };
const tones = [
  "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

export interface AvatarProps {
  /** Image URL. Falls back to initials if missing or broken. */
  src?: string;
  /** Person's name, used for initials, colour and alt text. */
  name?: string;
  /** Diameter preset. */
  size?: AvatarSize;
  /** Shows a presence dot. */
  status?: AvatarStatus;
  /** Extra classes for the root element. */
  className?: string;
}

/** Image with an initials fallback and an optional presence dot. */
export function Avatar({ src, name, size = "md", status, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const tone = tones[[...(name || "")].reduce((a, c) => a + c.charCodeAt(0), 0) % tones.length];
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-grid place-items-center overflow-hidden rounded-full font-semibold ring-2 ring-background",
          sizes[size],
          (!src || failed) && tone
        )}
      >
        {src && !failed ? <img src={src} alt={name} onError={() => setFailed(true)} className="size-full object-cover" /> : initials(name)}
      </span>
      {status && (
        <span
          aria-label={status}
          className={cn(
            "absolute bottom-0 right-0 size-[28%] min-h-2 min-w-2 rounded-full ring-2 ring-background",
            { online: "bg-success", away: "bg-warning", busy: "bg-destructive", offline: "bg-muted-foreground" }[status]
          )}
        />
      )}
    </span>
  );
}

export interface AvatarGroupProps {
  /** People to show. */
  people: { name: string; src?: string; status?: AvatarStatus }[];
  /** Avatars shown before a “+N” bubble. */
  max?: number;
  /** Diameter preset for every avatar. */
  size?: AvatarSize;
  /** Extra classes for the root element. */
  className?: string;
}

export function AvatarGroup({ people, max = 4, size = "sm", className }: AvatarGroupProps) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className={cn("flex -space-x-2", className)}>
      {shown.map((p) => (
        <Avatar key={p.name} {...p} size={size} />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-grid place-items-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            sizes[size]
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
