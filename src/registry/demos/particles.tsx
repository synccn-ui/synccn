import { Particles } from "@/registry/ui/particles";

export default function ParticlesDemo() {
  return (
    <div className="relative grid h-72 w-full max-w-xl place-items-center overflow-hidden rounded-2xl border bg-card">
      <Particles quantity={90} />
      <div className="relative grid gap-1 text-center">
        <p className="text-3xl font-semibold tracking-tight">Particles</p>
        <p className="text-sm text-muted-foreground">Move your pointer through them.</p>
      </div>
    </div>
  );
}
