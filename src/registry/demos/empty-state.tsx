import { FolderPlus, Plus } from "lucide-react";
import { Button } from "@/registry/ui/button";
import { EmptyState } from "@/registry/ui/empty-state";

export default function EmptyStateDemo() {
  return (
    <EmptyState
      className="w-full max-w-md"
      icon={FolderPlus}
      title="No projects yet"
      description="Create a project to start adding components and pages."
      action={
        <Button size="sm">
          <Plus /> New project
        </Button>
      }
    />
  );
}
