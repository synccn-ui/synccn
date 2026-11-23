import { TiltCard } from "@/registry/ui/spotlight-card";

export default function TiltCardDemo() {
  return (
    <TiltCard className="w-72">
      <div className="aspect-[4/3] bg-[radial-gradient(circle_at_30%_30%,var(--primary),transparent_60%),radial-gradient(circle_at_80%_70%,oklch(0.75_0.15_75),transparent_55%)] bg-muted" />
      <div className="grid gap-1 p-4">
        <p className="font-semibold">Membership card</p>
        <p className="text-sm text-muted-foreground">Move your pointer across the card.</p>
      </div>
    </TiltCard>
  );
}
