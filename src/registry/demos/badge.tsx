import { Badge } from "@/registry/ui/badge";

export default function BadgeDemo() {
  return (
    <div className="flex max-w-sm flex-wrap justify-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="success" dot>
        Deployed
      </Badge>
      <Badge variant="warning" dot>
        Building
      </Badge>
      <Badge variant="destructive" dot>
        Failed
      </Badge>
    </div>
  );
}
