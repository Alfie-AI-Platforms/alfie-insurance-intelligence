import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Download, Eye, Mail, MapPin } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import { DocumentSheet } from "@/components/document-view";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  activeSeats,
  invoiceSections,
  invoiceSummary,
  invoices,
  licensedSeats,
  moduleMonthly,
  moduleSeats,
  modulesMonthlyTotal,
  monthlyTotal,
  paymentMethod,
  plan,
  usageThisPeriod,
  type Invoice,
} from "@/lib/billing-data";

export const Route = createFileRoute("/billing")({ component: BillingPage });

const card = "rounded-2xl border border-border bg-card p-5";
const money = (n: number) => `$${n.toLocaleString()}`;

function InvoiceStatus({ status }: { status: Invoice["status"] }) {
  return status === "Paid" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-positive/10 px-2 py-0.5 text-[12px] font-semibold text-positive">
      <span className="size-1.5 rounded-full bg-positive" /> Paid
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[12px] font-semibold text-warning">
      <span className="size-1.5 rounded-full bg-warning" /> Scheduled
    </span>
  );
}

function BillingPage() {
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const downloadInvoice = (inv: Invoice) => {
    const text = `${inv.id}\n${invoiceSummary(inv)}\n\n${invoiceSections(inv)
      .map((s) => `${s.heading}\n${s.body}`)
      .join("\n\n")}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const requestUpdate = (what: string) => {
    setNotice(
      `${what} is updated through a secure link, never by typing card or contact details into the workspace. A link was sent to ${paymentMethod.contactEmail} and the request was written to the audit log.`,
    );
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader
          title="Billing"
          description="The organization's Alfie subscription: plan, module seats, usage, payment method and invoices. This is platform billing for Alfie itself. Policyholder premium billing lives in Finance."
        />
        <p className="mt-3 rounded-xl bg-secondary/60 px-4 py-2.5 text-[13px] leading-5 text-muted-foreground">
          Sample billing records, shown until your payment provider is connected. Every figure
          follows the module pricing on this page, and plan or payment changes are recorded in the
          audit log.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Current plan", plan.name, `${plan.term}. Plan year ${plan.planYear}, renews ${plan.renews}.`],
            ["Monthly total", money(monthlyTotal), `Platform ${money(plan.platformFeeMonthly)} plus module seats ${money(modulesMonthlyTotal)}.`],
            ["Next invoice", plan.nextInvoiceDate, `Estimated ${money(plan.nextInvoiceEstimate)} for the December 2026 period.`],
            ["Module seats", `${activeSeats} active`, `Of ${licensedSeats} licensed seats across five priced modules. Reports is bundled.`],
          ].map(([label, value, detail]) => (
            <section key={label} className={card}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{detail}</p>
            </section>
          ))}
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <section className={card}>
              <h2 className="text-sm font-semibold">Plan and module seats</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{plan.platformFeeNote}. Seat changes take effect at the next billing cycle.</p>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Module</th>
                    <th className="py-2 pr-3 font-medium">Per user / month</th>
                    <th className="py-2 pr-3 font-medium">Seats</th>
                    <th className="py-2 text-right font-medium">Monthly</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/60">
                    <td className="py-2.5 pr-3 font-medium">Platform fee</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">Flat</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">Organization</td>
                    <td className="py-2.5 text-right tabular-nums">{money(plan.platformFeeMonthly)}</td>
                  </tr>
                  {moduleSeats.map((m) => (
                    <tr key={m.module} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pr-3 font-medium">{m.module}</td>
                      <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">
                        {m.pricePerSeat === null ? "Bundled" : money(m.pricePerSeat)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">
                        {m.pricePerSeat === null ? `${m.active} users` : `${m.active} of ${m.licensed}`}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {m.pricePerSeat === null ? "$0" : money(moduleMonthly(m))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-semibold" colSpan={3}>Total per month</td>
                    <td className="pt-3 text-right font-semibold tabular-nums">{money(monthlyTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">Usage this period</h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">November 2026, to Nov 15. Usage never changes a seat price mid-cycle; overages appear on the next invoice and are itemized there.</p>
              <ul className="mt-3 space-y-4">
                {usageThisPeriod.map((u) => (
                  <li key={u.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-medium">{u.label}</p>
                      <p className="text-sm font-semibold tabular-nums">{u.used}</p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${u.pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{u.detail}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-4">
            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="size-4 text-muted-foreground" /> Payment method
              </h2>
              <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-4">
                <p className="text-sm font-semibold">{paymentMethod.brand} ending {paymentMethod.last4}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {paymentMethod.holder} · Expires {paymentMethod.expiry}
                </p>
              </div>
              <dl className="mt-3 space-y-1.5 text-[13px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Billing contact</dt>
                  <dd className="text-right font-medium">{paymentMethod.contactName}, {paymentMethod.contactRole}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-center gap-1 text-muted-foreground"><Mail className="size-3.5" /> Email</dt>
                  <dd className="text-right font-medium">{paymentMethod.contactEmail}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="flex items-start gap-1 text-muted-foreground"><MapPin className="mt-0.5 size-3.5" /> Address</dt>
                  <dd className="text-right font-medium">{paymentMethod.address}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => requestUpdate("The payment method")}>Update payment method</Button>
                <Button size="sm" variant="outline" onClick={() => requestUpdate("The billing contact")}>Update billing contact</Button>
              </div>
              {notice ? (
                <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-[13px] leading-5">{notice}</p>
              ) : null}
              <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
                Your role, Organization Administrator, can manage billing. Card details are held by
                the payment provider, never in Alfie.
              </p>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">How changes work</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-muted-foreground">
                <li>Seat increases apply from the next invoice; decreases apply at plan renewal.</li>
                <li>Adding a module starts a prorated charge on the next invoice, shown as its own line.</li>
                <li>A failed payment pauses automations after 7 days, never access to your records.</li>
                <li>Every billing change is written to the audit log in Settings.</li>
              </ul>
            </section>
          </div>
        </div>

        <section className={`${card} mt-4`}>
          <h2 className="text-sm font-semibold">Invoices</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">View opens the invoice in place. Download keeps a copy outside Alfie.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Invoice</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Period</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 text-right font-medium">Amount</th>
                  <th className="py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{inv.id}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{inv.date}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{inv.period}</td>
                    <td className="py-2.5 pr-3"><InvoiceStatus status={inv.status} /></td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{money(inv.amount)}</td>
                    <td className="py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => setPreview(inv)}>
                          <Eye className="size-3.5" /> View
                        </Button>
                        <Button size="sm" variant="ghost" aria-label={`Download ${inv.id}`} onClick={() => downloadInvoice(inv)}>
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          {preview ? (
            <>
              <DialogHeader>
                <DialogTitle>Invoice {preview.id}</DialogTitle>
                <DialogDescription>
                  {preview.date} · {preview.period} · {money(preview.amount)} · {preview.status}
                </DialogDescription>
              </DialogHeader>
              <DocumentSheet summary={invoiceSummary(preview)} sections={invoiceSections(preview)} />
              <DialogFooter>
                <span className="mr-auto text-[13px] text-muted-foreground">
                  All amounts in USD.
                </span>
                <Button variant="outline" onClick={() => downloadInvoice(preview)}>
                  <Download className="size-4" /> Download
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
