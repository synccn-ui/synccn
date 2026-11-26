"use client";

import { useState } from "react";
import { ToolCall, type ToolCallStatus } from "@/registry/ui/tool-call";

export default function ToolCallDemo() {
  const [refund, setRefund] = useState<ToolCallStatus>("approval");
  const approve = () => {
    setRefund("running");
    setTimeout(() => setRefund("success"), 1400);
  };
  return (
    <div className="grid w-full max-w-lg gap-2">
      <ToolCall name="search_orders" description="Find orders for a customer" status="success" duration={312} input={{ email: "synccn@example.com", limit: 5 }} output={[{ id: "ord_8812", total: 129, status: "delivered" }]} defaultOpen />
      <ToolCall name="issue_refund" description="Refund an order to the original card" status={refund} duration={1380} input={{ order: "ord_8812", amount: 129, reason: "damaged" }} output={{ refund: "re_3k21", status: "pending" }} onApprove={approve} onDeny={() => setRefund("error")} error="Denied by you. Nothing was refunded." />
      <ToolCall name="send_email" description="Tell the customer" status={refund === "success" ? "running" : "pending"} />
    </div>
  );
}
