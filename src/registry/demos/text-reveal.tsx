import { TextReveal } from "@/registry/ui/text-reveal";

export default function TextRevealDemo() {
  return (
    <div className="h-80 w-full max-w-xl overflow-y-auto rounded-xl border bg-card px-6">
      <p className="flex h-52 items-end justify-center pb-4 text-sm text-muted-foreground">Scroll down ↓</p>
      <TextReveal text="Components you copy into your project and own. Read every line, change anything, and keep it in step with updates when you want them." />
      <div className="h-72" />
    </div>
  );
}
