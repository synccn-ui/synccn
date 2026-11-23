"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/registry/ui/progress";

export default function ProgressDemo() {
  const [v, setV] = useState(18);
  useEffect(() => {
    const t = setInterval(() => setV((x) => (x >= 100 ? 8 : x + 9)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid w-full max-w-sm gap-6">
      <Progress value={v} label="Uploading assets" />
      <Progress value={72} label="Storage used" size="sm" />
      <Progress indeterminate label="Connecting" />
    </div>
  );
}
