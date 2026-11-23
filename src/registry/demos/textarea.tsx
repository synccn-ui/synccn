import { Label } from "@/registry/ui/input";
import { Textarea } from "@/registry/ui/textarea";

export default function TextareaDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="feedback">Release notes</Label>
      <Textarea id="feedback" maxLength={180} placeholder="What changed in this version?" defaultValue="Added range mode to Calendar and fixed focus return in Dialog." />
      <p className="text-[13px] text-muted-foreground">The field grows as you type.</p>
    </div>
  );
}
