import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileBarChart } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PricingHeader, SampleDataNote, card, selectCls } from "@/components/pricing-nav";
import { lines } from "@/lib/pricing-data";
import {
  pricingReportLibrary,
  scheduledPricingReports,
  type PricingReportItem,
} from "@/lib/pricing-workspaces-data";

export const Route = createFileRoute("/pricing/reports")({
  head: () => ({ meta: [{ title: "Pricing Reports | Alfie Insurance" }] }),
  component: PricingReportsPage,
});

const categories = [
  "All categories",
  "Pricing Performance",
  "Actuarial",
  "Scenario",
  "Pricing Models",
  "Rate Reviews",
];
const workflow = ["Draft", "Generated", "Under Review", "Approved", "Published", "Archived"];

function PricingReportsPage() {
  const [category, setCategory] = useState("All categories");
  const [library, setLibrary] = useState<PricingReportItem[]>(pricingReportLibrary);
  const [gCategory, setGCategory] = useState("Actuarial");
  const [gLine, setGLine] = useState("Commercial Property");
  const [gPeriod, setGPeriod] = useState("Q3 2026");
  const [gMethod, setGMethod] = useState("Chain Ladder");
  const [preview, setPreview] = useState<PricingReportItem | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const filtered = useMemo(
    () => library.filter((r) => category === "All categories" || r.category === category),
    [library, category],
  );
  const line = lines.find((l) => l.line === gLine) ?? lines[0]!;

  function generate() {
    const item: PricingReportItem = {
      id: `PR-${109 + library.length}`,
      name: `${gLine} ${gCategory} Report, ${gPeriod}`,
      category: gCategory,
      period: gPeriod,
      owner: "Jane Doe",
      status: "Draft",
      updated: "Nov 04, 2026",
      parameters: `${gLine}, ${gPeriod}, methodology ${gMethod}, org metric definitions, sources preserved`,
    };
    setLibrary((prev) => [item, ...prev]);
    setPreview(item);
    setNote(
      `Generated ${item.id} as a Draft. Its parameters, period, methodology and sources are preserved with it, so it can be reproduced exactly.`,
    );
  }
  function advance(r: PricingReportItem) {
    const idx = workflow.indexOf(r.status);
    if (idx < 0 || idx >= workflow.length - 1) return;
    const next = workflow[idx + 1]!;
    setLibrary((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
    setNote(
      `${r.id} moved to ${next}. Status changes, reviewers and approval dates are recorded on the report.`,
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <PricingHeader
          title="Pricing Reports"
          subtitle="Technical reporting for the Pricing & Actuarial department: pricing performance, actuarial analysis, scenarios, models and rate reviews. For organization wide business reporting, use the main Reports module instead. These reports reference the workspaces they came from rather than duplicating them."
          actions={
            <Button asChild variant="outline">
              <Link to="/reports">Open main Reports</Link>
            </Button>
          }
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>
        {note ? (
          <p className="mt-3 rounded-xl bg-positive/10 p-3 text-xs font-medium leading-5 text-positive">
            {note}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className={`${card} p-5`}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileBarChart className="size-4" /> Generate a technical report
            </h2>
            <div className="mt-3 space-y-3">
              <label className="block text-[13px] text-muted-foreground">
                Report category
                <select
                  value={gCategory}
                  onChange={(e) => setGCategory(e.target.value)}
                  className="select-chevron mt-1 h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring"
                >
                  {categories.slice(1).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px] text-muted-foreground">
                Portfolio / business line
                <select
                  value={gLine}
                  onChange={(e) => setGLine(e.target.value)}
                  className="select-chevron mt-1 h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring"
                >
                  {lines.map((l) => (
                    <option key={l.line}>{l.line}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px] text-muted-foreground">
                Reporting period
                <select
                  value={gPeriod}
                  onChange={(e) => setGPeriod(e.target.value)}
                  className="select-chevron mt-1 h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring"
                >
                  {[
                    "Q3 2026",
                    "Q2 2026",
                    "Last 12 months",
                    "AY 2021 to 2025",
                    "Forward 12 months",
                  ].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px] text-muted-foreground">
                Methodology (where applicable)
                <select
                  value={gMethod}
                  onChange={(e) => setGMethod(e.target.value)}
                  className="select-chevron mt-1 h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring"
                >
                  {[
                    "Chain Ladder",
                    "Bornhuetter-Ferguson",
                    "Expected Loss Ratio",
                    "Scenario engine",
                    "Model validation suite",
                  ].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button className="mt-4 w-full" onClick={generate}>
              Generate report
            </Button>
            <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
              Technical reports follow a fixed structure: executive summary, purpose and scope, data
              sources, methodology, assumptions, calculations, results, comparisons, limitations,
              findings and recommendations. Alfie's narrative is labelled as AI commentary and kept
              separate from verified calculations and approved conclusions.
            </p>
            <div className="mt-4 border-t border-border pt-4">
              <h3 className="text-xs font-semibold">Scheduled pricing reports</h3>
              <ul className="mt-2 space-y-2">
                {scheduledPricingReports.map((s) => (
                  <li key={s.name} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-muted-foreground">
                      {s.schedule} · {s.status}
                    </p>
                    <p className="text-muted-foreground">Last run: {s.lastRun}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={`${card} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Pricing report library</h2>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectCls}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Report</th>
                    <th className="py-2 pr-3 font-medium">Period</th>
                    <th className="py-2 pr-3 font-medium">Owner</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/60 last:border-0 align-top hover:bg-secondary/40"
                    >
                      <td className="py-2.5 pr-3">
                        <span className="block font-medium">{r.name}</span>
                        <span className="text-muted-foreground">
                          {r.id} · {r.category} · Updated {r.updated}
                        </span>
                        <span className="block text-muted-foreground">{r.parameters}</span>
                      </td>
                      <td className="py-2.5 pr-3">{r.period}</td>
                      <td className="py-2.5 pr-3">{r.owner}</td>
                      <td className="py-2.5 pr-3">{r.status}</td>
                      <td className="py-2.5">
                        <span className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" onClick={() => setPreview(r)}>
                            Open
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={workflow.indexOf(r.status) >= workflow.length - 1}
                            onClick={() => advance(r)}
                          >
                            Advance
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setNote(
                                `${r.name} exported. Exports keep the period, parameters, sources and definitions, follow the report's access rules, and are written to the audit history.`,
                              )
                            }
                          >
                            <Download className="size-3.5" />
                          </Button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
              Review workflow: Draft, Generated, Under Review, Changes Requested, Approved,
              Published, Archived. Confidential and restricted reports follow the organization's
              distribution rules, and scheduled reports log every run and delivery.
            </p>
          </section>
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>
              {preview?.id} · {preview?.category} · {preview?.period} · Status {preview?.status} ·
              Owner {preview?.owner}
            </DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1 text-xs leading-5">
              <div>
                <p className="font-semibold">Executive summary</p>
                <p className="text-muted-foreground">
                  {line.line} wrote ${line.premium.toFixed(1)}M with a loss ratio of{" "}
                  {line.lossRatio}% and a combined ratio of {line.combinedRatio}%, against the 60%
                  target loss ratio. Severity is moving faster than frequency (
                  {line.sevChange >= 0 ? "+" : ""}
                  {line.sevChange}% vs {line.freqChange >= 0 ? "+" : ""}
                  {line.freqChange}%).
                </p>
              </div>
              <div>
                <p className="font-semibold">Purpose, scope and data sources</p>
                <p className="text-muted-foreground">
                  Parameters preserved with this report: {preview.parameters}. Sources: Policy
                  Administration System, Claims Management System, Actuarial Data Warehouse.
                  Building age data is 82% complete and flagged where it limits segment conclusions.
                </p>
              </div>
              <div>
                <p className="font-semibold">Methodology and assumptions</p>
                <p className="text-muted-foreground">
                  {gMethod === "Chain Ladder" || preview.category === "Actuarial"
                    ? "Development calculated from the AY 2021 to 2025 triangles in Actuarial Analysis, with Bornhuetter-Ferguson blending for immature years."
                    : "Calculated with the workspace's own engine and assumptions, referenced rather than restated."}{" "}
                  Assumptions are the current approved versions in the assumptions register.
                </p>
              </div>
              <div>
                <p className="font-semibold">Limitations</p>
                <p className="text-muted-foreground">
                  Sample data until systems are connected. AY 2025 is immature. Figures are
                  preliminary until the relevant review and sign-off steps complete.
                </p>
              </div>
              <div className="rounded-xl bg-secondary/60 p-3">
                <p className="font-semibold">
                  Alfie commentary (AI generated, not an approved conclusion)
                </p>
                <p className="text-muted-foreground">
                  The pattern to watch is severity concentration in older Commercial Property risks.
                  That is an observed pattern in the data; whether it justifies a rate change is a
                  decision for the Rate Review workflow, supported by Actuarial Analysis and
                  Scenario Modeling.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setNote(`${preview.name} exported to PDF with its full technical structure.`)
                  }
                >
                  <Download className="size-3.5" /> PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNote(`${preview.name} exported to Excel.`)}
                >
                  <Download className="size-3.5" /> Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNote(`${preview.name} exported to CSV.`)}
                >
                  <Download className="size-3.5" /> CSV
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
