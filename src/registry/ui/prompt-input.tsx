"use client";

import type * as React from "react";
import { useRef, useState } from "react";
import { ArrowUp, FileText, Paperclip, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PromptInputProps {
  /** Called on send. */
  onSubmit?: (message: { text: string; files: File[] }) => void;
  /** Called when stop is pressed while busy. */
  onStop?: () => void;
  /** Swaps send for stop while a response is generating. */
  busy?: boolean;
  /** Placeholder text. */
  placeholder?: string;
  /** Extra controls beside the attach button, e.g. a model picker. */
  toolbar?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Chat composer for AI products: auto-growing field, attachments,
 * a model picker slot, Enter to send and a stop button while busy.
 */
export function PromptInput({ onSubmit, onStop, busy = false, placeholder = "Ask anything…", toolbar, className }: PromptInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };
  const send = () => {
    if (busy) return onStop?.();
    if (!text.trim() && !files.length) return;
    onSubmit?.({ text: text.trim(), files });
    setText("");
    setFiles([]);
    if (area.current) area.current.style.height = "auto";
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setFiles((f) => [...f, ...e.dataTransfer.files]);
      }}
      className={cn(
        "w-full rounded-2xl border bg-card p-2 shadow-sm transition-[border-color,box-shadow] focus-within:border-ring/60 focus-within:ring-[3px] focus-within:ring-ring/15",
        className
      )}
    >
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1.5 pb-2 pt-1">
          {files.map((f, i) => (
            <span key={i} className="inline-flex animate-in items-center gap-1.5 rounded-lg border bg-muted/60 py-1 pl-2 pr-1 text-xs">
              <FileText className="size-3.5 text-muted-foreground" />
              <span className="max-w-32 truncate">{f.name}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="rounded p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <textarea
        ref={area}
        rows={1}
        value={text}
        onChange={(e) => (setText(e.target.value), grow(e.target))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={placeholder}
        aria-label="Message"
        className="block max-h-[200px] w-full resize-none bg-transparent px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground sm:text-[15px]"
      />
      <div className="flex items-center gap-1 pt-1">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          aria-label="Attach files"
          className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Paperclip className="size-4" />
        </button>
        <input
          ref={fileInput}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => (setFiles((f) => [...f, ...(e.target.files ?? [])]), (e.target.value = ""))}
        />
        {toolbar}
        <button
          type="button"
          onClick={send}
          aria-label={busy ? "Stop generating" : "Send message"}
          disabled={!busy && !text.trim() && !files.length}
          className="ml-auto grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
        >
          {busy ? <Square className="size-3.5 fill-current" /> : <ArrowUp className="size-4" />}
        </button>
      </div>
    </div>
  );
}
