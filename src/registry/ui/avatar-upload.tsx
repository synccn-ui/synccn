"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarUploadProps {
  /** Used for initials before a photo is chosen. */
  name?: string;
  /** Avatar diameter in pixels. */
  size?: number;
  /** Largest file allowed, in bytes. */
  maxSize?: number;
  /** Called with the chosen file, or null when removed. */
  onChange?: (file: File | null) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Round avatar picker: click or drop an image to preview it; remove to go back to initials. */
export function AvatarUpload({ name = "", size = 96, maxSize = 4 * 1048576, onChange, className }: AvatarUploadProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (src) URL.revokeObjectURL(src);
    },
    [src]
  );

  const pick = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file (PNG, JPG, GIF or WebP).");
    if (file.size > maxSize) return setError(`That image is over ${Math.round(maxSize / 1048576)} MB. Choose a smaller one.`);
    setError("");
    setSrc(URL.createObjectURL(file));
    onChange?.(file);
  };
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return (
    <div className={cn("flex flex-wrap items-center gap-5", className)}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => (e.preventDefault(), setOver(true))}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        aria-label={src ? "Change photo" : "Upload photo"}
        className={cn(
          "group relative grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed bg-muted text-2xl font-semibold text-muted-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          src && "border-solid border-transparent",
          over && "border-primary"
        )}
        style={{ width: size, height: size }}
      >
        {src ? <img src={src} alt="" className="size-full object-cover" /> : initials || <Camera className="size-6" />}
        <span className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <Camera className="size-5" />
        </span>
      </button>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="h-8 rounded-md border bg-background px-3 text-[13px] font-medium shadow-xs hover:bg-accent"
          >
            {src ? "Change photo" : "Upload photo"}
          </button>
          {src && (
            <button
              type="button"
              onClick={() => (setSrc(null), onChange?.(null))}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-destructive"
            >
              <Trash2 className="size-3.5" /> Remove
            </button>
          )}
        </div>
        <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>
          {error || `PNG, JPG or GIF, up to ${Math.round(maxSize / 1048576)} MB. Drop an image on the circle too.`}
        </p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))}
      />
    </div>
  );
}
