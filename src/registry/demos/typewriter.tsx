import { Typewriter } from "@/registry/ui/typewriter";

export default function TypewriterDemo() {
  return (
    <p className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
      Build your next <br className="sm:hidden" />
      <Typewriter words={["dashboard", "landing page", "design system", "side project"]} className="text-primary" />
    </p>
  );
}
