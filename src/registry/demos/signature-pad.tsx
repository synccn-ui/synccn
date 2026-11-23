"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { SignaturePad } from "@/registry/ui/signature-pad";
import { toast } from "@/registry/ui/toast";

export default function SignaturePadDemo() {
  const [sig, setSig] = useState<string | null>(null);
  return (
    <div className="grid w-full max-w-md gap-2">
      <p className="text-sm font-medium">Sign to accept the agreement</p>
      <SignaturePad onChange={setSig} />
      <Button disabled={!sig} onClick={() => toast.success("Agreement signed")}>
        Accept and sign
      </Button>
    </div>
  );
}
