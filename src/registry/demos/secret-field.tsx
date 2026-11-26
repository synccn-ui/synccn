"use client";

import { useState } from "react";
import { SecretField } from "@/registry/ui/secret-field";
import { toast } from "@/registry/ui/toast";

// Fake keys for the example.
const roll = () => `demo_key_${Array.from({ length: 28 }, (_, i) => "abcdef0123456789"[(Date.now() + i * 7919) % 16]).join("")}`;

export default function SecretFieldDemo() {
  const [key, setKey] = useState("demo_key_x9QeExampleOnly0000000003f9a");
  return (
    <div className="grid w-full max-w-md gap-5">
      <SecretField
        label="Secret key"
        value={key}
        hint="Example key. Use it on your server only."
        onRegenerate={() =>
          new Promise<void>((done) =>
            setTimeout(() => {
              setKey(roll());
              toast.success("New key created", { description: "The old key stops working in 24 hours." });
              done();
            }, 900)
          )
        }
      />
      <SecretField label="Webhook signing secret" value="demo_whk_exampleOnly7Yq2Lk9Vb4Nn8Tt1" />
    </div>
  );
}
