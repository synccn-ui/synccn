import { TestimonialCard } from "@/registry/ui/cards";

export default function TestimonialCardDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <TestimonialCard rating={5} name="synccn" role="Product designer" quote="Swapping our hand-rolled modals for these cut a week off the launch. The keyboard support just works." />
      <p className="text-center text-xs text-muted-foreground">Sample quote. Use real ones you have permission to publish.</p>
    </div>
  );
}
