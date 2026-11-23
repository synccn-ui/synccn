"use client";

import { useState } from "react";
import { Rating } from "@/registry/ui/rating";

const labels = ["Not rated", "Poor", "Fair", "Good", "Very good", "Excellent"];

export default function RatingDemo() {
  const [v, setV] = useState(4);
  return (
    <div className="grid justify-items-center gap-4">
      <Rating value={v} onValueChange={setV} size={26} />
      <p className="text-sm text-muted-foreground">{labels[v]}</p>
      <Rating defaultValue={3} readOnly size={16} />
    </div>
  );
}
