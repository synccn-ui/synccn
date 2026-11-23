"use client";

import { ResizablePanels } from "@/registry/ui/resizable";

const Pane = ({ label }: { label: string }) => <div className="grid size-full min-h-20 place-items-center p-4 text-sm font-medium text-muted-foreground">{label}</div>;

export default function ResizableDemo() {
  return (
    <ResizablePanels className="h-72 max-w-2xl" defaultSizes={[28, 72]}>
      <Pane label="Sidebar" />
      <ResizablePanels direction="vertical" className="h-full rounded-none border-0" defaultSizes={[60, 40]}>
        <Pane label="Editor" />
        <Pane label="Terminal" />
      </ResizablePanels>
    </ResizablePanels>
  );
}
