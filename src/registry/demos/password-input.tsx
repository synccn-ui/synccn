import { Label } from "@/registry/ui/input";
import { PasswordInput } from "@/registry/ui/password-input";

export default function PasswordInputDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label>Create a password</Label>
      <PasswordInput />
    </div>
  );
}
