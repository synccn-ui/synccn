import { ProfileCard } from "@/registry/ui/cards";

export default function ProfileCardDemo() {
  return (
    <ProfileCard
      name="Michael"
      handle="@michael"
      role="Design engineer"
      location="Los Angeles"
      bio="Builds component libraries and the docs that explain them."
      stats={[
        { label: "Followers", value: 2480 },
        { label: "Following", value: 312 },
        { label: "Projects", value: 26 },
      ]}
    />
  );
}
