import { ArrowDown } from "lucide-react";
import { SpinningText } from "@/registry/ui/spinning-text";

export default function SpinningTextDemo() {
  return (
    <SpinningText text="scroll to explore • scroll to explore • ">
      <span className="grid size-12 place-items-center rounded-full bg-foreground text-background">
        <ArrowDown className="size-5" />
      </span>
    </SpinningText>
  );
}
