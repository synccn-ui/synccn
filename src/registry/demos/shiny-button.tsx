import { ArrowRight } from "lucide-react";
import { ShinyButton } from "@/registry/ui/shine-border";

export default function ShinyButtonDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <ShinyButton>
        Get started <ArrowRight className="ml-1 inline size-4" />
      </ShinyButton>
      <ShinyButton className="bg-foreground text-background">Join the waitlist</ShinyButton>
    </div>
  );
}
