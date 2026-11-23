"use client";

import { useState } from "react";
import { ChevronDown, CreditCard, Keyboard, LogOut, Settings, User, Users } from "lucide-react";
import { Avatar } from "@/registry/ui/avatar";
import { Button } from "@/registry/ui/button";
import { DropdownMenu } from "@/registry/ui/dropdown-menu";
import { toast } from "@/registry/ui/toast";

export default function DropdownMenuDemo() {
  const [compact, setCompact] = useState(false);
  const [beta, setBeta] = useState(true);
  return (
    <DropdownMenu
      trigger={
        <Button variant="outline" className="gap-2 pl-1.5">
          <Avatar name="Michael" size="xs" /> Michael <ChevronDown className="text-muted-foreground" />
        </Button>
      }
      items={[
        { type: "label", label: "michael@example.com" },
        { label: "Profile", icon: User, shortcut: "⇧⌘P", onSelect: () => toast("Opening profile") },
        { label: "Billing", icon: CreditCard, shortcut: "⌘B" },
        { label: "Team", icon: Users },
        { label: "Settings", icon: Settings, shortcut: "⌘," },
        { type: "separator" },
        { type: "checkbox", label: "Compact mode", checked: compact, onCheckedChange: setCompact },
        { type: "checkbox", label: "Beta features", checked: beta, onCheckedChange: setBeta },
        { type: "separator" },
        { label: "Keyboard shortcuts", icon: Keyboard, disabled: true },
        { label: "Log out", icon: LogOut, destructive: true, onSelect: () => toast("Logged out") },
      ]}
    />
  );
}
