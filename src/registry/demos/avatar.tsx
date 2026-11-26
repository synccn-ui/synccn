import { Avatar, AvatarGroup, type AvatarStatus } from "@/registry/ui/avatar";

const team: { name: string; status?: AvatarStatus }[] = [
  { name: "synccn", status: "online" },
  { name: "synccn" },
  { name: "synccn" },
];

export default function AvatarDemo() {
  return (
    <div className="grid justify-items-center gap-6">
      <div className="flex items-end gap-4">
        <Avatar name="synccn" size="lg" status="online" />
        <Avatar name="synccn" size="md" status="away" />
        <Avatar name="synccn" size="sm" status="busy" />
      </div>
      <AvatarGroup people={team} max={4} size="md" />
    </div>
  );
}
