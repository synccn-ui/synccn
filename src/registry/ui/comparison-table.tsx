import { Fragment } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComparisonPlan {
  name: string;
  price?: string;
  featured?: boolean;
}

export interface ComparisonGroup {
  title: string;
  rows: { feature: string; values: (boolean | string)[] }[];
}

export interface ComparisonTableProps {
  /** Column headers. */
  plans: ComparisonPlan[];
  /** Row groups. true/false render as icons; strings as text. */
  groups: ComparisonGroup[];
  /** Extra classes for the root element. */
  className?: string;
}

/**
 * Feature comparison across plans. Values can be true/false or text.
 * plans: [{ name, price?, featured? }]; groups: [{ title, rows: [{ feature, values: [] }] }]
 */
export function ComparisonTable({ plans, groups, className }: ComparisonTableProps) {
  const cell = (v: boolean | string) =>
    v === true ? (
      <Check className="mx-auto size-4" aria-label="Included" />
    ) : v === false ? (
      <Minus className="mx-auto size-4 text-muted-foreground/50" aria-label="Not included" />
    ) : (
      <span className="text-sm">{v}</span>
    );
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border scrollbar-thin", className)}>
      <table className="w-full min-w-[540px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-[38%] bg-background p-4 text-left align-bottom font-medium text-muted-foreground">
              Features
            </th>
            {plans.map((p) => (
              <th key={p.name} className={cn("p-4 text-center align-bottom", p.featured && "bg-accent/50")}>
                <span className="grid gap-0.5">
                  <span className="font-semibold">{p.name}</span>
                  {p.price && <span className="text-xs font-normal text-muted-foreground">{p.price}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <Fragment key={g.title}>
              <tr>
                <th colSpan={plans.length + 1} className="sticky left-0 border-t bg-muted/40 px-4 py-2 text-left text-xs font-semibold">
                  {g.title}
                </th>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.feature} className="border-t">
                  <td className="sticky left-0 bg-background px-4 py-3">{r.feature}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className={cn("px-4 py-3 text-center", plans[i]?.featured && "bg-accent/50")}>
                      {cell(v)}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
