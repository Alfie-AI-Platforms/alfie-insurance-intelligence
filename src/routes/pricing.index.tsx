import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowDownRight, ArrowUpRight, Bot, FileBarChart, FlaskConical, Plus, Sparkle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { AlfieComposer, type Attachment } from "@/components/alfie-composer";
import { PricingHeader, SampleDataNote, card, selectCls } from "@/components/pricing-nav";
import { annual, kpis, lines, monthly, quarterly } from "@/lib/pricing-data";

export const Route = createFileRoute("/pricing/")({
  head: () => ({ meta: [{ title: "Pricing & Actuarial | Alfie Insurance" }, { name: "description", content: "Understand portfolio performance, evaluate pricing adequacy, and model better insurance decisions with Alfie." }, { property: "og:title", content: "Pricing & Actuarial | Alfie Insurance" }, { property: "og:description", content: "AI-powered pricing and actuarial workspace for insurers." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PricingOverview,
});

const prompts = ["Which insurance products are currently underpriced?", "Analyze our loss ratio over the last 12 months.", "Which regions are showing increasing claims severity?", "What is driving the increase in our commercial property losses?", "Compare actual claims against expected claims.", "Identify portfolios that may require a rate review.", "Model a 7% premium increase across commercial property.", "Prepare a quarterly actuarial performance summary."];
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, color: "var(--popover-foreground)" } };
const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;

function PricingOverview() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [period, setPeriod] = useState<"Monthly" | "Quarterly" | "Annual">("Monthly");
  const [lrLine, setLrLine] = useState("All lines");
  const [fsView, setFsView] = useState<"frequency" | "severity">("severity");
  const series = period === "Monthly" ? monthly : period === "Quarterly" ? quarterly : annual;
  const lrSeries = monthly.map((m, i) => ({ ...m, lossRatio: lrLine === "All lines" ? m.lossRatio : +(m.lossRatio + (lines.find((l) => l.line === lrLine)!.lossRatio - 62.4) + Math.sin(i) * 1.2).toFixed(1) }));
  const open = (q: string, _files: Attachment[] = []) => navigate({ to: "/pricing/analysis", search: { q: q || "Analyze the attached files." } });

  return <AppShell><div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
    <PricingHeader title="Pricing & Actuarial" subtitle="Understand portfolio performance, evaluate pricing adequacy, and model better insurance decisions with Alfie." actions={<><Button variant="outline" onClick={() => navigate({ to: "/pricing/analysis" })}><Plus className="size-4" />New Analysis</Button><Button variant="outline" onClick={() => navigate({ to: "/pricing/scenarios" })}><FlaskConical className="size-4" />Create Scenario</Button><Button onClick={() => navigate({ to: "/pricing/reports" })}><FileBarChart className="size-4" />Generate Report</Button></>} />

    <section className="mt-6 rounded-2xl border border-border bg-panel p-4">
      <div className="mb-3 flex items-center gap-2"><AlfieMark /><h2 className="text-sm font-semibold">Ask Alfie about your pricing and portfolio.</h2></div>
      <AlfieComposer value={prompt} onChange={setPrompt} onSend={open} placeholder="Ask Alfie to analyze pricing performance, investigate trends, or model a scenario..." />
      <div className="mt-3 flex flex-wrap gap-2">{prompts.map((p) => <Button key={p} variant="secondary" size="sm" className="h-auto whitespace-normal py-1.5 text-left font-normal" onClick={() => open(p)}><Sparkle className="size-3 shrink-0 text-primary" />{p}</Button>)}</div>
    </section>

    <div className="mt-6 flex items-center justify-between"><h2 className="text-sm font-semibold">Portfolio performance</h2><SampleDataNote /></div>
    <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">{kpis.map((k) => <button key={k.key} onClick={() => open(k.prompt)} className="group bg-card p-4 text-left transition-colors hover:bg-secondary/60" title="Open analysis with Alfie">
      <p className="text-[13px] font-medium text-muted-foreground">{k.label}</p><p className="mt-1.5 text-2xl font-semibold">{k.value}</p>
      <p className={`mt-1 flex items-center gap-0.5 text-[12px] ${k.good ? "text-positive" : "text-warning"}`}>{k.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{k.delta}</p>
      {k.key === "ra" ? <div className="mt-2 h-1 rounded-full bg-secondary"><div className="h-1 rounded-full bg-warning" style={{ width: "96.2%" }} /></div> : null}
      <p className="mt-2 text-[12px] text-primary opacity-0 transition-opacity group-hover:opacity-100">Analyze with Alfie →</p></button>)}</div>

    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <section className={`${card} p-4`}><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Premium vs incurred losses</h3><p className="text-[13px] text-muted-foreground">Earned premium and incurred losses, $M</p></div><div className="flex rounded-lg bg-secondary p-0.5">{(["Monthly", "Quarterly", "Annual"] as const).map((p) => <button key={p} onClick={() => setPeriod(p)} className={`rounded-md px-2 py-1 text-[13px] ${period === p ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}>{p}</button>)}</div></div>
        <div className="mt-3 h-52"><ResponsiveContainer><AreaChart data={series}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="period" {...axis} /><YAxis {...axis} width={34} /><Tooltip {...tip} /><Area dataKey="premium" name="Premium" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.12} strokeWidth={2} /><Area dataKey="losses" name="Incurred losses" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.1} strokeWidth={2} /></AreaChart></ResponsiveContainer></div></section>
      <section className={`${card} p-4`}><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Loss ratio trend</h3><p className="text-[13px] text-muted-foreground">Last 12 months · target 60%</p></div><select aria-label="Line of business" value={lrLine} onChange={(e) => setLrLine(e.target.value)} className={selectCls}><option>All lines</option>{lines.map((l) => <option key={l.line}>{l.line}</option>)}</select></div>
        <div className="mt-3 h-52"><ResponsiveContainer><LineChart data={lrSeries}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="period" {...axis} /><YAxis {...axis} width={34} domain={["dataMin - 4", "dataMax + 4"]} unit="%" /><Tooltip {...tip} /><ReferenceLine y={60} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "var(--muted-foreground)", position: "insideTopLeft" }} /><Line dataKey="lossRatio" name="Loss ratio %" stroke="var(--primary)" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></section>
    </div>

    <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className={`${card} overflow-hidden`}><div className="p-4 pb-2"><h3 className="text-sm font-semibold">Profitability by line of business</h3><p className="text-[13px] text-muted-foreground">Click a line to investigate with Alfie</p></div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-[13px] text-muted-foreground">{["Line", "Premium", "Incurred", "Loss ratio", "Combined"].map((h) => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{lines.map((l) => <tr key={l.line} onClick={() => open(`Analyze ${l.line} profitability and rate adequacy.`)} className="cursor-pointer border-t border-border hover:bg-secondary/50"><td className="px-4 py-2.5 font-medium">{l.line}</td><td className="px-4">${l.premium}M</td><td className="px-4">${l.losses}M</td><td className="px-4"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded-full bg-secondary"><div className={`h-1.5 rounded-full ${l.lossRatio > 65 ? "bg-warning" : "bg-primary"}`} style={{ width: `${l.lossRatio}%` }} /></div>{l.lossRatio}%</div></td><td className={`px-4 ${l.combinedRatio > 100 ? "font-medium text-destructive" : ""}`}>{l.combinedRatio}%</td></tr>)}</tbody></table></div></section>
      <section className={`${card} p-4`}><div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold">Frequency & severity</h3><p className="text-[13px] text-muted-foreground">YoY change by line · what is driving deterioration?</p></div><div className="flex rounded-lg bg-secondary p-0.5">{(["frequency", "severity"] as const).map((v) => <button key={v} onClick={() => setFsView(v)} className={`rounded-md px-2 py-1 text-[13px] capitalize ${fsView === v ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}>{v}</button>)}</div></div>
        <div className="mt-3 h-56"><ResponsiveContainer><BarChart data={lines.map((l) => ({ name: l.line.replace("Workers' Compensation", "Workers' Comp").replace("Professional Liability", "Prof. Liability"), value: fsView === "frequency" ? l.freqChange : l.sevChange }))} layout="vertical" margin={{ left: 10 }}><XAxis type="number" {...axis} unit="%" /><YAxis type="category" dataKey="name" {...axis} width={110} /><Tooltip {...tip} formatter={(v) => [`${v}%`, fsView === "frequency" ? "Frequency change" : "Severity change"]} /><ReferenceLine x={0} stroke="var(--border)" /><Bar dataKey="value" fill={fsView === "frequency" ? "var(--primary)" : "var(--warning)"} radius={4} barSize={12} /></BarChart></ResponsiveContainer></div>
        <p className="mt-1 text-[13px] text-muted-foreground">Severity is rising faster than frequency in most lines. Deterioration is cost-driven.</p></section>
    </div>
  </div></AppShell>;
}
