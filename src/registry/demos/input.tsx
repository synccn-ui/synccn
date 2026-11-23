"use client";

import { useState } from "react";
import { AtSign, Search } from "lucide-react";
import { Input, Label } from "@/registry/ui/input";

export default function InputDemo() {
  const [email, setEmail] = useState("hello@");
  const invalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email);
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <Label htmlFor="demo-email">Email</Label>
        <Input id="demo-email" icon={AtSign} type="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={invalid} placeholder="you@company.com" />
        <p className={invalid ? "text-[13px] text-destructive" : "text-[13px] text-muted-foreground"}>
          {invalid ? "Enter an address like name@company.com." : "We'll send the invite here."}
        </p>
      </div>
      <Input icon={Search} placeholder="Search components…" aria-label="Search" />
      <Input type="file" aria-label="Upload" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  );
}
