import { Home } from "lucide-react";
import { Breadcrumb } from "@/registry/ui/breadcrumb";

export default function BreadcrumbDemo() {
  return (
    <div className="grid gap-5">
      <Breadcrumb items={[{ label: "Home", icon: Home }, { label: "Components" }, { label: "Navigation" }, { label: "Breadcrumb" }]} />
      <Breadcrumb separator="slash" items={[{ label: "projects" }, { label: "web-app" }, { label: "settings" }]} />
    </div>
  );
}
