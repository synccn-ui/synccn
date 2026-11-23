"use client";

import { CodeBlock } from "@/registry/ui/code-block";

const app = `import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export default function App() {
  return (
    <Button onClick={() => toast.success("Saved")}>
      Save changes
    </Button>
  );
}`;

const utils = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}`;

export default function CodeBlockDemo() {
  return (
    <CodeBlock
      className="max-w-xl"
      files={[
        { name: "app.jsx", code: app, highlight: [6, 7] },
        { name: "lib/utils.js", code: utils },
      ]}
    />
  );
}
