import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card, selectCls } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { claimPayments, money, type ClaimPayment } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/claims-payments")({
  head: () => ({
    meta: [
      { title: "Claims Payments | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Manage claims payment, settlement, accounting and reconciliation in Finance, connected to the Claims workspace.",
      },
      { property: "og:title", content: "Claims Payments | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ClaimsPaymentsPage,
});

function ClaimsPaymentsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<ClaimPayment | null>(null);
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const rows = useMemo(() => claimPayments.filter((p) => !status || p.status === status), [status]);
  const summary = [
    ["Total Claims Paid", "$21.8M"],
    ["Pending Payments", "$1.8M"],
    ["Awaiting Approval", "6 payments"],
    ["Failed Payments", "1 payment"],
    ["Outstanding Settlements", "$231K"],
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Claims Payments"
          subtitle="Finance handles payment, settlement, accounting and reconciliation. Claims handles investigation and decisions. The two workspaces stay connected, with separate responsibilities."
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-5">
          {summary.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-panel p-3 text-xs leading-5">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Payment execution is permission controlled and needs the configured approvals. Alfie can
            prepare payment batches, flag amounts that differ from approved settlements and identify
            duplicate payment risks. Alfie never changes an approved settlement amount, and never
            pays an unapproved claim because a user asked in conversation.
          </p>
        </div>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4 pb-3">
            <h3 className="mr-auto text-sm font-semibold">Claims payments and settlements</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
              aria-label="Filter by payment status"
            >
              <option value="">All statuses</option>
              {[
                "Awaiting Authorization",
                "Approved for Payment",
                "Processing",
                "Paid",
                "Failed",
                "On Hold",
                "Reconciled",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => open("Prepare a payment reconciliation summary for claims payments.")}
            >
              Prepare reconciliation summary
            </Button>
            <Button
              size="sm"
              onClick={() =>
                open(
                  "Prepare a claims payment batch for the payments that are approved for payment.",
                )
              }
            >
              Prepare payment batch
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[13px] text-muted-foreground">
                  {[
                    "Claim",
                    "Claimant",
                    "Policy",
                    "Type",
                    "Approved settlement",
                    "Payment amount",
                    "Method",
                    "Date",
                    "Status",
                    "Officer",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.claim}
                    onClick={() => setSelected(p)}
                    className={`cursor-pointer border-t border-border hover:bg-secondary/50 ${selected?.claim === p.claim ? "bg-secondary/60" : ""}`}
                  >
                    <td className="px-4 py-2.5 font-medium">{p.claim}</td>
                    <td className="px-4">{p.claimant}</td>
                    <td className="px-4">{p.policy}</td>
                    <td className="px-4">{p.type}</td>
                    <td className="px-4">{money(p.approved)}</td>
                    <td
                      className={`px-4 ${p.amount !== p.approved ? "font-semibold text-destructive" : ""}`}
                    >
                      {money(p.amount)}
                    </td>
                    <td className="px-4">{p.method}</td>
                    <td className="px-4">{p.date}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={p.status} />
                    </td>
                    <td className="px-4 text-muted-foreground">{p.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {selected ? (
          <section className={`${card} mt-4 p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Payment workspace, {selected.claim}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.claimant}, {selected.type}, policy {selected.policy}
                </p>
              </div>
              <FinanceStatusBadge status={selected.status} />
            </div>
            {selected.amount !== selected.approved ? (
              <p className="mt-3 rounded-lg border border-border bg-panel p-3 text-xs leading-5">
                Alfie flag: the payment amount of {money(selected.amount)} differs from the approved
                settlement of {money(selected.approved)} by{" "}
                {money(selected.approved - selected.amount)}. This payment is on hold until Finance
                reviews the discrepancy against the Claims record. The approved amount has not been
                changed.
              </p>
            ) : null}
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                [
                  "Claim information",
                  [
                    ["Claim", selected.claim],
                    ["Claimant", selected.claimant],
                    ["Policy", selected.policy],
                    ["Type", selected.type],
                  ],
                ],
                [
                  "Payment",
                  [
                    ["Approved settlement", money(selected.approved)],
                    ["Payment amount", money(selected.amount)],
                    ["Method", selected.method],
                    ["Payment date", selected.date],
                    ["Beneficiary", selected.claimant],
                    ["Assigned officer", selected.officer],
                  ],
                ],
                [
                  "Approvals and ledger",
                  [
                    [
                      "Approval record",
                      selected.status === "Awaiting Authorization"
                        ? "Awaiting Finance Manager authorization"
                        : "Approved in Claims, settlement locked",
                    ],
                    ["Ledger entries", "Claims payable and cash entries prepared in Accounting"],
                    [
                      "Reconciliation status",
                      selected.status === "Reconciled"
                        ? "Reconciled with bank entry"
                        : "Not yet reconciled",
                    ],
                    ["Payment history", "See the Claims workspace for investigation history"],
                  ],
                ],
              ].map(([title, pairs]) => (
                <div key={title as string} className="rounded-xl border border-border p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wide">
                    {title as string}
                  </h4>
                  <dl className="mt-3 space-y-2 text-xs">
                    {(pairs as string[][]).map(([k, v]) => (
                      <div key={k} className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="text-right font-medium">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => open(`Explain the payment history for claim ${selected.claim}.`)}
              >
                Explain payment history with Alfie
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  open(
                    `Identify discrepancies and duplicate payment risks for claim ${selected.claim}.`,
                  )
                }
              >
                Check for discrepancies
              </Button>
            </div>
          </section>
        ) : (
          <p className="mt-3 text-[13px] text-muted-foreground">
            Select a payment row to open its payment workspace, with claim information, approvals,
            ledger entries and reconciliation status.
          </p>
        )}
      </div>
    </AppShell>
  );
}
