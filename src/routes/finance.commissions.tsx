import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card, selectCls } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { commissionByBroker, commissions, money } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/commissions")({
  head: () => ({
    meta: [
      { title: "Broker Commissions | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Manage broker commissions and distribution payments, calculated from configured contractual rules.",
      },
      { property: "og:title", content: "Broker Commissions | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CommissionsPage,
});

const workflow = [
  "Commission Calculated",
  "Validated",
  "Reviewed",
  "Approved",
  "Payment Processed",
  "Reconciled",
];

function CommissionsPage() {
  const navigate = useNavigate();
  const [broker, setBroker] = useState("");
  const [status, setStatus] = useState("");
  const [batchPrepared, setBatchPrepared] = useState(false);
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const rows = useMemo(
    () =>
      commissions.filter(
        (c) => (!broker || c.broker === broker) && (!status || c.status === status),
      ),
    [broker, status],
  );
  const overview = [
    ["Total Commission Expense", "$5.6M"],
    ["Commission Payable", "$1.1M"],
    ["Commission Paid", "$4.5M"],
    ["Outstanding Commission", "$1.1M"],
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Commissions"
          subtitle="Broker commissions and distribution payments, calculated from the configured contractual arrangements for each broker, not from assumed rates."
        />
        <div className="mt-4">
          <SampleDataNote>
            Rates shown are the configured schedule for this sample data. Alfie does not invent
            commission rates.
          </SampleDataNote>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {overview.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className={`${card} p-4`}>
            <h3 className="text-sm font-semibold">Commission by broker</h3>
            <div className="mt-3 space-y-3">
              {commissionByBroker.map((b) => (
                <button
                  key={b.broker}
                  onClick={() => {
                    setBroker(b.broker);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left hover:bg-secondary/50"
                >
                  <span className="text-xs font-medium">{b.broker}</span>
                  <span className="text-right text-xs">
                    <span className="block font-semibold">{money(b.expense)}</span>
                    <span className="text-muted-foreground">{money(b.payable)} payable</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
          <section className={`${card} p-4`}>
            <h3 className="text-sm font-semibold">Broker payment workflow</h3>
            <ol className="mt-3 space-y-2">
              {workflow.map((step, i) => (
                <li key={step} className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex size-4 items-center justify-center rounded-full ${i < 3 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
                  >
                    {i < 3 ? (
                      <Check className="size-2.5" />
                    ) : (
                      <span className="text-[12px]">{i + 1}</span>
                    )}
                  </span>
                  <span className={i === 3 ? "font-semibold" : ""}>{step}</span>
                  {i === 3 ? (
                    <span className="ml-auto text-[12px] text-primary">Current for this cycle</span>
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setBatchPrepared(true)}>
                Prepare commission payment batch
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  open(
                    "Compare commission expense by broker and identify discrepancies between commission schedules and payments.",
                  )
                }
              >
                Analyze with Alfie
              </Button>
            </div>
            {batchPrepared ? (
              <p className="mt-3 rounded-lg border border-border bg-panel p-3 text-xs leading-5">
                Batch prepared for review:{" "}
                {money(
                  rows
                    .filter((r) => r.status === "Outstanding" || r.status === "Processing")
                    .reduce((s, r) => s + (r.commission - r.paidAmount), 0),
                )}{" "}
                of outstanding commission in the current filter. It is not paid. It moves to
                Reviewed, then Approved, before any payment is processed.
              </p>
            ) : null}
          </section>
        </div>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4 pb-3">
            <h3 className="mr-auto text-sm font-semibold">Commission records</h3>
            <select
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className={selectCls}
              aria-label="Filter by broker"
            >
              <option value="">All brokers</option>
              {[...new Set(commissions.map((c) => c.broker))].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
              aria-label="Filter by payment status"
            >
              <option value="">All statuses</option>
              {["Paid", "Outstanding", "Processing", "Disputed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[13px] text-muted-foreground">
                  {[
                    "Broker",
                    "Policy",
                    "Policyholder",
                    "Premium",
                    "Rate",
                    "Commission",
                    "Paid",
                    "Outstanding",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.policy + c.broker}
                    className="border-t border-border hover:bg-secondary/50"
                  >
                    <td className="px-4 py-2.5 font-medium">{c.broker}</td>
                    <td className="px-4">{c.policy}</td>
                    <td className="px-4">{c.holder}</td>
                    <td className="px-4">{money(c.premium)}</td>
                    <td className="px-4">{c.rate}%</td>
                    <td className="px-4">{money(c.commission)}</td>
                    <td className="px-4">{money(c.paidAmount)}</td>
                    <td className="px-4 font-medium">{money(c.commission - c.paidAmount)}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No commission records match those filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border p-4 text-[13px] leading-5 text-muted-foreground">
            Alfie can find duplicate commission entries and unusual commission movements, and
            prepare payment summaries. A disputed record, such as Summit Construction on WC-77120,
            stays out of payment batches until it is validated.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
