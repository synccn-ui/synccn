import { CopyButton } from "@/registry/ui/copy-button";

export default function CopyButtonDemo() {
  const key = "sync_demo_7Qx2Lm9Pa4Rt8Vw1";
  return (
    <div className="grid w-full max-w-sm gap-3">
      <div className="flex items-center gap-2 rounded-lg border bg-muted/50 py-1 pl-3 pr-1">
        <code className="flex-1 truncate font-mono text-[13px]">npx shadcn@latest add @synccn/button</code>
        <CopyButton value="npx shadcn@latest add @synccn/button" />
      </div>
      <div className="flex items-center gap-2 rounded-lg border py-1 pl-3 pr-1">
        <code className="flex-1 truncate font-mono text-[13px]">{key.slice(0, 12)}••••••••</code>
        <CopyButton value={key}>Copy key</CopyButton>
      </div>
    </div>
  );
}
