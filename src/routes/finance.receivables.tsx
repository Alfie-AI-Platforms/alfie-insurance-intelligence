import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Bot, Search, Sparkle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card, selectCls } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { aging, collectionActivity, money, receivables } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/receivables")({
  head: () => ({
    meta: [
      { title: "Premium & Receivables | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Track premium owed, received and overdue, and investigate collections with Alfie.",
      },
      { property: "og:title", content: "Premium & Receivables | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReceivablesPage,
});

const tip = {
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    fontSize: 12,
    color: "var(--popover-foreground)",
  },
};
const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;
const alfieActions = [
  "Find overdue premium invoices.",
  "Identify policyholders with repeated late payments.",
  "Reconcile premium payments against invoices.",
  "Prepare payment reminders.",
  "Summarize outstanding receivables.",
  "Identify possible duplicate payments.",
];

function ReceivablesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [line, setLine] = useState("");
  const [officer, setOfficer] = useState("");
  const [search, setSearch] = useState("");
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const rows = useMemo(
    () =>
      receivables.filter(
        (r) =>
          (!status || r.status === status) &&
          (!line || r.line === line) &&
          (!officer || r.officer === officer) &&
          (!search ||
            `${r.holder} ${r.policy} ${r.invoice}`.toLowerCase().includes(search.toLowerCase())),
      ),
    [status, line, officer, search],
  );
  const totalOutstanding = receivables.reduce((sum, r) => sum + (r.amount - r.paidAmount), 0);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Premium & Receivables"
          subtitle="Visibility into the money the insurer is owed, the money it has received, and the balances still outstanding on policies."
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-5">
          {aging.map((a) => (
            <div key={a.bucket} className="bg-card p-4">
              <p className="text-[13px] font-medium text-muted-foreground">{a.bucket}</p>
              <p className="mt-1.5 text-xl font-semibold">{money(a.amount)}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Total outstanding in this sample: {money(totalOutstanding)} across the invoices below.
          Full portfolio total is $4.2M.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <section className={`${card} p-4`}>
            <h3 className="text-sm font-semibold">Receivables aging</h3>
            <p className="text-[13px] text-muted-foreground">Outstanding balance by age, $</p>
            <div className="mt-3 h-48">
              <ResponsiveContainer>
                <BarChart
                  data={aging.map((a) => ({
                    name: a.bucket.replace(" overdue", ""),
                    amount: a.amount,
                  }))}
                  layout="vertical"
                  margin={{ left: 10 }}
                >
                  <XAxis type="number" {...axis} />
                  <YAxis type="category" dataKey="name" {...axis} width={110} />
                  <Tooltip {...tip} formatter={(v) => [money(Number(v)), "Outstanding"]} />
                  <Bar dataKey="amount" fill="var(--primary)" radius={4} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className={`${card} p-4`}>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-3.5" />
              </div>
              <h3 className="text-sm font-semibold">Ask Alfie</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {alfieActions.map((a) => (
                <Button
                  key={a}
                  variant="secondary"
                  size="sm"
                  className="h-auto whitespace-normal py-1.5 text-left font-normal"
                  onClick={() => open(a)}
                >
                  <Sparkle className="size-3 shrink-0 text-primary" /> {a}
                </Button>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-5 text-muted-foreground">
              Alfie can prepare reminders and payment instructions. Sending external communications
              and taking payment follow the configured permissions and approvals.
            </p>
          </section>
        </div>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4 pb-3">
            <h3 className="mr-auto text-sm font-semibold">Premium receivables</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search holder, policy, invoice"
                className="h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-ring"
                aria-label="Search receivables"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={selectCls}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {["Paid", "Partially Paid", "Outstanding", "Overdue", "Disputed", "Written Off"].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
            <select
              value={line}
              onChange={(e) => setLine(e.target.value)}
              className={selectCls}
              aria-label="Filter by line of business"
            >
              <option value="">All lines</option>
              {[...new Set(receivables.map((r) => r.line))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={officer}
              onChange={(e) => setOfficer(e.target.value)}
              className={selectCls}
              aria-label="Filter by finance officer"
            >
              <option value="">All officers</option>
              {[...new Set(receivables.map((r) => r.officer))].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[13px] text-muted-foreground">
                  {[
                    "Policy",
                    "Policyholder",
                    "Line",
                    "Invoice",
                    "Amount",
                    "Paid",
                    "Outstanding",
                    "Due date",
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
                {rows.map((r) => (
                  <tr key={r.invoice} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-2.5 font-medium">{r.policy}</td>
                    <td className="px-4">{r.holder}</td>
                    <td className="px-4">{r.line}</td>
                    <td className="px-4">{r.invoice}</td>
                    <td className="px-4">{money(r.amount)}</td>
                    <td className="px-4">{money(r.paidAmount)}</td>
                    <td className="px-4 font-medium">{money(r.amount - r.paidAmount)}</td>
                    <td className="px-4">{r.due}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 text-muted-foreground">{r.officer}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No receivables match those filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${card} mt-4 p-4`}>
          <h3 className="text-sm font-semibold">Premium collection activity</h3>
          <div className="mt-3 divide-y divide-border">
            {collectionActivity.map((a) => (
              <button
                key={a.label + a.detail}
                onClick={() =>
                  open(`Investigate this collection activity: ${a.label}, ${a.detail}`)
                }
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-secondary/40"
              >
                <span>
                  <span className="block text-xs font-medium">{a.label}</span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">{a.detail}</span>
                </span>
                <span className="shrink-0 text-[13px] text-muted-foreground">{a.time}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
