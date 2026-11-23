"use client";

import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const time = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export interface AudioPlayerProps {
  /** Audio file URL. Without it the player runs a silent preview. */
  src?: string;
  /** Length in seconds for the silent preview (read from the file when src is set). */
  duration?: number;
  /** Number of waveform bars. */
  bars?: number;
  /** Label above the waveform. */
  title?: React.ReactNode;
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Voice-note style player with a clickable waveform. Pass `src` for a real
 * audio file; without one it runs a silent preview for `duration` seconds.
 */
export function AudioPlayer({ src, duration: durationProp = 42, bars = 48, title, className }: AudioPlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [duration, setDuration] = useState(durationProp);
  const heights = useMemo(
    () => Array.from({ length: bars }, (_, i) => Math.round((0.25 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 0.75) * 1000) / 1000),
    [bars]
  );

  useEffect(() => {
    if (src || !playing) return;
    const t = setInterval(() => setPos((p) => (p + 0.1 >= duration ? (setPlaying(false), 0) : p + 0.1)), 100);
    return () => clearInterval(t);
  }, [playing, src, duration]);

  const toggle = () => {
    if (src) playing ? audio.current!.pause() : audio.current!.play().catch(() => {});
    setPlaying(!playing);
  };
  const seek = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const p = ((e.clientX - r.left) / r.width) * duration;
    setPos(p);
    if (src) audio.current!.currentTime = p;
  };
  const pct = pos / duration;

  return (
    <div className={cn("flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-card p-3", className)}>
      {src && (
        <audio
          ref={audio}
          src={src}
          onTimeUpdate={(e) => setPos(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => (setPlaying(false), setPos(0))}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
      >
        {playing ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
      </button>
      <div className="grid min-w-0 flex-1 gap-1">
        {title && <p className="truncate text-sm font-medium">{title}</p>}
        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(pos)}
          onClick={seek}
          onKeyDown={(e) => {
            const d = { ArrowRight: 5, ArrowLeft: -5 }[e.key];
            if (d) (e.preventDefault(), setPos((p) => Math.min(duration, Math.max(0, p + d))));
          }}
          className="flex h-8 cursor-pointer items-center gap-[2px] rounded focus-visible:outline-2 focus-visible:outline-ring"
        >
          {heights.map((h, i) => (
            <span
              key={i}
              className={cn("flex-1 rounded-full transition-colors", i / bars < pct ? "bg-foreground" : "bg-foreground/20")}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      </div>
      <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{time(playing || pos ? pos : duration)}</span>
    </div>
  );
}
