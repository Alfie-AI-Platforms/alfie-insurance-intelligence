import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { forecastMonths, scenarios } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/cash-flow")({
  head: () => ({
    meta: [
      { title: "Cash Flow & Forecasting | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Monitor cash position and forecast liquidity over 30 days to 12 months, with scenario comparison.",
      },
      { property: "og:title", content: "Cash Flow & Forecasting | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CashFlowPage,
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
const horizons = ["30 days", "60 days", "90 days", "6 months", "12 months"] as const;

function CashFlowPage() {
  const navigate = useNavigate();
  const [horizon, setHorizon] = useState<(typeof horizons)[number]>("90 days");
  const [selected, setSelected] = useState<string[]>(["Base case"]);
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const points =
    horizon === "30 days"
      ? forecastMonths.slice(0, 1)
      : horizon === "60 days"
        ? forecastMonths.slice(0, 2)
        : horizon === "90 days"
          ? forecastMonths.slice(0, 3)
          : forecastMonths;
  const monitoring = [
    ["Current Cash Position", "$23.5M"],
    ["Cash Inflows, next 90 days", "$15.0M"],
    ["Cash Outflows, next 90 days", "$11.1M"],
    ["Net Cash Flow, next 90 days", "+$3.9M"],
    ["Expected Claims Payments", "$6.4M"],
    ["Expected Premium Receipts", "$13.8M"],
    ["Expected Commission Payments", "$1.6M"],
    ["Expected Reinsurance Recoveries", "$1.2M"],
  ] as const;

  const toggle = (name: string) =>
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Cash Flow & Forecasting"
          subtitle="Understand the expected financial position and anticipate liquidity needs, with actuals, forecasts and scenario assumptions kept clearly separate."
        />
        <div className="mt-4">
          <SampleDataNote>
            Forecasts are estimates built from historical collections, expected payment schedules,
            receivables, commission obligations, operating expenses and expected recoveries. They
            are not actual results.
          </SampleDataNote>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {monitoring.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className={`${card} mt-4 p-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Cash position forecast</h3>
              <p className="text-[11px] text-muted-foreground">
                Closing cash balance by month, $M, base case
              </p>
            </div>
            <div className="flex flex-wrap rounded-lg bg-secondary p-0.5">
              {horizons.map((h) => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`rounded-md px-2 py-1 text-[11px] ${horizon === h ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 h-56">
            <ResponsiveContainer>
              <AreaChart data={points}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="period" {...axis} />
                <YAxis {...axis} width={34} domain={[20, 34]} />
                <Tooltip {...tip} />
                <Area
                  dataKey="balance"
                  name="Closing cash"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Area
                  dataKey="inflows"
                  name="Inflows"
                  stroke="var(--muted-foreground)"
                  fill="var(--muted-foreground)"
                  fillOpacity={0.06}
                  strokeWidth={1.5}
                />
                <Area
                  dataKey="outflows"
                  name="Outflows"
                  stroke="var(--warning)"
                  fill="var(--warning)"
                  fillOpacity={0.08}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                open("Forecast our cash flow for the next 90 days and explain the assumptions.")
              }
            >
              Explain this forecast with Alfie
            </Button>
            <span className="inline-flex items-center">
              <FinanceStatusBadge status="In review" />
            </span>
            <span className="self-center text-[11px] text-muted-foreground">
              Assumptions and source data are shown with every forecast in the analysis workspace.
            </span>
          </div>
        </section>

        <section className="mt-4">
          <h3 className="text-sm font-semibold">Scenario analysis</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Select scenarios to compare their effect on cash position, liquidity and net cash flow
            over the forecast period.
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {scenarios.map((s) => {
              const active = selected.includes(s.name);
              return (
                <button
                  key={s.name}
                  onClick={() => toggle(s.name)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${active ? "border-primary bg-panel" : "border-border bg-card hover:bg-secondary/50"}`}
                  aria-pressed={active}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="text-[10px] font-medium text-primary">
                      {active ? "Selected" : "Select to compare"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{s.assumption}</p>
                  <div className="mt-3 flex gap-6 text-xs">
                    <span>
                      Cash at period end
                      <br />
                      <strong className="text-sm">{s.cash}</strong>
                    </span>
                    <span>
                      Net cash flow
                      <br />
                      <strong className="text-sm">{s.net}</strong>
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-5">{s.impact}</p>
                </button>
              );
            })}
          </div>
          {selected.length > 1 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Comparing {selected.join(", ")}. The lowest cash position across the selected
              scenarios stays above the $18M policy minimum. Ask Alfie to explain any scenario in
              the analysis workspace.
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
