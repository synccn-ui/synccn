import { RetroGrid } from "@/registry/ui/particles";

export default function RetroGridDemo() {
  return (
    <div className="relative grid h-72 w-full max-w-xl place-items-center overflow-hidden rounded-2xl border bg-background">
      <RetroGrid />
      <p className="text-fade relative text-5xl font-semibold tracking-tighter">Retro grid</p>
    </div>
  );
}
