"use client";

import { useState } from "react";
import { Check, CreditCard, Download, FlaskConical, Receipt, Sparkles } from "lucide-react";
import { AlertDialog } from "@/registry/ui/alert-dialog";
import { Badge } from "@/registry/ui/badge";
import { Button } from "@/registry/ui/button";
import { Dialog } from "@/registry/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/ui/table";
import { toast } from "@/registry/ui/toast";
import { ToggleGroup } from "@/registry/ui/toggle-group";
import { UsageMeter } from "@/registry/ui/usage-meter";
import { cn } from "@/lib/utils";

const PLANS = [
  { id: "starter", name: "Starter", monthly: 0, seats: 2, requests: 100_000, features: ["2 seats", "100k API requests", "Community support"] },
  { id: "pro", name: "Pro", monthly: 12, seats: 10, requests: 1_000_000, features: ["Up to 10 seats", "1M API requests", "Email support"] },
  { id: "team", name: "Team", monthly: 29, seats: 50, requests: 5_000_000, features: ["Up to 50 seats", "5M API requests", "SSO and audit log"] },
];

const INVOICES = [
  { id: "INV-2026-011", date: "Nov 1, 2026", amount: 48, status: "Paid" },
  { id: "INV-2026-010", date: "Oct 1, 2026", amount: 48, status: "Paid" },
  { id: "INV-2026-009", date: "Sep 1, 2026", amount: 36, status: "Paid" },
  { id: "INV-2026-008", date: "Aug 1, 2026", amount: 36, status: "Refunded" },
];

// Made-up cards. The demo never asks for real payment details.
const TEST_CARDS = [
  { id: "visa", brand: "Visa", last4: "4242", exp: "08/28" },
  { id: "mc", brand: "Mastercard", last4: "4444", exp: "11/30" },
  { id: "amex", brand: "Amex", last4: "0005", exp: "03/29" },
];

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export default function BillingBlock() {
  const [plan, setPlan] = useState("pro");
  const [cycle, setCycle] = useState("monthly");
  const [planOpen, setPlanOpen] = useState(false);
  const [draft, setDraft] = useState({ plan: "pro", cycle: "monthly" });
  const [cardOpen, setCardOpen] = useState(false);
  const [card, setCard] = useState(TEST_CARDS[0]);
  const [pick, setPick] = useState(TEST_CARDS[0].id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const seats = 4;
  const current = PLANS.find((p) => p.id === plan) ?? PLANS[1];
  const price = (p: (typeof PLANS)[number], c: string) => (c === "yearly" ? Math.round(p.monthly * 10) : p.monthly);
  const total = price(current, cycle) * seats;

  return (
    <div className="grid w-full max-w-5xl gap-5 rounded-2xl border bg-background p-4 text-left sm:p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            Billing
            <Badge variant="outline">
              <FlaskConical className="size-3" aria-hidden /> Example
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">Sample data. Nothing here charges, saves or sends anything.</p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="grid content-start gap-4 rounded-xl border bg-card p-5" aria-labelledby="bill-plan">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current plan</p>
              <h3 id="bill-plan" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                {current.name}
                {cancelled ? <Badge variant="warning">Ends Dec 1</Badge> : <Badge variant="success" dot>Active</Badge>}
              </h3>
              <p className="text-sm text-muted-foreground">
                {usd(price(current, cycle))} per seat / {cycle === "yearly" ? "year" : "month"} · {seats} seats
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{usd(total)}</p>
              <p className="text-xs text-muted-foreground">{cancelled ? "No further charges" : `Next charge Dec 1`}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => (setDraft({ plan, cycle }), setPlanOpen(true))}>
              <Sparkles /> Change plan
            </Button>
            {cancelled ? (
              <Button size="sm" variant="outline" onClick={() => (setCancelled(false), toast.success("Subscription resumed"))}>
                Resume subscription
              </Button>
            ) : (
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setCancelOpen(true)}>
                Cancel subscription
              </Button>
            )}
          </div>
          <div className="grid gap-3 border-t pt-4">
            <p className="text-sm font-medium">Payment method</p>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <span className="grid h-8 w-12 place-items-center rounded-md bg-muted" aria-hidden>
                <CreditCard className="size-4 text-muted-foreground" />
              </span>
              <div className="grid min-w-0 flex-1">
                <p className="text-sm font-medium">
                  Test {card.brand} ending in {card.last4}
                </p>
                <p className="text-xs text-muted-foreground">Example card · expires {card.exp}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => (setPick(card.id), setCardOpen(true))}>
                Update
              </Button>
            </div>
          </div>
        </section>

        <section className="grid content-start gap-5 rounded-xl border bg-card p-5" aria-labelledby="bill-usage">
          <div className="flex items-baseline justify-between gap-2">
            <h3 id="bill-usage" className="text-sm font-semibold">
              Usage
            </h3>
            <p className="text-xs text-muted-foreground">Nov 1 – Nov 30</p>
          </div>
          <UsageMeter label="Seats" value={seats} limit={current.seats} format={String} />
          <UsageMeter label="API requests" value={842_000} limit={current.requests} hint="Resets Dec 1" action={plan !== "team" ? <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => (setDraft({ plan: "team", cycle }), setPlanOpen(true))}>Upgrade</button> : undefined} />
          <UsageMeter label="Storage" value={12.4} limit={plan === "starter" ? 5 : 50} unit="GB" format={(n) => n.toFixed(1).replace(/\.0$/, "")} />
        </section>
      </div>

      <section className="grid gap-3 rounded-xl border bg-card" aria-labelledby="bill-invoices">
        <div className="flex items-center justify-between gap-2 px-5 pt-4">
          <h3 id="bill-invoices" className="flex items-center gap-2 text-sm font-semibold">
            <Receipt className="size-4 text-muted-foreground" /> Invoices
          </h3>
          <p className="text-xs text-muted-foreground">Sent to billing@example.com</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12 pr-5">
                  <span className="sr-only">Download</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVOICES.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-5 font-mono text-[13px]">{inv.id}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{inv.date}</TableCell>
                  <TableCell>
                    <Badge variant={inv.status === "Paid" ? "success" : "secondary"}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{usd(inv.amount)}</TableCell>
                  <TableCell className="pr-5">
                    <Button variant="ghost" size="icon-sm" aria-label={`Download ${inv.id}`} onClick={() => toast(`Downloading ${inv.id}.pdf`)}>
                      <Download />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        size="lg"
        title="Change plan"
        description="Changes apply now. We'll prorate the difference on your next invoice."
        footer={
          <>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={draft.plan === plan && draft.cycle === cycle}
              onClick={() => {
                setPlan(draft.plan);
                setCycle(draft.cycle);
                setCancelled(false);
                setPlanOpen(false);
                toast.success(`Switched to ${PLANS.find((p) => p.id === draft.plan)?.name}`, { description: draft.cycle === "yearly" ? "Billed yearly" : "Billed monthly" });
              }}
            >
              Confirm change
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <ToggleGroup
            size="sm"
            className="w-fit"
            value={draft.cycle}
            onValueChange={(c) => setDraft((d) => ({ ...d, cycle: c }))}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly · 2 months free" },
            ]}
          />
          <div role="radiogroup" aria-label="Plan" className="grid gap-2 sm:grid-cols-3">
            {PLANS.map((p) => {
              const on = draft.plan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setDraft((d) => ({ ...d, plan: p.id }))}
                  className={cn("grid content-start gap-2 rounded-xl border p-3.5 text-left transition-colors", on ? "border-primary bg-brand-soft/50 ring-1 ring-primary" : "hover:bg-muted/50")}
                >
                  <span className="flex items-center justify-between text-sm font-semibold">
                    {p.name} {p.id === plan && <span className="text-xs font-normal text-muted-foreground">Current</span>}
                  </span>
                  <span className="text-lg font-semibold tabular-nums">
                    {usd(price(p, draft.cycle))}
                    <span className="text-xs font-normal text-muted-foreground"> / seat / {draft.cycle === "yearly" ? "yr" : "mo"}</span>
                  </span>
                  <ul className="grid gap-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Check className="size-3 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </div>
      </Dialog>

      <Dialog
        open={cardOpen}
        onOpenChange={setCardOpen}
        title="Update payment method"
        description="Example only. Pick a test card to see how the change looks."
        footer={
          <>
            <Button variant="outline" onClick={() => setCardOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={pick === card.id}
              onClick={() => {
                const next = TEST_CARDS.find((c) => c.id === pick) ?? TEST_CARDS[0];
                setCard(next);
                setCardOpen(false);
                toast.success("Example card switched", { description: `Test ${next.brand} ending in ${next.last4}` });
              }}
            >
              Use this card
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <div role="radiogroup" aria-label="Test card" className="grid gap-2">
            {TEST_CARDS.map((c) => {
              const on = pick === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPick(c.id)}
                  className={cn("flex items-center gap-3 rounded-lg border border-dashed p-3 text-left transition-colors", on ? "border-primary bg-brand-soft/50" : "hover:bg-muted/50")}
                >
                  <span className="grid h-7 w-10 place-items-center rounded-md bg-muted" aria-hidden>
                    <CreditCard className="size-4 text-muted-foreground" />
                  </span>
                  <span className="grid min-w-0 flex-1">
                    <span className="text-sm font-medium">
                      Test {c.brand} •••• {c.last4}
                    </span>
                    <span className="text-xs text-muted-foreground">Expires {c.exp}</span>
                  </span>
                  <span className={cn("grid size-4 place-items-center rounded-full border", on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40")} aria-hidden>
                    {on && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="flex items-start gap-2 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
            <FlaskConical className="mt-px size-3.5 shrink-0" aria-hidden />
            This is a demo. There's no card field on purpose, so real payment details can't be typed in here. In your app, put your payment provider's card form here.
          </p>
        </div>
      </Dialog>

      <AlertDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel your subscription?"
        description="In this example, you'd keep Pro features until Dec 1. After that the workspace moves to Starter and extra seats lose access."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep plan"
        destructive
        onConfirm={() => {
          setCancelled(true);
          toast("Subscription cancelled", { description: "Access continues until Dec 1" });
        }}
      />
    </div>
  );
}
