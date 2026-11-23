"use client";

import { useState } from "react";
import { OtpInput } from "@/registry/ui/otp-input";

export default function OtpInputDemo() {
  const [status, setStatus] = useState("idle");
  return (
    <div className="grid justify-items-center gap-3">
      <OtpInput
        key={status === "reset" ? "r" : "x"}
        invalid={status === "error"}
        onComplete={(code) => setStatus(code === "123456" ? "ok" : "error")}
      />
      <p className={status === "error" ? "text-[13px] text-destructive" : status === "ok" ? "text-[13px] text-success" : "text-[13px] text-muted-foreground"}>
        {status === "ok" ? "Code accepted." : status === "error" ? "That code doesn't match. Try 123456." : "Enter the 6-digit code. Paste works too."}
      </p>
    </div>
  );
}
