import { Label } from "@/registry/ui/input";
import { PhoneInput } from "@/registry/ui/phone-input";

export default function PhoneInputDemo() {
  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label>Phone number</Label>
      <PhoneInput />
    </div>
  );
}
