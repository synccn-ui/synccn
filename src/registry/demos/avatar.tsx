import { Avatar, AvatarGroup, type AvatarStatus } from "@/registry/ui/avatar";

const team: { name: string; status?: AvatarStatus }[] = [
  { name: "Michael", status: "online" },
  { name: "Riley" },
  { name: "Jayden" },
];

export default function AvatarDemo() {
  return (
    <div className="grid justify-items-center gap-6">
      <div className="flex items-end gap-4">
        <Avatar name="Michael" size="lg" status="online" />
        <Avatar name="Riley" size="md" status="away" />
        <Avatar name="Jayden" size="sm" status="busy" />
      </div>
      <AvatarGroup people={team} max={4} size="md" />
    </div>
  );
}
