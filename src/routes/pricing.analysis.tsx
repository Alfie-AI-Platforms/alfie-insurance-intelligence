import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Check, ChevronDown, ChevronRight, Circle, Database, Download, FlaskConical, PanelRightClose, PanelRightOpen, Share2, Sparkle, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlfieComposer, AttachmentChip, type Attachment } from "@/components/alfie-composer";
import { PricingHeader, SampleDataNote } from "@/components/pricing-nav";
import { baseScenario, dataSources, pricingAudit, runScenario } from "@/lib/pricing-data";

export const Route = createFileRoute("/pricing/analysis")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s.q === "string" && s.q ? { q: s.q } : {}),
  head: () => ({ meta: [{ title: "Pricing Analysis | Alfie Insurance" }, { name: "description", content: "Investigate rate adequacy and portfolio performance in a conversation with Alfie." }, { property: "og:title", content: "Pricing Analysis | Alfie Insurance" }, { property: "og:description", content: "AI pricing analysis workspace with sources, assumptions, and governance." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AnalysisWorkspace,
});

type Section = { title: string; items: string[] };
type Reply = { intro: string; sections?: Section[]; table?: string[][]; confidence?: string; limitations?: string[]; sources?: string[]; agents?: string[]; actions?: string[] };
type Msg = { id: string; role: "user" | "alfie"; text?: string; files?: Attachment[]; reply?: Reply };

const followUps = ["What happens if we increase rates by 8%?", "Which geographic segments are responsible for the increase?", "Compare this year's performance with last year.", "Show me the highest-risk policy segments.", "Prepare a pricing recommendation for management."];
const workflow = ["Data Collection", "Data Validation", "Experience Analysis", "Pricing Assessment", "Scenario Modeling", "Actuarial Review", "Approval", "Final Report"];
const pct = (n: number) => `${n.toFixed(1)}%`;

function replyFor(q: string, files: Attachment[], turn: number): Reply {
  const p = q.toLowerCase();
  if (files.length) return { intro: `I read ${files.length === 1 ? "the attached file" : `the ${files.length} attached files`} in the context of the Commercial Property analysis.`, sections: [{ title: "What I extracted", items: files.map((f) => /triangle/i.test(f.name) ? `${f.name}: incurred development AY 2021–2025; 12–24 month factors run ~1.39, slightly above the current selection.` : /filing/i.test(f.name) ? `${f.name}: last filed base rate change +4.5% (2025), filed territory definitions match the model.` : /claims|xlsx|csv/i.test(f.name) ? `${f.name}: structured loss data detected; columns mapped to accident date, paid, incurred, territory.` : `${f.name}: narrative content summarized; no conflicting assumptions found.`) }, { title: "How it affects this analysis", items: ["Used as conversation context only — not added to the actuarial data warehouse.", "Figures from uploaded files are treated as unverified until reconciled with source systems."] }], confidence: "Moderate — uploaded data not yet reconciled", sources: files.map((f) => f.name), actions: ["Add to repository", "Ask Follow-up"] };
  if (p.includes("8%") || p.includes("increase rates") || p.includes("model a") || p.includes("premium increase")) {
    const rate = Number(p.match(/(\d+)\s*%/)?.[1] ?? 8); const r = runScenario({ ...baseScenario, ratePct: rate }); const b = runScenario(baseScenario);
    return { intro: `Illustrative +${rate}% scenario for Commercial Property, keeping the analysis assumptions (no trend change, retention elasticity 0.45).`, table: [["Metric", "Current", `+${rate}%`], ["Written premium", `$${b.writtenPremium.toFixed(1)}M`, `$${r.writtenPremium.toFixed(1)}M`], ["Expected loss ratio", pct(b.lossRatio), pct(r.lossRatio)], ["Combined ratio", pct(b.combinedRatio), pct(r.combinedRatio)], ["Expected retention", `${b.retention.toFixed(0)}%`, `${r.retention.toFixed(0)}%`]], sections: [{ title: "Interpretation", items: ["The increase brings the loss ratio closer to the 60% target but does not close the severity gap in pre-1980 buildings on its own.", "A segmented change (higher in GTA older buildings, lower elsewhere) may reduce retention impact."] }], confidence: "Illustrative — simple arithmetic, not an actuarial forecast", limitations: ["Retention elasticity is a placeholder assumption.", "No mix shift modeled."], agents: ["Pricing Agent"], sources: ["Model PM-CP-01 v4.2", "Policy Administration System"], actions: ["Open in Scenario Modeling", "Ask Follow-up"] };
  }
  if (p.includes("geograph") || p.includes("region") || p.includes("segment")) return { intro: "Three geographic segments account for 71% of the loss ratio deterioration:", table: [["Segment", "Premium", "Loss ratio", "Severity Δ"], ["Ontario — GTA", "$6.1M", "73.8%", "+13.4%"], ["Alberta — Calgary", "$2.4M", "69.2%", "+10.1% (hail)"], ["Quebec — Montréal", "$2.9M", "66.5%", "+8.7%"], ["All other", "$7.0M", "56.1%", "+4.2%"]], sections: [{ title: "Highest-risk policy segments", items: ["Pre-1980 buildings, manufacturing occupancy, GTA — loss ratio 81%.", "Frame construction, Calgary — convective storm exposure.", "Policies with deductibles ≤ $5,000 show 1.6× claim frequency."] }], confidence: "High for GTA; moderate for Calgary (cat-driven volatility)", agents: ["Portfolio Risk Agent", "Underwriting Agent", "Claims Trend Analysis Agent"], sources: ["Claims Management System", "Policy Administration System"], actions: ["Ask Follow-up", "Prepare Recommendation"] };
  if (p.includes("last year") || p.includes("compare")) return { intro: "Commercial Property, 2026 YTD vs 2025 same period:", table: [["Metric", "2025", "2026 YTD"], ["Gross written premium", "$17.1M", "$18.4M"], ["Incurred losses", "$10.2M", "$11.9M"], ["Loss ratio", "59.6%", "64.7%"], ["Claim frequency", "3.09", "3.10"], ["Average severity", "$41,300", "$46,200"]], sections: [{ title: "Takeaway", items: ["Frequency is flat; the deterioration is almost entirely severity-driven.", "Premium growth (+7.6%) lagged loss growth (+16.7%)."] }], confidence: "High", agents: ["Financial Analysis Agent"], sources: ["Historical Premium Database", "Claims Management System"], actions: ["Ask Follow-up"] };
  if (p.includes("recommendation") || p.includes("management") || p.includes("summary") || p.includes("report")) return { intro: "I've drafted a pricing recommendation for management review. Nothing changes in production until it is approved.", sections: [{ title: "Draft recommendation", items: ["Proposed: +8% base rate for Commercial Property, Ontario, with a +4% age-band adjustment for pre-1980 buildings.", "Expected premium impact: +$1.47M (illustrative).", "Expected loss ratio: 64.7% → ~59.9%."] }, { title: "Approval path", items: ["Internal review by actuarial (Priya Natarajan).", "Approval by Pricing Manager — within 10% authority.", "Regulatory filing review before production implementation."] }], confidence: "Moderate", agents: ["Pricing Agent", "Compliance Monitoring Agent"], sources: ["RR-2026-014", "Scenario B (+8%)"], actions: ["Open Rate Review", "Ask Follow-up"] };
  if (turn === 0 || p.includes("adequa") || p.includes("analy")) return { intro: "I've completed an initial assessment of the available commercial property portfolio data. There are several areas worth investigating.", sections: [{ title: "1. Portfolio Overview", items: ["Total policies: 8,420", "Gross Written Premium: $18.4M", "Incurred Claims: $11.9M", "Current Loss Ratio: 64.7%"] }, { title: "2. Emerging Trends", items: ["Claims severity has increased 11.8% over the previous reporting period.", "Certain geographic segments (Ontario GTA) show higher-than-average losses.", "Older commercial buildings account for a disproportionate share of incurred losses."] }, { title: "3. Pricing Adequacy", items: ["Current pricing may not fully reflect the observed increase in claims severity.", "Additional investigation is recommended before determining a rate adjustment."] }, { title: "4. Recommended Next Steps", items: ["Review geographic pricing segmentation.", "Reassess claims severity assumptions.", "Compare actual versus expected loss experience.", "Run alternative rate scenarios."] }], confidence: "Moderate — supported for portfolio level; segment level limited by data gaps", limitations: ["Building age missing for 18% of policies.", "AY 2025 losses are immature (12 months developed).", "Assumes current expense ratio of 30.1%."], agents: ["Actuarial Agent", "Claims Trend Analysis Agent", "Policy Agent"], sources: ["Policy Administration System", "Claims Management System", "Actuarial Data Warehouse", "Model PM-CP-01 v4.2"], actions: ["Open in Scenario Modeling", "Ask Follow-up"] };
  return { intro: "Continuing the Commercial Property analysis with the same portfolio and period:", sections: [{ title: "Findings", items: ["Actual losses are 14.4% above expected, driven by severity.", "The current model's holdout actual/expected ratio of 1.12 suggests recalibration is due."] }], confidence: "Moderate", sources: ["Actuarial Data Warehouse"], actions: ["Ask Follow-up"] };
}

function AnalysisWorkspace() {
  const { q } = Route.useSearch();
  const first = q ?? "Analyze our commercial property portfolio and determine whether our current rates are adequate.";
  const [messages, setMessages] = useState<Msg[]>(() => [{ id: "u0", role: "user", text: first }, { id: "a0", role: "alfie", reply: replyFor(first, [], 0) }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [panel, setPanel] = useState(true);
  const [stage, setStage] = useState(2);
  const [confirm, setConfirm] = useState<Attachment[] | null>(null);
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [lastFiles, setLastFiles] = useState<Attachment[]>([]);
  const [audit, setAudit] = useState(pricingAudit);
  const end = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  useEffect(() => { if (!mounted.current) { mounted.current = true; return; } end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, thinking]);

  const send = (text: string, files: Attachment[] = []) => {
    const t = text || "Analyze the attached files.";
    setInput(""); if (files.length) setLastFiles(files);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: t, files }]); setThinking(true);
    setTimeout(() => { setMessages((m) => [...m, { id: crypto.randomUUID(), role: "alfie", reply: replyFor(t, files, m.length) }]); setThinking(false);
      if (/scenario|%|increase/i.test(t)) setStage((s) => Math.max(s, 4)); else if (/recommend/i.test(t)) setStage((s) => Math.max(s, 5));
      setAudit((a) => [...a, { time: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }), actor: "Alfie", type: "Alfie", action: files.length ? "Documents analyzed" : "Analysis response", detail: t.slice(0, 70) }]); }, 800);
  };
  const action = (a: string) => { if (a === "Ask Follow-up") return; if (a === "Add to repository") setConfirm(lastFiles); };

  const right = panel ? <aside className="scrollbar-thin hidden w-[320px] shrink-0 overflow-y-auto border-l border-border bg-panel p-4 xl:block">
    <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Pricing Context</h2><Button variant="ghost" size="icon" className="size-7" onClick={() => setPanel(false)} aria-label="Collapse context panel"><PanelRightClose className="size-4" /></Button></div>
    <Group title="Analysis Details" rows={[["Analysis", "Commercial Property Rate Adequacy"], ["ID", "PA-2026-031"], ["Line of business", "Commercial Property"], ["Reporting period", "Nov 2025 – Oct 2026"], ["Created by", "Jane Doe"], ["Created", "Nov 04, 2026"], ["Last updated", "Just now"], ["Status", "In progress"]]} />
    <Group title="Portfolio Information" rows={[["Product", "Commercial Package"], ["Policies", "8,420"], ["Total exposure (TIV)", "$9.6B"], ["Gross written premium", "$18.4M"], ["Earned premium", "$17.9M"], ["Incurred losses", "$11.9M"], ["Current loss ratio", "64.7%"]]} />
    <Collapsible title="Data Sources">{[...dataSources.slice(0, 4), dataSources[6]].map((d) => <div key={d.name} className="flex items-start justify-between gap-2 py-1.5 text-xs"><span className="flex items-center gap-1.5"><Database className="size-3 text-muted-foreground" />{d.name}</span><span className={`shrink-0 text-[12px] ${d.status === "Stale" ? "text-warning" : "text-muted-foreground"}`}>{d.status === "Stale" ? "Stale · " : ""}{d.updated}</span></div>)}
      <div className="flex justify-between py-1.5 text-xs"><span className="flex items-center gap-1.5"><Upload className="size-3 text-muted-foreground" />Uploaded documents</span><span className="text-[12px] text-muted-foreground">{messages.reduce((n, m) => n + (m.files?.length ?? 0), 0)} in conversation</span></div></Collapsible>
    <Collapsible title="Key Findings"><ul className="space-y-1.5 text-xs">{["Severity +11.8% YoY; frequency flat.", "Ontario GTA loss ratio 73.8%.", "Pre-1980 buildings over-represented in losses.", "Model PM-CP-01 A/E of 1.12 on holdout."].map((f) => <li key={f} className="flex gap-1.5"><Sparkle className="mt-0.5 size-3 shrink-0 text-primary" />{f}</li>)}</ul></Collapsible>
    <Collapsible title="Analysis Workflow"><ol className="space-y-1">{workflow.map((w, i) => <li key={w} className={`flex items-center gap-2 rounded-md px-1.5 py-1 text-xs ${i === stage ? "bg-accent font-medium text-accent-foreground" : i < stage ? "" : "text-muted-foreground"}`}>{i < stage ? <Check className="size-3.5 text-positive" /> : i === stage ? <ChevronRight className="size-3.5" /> : <Circle className="size-3" />}{w}</li>)}</ol></Collapsible>
    <Collapsible title="Audit Trail" defaultOpen={false}><ul className="space-y-2">{audit.slice().reverse().map((e, i) => <li key={i} className="text-[13px]"><p className="font-medium">{e.action} <span className="font-normal text-muted-foreground">· {e.actor}</span></p><p className="text-muted-foreground">{e.detail}</p><p className="text-[12px] text-muted-foreground">{e.time}</p></li>)}</ul></Collapsible>
  </aside> : null;

  return <AppShell rightPanel={right}><div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 pt-8 lg:px-10">
    <PricingHeader title="Pricing Analysis" subtitle="Evaluate pricing adequacy against claims experience, risk exposure and portfolio performance with Alfie, with the evidence attached. Analysis is read-only: it never changes rates, models or rate reviews." />
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
      <header className="flex flex-wrap items-start justify-between gap-3 py-5"><div><h2 className="text-xl font-semibold">Commercial Property Rate Adequacy Analysis</h2><p className="mt-1 text-sm text-muted-foreground">Evaluating current premium levels against claims experience, risk exposure, and portfolio performance.</p><div className="mt-2"><SampleDataNote /></div></div>
        <div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Share" title="Share"><Share2 className="size-4" /></Button><Button variant="ghost" size="icon" aria-label="Export" title="Export"><Download className="size-4" /></Button>{!panel ? <Button variant="ghost" size="icon" onClick={() => setPanel(true)} aria-label="Show context panel" className="hidden xl:inline-flex"><PanelRightOpen className="size-4" /></Button> : null}</div></header>
      <div className="flex-1 space-y-5 pb-6">{messages.map((m) => m.role === "user" ? <div key={m.id} className="ml-auto max-w-[85%] space-y-2"><div className="rounded-2xl bg-secondary px-4 py-2.5 text-sm">{m.text}</div>{m.files?.length ? <><div className="flex flex-wrap justify-end gap-2">{m.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div><p className="text-right text-[13px] text-muted-foreground">{m.files.length} attachment{m.files.length > 1 ? "s" : ""} ready for analysis</p></> : null}</div>
        : <div key={m.id} className="flex gap-3"><AlfieMark /><ReplyView reply={m.reply!} onAction={action} /></div>)}
        {thinking ? <div className="flex items-center gap-3 text-sm text-muted-foreground"><AlfieMark /><span className="animate-pulse">Alfie is retrieving authorized data and validating sources…</span></div> : null}
        <div ref={end} />
      </div>
      <div className="sticky bottom-0 bg-background pb-5 pt-2"><div className="mb-2 flex flex-wrap gap-1.5">{followUps.map((f) => <button key={f} onClick={() => send(f)} className="rounded-full border border-border bg-card px-2.5 py-1 text-[13px] text-muted-foreground hover:text-foreground">{f}</button>)}</div>
        <AlfieComposer value={input} onChange={setInput} onSend={send} placeholder="Ask a follow-up about this analysis…" /></div>
    </div>
    <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>Add to permanent repository?</DialogTitle><DialogDescription>These files will be added to the organization's actuarial data repository and become available to other authorized users and agents. Conversation attachments are not saved permanently unless you confirm.</DialogDescription></DialogHeader>
      <div className="flex flex-wrap gap-2">{confirm?.map((f) => <AttachmentChip key={f.id} file={f} />)}</div>
      <DialogFooter><Button variant="outline" onClick={() => setConfirm(null)}>Keep in conversation only</Button><Button onClick={() => { setSavedFiles((s) => [...s, ...(confirm ?? []).map((f) => f.name)]); setAudit((a) => [...a, { time: "Just now", actor: "Jane Doe", type: "User", action: "Added to repository", detail: (confirm ?? []).map((f) => f.name).join(", ") }]); setConfirm(null); }}>Add to repository</Button></DialogFooter></DialogContent></Dialog>
    {savedFiles.length ? <p className="sr-only" role="status">{savedFiles.length} files added to repository</p> : null}
  </div></AppShell>;
}

function ReplyView({ reply, onAction }: { reply: Reply; onAction: (a: string) => void }) {
  return <div className="min-w-0 flex-1 space-y-3 font-display text-[15px] leading-7">
    {reply.agents?.length ? <p className="text-[13px] text-muted-foreground">Coordinated with {reply.agents.join(", ")}</p> : null}
    <p>{reply.intro}</p>
    {reply.table ? <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-xs"><thead><tr className="bg-secondary/60">{reply.table[0].map((h) => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr></thead><tbody>{reply.table.slice(1).map((r) => <tr key={r[0]} className="border-t border-border">{r.map((c, i) => <td key={i} className={`px-3 py-2 ${i === 0 ? "font-medium" : ""}`}>{c}</td>)}</tr>)}</tbody></table></div> : null}
    {reply.sections?.map((s) => <div key={s.title}><p className="font-semibold">{s.title}</p><ul className="mt-1 list-disc space-y-0.5 pl-5 text-foreground/90">{s.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}
    {reply.confidence || reply.limitations ? <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs"><p><span className="font-semibold">Confidence:</span> {reply.confidence}</p>{reply.limitations ? <><p className="mt-2 font-semibold">Data limitations & assumptions</p><ul className="mt-1 list-disc pl-4 text-muted-foreground">{reply.limitations.map((l) => <li key={l}>{l}</li>)}</ul></> : null}</div> : null}
    {reply.sources ? <div className="flex flex-wrap items-center gap-1.5 text-[13px]"><span className="text-muted-foreground">Sources:</span>{reply.sources.map((s) => <span key={s} className="rounded-md border border-border bg-card px-1.5 py-0.5">{s}</span>)}</div> : null}
    {reply.actions ? <div className="flex flex-wrap gap-2">{reply.actions.map((a) => a === "Open in Scenario Modeling" ? <Button key={a} size="sm" variant="outline" asChild><Link to="/pricing/scenarios"><FlaskConical className="size-3.5" />{a}</Link></Button> : a === "Open Rate Review" ? <Button key={a} size="sm" variant="outline" asChild><Link to="/pricing/reviews">{a}</Link></Button> : a === "Prepare Recommendation" ? <Button key={a} size="sm" variant="outline" asChild><Link to="/pricing/reviews">{a}</Link></Button> : <Button key={a} size="sm" variant="outline" onClick={() => onAction(a)}>{a}</Button>)}</div> : null}
  </div>;
}

function Group({ title, rows }: { title: string; rows: [string, string][] }) {
  return <Collapsible title={title}><dl className="space-y-1.5">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3 text-xs"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl></Collapsible>;
}
function Collapsible({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className="mt-4 border-t border-border pt-3"><button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}<ChevronDown className={`size-3.5 transition-transform ${open ? "" : "-rotate-90"}`} /></button>{open ? <div className="mt-2">{children}</div> : null}</section>;
}
