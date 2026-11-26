"use client";

import { useState } from "react";
import { OnboardingChecklist, type ChecklistStep } from "@/registry/ui/onboarding-checklist";
import { toast } from "@/registry/ui/toast";

export default function OnboardingChecklistDemo() {
  const [done, setDone] = useState(["account"]);
  const [hidden, setHidden] = useState(false);

  const steps: ChecklistStep[] = [
    { id: "account", title: "Create your workspace", description: "Pick a name and URL. You can change both later." },
    { id: "connect", title: "Connect a repository", description: "We'll build every push and give each pull request a preview link.", action: { label: "Connect GitHub", onClick: () => (setDone((d) => [...d, "connect"]), toast.success("Repository connected", { description: "example/web" })) } },
    { id: "invite", title: "Invite your team", description: "Teammates can review previews and leave comments.", action: { label: "Invite people", onClick: () => toast("Invite dialog would open here") } },
    { id: "domain", title: "Add a custom domain", description: "Point app.yourcompany.com at your production deployment.", optional: true },
  ];

  if (hidden)
    return (
      <button type="button" onClick={() => (setHidden(false), setDone(["account"]))} className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
        Show the checklist again
      </button>
    );

  return <OnboardingChecklist className="max-w-md" steps={steps} value={done} onValueChange={setDone} description="Finish setup to deploy your first app" onDismiss={() => setHidden(true)} />;
}
