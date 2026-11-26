"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface CropArea {
  /** In the image's own pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps {
  /** Image URL. For cropping to a canvas it must be same-origin or allow CORS. */
  src: string;
  /** Text alternative for the image. */
  alt?: string;
  /** Width divided by height, e.g. 1 for square avatars or 16 / 9. Free when not set. */
  aspect?: number;
  /** Called as the crop changes, in the image's own pixels. */
  onCropChange?: (area: CropArea) => void;
  /**
   * Draws the crop as a circle (the result is still a square).
   * @default false
   */
  round?: boolean;
  /** Extra classes for the root element. */
  className?: string;
}

/** Crops an image to a data URL with a canvas. */
export async function cropImage(src: string, area: CropArea, type = "image/png"): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  canvas.getContext("2d")?.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  return canvas.toDataURL(type);
}

type Box = { x: number; y: number; w: number; h: number };
type Drag = { mode: "move" | "nw" | "ne" | "sw" | "se"; sx: number; sy: number; box: Box };

/**
 * Drag a box over an image to crop it: move, resize from the corners, lock an aspect ratio,
 * round for avatars, and nudge with the arrow keys. Gives you pixel coordinates, plus a
 * cropImage() helper that returns the result as a data URL.
 */
export function ImageCropper({ src, alt = "", aspect, onCropChange, round = false, className }: ImageCropperProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0, nw: 0, nh: 0 });
  const [box, setBox] = useState<Box | null>(null);
  const drag = useRef<Drag | null>(null);

  // Start with the largest centered box that fits the aspect ratio.
  const init = () => {
    const el = img.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    setSize({ w, h, nw: el.naturalWidth, nh: el.naturalHeight });
    const a = aspect ?? 1;
    let bw = w * 0.8;
    let bh = bw / a;
    if (bh > h * 0.8) (bh = h * 0.8), (bw = bh * a);
    setBox({ x: (w - bw) / 2, y: (h - bh) / 2, w: bw, h: bh });
  };
  useEffect(() => {
    if (img.current?.complete) init();
  }, [src, aspect]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!box || !size.w) return;
    const sx = size.nw / size.w;
    const sy = size.nh / size.h;
    onCropChange?.({ x: Math.round(box.x * sx), y: Math.round(box.y * sy), width: Math.round(box.w * sx), height: Math.round(box.h * sy) });
  }, [box, size]); // eslint-disable-line react-hooks/exhaustive-deps

  const clamp = (b: Box): Box => {
    const w = Math.min(Math.max(24, b.w), size.w);
    const h = Math.min(Math.max(24, b.h), size.h);
    return { w, h, x: Math.min(Math.max(0, b.x), size.w - w), y: Math.min(Math.max(0, b.y), size.h - h) };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    const b = d.box;
    if (d.mode === "move") return setBox(clamp({ ...b, x: b.x + dx, y: b.y + dy }));
    const left = d.mode === "nw" || d.mode === "sw";
    const topSide = d.mode === "nw" || d.mode === "ne";
    let w = b.w + (left ? -dx : dx);
    let h = b.h + (topSide ? -dy : dy);
    if (aspect) {
      if (Math.abs(dx) > Math.abs(dy)) h = w / aspect;
      else w = h * aspect;
    }
    w = Math.max(24, Math.min(w, left ? b.x + b.w : size.w - b.x));
    h = Math.max(24, Math.min(h, topSide ? b.y + b.h : size.h - b.y));
    if (aspect) (w = Math.min(w, h * aspect)), (h = w / aspect);
    setBox({ w, h, x: left ? b.x + b.w - w : b.x, y: topSide ? b.y + b.h - h : b.y });
  };

  const start = (mode: Drag["mode"]) => (e: React.PointerEvent) => {
    if (!box) return;
    e.stopPropagation();
    e.preventDefault();
    wrap.current?.setPointerCapture(e.pointerId);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, box };
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!box) return;
    const step = e.shiftKey ? 10 : 2;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    if (e.altKey) {
      const w = box.w + d[0] + (aspect ? d[1] * aspect : 0);
      setBox(clamp({ ...box, w, h: aspect ? w / aspect : box.h + d[1] }));
    } else setBox(clamp({ ...box, x: box.x + d[0], y: box.y + d[1] }));
  };

  const handle = "absolute size-3.5 rounded-full border-2 border-white bg-primary shadow";
  return (
    <div
      ref={wrap}
      onPointerMove={onMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      className={cn("relative inline-block max-w-full touch-none select-none overflow-hidden rounded-lg bg-muted", className)}
    >
      <img ref={img} src={src} alt={alt} onLoad={init} draggable={false} className="block max-h-[420px] max-w-full" />
      {box && (
        <>
          <div aria-hidden className={cn("pointer-events-none absolute shadow-[0_0_0_9999px_rgb(0_0_0/0.55)]", round && "rounded-full")} style={{ left: box.x, top: box.y, width: box.w, height: box.h }} />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Crop area. Arrow keys move it, Alt and arrow keys resize it."
            aria-valuetext={`${Math.round((box.w / size.w) * 100)}% wide, at ${Math.round((box.x / size.w) * 100)}% from the left`}
            onPointerDown={start("move")}
            onKeyDown={onKey}
            className={cn("absolute cursor-move border border-white/90 outline-none focus-visible:ring-2 focus-visible:ring-ring", round && "rounded-full")}
            style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
          >
            {!round && (
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_33.2%,rgb(255_255_255/0.35)_33.3%,transparent_33.5%,transparent_66.5%,rgb(255_255_255/0.35)_66.6%,transparent_66.8%),linear-gradient(to_bottom,transparent_33.2%,rgb(255_255_255/0.35)_33.3%,transparent_33.5%,transparent_66.5%,rgb(255_255_255/0.35)_66.6%,transparent_66.8%)]" />
            )}
            <span onPointerDown={start("nw")} className={cn(handle, "-left-1.5 -top-1.5 cursor-nwse-resize")} />
            <span onPointerDown={start("ne")} className={cn(handle, "-right-1.5 -top-1.5 cursor-nesw-resize")} />
            <span onPointerDown={start("sw")} className={cn(handle, "-bottom-1.5 -left-1.5 cursor-nesw-resize")} />
            <span onPointerDown={start("se")} className={cn(handle, "-bottom-1.5 -right-1.5 cursor-nwse-resize")} />
          </div>
        </>
      )}
    </div>
  );
}
