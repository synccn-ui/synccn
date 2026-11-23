"use client";

import { Copy, Globe, Search } from "lucide-react";
import { InputAddon, InputGroup, InputGroupButton, InputGroupInput } from "@/registry/ui/input-group";
import { Kbd } from "@/registry/ui/kbd";
import { toast } from "@/registry/ui/toast";

export default function InputGroupDemo() {
  return (
    <div className="grid w-full max-w-sm gap-4">
      <InputGroup>
        <InputAddon variant="muted">https://</InputAddon>
        <InputGroupInput placeholder="your-site" aria-label="Website" />
        <InputAddon variant="muted">.com</InputAddon>
      </InputGroup>
      <InputGroup>
        <InputAddon>
          <Search />
        </InputAddon>
        <InputGroupInput placeholder="Search docs…" aria-label="Search docs" />
        <InputAddon className="pr-2">
          <Kbd>⌘K</Kbd>
        </InputAddon>
      </InputGroup>
      <InputGroup>
        <InputAddon variant="muted">$</InputAddon>
        <InputGroupInput defaultValue="1,200.00" inputMode="decimal" aria-label="Amount" />
        <InputAddon variant="muted">USD</InputAddon>
      </InputGroup>
      <InputGroup>
        <InputAddon>
          <Globe />
        </InputAddon>
        <InputGroupInput readOnly value="https://synccn.com/invite/8f2k" aria-label="Invite link" />
        <InputGroupButton onClick={() => toast.success("Link copied")}>
          <Copy /> Copy
        </InputGroupButton>
      </InputGroup>
    </div>
  );
}
