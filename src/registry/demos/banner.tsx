import { Banner } from "@/registry/ui/banner";

export default function BannerDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 overflow-hidden">
      <Banner href="#" className="rounded-lg">
        Version 3.0 is here with 40 new components.
      </Banner>
      <Banner variant="muted" href="#" linkLabel="Read the post" className="rounded-lg border">
        We're changing our pricing on March 1.
      </Banner>
      <Banner variant="gradient" href="#" linkLabel="Save 30%" className="rounded-lg">
        Spring sale ends Friday.
      </Banner>
    </div>
  );
}
