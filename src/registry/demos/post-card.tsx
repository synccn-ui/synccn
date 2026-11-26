import { PostCard } from "@/registry/ui/cards";

export default function PostCardDemo() {
  return (
    <PostCard
      name="synccn"
      handle="@synccn"
      time="3h"
      likes={1284}
      reposts={96}
      replies={41}
      media={<div className="aspect-[16/8] bg-[radial-gradient(circle_at_25%_30%,oklch(0.6_0.15_260),oklch(0.25_0.05_280))]" />}
    >
      Just shipped dark mode for our dashboard using one set of CSS variables. Took an afternoon, not a sprint.
    </PostCard>
  );
}
