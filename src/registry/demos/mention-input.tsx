"use client";

import { useState } from "react";
import { MentionInput, type MentionPerson } from "@/registry/ui/mention-input";
import { toast } from "@/registry/ui/toast";

const people: MentionPerson[] = [
  { id: "u1", name: "synccn", detail: "Team" },
];

export default function MentionInputDemo() {
  const [text, setText] = useState("Looks good to me. @synccn can you check the empty state on mobile?");
  return (
    <div className="w-full max-w-md pb-40">
      <MentionInput
        people={people}
        value={text}
        onValueChange={setText}
        placeholder="Leave a comment…"
        aria-label="Comment"
        onSubmit={(value, mentioned) => {
          toast.success("Comment posted", { description: mentioned.length ? `Notified ${mentioned.map((p) => p.name).join(", ")}` : value.slice(0, 60) });
          setText("");
        }}
      />
    </div>
  );
}
