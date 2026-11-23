import { Terminal } from "@/registry/ui/terminal";

export default function TerminalDemo() {
  return (
    <Terminal
      className="max-w-lg"
      loop
      lines={[
        { type: "input", text: "npx shadcn@latest init" },
        { type: "output", text: "✔ Found Vite + React + Tailwind v4", tone: "success" },
        { type: "output", text: "✔ Wrote theme variables to src/index.css", tone: "success" },
        { type: "input", text: "npx shadcn@latest add @synccn/dialog @synccn/toast" },
        { type: "output", text: "Resolving 2 components and their dependencies…", tone: "muted" },
        { type: "output", text: "✔ Done. Components are in src/components/ui", tone: "success" },
      ]}
    />
  );
}
