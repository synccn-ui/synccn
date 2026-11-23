"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { Stepper } from "@/registry/ui/stepper";

const steps = [
  { title: "Account", description: "Name and email" },
  { title: "Workspace", description: "Team details" },
  { title: "Plan", description: "Choose a tier" },
  { title: "Done", description: "Start building" },
];

export default function StepperDemo() {
  const [step, setStep] = useState(1);
  return (
    <div className="grid w-full max-w-xl gap-6">
      <Stepper steps={steps} current={step} onStepClick={(i) => i <= step && setStep(i)} />
      <div className="flex items-center justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </Button>
        <span className="text-[13px] tabular-nums text-muted-foreground">
          Step {Math.min(step + 1, steps.length)} of {steps.length}
        </span>
        <Button disabled={step >= steps.length} onClick={() => setStep(step + 1)}>
          {step >= steps.length - 1 ? "Finish" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
