"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageIcon, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropzoneFile {
  id: string;
  file: File;
  progress: number;
  preview: string | null;
}

const fmt = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);

export interface DropzoneProps {
  /** File types, as for an input's accept attribute. */
  accept?: string;
  /** Allow several files. */
  multiple?: boolean;
  /** Largest file allowed, in bytes. */
  maxSize?: number;
  /** Called whenever the list changes. */
  onFilesChange?: (files: DropzoneFile[]) => void;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Drag-and-drop file picker with previews and simulated upload progress.
 * Swap `simulate` for your own upload function.
 */
export function Dropzone({ accept, multiple = true, maxSize = 10 * 1048576, onFilesChange, className }: DropzoneProps) {
  const [files, setFiles] = useState<DropzoneFile[]>([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => onFilesChange?.(files), [files]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const simulate = (id: string) => {
    const tick = () =>
      setFiles((prev) => {
        const next = prev.map((f) => (f.id === id ? { ...f, progress: Math.min(100, f.progress + 8 + Math.random() * 18) } : f));
        if ((next.find((f) => f.id === id)?.progress ?? 100) < 100) setTimeout(tick, 180);
        return next;
      });
    setTimeout(tick, 200);
  };

  const addFiles = (list: FileList | File[]) => {
    setError("");
    const incoming = [...list].filter((f) => {
      if (f.size > maxSize) {
        setError(`${f.name} is larger than ${fmt(maxSize)}. Choose a smaller file.`);
        return false;
      }
      return true;
    });
    const mapped = incoming.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      progress: 0,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => (multiple ? [...prev, ...mapped] : mapped.slice(0, 1)));
    mapped.forEach((m) => simulate(m.id));
  };

  return (
    <div className={cn("grid w-full gap-3", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "grid place-items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          "hover:border-primary/50 hover:bg-brand-soft/50 focus-visible:outline-2 focus-visible:outline-ring",
          over && "border-primary bg-brand-soft"
        )}
      >
        <span
          className={cn(
            "grid size-11 place-items-center rounded-full bg-muted transition-transform",
            over && "scale-110 bg-primary text-primary-foreground"
          )}
        >
          <UploadCloud className="size-5" />
        </span>
        <p className="text-sm font-medium">
          <span className="text-primary">Choose files</span> or drag them here
        </p>
        <p className="text-xs text-muted-foreground">Up to {fmt(maxSize)} each</p>
        <input
          ref={input}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => (e.target.files && addFiles(e.target.files), (e.target.value = ""))}
        />
      </div>
      {error && <p className="text-[13px] text-destructive">{error}</p>}
      {files.length > 0 && (
        <ul className="grid gap-2">
          {files.map((f) => (
            <li key={f.id} className="flex animate-in items-center gap-3 rounded-lg border bg-card p-2.5">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
                {f.preview ? (
                  <img src={f.preview} alt="" className="size-full object-cover" />
                ) : f.file.type.startsWith("image/") ? (
                  <ImageIcon className="size-4" />
                ) : (
                  <FileText className="size-4 text-muted-foreground" />
                )}
              </span>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate font-medium">{f.file.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {f.progress >= 100 ? fmt(f.file.size) : `${Math.round(f.progress)}%`}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-[width] duration-200", f.progress >= 100 ? "bg-success" : "bg-primary")}
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                aria-label={`Remove ${f.file.name}`}
                onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
