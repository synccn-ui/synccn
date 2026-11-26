import { Badge } from "@/registry/ui/badge";
import { DescriptionList } from "@/registry/ui/status-indicator";

export default function DescriptionListDemo() {
  return (
    <DescriptionList
      className="max-w-lg"
      items={[
        { term: "Customer", detail: "synccn" },
        { term: "Email", detail: "synccn@example.com" },
        { term: "Plan", detail: <Badge variant="secondary">Pro, billed yearly</Badge> },
        { term: "Next invoice", detail: "$115.20 on March 1" },
        { term: "Notes", detail: "Asked for invoices to include the company's tax ID from the next billing cycle." },
      ]}
    />
  );
}
