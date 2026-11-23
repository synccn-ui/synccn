import { Button } from "@/registry/ui/button";
import { BorderBeam } from "@/registry/ui/border-beam";

export default function BorderBeamDemo() {
  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">Pro plan</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        $12<span className="text-base font-normal text-muted-foreground"> per month</span>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">Every component, block and theme, plus updates as they ship.</p>
      <Button className="mt-5 w-full">Upgrade to Pro</Button>
      <BorderBeam duration={7} size={140} />
    </div>
  );
}
