import { Button } from "@/registry/ui/button";
import { Spinner } from "@/registry/ui/skeleton";

export default function SpinnerDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <Spinner size={16} className="text-muted-foreground" />
      <Spinner size={24} className="text-primary" />
      <Spinner size={32} />
      <Button disabled>
        <Spinner size={16} /> Processing
      </Button>
    </div>
  );
}
