import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bot, Plus, Search, Sparkle, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlfieComposer, AttachmentChip, type Attachment } from "@/components/alfie-composer";
import { SubmissionStatusBadge, UwPriorityBadge } from "@/components/uw-badges";
import { compactUsd, submissions as seed, submissionStatuses, type Submission, type SubmissionStatus } from "@/lib/underwriting-data";

export const Route = createFileRoute("/underwriting/")({
  head: () => ({ meta: [{ title: "Underwriting | Alfie Insurance" }, { name: "description", content: "Evaluate risks, prioritize submissions, and make faster underwriting decisions with Alfie." }, { property: "og:title", content: "Underwriting | Alfie Insurance" }, { property: "og:description", content: "An AI-powered underwriting workspace for submission triage, appetite, and pricing." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: UnderwritingPage,
});

const metrics: readonly (readonly [string, string, string, boolean])[] = [["New Submissions", "42", "+8 this week", true], ["Needs Review", "17", "+3 today", true], ["High Priority", "6", "−1 vs last wk", false], ["Awaiting Information", "11", "−2 vs last wk", false], ["Quoted Premium", "$4.8M", "+5.4% MoM", true]];
const examples = ["Show me the submissions that need my attention.", "Which new submissions are within our appetite?", "Find submissions with missing information.", "Which risks have the highest potential premium?", "Show me submissions that may require referral.", "Summarize today's underwriting activity."];

type Answer = { prompt: string; files: Attachment[]; intro: string; rows: Submission[]; note: string };

function answerFor(prompt: string, all: Submission[]): Omit<Answer, "prompt" | "files"> {
  const p = prompt.toLowerCase();
  const open = all.filter((s) => !["Declined", "Bound", "Quoted"].includes(s.status));
  if (p.includes("appetite")) return { intro: "4 open submissions are within appetite based on the current appetite guides.", rows: open.filter((s) => s.inAppetite === "Within appetite"), note: "Assessed against Commercial Property Appetite Guide v4.2, Commercial Auto Guide v3.1, and Cyber Guide v2.0. Final acceptance remains with the assigned underwriter." };
  if (p.includes("missing")) return { intro: "3 submissions have missing information blocking a complete assessment.", rows: open.filter((s) => s.missing > 0), note: "SUB-10482: fire protection details, Building 3 COPE data. SUB-10480: updated SOV, 2025 loss runs, flood zone certificate. SUB-10478: incident log for 2024." };
  if (p.includes("premium")) return { intro: "Ranked by estimated premium, these are the highest-potential open risks.", rows: [...open].sort((a, b) => b.premium - a.premium).slice(0, 4), note: "Combined estimated premium: $814K. Estimates are indicative and subject to underwriter pricing review." };
  if (p.includes("referral")) return { intro: "3 submissions may require referral under your current authority.", rows: open.filter((s) => s.inAppetite === "Referral"), note: "Triggers: requested limit above $5M class authority (SUB-10482, SUB-10480), and inland marine accumulation exposure (SUB-10477)." };
  if (p.includes("summarize") || p.includes("today")) return { intro: "Today: 5 submissions received, 2 analyzed by Alfie, 1 moved to Ready for Review, and 1 awaiting broker information.", rows: open.filter((s) => s.receivedDays === 0), note: "Average time to decision-ready file: 14 minutes. 2 items need your review before end of day." };
  return { intro: "You have 3 submissions that need your attention, based on priority, effective date, and pending decisions.", rows: open.filter((s) => s.status === "Needs Review" || (s.priority === "High" && s.underwriter === "Sarah Chen")).slice(0, 3), note: "SUB-10482 has an effective date of November 1, 2026 and requires a referral decision. Sources: submission queue, Underwriting SLA policy UW-SLA-01." };
}

function UnderwritingPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Submission[]>(seed);
  const [tab, setTab] = useState<"All" | SubmissionStatus>("All");
  const [search, setSearch] = useState("");
  const [line, setLine] = useState("");
  const [priority, setPriority] = useState("");
  const [uw, setUw] = useState("");
  const [broker, setBroker] = useState("");
  const [effective, setEffective] = useState("");
  const [received, setReceived] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [thinking, setThinking] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ insured: "", line: "Commercial Property", broker: "Apex Insurance Brokers", limit: "" });

  const uniq = (k: keyof Submission) => [...new Set(rows.map((r) => String(r[k])))];
  const filtered = useMemo(() => rows.filter((s) => (tab === "All" || s.status === tab) && (!line || s.line === line) && (!priority || s.priority === priority) && (!uw || s.underwriter === uw) && (!broker || s.broker === broker) && (!effective || s.effectiveMonth === effective) && (!received || s.receivedDays <= Number(received)) && (!search || `${s.id} ${s.insured} ${s.line} ${s.broker}`.toLowerCase().includes(search.toLowerCase()))), [rows, tab, line, priority, uw, broker, effective, received, search]);
  const anyFilter = tab !== "All" || line || priority || uw || broker || effective || received || search;

  const ask = (text: string, files: Attachment[] = []) => {
    const q = text || "Analyze the attached files.";
    setPrompt(""); setThinking(true);
    setTimeout(() => { setAnswers((a) => [{ prompt: q, files, ...answerFor(q, rows) }, ...a]); setThinking(false); }, 700);
  };
  const create = () => {
    const id = `SUB-${10483 + rows.length - seed.length}`;
    setRows((r) => [{ id, insured: form.insured || "New Insured", line: form.line, status: "New", priority: "Medium", underwriter: "Unassigned", broker: form.broker, received: "Just now", receivedDays: 0, effective: "December 1, 2026", effectiveMonth: "Dec 2026", limit: Number(form.limit) || 1_000_000, premium: 0, inAppetite: "Within appetite", missing: 0 }, ...r]);
    setNewOpen(false); setForm({ insured: "", line: "Commercial Property", broker: "Apex Insurance Brokers", limit: "" });
  };
  const sel = "select-chevron h-8 rounded-lg border border-border bg-background pl-2.5 text-xs text-foreground outline-none focus:border-ring";

  return <AppShell><div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold tracking-tight">Underwriting</h1><p className="mt-2 text-sm text-muted-foreground">Evaluate risks, prioritize submissions, and make faster underwriting decisions with Alfie.</p></div><Button onClick={() => setNewOpen(true)}><Plus className="size-4" />New Submission</Button></div>

    <div className="relative mt-6"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && search.trim().split(" ").length > 3) { ask(search); setSearch(""); } }} placeholder="Search submissions, insureds, policies, or ask Alfie…" aria-label="Search submissions" className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring" /></div>

    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">{metrics.map(([label, value, trend, up]) => <div key={label} className="bg-card p-4"><p className="text-[13px] font-medium text-muted-foreground">{label}</p><p className="mt-1.5 text-2xl font-semibold">{value}</p><p className="mt-1 flex items-center gap-0.5 text-[12px] text-muted-foreground">{up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{trend}</p></div>)}</div>

    <section className="mt-6 rounded-2xl border border-border bg-panel p-4">
      <div className="mb-3 flex items-center gap-2"><AlfieMark /><h2 className="text-sm font-semibold">Ask Alfie about underwriting</h2></div>
      <AlfieComposer value={prompt} onChange={setPrompt} onSend={ask} placeholder="Ask Alfie about underwriting…" />
      <div className="mt-3 flex flex-wrap gap-2">{examples.map((ex) => <Button key={ex} variant="secondary" size="sm" className="h-auto whitespace-normal py-1.5 text-left font-normal" onClick={() => ask(ex)}><Sparkle className="size-3 shrink-0 text-primary" />{ex}</Button>)}</div>
      {thinking ? <p className="mt-4 animate-pulse text-xs text-muted-foreground">Alfie is reviewing the submission pipeline…</p> : null}
      {answers.map((a, i) => <div key={i} className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3"><p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">You:</span> {a.prompt}</p><button aria-label="Dismiss" onClick={() => setAnswers((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button></div>
        {a.files.length ? <div className="mt-2 flex flex-wrap gap-2">{a.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div> : null}
        <p className="mt-3 text-sm">{a.intro}</p>
        <div className="mt-3 divide-y divide-border rounded-lg border border-border">{a.rows.map((s) => <Link key={s.id} to="/underwriting/$submissionId" params={{ submissionId: s.id }} className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-secondary"><span className="font-semibold">{s.id}</span><span className="text-muted-foreground">{s.insured} · {s.line}</span><span className="ml-auto hidden sm:inline">{s.premium ? compactUsd(s.premium) : "—"}</span><UwPriorityBadge priority={s.priority} /></Link>)}</div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{a.note}</p>
      </div>)}
    </section>

    <section className="mt-8">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Submission work queue</h2><span className="text-xs text-muted-foreground">{filtered.length} submissions</span></div>
      <div className="scrollbar-none mt-3 flex gap-1 overflow-x-auto">{(["All", ...submissionStatuses] as const).map((s) => <Button key={s} size="sm" variant={tab === s ? "soft" : "ghost"} onClick={() => setTab(s)} className={tab === s ? "text-foreground" : ""}>{s}</Button>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <select aria-label="Line of business" className={sel} value={line} onChange={(e) => setLine(e.target.value)}><option value="">Line of business: Any</option>{uniq("line").map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Priority" className={sel} value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">Priority: Any</option>{["High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Underwriter" className={sel} value={uw} onChange={(e) => setUw(e.target.value)}><option value="">Underwriter: Anyone</option>{uniq("underwriter").map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Broker" className={sel} value={broker} onChange={(e) => setBroker(e.target.value)}><option value="">Broker: Any</option>{uniq("broker").map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Effective date" className={sel} value={effective} onChange={(e) => setEffective(e.target.value)}><option value="">Effective: Any</option>{uniq("effectiveMonth").map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Submission date" className={sel} value={received} onChange={(e) => setReceived(e.target.value)}><option value="">Received: Any time</option><option value="0">Today</option><option value="1">Last 2 days</option><option value="7">Last 7 days</option></select>
        {anyFilter ? <Button size="sm" variant="ghost" onClick={() => { setTab("All"); setLine(""); setPriority(""); setUw(""); setBroker(""); setEffective(""); setReceived(""); setSearch(""); }}>Clear filters</Button> : null}
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[820px] text-left text-sm">
        <thead><tr className="border-b border-border text-[13px] uppercase tracking-wider text-muted-foreground">{["Submission", "Insured", "Line of Business", "Status", "Priority", "Underwriter", "Received"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{filtered.map((s) => <tr key={s.id} onClick={() => navigate({ to: "/underwriting/$submissionId", params: { submissionId: s.id } })} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/60">
          <td className="px-4 py-3"><Link to="/underwriting/$submissionId" params={{ submissionId: s.id }} onClick={(e) => e.stopPropagation()} className="font-semibold hover:text-primary">{s.id}</Link></td>
          <td className="px-4 py-3">{s.insured}</td><td className="px-4 py-3 text-muted-foreground">{s.line}</td><td className="px-4 py-3"><SubmissionStatusBadge status={s.status} /></td><td className="px-4 py-3"><UwPriorityBadge priority={s.priority} /></td>
          <td className={`px-4 py-3 ${s.underwriter === "Unassigned" ? "italic text-muted-foreground" : ""}`}>{s.underwriter}</td><td className="px-4 py-3 text-muted-foreground">{s.received}</td>
        </tr>)}{filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No submissions match these filters.</td></tr> : null}</tbody>
      </table></div>
    </section>

    <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent><DialogHeader><DialogTitle>New submission</DialogTitle><DialogDescription>Log a broker submission. Alfie will ingest documents and prepare a completeness and appetite check.</DialogDescription></DialogHeader>
      <div className="grid gap-3">
        <label className="text-xs font-medium">Insured name<input value={form.insured} onChange={(e) => setForm({ ...form, insured: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring" /></label>
        <label className="text-xs font-medium">Requested limit ($)<input value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring" /></label>
        <label className="text-xs font-medium">Line of business<select value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} className="select-chevron mt-1 h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-sm">{["Commercial Property", "Commercial Auto", "General Liability", "Cyber", "Inland Marine", "Professional Liability"].map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="text-xs font-medium">Broker<select value={form.broker} onChange={(e) => setForm({ ...form, broker: e.target.value })} className="select-chevron mt-1 h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-sm">{uniq("broker").map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <DialogFooter><Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={create}>Create submission</Button></DialogFooter></DialogContent></Dialog>
  </div></AppShell>;
}
