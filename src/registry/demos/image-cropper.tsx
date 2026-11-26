"use client";

import { useState } from "react";
import { Crop } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { ImageCropper, cropImage, type CropArea } from "@/registry/ui/image-cropper";
import { ToggleGroup } from "@/registry/ui/toggle-group";

// A generated picture, so the example needs no image file.
const SRC = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640" viewBox="0 0 960 640"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".55" stop-color="#7c3aed"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><rect width="960" height="640" fill="url(#s)"/><circle cx="640" cy="360" r="110" fill="#fde68a"/><path d="M0 470 L180 330 L330 450 L520 290 L720 470 L960 340 L960 640 L0 640Z" fill="#111827"/><path d="M0 540 L240 420 L460 540 L700 430 L960 560 L960 640 L0 640Z" fill="#030712"/></svg>`)}`;

export default function ImageCropperDemo() {
  const [aspect, setAspect] = useState("1");
  const [area, setArea] = useState<CropArea | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const ratio = aspect === "free" ? undefined : Number(aspect);
  return (
    <div className="grid w-full max-w-xl justify-items-center gap-3">
      <ToggleGroup size="sm" value={aspect} onValueChange={(v) => (setAspect(v), setResult(null))} options={[{ value: "1", label: "Avatar" }, { value: String(16 / 9), label: "16:9" }, { value: "free", label: "Free" }]} />
      <ImageCropper key={aspect} src={SRC} alt="Mountains at sunset" aspect={ratio} round={aspect === "1"} onCropChange={setArea} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{area ? `${area.width}×${area.height} at ${area.x},${area.y}` : "…"}</span>
        <Button size="sm" onClick={async () => area && setResult(await cropImage(SRC, area))}>
          <Crop /> Crop
        </Button>
        {result && <img src={result} alt="Cropped result" className={aspect === "1" ? "size-12 rounded-full border" : "h-12 rounded-md border"} />}
      </div>
    </div>
  );
}
