"use client";

import { useState } from "react";
import { Button } from "@/registry/ui/button";
import { CardInput } from "@/registry/ui/card-input";
import { Label } from "@/registry/ui/input";
import { toast } from "@/registry/ui/toast";

export default function CardInputDemo() {
  const [complete, setComplete] = useState(false);
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label>Card details</Label>
      <CardInput onChange={(s) => setComplete(s.complete)} />
      <p className="text-xs text-muted-foreground">Try the test number 4242 4242 4242 4242 with any future date.</p>
      <Button className="mt-2" disabled={!complete} onClick={() => toast.success("Payment method saved")}>
        Save card
      </Button>
    </div>
  );
}
