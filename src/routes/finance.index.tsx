import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Download,
  FileBarChart,
  Plus,
  Sparkle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { AlfieComposer, type Attachment } from "@/components/alfie-composer";
import { FinanceHeader, SampleDataNote, card, selectCls } from "@/components/finance-nav";
import { annual, kpis, lines, monthly, quarterly, receivablesPayables } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/")({
  head: () => ({
    meta: [
      { title: "Finance | Alfie Insurance" },
      {
        name: "description",
        content:
          "Monitor financial performance, manage insurance transactions, and understand your financial position with Alfie.",
      },
      { property: "og:title", content: "Finance | Alfie Insurance" },
      {
        property: "og:description",
        content: "AI powered financial operations and intelligence workspace for insurers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinanceOverview,
});

const prompts = [
  "Give me a summary of our financial position.",
  "How much premium have we collected this month?",
  "Show me outstanding premium receivables.",
  "Analyze our claims payment expenses this quarter.",
  "Which products are generating the highest underwriting profit?",
  "Identify unreconciled transactions.",
  "Investigate unusual financial movements.",
  "Forecast our cash flow for the next 90 days.",
  "Prepare our monthly financial performance report.",
];

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

function FinanceOverview() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [period, setPeriod] = useState<"Monthly" | "Quarterly" | "Annual">("Monthly");
  const [cashView, setCashView] = useState<"inflows" | "outflows">("inflows");
  const series = period === "Monthly" ? monthly : period === "Quarterly" ? quarterly : annual;
  const open = (q: string, _files: Attachment[] = []) =>
    navigate({ to: "/finance/analysis", search: { q: q || "Analyze the attached files." } });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Finance"
          subtitle="Monitor financial performance, manage insurance transactions, and understand your organization's financial position with Alfie."
          actions={
            <>
              <Button variant="outline" onClick={() => navigate({ to: "/finance/analysis" })}>
                <Plus className="size-4" /> New Financial Analysis
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/finance/reports" })}>
                <FileBarChart className="size-4" /> Create Report
              </Button>
              <Button onClick={() => navigate({ to: "/finance/reports" })}>
                <Download className="size-4" /> Export Data
              </Button>
            </>
          }
        />

        <section className="mt-6 rounded-2xl border border-border bg-panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="size-3.5" />
            </div>
            <h2 className="text-sm font-semibold">Ask Alfie about your finances.</h2>
          </div>
          <AlfieComposer
            value={prompt}
            onChange={setPrompt}
            onSend={open}
            placeholder="Ask Alfie to investigate financial activity, analyze performance, or prepare a report..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {prompts.map((p) => (
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
        </section>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Financial performance overview</h2>
          <SampleDataNote />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <button
              key={k.key}
              onClick={() => open(k.prompt)}
              className="group bg-card p-4 text-left transition-colors hover:bg-secondary/60"
              title="Open analysis with Alfie"
            >
              <p className="text-[11px] font-medium text-muted-foreground">{k.label}</p>
              <p className="mt-1.5 text-2xl font-semibold">{k.value}</p>
              <p
                className={`mt-1 flex items-center gap-0.5 text-[10px] ${k.good ? "text-positive" : "text-warning"}`}
              >
                {k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{" "}
                {k.delta}
              </p>
              <p className="mt-2 text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Analyze with Alfie
              </p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Revenue vs expenses</h3>
                <p className="text-[11px] text-muted-foreground">
                  Premium revenue and investment income against claims, commissions and operating
                  expenses, $M
                </p>
              </div>
              <div className="flex rounded-lg bg-secondary p-0.5">
                {(["Monthly", "Quarterly", "Annual"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-md px-2 py-1 text-[11px] ${period === p ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 h-52">
              <ResponsiveContainer>
                <AreaChart data={series}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="period" {...axis} />
                  <YAxis {...axis} width={34} />
                  <Tooltip {...tip} />
                  <Area
                    dataKey="premium"
                    name="Premium revenue"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="claims"
                    name="Claims expenses"
                    stroke="var(--warning)"
                    fill="var(--warning)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="opex"
                    name="Operating expenses"
                    stroke="var(--muted-foreground)"
                    fill="var(--muted-foreground)"
                    fillOpacity={0.08}
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Cash flow trend</h3>
                <p className="text-[11px] text-muted-foreground">
                  Premium receipts and recoveries in, claims, commissions and expenses out, $M
                </p>
              </div>
              <div className="flex rounded-lg bg-secondary p-0.5">
                {(["inflows", "outflows"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCashView(v)}
                    className={`rounded-md px-2 py-1 text-[11px] capitalize ${cashView === v ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 h-52">
              <ResponsiveContainer>
                <LineChart data={monthly}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="period" {...axis} />
                  <YAxis {...axis} width={34} />
                  <Tooltip {...tip} />
                  <Line
                    dataKey={cashView}
                    name={cashView === "inflows" ? "Cash inflows" : "Cash outflows"}
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey={cashView === "inflows" ? "outflows" : "inflows"}
                    name={cashView === "inflows" ? "Cash outflows" : "Cash inflows"}
                    stroke="var(--border)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Net cash flow has stayed positive in every month shown, with the widest gap in
              October.
            </p>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <section className={`${card} overflow-hidden`}>
            <div className="p-4 pb-2">
              <h3 className="text-sm font-semibold">Financial performance by line of business</h3>
              <p className="text-[11px] text-muted-foreground">
                Year to date, $M. Click a line to investigate with Alfie.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-muted-foreground">
                    {["Line", "GWP", "Earned", "Incurred", "Paid", "Commission", "Net result"].map(
                      (h) => (
                        <th key={h} className="px-4 py-2 font-medium">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr
                      key={l.line}
                      onClick={() => open(`Analyze the financial performance of ${l.line}.`)}
                      className="cursor-pointer border-t border-border hover:bg-secondary/50"
                    >
                      <td className="px-4 py-2.5 font-medium">{l.line}</td>
                      <td className="px-4">${l.gwp}M</td>
                      <td className="px-4">${l.earned}M</td>
                      <td className="px-4">${l.incurred}M</td>
                      <td className="px-4">${l.paid}M</td>
                      <td className="px-4">${l.commission}M</td>
                      <td
                        className={`px-4 font-medium ${l.net > 0 ? "text-positive" : "text-destructive"}`}
                      >
                        ${l.net}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${card} p-4`}>
            <h3 className="text-sm font-semibold">Receivables and payables</h3>
            <p className="text-[11px] text-muted-foreground">What is owed, and what is owing</p>
            <div className="mt-3 space-y-3">
              {receivablesPayables.map((r) => (
                <button
                  key={r.label}
                  onClick={() => navigate({ to: "/finance/receivables" })}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left hover:bg-secondary/50"
                >
                  <span>
                    <span className="block text-xs font-medium">{r.label}</span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">{r.note}</span>
                  </span>
                  <span className="text-sm font-semibold">{r.value}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium text-muted-foreground">
                Cash flow by month, net $M
              </p>
              <div className="h-28">
                <ResponsiveContainer>
                  <BarChart
                    data={monthly.map((m) => ({
                      period: m.period,
                      net: +(m.inflows - m.outflows).toFixed(1),
                    }))}
                  >
                    <XAxis dataKey="period" {...axis} />
                    <YAxis {...axis} width={28} />
                    <Tooltip {...tip} />
                    <Bar
                      dataKey="net"
                      name="Net cash flow"
                      fill="var(--primary)"
                      radius={4}
                      barSize={14}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <label className="mt-2 block text-[11px] text-muted-foreground">
              Period for exports
              <select
                className={`${selectCls} ml-2`}
                defaultValue="Oct 2026"
                aria-label="Reporting period"
              >
                <option>Oct 2026</option>
                <option>Q3 2026</option>
                <option>2026 YTD</option>
              </select>
            </label>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
