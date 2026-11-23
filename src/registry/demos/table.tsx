import { Badge, type BadgeVariant } from "@/registry/ui/badge";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/registry/ui/table";

const invoices = [
  { id: "INV-1042", client: "Michael", status: "Paid", amount: 1250 },
  { id: "INV-1043", client: "Riley", status: "Pending", amount: 820 },
  { id: "INV-1044", client: "Jayden", status: "Paid", amount: 2400 },
  { id: "INV-1045", client: "Michael", status: "Overdue", amount: 460 },
];
const tone: Record<string, BadgeVariant> = { Paid: "success", Pending: "warning", Overdue: "destructive" };
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function TableDemo() {
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((i) => (
            <TableRow key={i.id}>
              <TableCell className="font-medium">{i.id}</TableCell>
              <TableCell>{i.client}</TableCell>
              <TableCell>
                <Badge variant={tone[i.status]} dot>
                  {i.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{usd(i.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right tabular-nums">{usd(invoices.reduce((a, i) => a + i.amount, 0))}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
