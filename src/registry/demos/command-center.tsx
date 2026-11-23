"use client";

import { useState } from "react";
import { Bell, CreditCard, FileText, Moon, Palette, Settings, Sun, User, UserPlus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { CommandCenter, CommandCenterDialog, type CommandProvider } from "@/registry/ui/command-center";
import { Kbd } from "@/registry/ui/kbd";
import { toast } from "@/registry/ui/toast";

const DOCS = ["Getting started", "Billing and invoices", "Inviting your team", "API keys", "Webhooks", "Single sign-on", "Audit log", "Data export"];

const providers: CommandProvider[] = [
  {
    id: "actions",
    heading: "Actions",
    items: [
      { id: "invite", label: "Invite teammate", icon: UserPlus, shortcut: ["⌘", "I"], onSelect: () => toast.success("Invite sent") },
      { id: "new-doc", label: "New document", icon: FileText, shortcut: ["⌘", "N"], keywords: ["create", "page"], onSelect: () => toast("Document created") },
      {
        id: "theme",
        label: "Change theme",
        icon: Palette,
        items: [
          { id: "theme-light", label: "Light", icon: Sun, onSelect: () => toast("Theme: light") },
          { id: "theme-dark", label: "Dark", icon: Moon, onSelect: () => toast("Theme: dark") },
        ],
      },
    ],
  },
  {
    id: "settings",
    heading: "Settings",
    items: [
      { id: "profile", label: "Profile", icon: User, onSelect: () => toast("Opened profile") },
      { id: "billing", label: "Billing", icon: CreditCard, keywords: ["invoices", "plan", "payment"], onSelect: () => toast("Opened billing") },
      {
        id: "notifications",
        label: "Notifications",
        icon: Bell,
        items: [
          { id: "n-email", label: "Email digests", onSelect: () => toast("Email digests toggled") },
          { id: "n-push", label: "Push notifications", onSelect: () => toast("Push toggled") },
        ],
      },
      { id: "general", label: "General", icon: Settings, onSelect: () => toast("Opened settings") },
    ],
  },
  {
    id: "docs",
    heading: "Documentation",
    // An async provider: results arrive after a pretend network request.
    search: (q) =>
      new Promise((resolve) =>
        setTimeout(() => resolve(DOCS.filter((d) => d.toLowerCase().includes(q.toLowerCase())).map((d) => ({ id: `doc-${d}`, label: d, icon: FileText, description: "Docs", onSelect: () => toast(`Opened "${d}"`) }))), 350)
      ),
  },
];

export default function CommandCenterDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grid w-full max-w-xl gap-3">
      <CommandCenter providers={providers} recentsKey="synccn-demo-recents" autoFocus={false} />
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        Or as an overlay: press <Kbd>⌘</Kbd>
        <Kbd>K</Kbd> or
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Open command center
        </Button>
      </p>
      <CommandCenterDialog open={open} onOpenChange={setOpen} providers={providers} recentsKey="synccn-demo-recents" hotkey={false} />
    </div>
  );
}
