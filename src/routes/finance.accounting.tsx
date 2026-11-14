import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, Sparkle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card, selectCls } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { journals, ledgerSummary, money, reconTransactions } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/accounting")({
  head: () => ({
    meta: [
      { title: "Accounting & Reconciliation | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "General ledger overview, transaction reconciliation and journal entry preparation, connected to your existing accounting systems.",
      },
      { property: "og:title", content: "Accounting & Reconciliation | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AccountingPage,
});

const reconPrompts = [
  "Reconcile this month's premium receipts.",
  "Find transactions that do not match the general ledger.",
  "Identify duplicate claims payments.",
  "Explain the difference between the bank balance and ledger balance.",
  "Find unmatched broker commission payments.",
];
const ledgerLinks = [
  "General Ledger",
  "Chart of Accounts",
  "Journal Entries",
  "Trial Balance",
  "Account Balances",
  "Transaction History",
];

function AccountingPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const rows = useMemo(
    () => reconTransactions.filter((t) => !status || t.status === status),
    [status],
  );
  const summary = [
    ["Total Transactions", "1,284"],
    ["Matched Transactions", "1,241"],
    ["Unmatched Transactions", "18"],
    ["Potential Duplicates", "3"],
    ["Requiring Review", "7"],
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Accounting & Reconciliation"
          subtitle="Connected to your existing general ledger and accounting systems. Finance here reconciles and prepares, it does not replace your accounting system."
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>

        <section className={`${card} mt-5 p-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">General Ledger overview</h3>
              <p className="text-[11px] text-muted-foreground">
                From the connected accounting system, October 2026
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ledgerLinks.map((l) => (
                <span
                  key={l}
                  className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-6">
            {ledgerSummary.map((s) => (
              <div key={s.label} className="bg-card p-3.5">
                <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-base font-semibold">{s.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-5">
          {summary.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className={`${card} mt-4 p-4`}>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-3.5" />
            </div>
            <h3 className="text-sm font-semibold">Reconciliation Assistant</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {reconPrompts.map((p) => (
              <Button
                key={p}
                variant="secondary"
                size="sm"
                className="h-auto whitespace-normal py-1.5 text-left font-normal"
                onClick={() => open(p)}
              >
                <Sparkle className="size-3 shrink-0 text-primary" /> {p}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            How Alfie reconciles: retrieve the relevant transactions, identify possible matches,
            explain discrepancies, propose reconciliation entries, present a review screen, then
            request authorization. Alfie never silently posts journal entries or alters reconciled
            records.
          </p>
        </section>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4 pb-3">
            <h3 className="mr-auto text-sm font-semibold">Transaction reconciliation</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
              aria-label="Filter by reconciliation status"
            >
              <option value="">All statuses</option>
              {[
                "Matched",
                "Partially Matched",
                "Unmatched",
                "Potential Duplicate",
                "Requires Review",
                "Reconciled",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <p className="px-4 pb-2 text-[11px] text-muted-foreground">
            Matching bank transactions to ledger entries, premium receipts to invoices, claims
            payments to approved settlements, commissions to payment records, and reinsurance
            recoveries to expected recoverables.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[11px] text-muted-foreground">
                  {[
                    "Transaction",
                    "Source",
                    "Reference",
                    "Date",
                    "Amount",
                    "Matched record",
                    "Variance",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-2.5 font-medium">{t.id}</td>
                    <td className="px-4">{t.source}</td>
                    <td className="px-4">{t.ref}</td>
                    <td className="px-4">{t.date}</td>
                    <td className="px-4">{money(t.amount)}</td>
                    <td className="px-4">{t.matched}</td>
                    <td
                      className={`px-4 ${t.variance !== 0 ? "font-semibold text-destructive" : ""}`}
                    >
                      {t.variance === 0 ? money(0) : money(t.variance)}
                    </td>
                    <td className="px-4">
                      <FinanceStatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4 pb-3">
            <h3 className="mr-auto text-sm font-semibold">Journal entries</h3>
            <Button
              size="sm"
              onClick={() => {
                setShowJournalForm((v) => !v);
                setJournalSaved(false);
              }}
            >
              Prepare journal entry
            </Button>
          </div>
          {showJournalForm ? (
            <div className="border-t border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Journal reference", "JE-2295"],
                  ["Posting date", "Nov 05, 2026"],
                  ["Debit account", "Claims Expense"],
                  ["Credit account", "Claims Payable"],
                  ["Amount", "$0"],
                  ["Currency", "USD"],
                  ["Prepared by", "Jane Doe"],
                  ["Supporting documents", "None attached yet"],
                ].map(([label, val]) => (
                  <label key={label} className="block text-[11px] text-muted-foreground">
                    {label}
                    <input
                      defaultValue={val}
                      className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
                    />
                  </label>
                ))}
                <label className="block text-[11px] text-muted-foreground sm:col-span-2 lg:col-span-4">
                  Description
                  <input
                    placeholder="What this entry records, and why"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
                  />
                </label>
              </div>
              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                Validation: debits must equal credits, accounts must exist in the chart of accounts,
                and the period must be open. Alfie can prepare a suggested entry and explain its
                rationale. Posting needs the appropriate permission and approval.
              </p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => setJournalSaved(true)}>
                  Save as draft for approval
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    open(
                      "Prepare a suggested journal entry for the unreconciled bank receipt TXN-90197 and explain the rationale.",
                    )
                  }
                >
                  Ask Alfie to suggest an entry
                </Button>
              </div>
              {journalSaved ? (
                <p className="mt-2 text-xs text-positive">
                  Draft saved as JE-2295, status Draft. It has not been posted.
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[11px] text-muted-foreground">
                  {[
                    "Reference",
                    "Date",
                    "Description",
                    "Debit",
                    "Credit",
                    "Amount",
                    "Prepared by",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {journals.map((j) => (
                  <tr key={j.ref} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-2.5 font-medium">{j.ref}</td>
                    <td className="px-4">{j.date}</td>
                    <td className="px-4">{j.description}</td>
                    <td className="px-4">{j.debit}</td>
                    <td className="px-4">{j.credit}</td>
                    <td className="px-4">{money(j.amount)}</td>
                    <td className="px-4 text-muted-foreground">{j.preparedBy}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={j.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
