import { InteractiveGrid } from "@/registry/ui/interactive-grid";

export default function InteractiveGridDemo() {
  return (
    <InteractiveGrid className="grid h-72 w-full max-w-2xl place-items-center rounded-2xl border bg-card text-primary">
      <div className="pointer-events-none grid justify-items-center gap-2 px-6 text-center">
        <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Move your pointer</p>
        <p className="max-w-xs text-sm text-muted-foreground">Squares light up and fade behind you. Set the colour with a text class.</p>
      </div>
    </InteractiveGrid>
  );
}
