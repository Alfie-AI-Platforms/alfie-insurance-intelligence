import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Eye, FileBarChart, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinanceHeader, SampleDataNote, card, selectCls } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { financeReports, lines } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/reports")({
  head: () => ({
    meta: [
      { title: "Financial Reports | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Build, preview and export financial reports through Alfie, with comparisons, variance analysis and sources.",
      },
      { property: "og:title", content: "Financial Reports | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReportsPage,
});

const reportTypes = [
  "Monthly Financial Performance",
  "Quarterly Financial Performance",
  "Annual Financial Statements",
  "Premium Revenue Report",
  "Claims Payment Report",
  "Broker Commission Report",
  "Reinsurance Recoverables Report",
  "Accounts Receivable Aging",
  "Accounts Payable Summary",
  "Cash Flow Report",
  "Expense Analysis",
  "Profitability by Line of Business",
  "Financial Reconciliation Report",
];

function ReportsPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<string>("Monthly Financial Performance");
  const [period, setPeriod] = useState("Oct 2026");
  const [line, setLine] = useState("All lines");
  const [preview, setPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Financial Reports"
          subtitle="Generate meaningful financial summaries through Alfie, professionally formatted for management and finance teams."
        />
        <div className="mt-4">
          <SampleDataNote>
            Reporting frameworks are configurable, including IFRS 17 and local accounting standards.
            No single framework is assumed for every organization or jurisdiction.
          </SampleDataNote>
        </div>

        <section className={`${card} mt-5 p-5`}>
          <h3 className="text-sm font-semibold">Report builder</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-[11px] text-muted-foreground">
              Report type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
              >
                {reportTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Reporting period
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
              >
                {["Oct 2026", "Q3 2026", "2026 YTD", "2025 Annual"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Financial entity
              <select
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
                defaultValue="Northstar Mutual"
              >
                <option>Northstar Mutual</option>
                <option>Consolidated group</option>
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Currency
              <select
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
                defaultValue="USD"
              >
                <option>USD</option>
                <option>CAD</option>
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Line of business
              <select
                value={line}
                onChange={(e) => setLine(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
              >
                <option>All lines</option>
                {lines.map((l) => (
                  <option key={l.line}>{l.line}</option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Products
              <select className={`${selectCls} mt-1 h-9 w-full`} defaultValue="All products">
                <option>All products</option>
                <option>Core products</option>
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Regions
              <select className={`${selectCls} mt-1 h-9 w-full`} defaultValue="All regions">
                <option>All regions</option>
                <option>Ontario</option>
                <option>National</option>
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Data sources
              <select
                className={`${selectCls} mt-1 h-9 w-full`}
                defaultValue="All connected sources"
              >
                <option>All connected sources</option>
                <option>General Ledger only</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setPreview(type)}>
              <Eye className="size-4" /> Preview report
            </Button>
            <Button variant="outline" onClick={() => setSaved(true)}>
              <Save className="size-4" /> Save draft
            </Button>
            <Button
              variant="outline"
              onClick={() => open(`Prepare our ${type.toLowerCase()} report for ${period}.`)}
            >
              <FileBarChart className="size-4" /> Prepare with Alfie
            </Button>
          </div>
          {saved ? (
            <p className="mt-2 text-xs text-positive">
              Draft saved: {type}, {period}, {line}. Status is Draft until it goes through Finance
              Review.
            </p>
          ) : null}
        </section>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="p-4 pb-3">
            <h3 className="text-sm font-semibold">Available reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[11px] text-muted-foreground">
                  {["Report", "Type", "Period", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {financeReports.map((r) => (
                  <tr key={r.name} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-2.5 font-medium">{r.name}</td>
                    <td className="px-4">{r.type}</td>
                    <td className="px-4">{r.period}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={r.status} />
                    </td>
                    <td className="px-4">
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setPreview(r.name)}>
                          Preview
                        </Button>
                        <Button variant="ghost" size="sm" aria-label={`Export ${r.name} as PDF`}>
                          <Download className="size-3.5" /> PDF
                        </Button>
                        <Button variant="ghost" size="sm" aria-label={`Export ${r.name} as Excel`}>
                          Excel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border p-4 text-[11px] leading-5 text-muted-foreground">
            Every report carries an executive summary, financial tables, charts, period comparisons,
            variance analysis, key findings, supporting notes, data sources, and assumptions and
            limitations. Exports are PDF and Excel. Request Review sends a draft through Finance
            Review before it is final.
          </p>
        </section>
      </div>

      <Dialog
        open={!!preview}
        onOpenChange={(o) => {
          if (!o) setPreview(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview}</DialogTitle>
            <DialogDescription>
              Preview, {period}, Northstar Mutual. Illustrative sample data.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] space-y-4 overflow-y-auto text-sm leading-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide">Executive summary</h4>
              <p className="mt-1 text-muted-foreground">
                Gross Written Premium is $48.6M year to date, up 6.4%. Claims paid rose 9.1% to
                $21.8M, ahead of premium growth, while the net underwriting result improved to $6.4M
                on Liability line performance.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide">Key figures</h4>
              <table className="mt-2 w-full text-xs">
                <tbody>
                  {[
                    ["Gross Written Premium", "$48.6M", "+6.4%"],
                    ["Claims Paid", "$21.8M", "+9.1%"],
                    ["Operating Expenses", "$8.7M", "+3.8%"],
                    ["Net Underwriting Result", "$6.4M", "+$0.9M"],
                  ].map((row) => (
                    <tr key={row[0]} className="border-t border-border">
                      {row.map((c, i) => (
                        <td key={i} className={`py-2 ${i === 0 ? "font-medium" : "text-right"}`}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide">
                Variance analysis and key findings
              </h4>
              <p className="mt-1 text-muted-foreground">
                Claims severity in Commercial Property and a $600 payment discrepancy on CL-45821
                are the main items for Finance Review. Receivables overdue stand at $612K.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide">
                Data sources, assumptions and limitations
              </h4>
              <p className="mt-1 text-muted-foreground">
                General Ledger, Policy Administration, Claims, Billing and Bank feeds. Broker
                Commission System last synced 2 hours ago. Figures are illustrative until connected
                systems are verified.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreview(null)}>
              Close
            </Button>
            <Button variant="outline">
              <Download className="size-4" /> Export PDF
            </Button>
            <Button onClick={() => setPreview(null)}>Request Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
