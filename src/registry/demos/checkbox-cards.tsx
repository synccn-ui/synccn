"use client";

import { BarChart3, Bell, Mail, Shield } from "lucide-react";
import { CheckboxCards } from "@/registry/ui/checkbox-cards";

export default function CheckboxCardsDemo() {
  return (
    <CheckboxCards
      className="w-full max-w-lg"
      defaultValue={["email", "security"]}
      options={[
        { value: "email", label: "Email digests", description: "A summary every Monday.", icon: Mail },
        { value: "push", label: "Push alerts", description: "Mentions and replies.", icon: Bell },
        { value: "reports", label: "Monthly reports", description: "Usage and billing.", icon: BarChart3 },
        { value: "security", label: "Security alerts", description: "New sign-ins and changes.", icon: Shield },
      ]}
    />
  );
}
