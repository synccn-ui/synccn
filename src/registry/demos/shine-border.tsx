import { Sparkles } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { ShineBorder } from "@/registry/ui/shine-border";

export default function ShineBorderDemo() {
  return (
    <ShineBorder className="w-full max-w-sm" innerClassName="grid gap-3 p-6">
      <Sparkles className="size-5" />
      <p className="text-lg font-semibold tracking-tight">Pro features unlocked</p>
      <p className="text-sm text-muted-foreground">Every block, every theme and early access to new components.</p>
      <Button className="mt-1 w-fit">Get Pro</Button>
    </ShineBorder>
  );
}
