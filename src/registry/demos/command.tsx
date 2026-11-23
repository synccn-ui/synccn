"use client";

import { Calculator, Calendar, CreditCard, FileText, Settings, Smile, User } from "lucide-react";
import { Command } from "@/registry/ui/command";
import { toast } from "@/registry/ui/toast";

export default function CommandDemo() {
  const run = (label: string) => () => toast(`Ran “${label}”`);
  return (
    <Command
      autoFocus={false}
      className="max-w-md shadow-lg shadow-black/5"
      groups={[
        {
          heading: "Suggestions",
          items: [
            { label: "Calendar", icon: Calendar, onSelect: run("Calendar") },
            { label: "Search emoji", icon: Smile, onSelect: run("Search emoji") },
            { label: "Calculator", icon: Calculator, onSelect: run("Calculator") },
          ],
        },
        {
          heading: "Settings",
          items: [
            { label: "Profile", icon: User, shortcut: "⌘P", onSelect: run("Profile") },
            { label: "Billing", icon: CreditCard, shortcut: "⌘B", onSelect: run("Billing") },
            { label: "Preferences", icon: Settings, shortcut: "⌘,", onSelect: run("Preferences") },
            { label: "Changelog", icon: FileText, keywords: "release notes", onSelect: run("Changelog") },
          ],
        },
      ]}
    />
  );
}
