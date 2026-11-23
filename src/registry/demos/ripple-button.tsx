import { RippleButton } from "@/registry/ui/ripple-button";

export default function RippleButtonDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <RippleButton size="lg">Click me</RippleButton>
      <RippleButton size="lg" variant="outline">
        Or me
      </RippleButton>
    </div>
  );
}
