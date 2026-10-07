import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bot, Plus, Search, Sparkle, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlfieComposer, AttachmentChip, type Attachment } from "@/components/alfie-composer";
import { ClaimStatusBadge, PriorityBadge } from "@/components/claim-badges";
import { claims as seedClaims, claimStatuses, money, type Claim, type ClaimStatus, type Priority } from "@/lib/claims-data";

export const Route = createFileRoute("/claims/")({
  head: () => ({ meta: [{ title: "Claims | Alfie Insurance" }, { name: "description", content: "Manage, investigate, and triage claims with Alfie." }, { property: "og:title", content: "Claims | Alfie Insurance" }, { property: "og:description", content: "An AI-powered claims operating workspace for triage and investigation." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ClaimsPage,
});

const metrics: readonly (readonly [string, string, string, boolean])[] = [["Open Claims", "247", "+4.2% wk", true], ["Needs Review", "32", "+6 today", true], ["High Priority", "8", "−2 vs last wk", false], ["Awaiting Information", "19", "−3 vs last wk", false], ["Total Incurred YTD", "$18.7M", "+3.1% YoY", true]];
const examples = ["Show me the claims that need my attention today.", "Which claims have unusual activity?", "Show me high-value claims opened this month.", "Analyze the highest-risk open claims."];

type Answer = { prompt: string; files: Attachment[]; intro: string; rows: Claim[]; note: string };

function answerFor(prompt: string, all: Claim[]): Omit<Answer, "prompt" | "files"> {
  const p = prompt.toLowerCase();
  const open = all.filter((c) => c.status !== "Closed" && c.status !== "Approved");
  if (p.includes("unusual")) return { intro: "I found 2 claims with activity patterns that differ from similar claims in the portfolio.", rows: all.filter((c) => ["CL-45816", "CL-45821"].includes(c.id)), note: "CL-45816: theft reported 9 days after policy endorsement. CL-45821: location discrepancy between police report and claimant statement. These are indicators for review, not fraud determinations." };
  if (p.includes("high-value") || p.includes("high value")) return { intro: "4 claims opened this month have an estimated loss above $20,000.", rows: [...open].filter((c) => c.estimatedLoss > 20000).sort((a, b) => b.estimatedLoss - a.estimatedLoss), note: "Combined estimated loss: $350K. CL-45817 exceeds your $100,000 reserve authority and requires manager review." };
  if (p.includes("risk")) return { intro: "Ranked by severity, coverage complexity, and open risk signals, these are the highest-risk open claims.", rows: open.filter((c) => c.priority === "High"), note: "Recommended next step: supervisor review for CL-45817 and CL-45821. Confidence: Medium–High. Sources: claims database, policy administration system." };
  return { intro: "You have 3 claims that need your attention today, based on priority, SLA timers, and pending decisions.", rows: open.filter((c) => c.status === "Needs Review" || (c.priority === "High" && c.assignedTo === "Sarah Chen")).slice(0, 3), note: "CL-45821 is approaching its 48-hour review SLA. Sources: claims queue, SLA policy CLM-SLA-02." };
}

function ClaimsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Claim[]>(seedClaims);
  const [tab, setTab] = useState<"All" | ClaimStatus>("All");
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [assignee, setAssignee] = useState("");
  const [date, setDate] = useState("");
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [thinking, setThinking] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ claimant: "", type: "Auto Collision", policy: "", loss: "" });

  const types = [...new Set(rows.map((c) => c.type))];
  const assignees = [...new Set(rows.map((c) => c.assignedTo))];
  const filtered = useMemo(() => rows.filter((c) => (tab === "All" || c.status === tab) && (!priority || c.priority === priority) && (!type || c.type === type) && (!assignee || c.assignedTo === assignee) && (!date || c.updatedDays <= Number(date)) && (!search || `${c.id} ${c.claimant} ${c.policy} ${c.type}`.toLowerCase().includes(search.toLowerCase()))), [rows, tab, priority, type, assignee, date, search]);

  const ask = (text: string, files: Attachment[] = []) => {
    const q = text || "Analyze the attached files.";
    setPrompt("");
    setThinking(true);
    setTimeout(() => { setAnswers((a) => [{ prompt: q, files, ...answerFor(q, rows) }, ...a]); setThinking(false); }, 700);
  };
  const searchSubmit = () => { if (search.trim().split(" ").length > 3) { ask(search); setSearch(""); } };
  const createClaim = () => {
    const id = `CL-${45822 + rows.length - seedClaims.length}`;
    setRows((r) => [{ id, claimant: form.claimant || "New Claimant", type: form.type, status: "Needs Review", priority: "Medium", assignedTo: "Unassigned", updated: "Just now", updatedDays: 0, policy: form.policy || "Pending", dateOfLoss: "October 6, 2026", estimatedLoss: Number(form.loss) || 0, location: "Toronto, ON" }, ...r]);
    setNewOpen(false);
    setForm({ claimant: "", type: "Auto Collision", policy: "", loss: "" });
  };
  const selectCls = "h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring";

  return <AppShell><div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Claims</h1><p className="mt-2 text-sm text-muted-foreground">Manage, investigate, and triage claims with Alfie.</p></div><Button onClick={() => setNewOpen(true)}><Plus className="size-4" />New Claim</Button></div>

    <div className="relative mt-6"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && searchSubmit()} placeholder="Search claims, policies, claimants, or ask Alfie…" aria-label="Search claims" className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring" /></div>

    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">{metrics.map(([label, value, trend, up]) => <div key={label} className="bg-card p-4"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1.5 text-2xl font-semibold">{value}</p><p className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground">{up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{trend}</p></div>)}</div>

    <section className="mt-6 rounded-2xl border border-border bg-panel p-4">
      <div className="mb-3 flex items-center gap-2"><div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Bot className="size-3.5" /></div><h2 className="text-sm font-semibold">Ask Alfie about your claims</h2></div>
      <AlfieComposer value={prompt} onChange={setPrompt} onSend={ask} placeholder="Ask Alfie about your claims…" />
      <div className="mt-3 flex flex-wrap gap-2">{examples.map((ex) => <Button key={ex} variant="secondary" size="sm" className="h-auto whitespace-normal py-1.5 text-left font-normal" onClick={() => ask(ex)}><Sparkle className="size-3 shrink-0 text-primary" />{ex}</Button>)}</div>
      {thinking ? <p className="mt-4 animate-pulse text-xs text-muted-foreground">Alfie is reviewing the claims portfolio…</p> : null}
      {answers.map((a, i) => <div key={i} className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3"><p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">You:</span> {a.prompt}</p><button aria-label="Dismiss" onClick={() => setAnswers((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button></div>
        {a.files.length ? <div className="mt-2 flex flex-wrap gap-2">{a.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div> : null}
        <p className="mt-3 text-sm">{a.intro}</p>
        <div className="mt-3 divide-y divide-border rounded-lg border border-border">{a.rows.map((c) => <Link key={c.id} to="/claims/$claimId" params={{ claimId: c.id }} className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-secondary"><span className="font-semibold">{c.id}</span><span className="text-muted-foreground">{c.claimant} · {c.type}</span><span className="ml-auto hidden sm:inline">{money(c.estimatedLoss)}</span><PriorityBadge priority={c.priority} /></Link>)}</div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{a.note}</p>
      </div>)}
    </section>

    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold">Claims work queue</h2><span className="text-xs text-muted-foreground">{filtered.length} claims</span></div>
      <div className="scrollbar-none mt-3 flex gap-1 overflow-x-auto">{(["All", ...claimStatuses] as const).map((s) => <Button key={s} size="sm" variant={tab === s ? "soft" : "ghost"} onClick={() => setTab(s)} className={tab === s ? "text-foreground" : ""}>{s}</Button>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <select aria-label="Priority" className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">Priority: Any</option>{["High", "Medium", "Low"].map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Claim type" className={selectCls} value={type} onChange={(e) => setType(e.target.value)}><option value="">Claim type: Any</option>{types.map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Assigned to" className={selectCls} value={assignee} onChange={(e) => setAssignee(e.target.value)}><option value="">Assigned to: Anyone</option>{assignees.map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Date" className={selectCls} value={date} onChange={(e) => setDate(e.target.value)}><option value="">Updated: Any time</option><option value="0">Today</option><option value="1">Last 2 days</option><option value="7">Last 7 days</option></select>
        <select aria-label="Status" className={selectCls} value={tab} onChange={(e) => setTab(e.target.value as "All" | ClaimStatus)}><option value="All">Status: All</option>{claimStatuses.map((x) => <option key={x}>{x}</option>)}</select>
        {priority || type || assignee || date || tab !== "All" || search ? <Button size="sm" variant="ghost" onClick={() => { setPriority(""); setType(""); setAssignee(""); setDate(""); setTab("All"); setSearch(""); }}>Clear filters</Button> : null}
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[760px] text-left text-sm">
        <thead><tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">{["Claim", "Claimant", "Type", "Status", "Priority", "Assigned To", "Last Updated"].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
        <tbody>{filtered.map((c) => <tr key={c.id} onClick={() => navigate({ to: "/claims/$claimId", params: { claimId: c.id } })} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/60">
          <td className="px-4 py-3"><Link to="/claims/$claimId" params={{ claimId: c.id }} className="font-semibold hover:text-primary" onClick={(e) => e.stopPropagation()}>{c.id}</Link></td>
          <td className="px-4 py-3">{c.claimant}</td><td className="px-4 py-3 text-muted-foreground">{c.type}</td><td className="px-4 py-3"><ClaimStatusBadge status={c.status} /></td><td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
          <td className={`px-4 py-3 ${c.assignedTo === "Unassigned" ? "text-muted-foreground italic" : ""}`}>{c.assignedTo}</td><td className="px-4 py-3 text-muted-foreground">{c.updated}</td>
        </tr>)}{filtered.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No claims match these filters.</td></tr> : null}</tbody>
      </table></div>
    </section>

    <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent><DialogHeader><DialogTitle>New claim</DialogTitle><DialogDescription>Record first notice of loss. Alfie will begin intake analysis once evidence is received.</DialogDescription></DialogHeader>
      <div className="grid gap-3">{([["Claimant name", "claimant"], ["Policy number", "policy"], ["Estimated loss ($)", "loss"]] as const).map(([label, key]) => <label key={key} className="text-xs font-medium">{label}<input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring" /></label>)}
        <label className="text-xs font-medium">Loss type<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">{["Auto Collision", "Water Damage", "Commercial Property", "Theft", "Fire", "General Liability"].map((x) => <option key={x}>{x}</option>)}</select></label></div>
      <DialogFooter><Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={createClaim}>Create claim</Button></DialogFooter></DialogContent></Dialog>
  </div></AppShell>;
}
