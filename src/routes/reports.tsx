import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bot,
  CalendarClock,
  CheckCircle2,
  Copy,
  Download,
  FileBarChart,
  Plus,
  Search,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import { lines, moneyM } from "@/lib/finance-data";
import {
  executiveTargets,
  lossTrend,
  reportAudit,
  reportCategories,
  reportKpis,
  reportLibrary,
  scheduledReports,
  type LibraryReport,
} from "@/lib/reports-data";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring";
const selectCls =
  "h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring";

const askReplies: { match: string[]; agents: string; answer: string; sources: string }[] = [
  {
    match: ["loss ratio"],
    agents: "Pricing Analysis Agent",
    answer:
      "The loss ratio last quarter was 63.1%, up 2.4 points. Commercial Property is the driver at 64.1% on earned premium, with water damage frequency behind most of the movement. Auto sits at 69.6% and is the highest line. These figures come from the actuarial warehouse, refreshed 41 minutes ago.",
    sources: "Actuarial Data Warehouse · RPT-306 Loss Ratio by Business Line",
  },
  {
    match: ["most premium", "generated the most"],
    agents: "Policy Review Agent",
    answer:
      "Commercial Property generated the most premium this year at $13.8M of the $48.6M gross written premium, followed by Auto at $11.6M. That is premium volume, not profitability: Commercial Property also carries the second highest incurred claims, so the Executive Business Review pairs the two before drawing conclusions.",
    sources: "Policy Administration System · RPT-310 Executive Business Review",
  },
  {
    match: ["claims expenses increased", "claims increased", "why have claims"],
    agents: "Claims Intelligence Agent, Pricing Analysis Agent",
    answer:
      "Claims incurred rose 8.7% while premium grew 6.4%. The supporting data points to Commercial Property water damage frequency (more claims, similar average cost) plus a severity increase in Auto. That is an observed pattern in the data, not a proven cause: weather exposure data would normally help test it, but that source's credential has expired, so I am flagging the gap rather than filling it.",
    sources:
      "Claims Management System · Actuarial Data Warehouse · Weather source unavailable, flagged",
  },
  {
    match: ["retention", "renewal"],
    agents: "Policy Review Agent",
    answer:
      "Renewal retention is 91.2% over the past year, down 0.8 points. Cancellations rose 6.0% this quarter. The Renewals and Retention Review breaks this down by line and region, and shows the movement is concentrated in Homeowners rather than spread across the book.",
    sources: "Policy Administration System · RPT-304 Renewals and Retention Review",
  },
  {
    match: ["underwriting performance", "acceptance"],
    agents: "Underwriting Agent",
    answer:
      "Across the last two quarters, submission volume grew and the acceptance rate held at 58%, with referrals at 24% and declines at 18%. Turnaround improved slightly. One caution: the Underwriting Platform is syncing right now, so today's figures are a few minutes behind and are labelled preliminary in the library.",
    sources: "Underwriting Platform (syncing) · RPT-303 Submission Conversion by Line",
  },
  {
    match: ["executive", "summarize", "financial performance", "business performance"],
    agents: "Claims, Underwriting, Policy, Pricing and Finance Agents",
    answer:
      "Executive summary: premium is ahead of target at $48.6M and new business is strong at 3,842 policies. Two items need management attention: the combined ratio is 96.8% against a 95.0% target, driven by claims growth outpacing premium growth, and renewal retention slipped 0.8 points to 91.2%. Every figure here traces to a library report listed below.",
    sources: "RPT-310 Executive Business Review · RPT-306 · RPT-304 · RPT-308",
  },
  {
    match: ["region", "frequency"],
    agents: "Claims Intelligence Agent",
    answer:
      "Claims frequency is highest in the Ontario region at 6.8 claims per 100 policies overall, with Commercial Property water damage the largest contributor. Regional broker detail is excluded from this answer because the CRM source is stale; the report flags that limitation instead of presenting old figures as current.",
    sources: "Claims Management System · CRM excluded, stale",
  },
];

function ReportsPage() {
  const [period, setPeriod] = useState("This quarter");
  const [category, setCategory] = useState("All categories");
  const [search, setSearch] = useState("");
  const [library, setLibrary] = useState<LibraryReport[]>(reportLibrary);
  const [preview, setPreview] = useState<LibraryReport | null>(null);
  const [shareMode, setShareMode] = useState("Live report");
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<{ agents: string; answer: string; sources: string } | null>(null);
  // Builder
  const [bCategory, setBCategory] = useState("Claims");
  const [bPeriod, setBPeriod] = useState("Last 12 months");
  const [bComparison, setBComparison] = useState("Prior period");
  const [bSources, setBSources] = useState<string[]>(["Claims Management System"]);
  const [bMetrics, setBMetrics] = useState<string[]>(["Total incurred", "Loss ratio"]);
  const [generated, setGenerated] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      library.filter((r) => {
        if (category !== "All categories" && r.category !== category) return false;
        if (
          search &&
          !`${r.name} ${r.description} ${r.owner}`.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [library, category, search],
  );

  function ask() {
    const q = question.toLowerCase();
    const found = askReplies.find((r) => r.match.some((m) => q.includes(m)));
    setAnswer(
      found ?? {
        agents: "Alfie, coordinating the relevant agents",
        answer:
          "I can answer that from the reports and sources your role can access. Try asking about the loss ratio, premium by line, why claims expenses increased, renewal retention, underwriting performance, or ask for an executive summary. If the data behind a question is stale or incomplete, I will say so rather than estimate it.",
        sources: "Report Library · connected Data Sources",
      },
    );
  }

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function generate() {
    setGenerated(
      `${bCategory} report for ${bPeriod}, compared with ${bComparison.toLowerCase()}. Sources: ${bSources.join(", ")}. Metrics: ${bMetrics.join(", ")}, grouped by business line. Definitions follow the organization metric dictionary, the same definitions used in Finance and Pricing, so figures reconcile across departments.`,
    );
    setSavedNote(null);
  }

  function saveGenerated() {
    const report: LibraryReport = {
      id: `RPT-${312 + library.length}`,
      name: `${bCategory} Performance, ${bPeriod}`,
      category: bCategory,
      description: generated ?? "",
      period: bPeriod,
      owner: "Jane Doe",
      created: "Nov 04, 2026",
      updated: "Nov 04, 2026",
      access: "Creator's departments",
      status: "Preliminary",
      version: "1.0",
      sources: bSources.join(", "),
    };
    setLibrary((prev) => [report, ...prev]);
    setSavedNote(
      `Saved to the Report Library as ${report.id}, version 1.0, with its filters, period, definitions and sources preserved so it can be reproduced exactly.`,
    );
  }

  function duplicate(r: LibraryReport) {
    const copy: LibraryReport = {
      ...r,
      id: `RPT-${400 + library.length}`,
      name: `${r.name} (copy)`,
      version: "1.0",
      created: "Nov 04, 2026",
      updated: "Nov 04, 2026",
      status: "Preliminary",
    };
    setLibrary((prev) => [copy, ...prev]);
    setShareNote(
      `Duplicated ${r.id} as ${copy.id}. The copy keeps the original's filters and definitions and starts as Preliminary.`,
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              The organization's central reporting and business intelligence workspace. Reports
              consolidate authorized data from Claims, Underwriting, Policy, Pricing &amp; Actuarial
              and Finance. Reporting is read and analysis only: nothing here modifies an operational
              record.
            </p>
          </div>
          <label className="block text-[11px] text-muted-foreground">
            Reporting period
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
            >
              <option>This quarter</option>
              <option>Last quarter</option>
              <option>Year to date</option>
              <option>Last 12 months</option>
            </select>
          </label>
        </div>
        <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-[11px] leading-4 text-muted-foreground">
          Illustrative sample data, shown until your systems are connected. Every figure carries its
          source and last updated time, and figures from a stale source are flagged, never presented
          as current.
        </p>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {reportKpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {k.label}
              </p>
              <p className="mt-1.5 text-xl font-semibold">{k.value}</p>
              <p className="mt-1 text-[11px] font-medium text-positive">{k.change}</p>
              <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                {k.source} · Updated {k.updated} · {period}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className={card}>
            <h2 className="text-sm font-semibold">Premium growth and loss ratio</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Monthly gross written premium ($M) against loss ratio (%), last 6 months. The two
              series come from different departments and use the shared metric definitions.
            </p>
            <div className="mt-3 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={lossTrend} margin={{ top: 4, right: 4, bottom: 0, left: -14 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[50, 75]}
                    tick={{ fontSize: 11 }}
                    stroke="var(--color-muted-foreground)"
                  />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="gwp"
                    name="GWP ($M)"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="lossRatio"
                    name="Loss ratio %"
                    stroke="var(--color-destructive)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid gap-2.5 md:grid-cols-3">
              {[
                [
                  "Growth vs claims",
                  "Submissions and new policies are up 11.2% while claims incurred rose 8.7%. The lines driving premium growth are not the lines driving claims growth, which is why portfolio profitability is holding for now. Correlation in the same period is not proof of cause.",
                ],
                [
                  "Renewals vs premium",
                  "Premium grew while retention slipped 0.8 points. Growth is coming from new business more than from keeping existing policyholders, which the retention review flags as the pattern to watch.",
                ],
                [
                  "Broker view, limited",
                  "Broker production and commission can be compared with loss experience, but CRM broker identifiers are stale this month, so the broker level view is flagged as limited in RPT-309 rather than published as fact.",
                ],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Bot className="size-4 text-primary" /> Ask Alfie about performance
            </h2>
            <div className="mt-3 flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="e.g. What was our loss ratio last quarter?"
                className={`${inputCls} flex-1`}
              />
              <Button size="sm" onClick={ask}>
                Ask
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "What was our loss ratio last quarter?",
                "Which business line generated the most premium?",
                "Why have claims expenses increased?",
                "How has renewal retention changed?",
                "Prepare an executive summary",
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQuestion(s);
                  }}
                  className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium hover:bg-secondary"
                >
                  {s}
                </button>
              ))}
            </div>
            {answer ? (
              <div className="mt-3 rounded-xl bg-secondary/50 p-3.5 text-xs leading-5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Via {answer.agents}
                </p>
                <p className="mt-1.5">{answer.answer}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">Sources: {answer.sources}</p>
              </div>
            ) : (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Alfie coordinates the Claims, Underwriting, Policy, Pricing and Finance agents, uses
                only the data your role can access, and states plainly when data is stale,
                incomplete or insufficient, instead of inventing a figure.
              </p>
            )}
            <div className="mt-4 border-t border-border pt-3">
              <h3 className="text-xs font-semibold">Performance against targets</h3>
              <ul className="mt-2 space-y-1.5">
                {executiveTargets.map((t) => (
                  <li key={t.metric} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{t.metric}</span>
                    <span className="font-medium">
                      {t.actual} <span className="text-muted-foreground">vs {t.target}</span>
                    </span>
                    <WorkspaceStatusBadge
                      status={
                        t.status === "Ahead"
                          ? "Completed"
                          : t.status === "Behind"
                            ? "Needs Attention"
                            : "In Progress"
                      }
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                The executive briefing Alfie prepares from these figures stays traceable: every
                number links back to its library report.
              </p>
            </div>
          </section>
        </div>

        <section className={`${card} mt-4`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileBarChart className="size-4" /> Report Library
            </h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports"
                  className="h-9 rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-ring"
                />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectCls}
              >
                {reportCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {shareNote ? <p className="mt-2 text-xs font-medium text-positive">{shareNote}</p> : null}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Report</th>
                  <th className="py-2 pr-3 font-medium">Period</th>
                  <th className="py-2 pr-3 font-medium">Owner</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Access</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/40"
                  >
                    <td className="py-2.5 pr-3">
                      <span className="block font-medium">{r.name}</span>
                      <span className="text-muted-foreground">
                        {r.id} · {r.category} · v{r.version} · Updated {r.updated}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">{r.period}</td>
                    <td className="py-2.5 pr-3">{r.owner}</td>
                    <td className="py-2.5 pr-3">
                      <WorkspaceStatusBadge
                        status={
                          r.status === "Final"
                            ? "Completed"
                            : r.status === "Preliminary"
                              ? "In Progress"
                              : "Needs Attention"
                        }
                      />
                    </td>
                    <td className="py-2.5 pr-3">{r.access}</td>
                    <td className="py-2.5">
                      <span className="flex flex-wrap gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreview(r);
                            setShareNote(null);
                          }}
                        >
                          Open
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => duplicate(r)}>
                          <Copy className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setShareNote(
                              `${r.name} exported. Exports keep the reporting period, sources and definitions, and the export is written to the report audit history.`,
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
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No reports match, or your role cannot access them.
              </p>
            ) : null}
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Plus className="size-4" /> Report builder
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Generate a report in steps: category, sources, metrics, period, filters, comparison,
              then review and save. Or describe it in plain language and Alfie will set the same
              fields and explain them.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] text-muted-foreground">
                Category
                <select
                  value={bCategory}
                  onChange={(e) => setBCategory(e.target.value)}
                  className={`${inputCls} mt-1`}
                >
                  {reportCategories.slice(1).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Reporting period
                <select
                  value={bPeriod}
                  onChange={(e) => setBPeriod(e.target.value)}
                  className={`${inputCls} mt-1`}
                >
                  {[
                    "This month",
                    "This quarter",
                    "Last quarter",
                    "Last 12 months",
                    "Year to date",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Comparison
                <select
                  value={bComparison}
                  onChange={(e) => setBComparison(e.target.value)}
                  className={`${inputCls} mt-1`}
                >
                  {["Prior period", "Same period last year", "No comparison"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Filters
                <select
                  className={`${inputCls} mt-1`}
                  defaultValue="All business lines, all regions"
                >
                  <option>All business lines, all regions</option>
                  <option>Commercial lines only</option>
                  <option>Ontario only</option>
                  <option>Open claims only</option>
                </select>
              </label>
            </div>
            <div className="mt-3">
              <p className="text-[11px] text-muted-foreground">
                Data sources (only ones your role can use)
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  "Claims Management System",
                  "Policy Administration System",
                  "Underwriting Platform",
                  "Actuarial Data Warehouse",
                  "General Ledger and ERP",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(bSources, s, setBSources)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${bSources.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[11px] text-muted-foreground">Metrics and aggregations</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[
                  "Total incurred",
                  "Loss ratio",
                  "Average severity",
                  "Premium total",
                  "Policy count",
                  "Retention %",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(bMetrics, s, setBMetrics)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${bMetrics.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={generate}>Generate report</Button>
              {generated ? (
                <Button variant="outline" onClick={saveGenerated}>
                  Save to library
                </Button>
              ) : null}
            </div>
            {generated ? (
              <div className="mt-3 rounded-xl bg-secondary/50 p-3.5 text-xs leading-5">
                <p className="font-semibold">Generated preview, by business line</p>
                <p className="mt-1 text-muted-foreground">{generated}</p>
                <table className="mt-2 w-full text-left">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="py-1 pr-2 font-medium">Line</th>
                      <th className="py-1 pr-2 font-medium">GWP</th>
                      <th className="py-1 pr-2 font-medium">Incurred</th>
                      <th className="py-1 font-medium">Loss ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l) => (
                      <tr key={l.line} className="border-t border-border/50">
                        <td className="py-1 pr-2 font-medium">{l.line}</td>
                        <td className="py-1 pr-2">{moneyM(l.gwp)}</td>
                        <td className="py-1 pr-2">{moneyM(l.incurred)}</td>
                        <td className="py-1">{((l.incurred / l.earned) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Example of a natural language build: "Claims by region, grouped by product, with
                  total incurred, average settlement and loss ratios for the last twelve months"
                  sets exactly these fields, and Alfie lists the fields and calculations it used.
                </p>
              </div>
            ) : null}
            {savedNote ? (
              <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-positive">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {savedNote}
              </p>
            ) : null}
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarClock className="size-4" /> Scheduled reports
            </h2>
            <div className="mt-3 space-y-2">
              {scheduledReports.map((s) => (
                <div key={s.name} className="rounded-xl border border-border p-3 text-xs leading-5">
                  <p className="font-semibold">
                    {s.name}{" "}
                    <span className="font-normal text-muted-foreground">· {s.schedule}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Recipients: {s.recipients} · Next: {s.nextRun} · Review: {s.review}
                  </p>
                  <p className="text-muted-foreground">Last run: {s.lastRun}</p>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              Every scheduled run, delivery and failure is logged, including data source problems.
              Sensitive reports follow the organization's distribution policy, and schedules can
              require review before anything is sent.
            </p>
            <div className="mt-4 border-t border-border pt-3">
              <h3 className="flex items-center gap-2 text-xs font-semibold">
                <ShieldCheck className="size-3.5" /> Governance and audit
              </h3>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-muted-foreground">
                <li>
                  Access follows roles and data level permissions: asking Alfie for a cross
                  department report never grants access to restricted departmental data.
                </li>
                <li>
                  Exports are PDF, Excel or CSV, and sharing is either a static snapshot or a live
                  report that refreshes from its authorized sources.
                </li>
                <li>
                  If underlying data changes, a refresh creates a new version. The original report
                  is preserved, never silently replaced.
                </li>
              </ul>
              <ul className="mt-3 space-y-2 border-t border-border pt-3">
                {reportAudit.map((a) => (
                  <li key={a.time + a.detail} className="text-xs leading-5">
                    <span className="font-medium">{a.action}</span>{" "}
                    <span className="text-muted-foreground">· {a.detail}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {a.time} · {a.actor}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
            <DialogDescription>{preview?.description}</DialogDescription>
          </DialogHeader>
          {preview ? (
            <div className="space-y-3 text-sm leading-6">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  ["Report ID", preview.id],
                  ["Category", preview.category],
                  ["Period", preview.period],
                  ["Status", preview.status],
                  ["Version", preview.version],
                  ["Owner", preview.owner],
                  ["Created", preview.created],
                  ["Last updated", preview.updated],
                  ["Access", preview.access],
                  ["Sources", preview.sources],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-secondary/50 px-2.5 py-1.5">
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">
                      {k}
                    </span>
                    {v}
                  </div>
                ))}
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                Integrity: this report preserves its period, generation time, sources, filters,
                metric definitions and creator, so it can be reproduced. Figures are labelled{" "}
                {preview.status.toLowerCase()}. If a source was incomplete when it ran, the gap is
                flagged in the report rather than treated as complete.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShareNote(
                      `${preview.name} exported to PDF with its period, sources and definitions included.`,
                    )
                  }
                >
                  <Download className="size-3.5" /> PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShareNote(`${preview.name} exported to Excel.`)}
                >
                  <Download className="size-3.5" /> Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShareNote(`${preview.name} exported to CSV.`)}
                >
                  <Download className="size-3.5" /> CSV
                </Button>
                <select
                  value={shareMode}
                  onChange={(e) => setShareMode(e.target.value)}
                  className={selectCls}
                >
                  <option>Live report</option>
                  <option>Static snapshot</option>
                </select>
                <Button
                  size="sm"
                  onClick={() =>
                    setShareNote(
                      `Shared as a ${shareMode.toLowerCase()}. Only people whose permissions cover the underlying data can open it.`,
                    )
                  }
                >
                  <Share2 className="size-3.5" /> Share
                </Button>
              </div>
              {shareNote ? <p className="text-xs font-medium text-positive">{shareNote}</p> : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
