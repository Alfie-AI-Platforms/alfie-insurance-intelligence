import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Bot, Plus, Search, Sparkle, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlfieComposer, AttachmentChip, type Attachment } from "@/components/alfie-composer";
import { PolicyStatusBadge } from "@/components/policy-badges";
import { dollars, policies as seed, policyStatuses, type Policy, type PolicyStatus } from "@/lib/policy-data";

export const Route = createFileRoute("/policy/")({
  head: () => ({ meta: [{ title: "Policy | Alfie Insurance" }, { name: "description", content: "Manage policy portfolios, coverage, renewals, and policy changes with Alfie." }, { property: "og:title", content: "Policy | Alfie Insurance" }, { property: "og:description", content: "An AI-powered policy administration workspace for coverage, servicing, and renewals." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PolicyPage,
});

const metrics: readonly (readonly [string, string, string, boolean])[] = [["Policies in Force", "12,840", "+1.9% MoM", true], ["Pending Issuance", "38", "+5 this week", true], ["Renewals Upcoming", "126", "Next 60 days", true], ["Endorsements Pending", "24", "−3 vs last wk", false], ["Policies Expiring Soon", "47", "Next 30 days", true]];
const examples = ["Show me policies expiring in the next 30 days.", "Which policies have pending endorsements?", "Find policies with incomplete documentation.", "Summarize our active commercial property policies.", "Identify policies with significant coverage changes.", "Show me policies with outstanding renewal actions."];
const columns: readonly (readonly [string, keyof Policy])[] = [["Policy Number", "id"], ["Policyholder", "holder"], ["Line of Business", "line"], ["Coverage", "coverage"], ["Premium", "premium"], ["Status", "status"], ["Effective Date", "effectiveISO"], ["Expiration Date", "expirationISO"]];

type Answer = { prompt: string; files: Attachment[]; intro: string; rows: Policy[]; note: string };
function answerFor(prompt: string, all: Policy[]): Omit<Answer, "prompt" | "files"> {
  const p = prompt.toLowerCase();
  if (p.includes("endorsement")) return { intro: "2 policies have pending endorsements awaiting review.", rows: all.filter((x) => ["POL-28492", "POL-28493"].includes(x.id)), note: "POL-28492: add new location (220 Industrial Pkwy) — underwriting review required. POL-28493: add 3 vehicles to fleet schedule — premium impact +$6,200, Finance review." };
  if (p.includes("incomplete") || p.includes("documentation")) return { intro: "3 policies have incomplete documentation in the policy record.", rows: all.filter((x) => ["POL-28492", "POL-28494", "POL-28455"].includes(x.id)), note: "Missing items: 2026 inspection report (POL-28492), signed application (POL-28494), updated certificate of occupancy (POL-28455)." };
  if (p.includes("commercial property")) { const r = all.filter((x) => x.line === "Commercial Property" && x.status === "Active"); return { intro: `${r.length} active commercial property policy in this view, with ${dollars(r.reduce((s, x) => s + x.premium, 0))} annual premium.`, rows: r, note: "Portfolio-wide: 1,284 active commercial property policies, $142.6M in force premium, average TIV $6.8M. Sources: policy administration system." }; }
  if (p.includes("coverage change")) return { intro: "2 policies had significant coverage changes in the last 90 days.", rows: all.filter((x) => ["POL-28492", "POL-28480"].includes(x.id)), note: "POL-28492: Equipment Breakdown limit increased $1.0M → $1.5M (v3). POL-28480: ransomware sublimit reduced $5M → $2.5M at renewal." };
  if (p.includes("renewal")) return { intro: "3 policies have outstanding renewal actions.", rows: all.filter((x) => x.status === "Renewal Pending" || x.id === "POL-28480"), note: "Outstanding: updated exposure data (POL-28493), renewal offer not sent (POL-28455), underwriting review of ransomware controls (POL-28480)." };
  return { intro: "4 policies expire in the next 30 days.", rows: all.filter((x) => ["POL-28480", "POL-28471", "POL-28455"].includes(x.id) || x.expirationISO <= "2026-12-03" && x.status === "Active"), note: "Renewal preparation has started for all but POL-28471. Sources: policy administration system, renewal calendar." };
}

function PolicyPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Policy[]>(seed);
  const [tab, setTab] = useState<"All" | PolicyStatus>("All");
  const [search, setSearch] = useState("");
  const [line, setLine] = useState(""); const [holder, setHolder] = useState(""); const [eff, setEff] = useState(""); const [exp, setExp] = useState(""); const [range, setRange] = useState(""); const [team, setTeam] = useState("");
  const [sort, setSort] = useState<{ key: keyof Policy; dir: 1 | -1 }>({ key: "id", dir: -1 });
  const [prompt, setPrompt] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [thinking, setThinking] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [form, setForm] = useState({ holder: "", line: "Commercial Property", premium: "" });

  const uniq = (k: keyof Policy) => [...new Set(rows.map((r) => String(r[k])))];
  const year = (iso: string) => iso.slice(0, 4);
  const inRange = (v: number) => !range || (range === "lt10" ? v < 10000 : range === "10to100" ? v >= 10000 && v <= 100000 : v > 100000);
  const filtered = useMemo(() => rows
    .filter((x) => (tab === "All" || x.status === tab) && (!line || x.line === line) && (!holder || x.holder === holder) && (!eff || year(x.effectiveISO) === eff) && (!exp || year(x.expirationISO) === exp) && inRange(x.premium) && (!team || x.team === team) && (!search || `${x.id} ${x.holder} ${x.line} ${x.coverage}`.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => { const av = a[sort.key], bv = b[sort.key]; return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir; }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [rows, tab, line, holder, eff, exp, range, team, search, sort]);
  const anyFilter = tab !== "All" || line || holder || eff || exp || range || team || search;

  const ask = (text: string, files: Attachment[] = []) => {
    const q = text || "Analyze the attached files.";
    setPrompt(""); setThinking(true);
    setTimeout(() => { setAnswers((a) => [{ prompt: q, files, ...answerFor(q, rows) }, ...a]); setThinking(false); }, 700);
  };
  const create = () => {
    const id = `POL-${28495 + rows.length - seed.length}`;
    setRows((r) => [{ id, holder: form.holder || "New Policyholder", line: form.line, coverage: form.line.includes("Auto") ? "Auto Coverage" : "Property Coverage", premium: Number(form.premium) || 0, status: "Pending Issuance", effective: "Dec 01, 2026", expiration: "Dec 01, 2027", effectiveISO: "2026-12-01", expirationISO: "2027-12-01", team: form.line, tiv: 0, personal: form.line === "Personal Auto" || form.line === "Homeowners" }, ...r]);
    setNewOpen(false); setForm({ holder: "", line: "Commercial Property", premium: "" });
  };
  const sel = "h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring";

  return <AppShell><div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Policy</h1><p className="mt-2 text-sm text-muted-foreground">Manage policy portfolios, coverage, renewals, and policy changes with Alfie.</p></div><Button onClick={() => setNewOpen(true)}><Plus className="size-4" />Create Policy</Button></div>

    <div className="relative mt-6"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && search.trim().split(" ").length > 3) { ask(search); setSearch(""); } }} placeholder="Search policies, policyholders, coverage, or ask Alfie..." aria-label="Search policies" className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring" /></div>

    <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">{metrics.map(([label, value, trend, up]) => <div key={label} className="bg-card p-4"><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-1.5 text-2xl font-semibold">{value}</p><p className="mt-1 flex items-center gap-0.5 text-[10px] text-muted-foreground">{up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{trend}</p></div>)}</div>

    <section className="mt-6 rounded-2xl border border-border bg-panel p-4">
      <div className="mb-3 flex items-center gap-2"><AlfieMark /><h2 className="text-sm font-semibold">Ask Alfie about your policies...</h2></div>
      <AlfieComposer value={prompt} onChange={setPrompt} onSend={ask} placeholder="Ask Alfie about your policies..." />
      <div className="mt-3 flex flex-wrap gap-2">{examples.map((ex) => <Button key={ex} variant="secondary" size="sm" className="h-auto whitespace-normal py-1.5 text-left font-normal" onClick={() => ask(ex)}><Sparkle className="size-3 shrink-0 text-primary" />{ex}</Button>)}</div>
      {thinking ? <p className="mt-4 animate-pulse text-xs text-muted-foreground">Policy Agent is reviewing the portfolio…</p> : null}
      {answers.map((a, i) => <div key={i} className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3"><p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">You:</span> {a.prompt}</p><button aria-label="Dismiss" onClick={() => setAnswers((x) => x.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-foreground"><X className="size-3.5" /></button></div>
        {a.files.length ? <div className="mt-2 flex flex-wrap gap-2">{a.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div> : null}
        <p className="mt-3 text-sm">{a.intro}</p>
        <div className="mt-3 divide-y divide-border rounded-lg border border-border">{a.rows.map((x) => <Link key={x.id} to="/policy/$policyId" params={{ policyId: x.id }} className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-secondary"><span className="font-semibold">{x.id}</span><span className="text-muted-foreground">{x.holder} · {x.line}</span><span className="ml-auto hidden sm:inline">Exp. {x.expiration}</span><PolicyStatusBadge status={x.status} /></Link>)}</div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{a.note}</p>
      </div>)}
    </section>

    <section className="mt-8">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Policy portfolio</h2><span className="text-xs text-muted-foreground">{filtered.length} policies</span></div>
      <div className="scrollbar-none mt-3 flex gap-1 overflow-x-auto">{(["All", ...policyStatuses] as const).map((s) => <Button key={s} size="sm" variant={tab === s ? "soft" : "ghost"} onClick={() => setTab(s)} className={tab === s ? "text-foreground" : ""}>{s}</Button>)}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        <select aria-label="Line of business" className={sel} value={line} onChange={(e) => setLine(e.target.value)}><option value="">Line of business: Any</option>{uniq("line").map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Policyholder" className={sel} value={holder} onChange={(e) => setHolder(e.target.value)}><option value="">Policyholder: Any</option>{uniq("holder").map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Effective date" className={sel} value={eff} onChange={(e) => setEff(e.target.value)}><option value="">Effective: Any year</option>{[...new Set(rows.map((r) => year(r.effectiveISO)))].map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Expiration date" className={sel} value={exp} onChange={(e) => setExp(e.target.value)}><option value="">Expiration: Any year</option>{[...new Set(rows.map((r) => year(r.expirationISO)))].map((x) => <option key={x}>{x}</option>)}</select>
        <select aria-label="Premium range" className={sel} value={range} onChange={(e) => setRange(e.target.value)}><option value="">Premium: Any</option><option value="lt10">Under $10K</option><option value="10to100">$10K – $100K</option><option value="gt100">Over $100K</option></select>
        <select aria-label="Assigned team" className={sel} value={team} onChange={(e) => setTeam(e.target.value)}><option value="">Team: Any</option>{uniq("team").map((x) => <option key={x}>{x}</option>)}</select>
        {anyFilter ? <Button size="sm" variant="ghost" onClick={() => { setTab("All"); setLine(""); setHolder(""); setEff(""); setExp(""); setRange(""); setTeam(""); setSearch(""); }}>Clear filters</Button> : null}
      </div>
      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[960px] text-left text-sm">
        <thead><tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">{columns.map(([h, k]) => <th key={h} className="px-4 py-3 font-medium"><button className="inline-flex items-center gap-1 uppercase hover:text-foreground" onClick={() => setSort((s) => ({ key: k, dir: s.key === k ? (s.dir === 1 ? -1 : 1) : 1 }))} aria-label={`Sort by ${h}`}>{h}{sort.key === k ? sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : null}</button></th>)}</tr></thead>
        <tbody>{filtered.map((x) => <tr key={x.id} onClick={() => navigate({ to: "/policy/$policyId", params: { policyId: x.id } })} className="cursor-pointer border-b border-border last:border-0 hover:bg-secondary/60">
          <td className="px-4 py-3"><Link to="/policy/$policyId" params={{ policyId: x.id }} onClick={(e) => e.stopPropagation()} className="font-semibold hover:text-primary">{x.id}</Link></td>
          <td className="px-4 py-3">{x.holder}</td><td className="px-4 py-3 text-muted-foreground">{x.line}</td><td className="px-4 py-3 text-muted-foreground">{x.coverage}</td><td className="px-4 py-3 tabular-nums">{dollars(x.premium)}</td><td className="px-4 py-3"><PolicyStatusBadge status={x.status} /></td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{x.effective}</td><td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{x.expiration}</td>
        </tr>)}{filtered.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No policies match these filters.</td></tr> : null}</tbody>
      </table></div>
    </section>

    <Dialog open={newOpen} onOpenChange={setNewOpen}><DialogContent><DialogHeader><DialogTitle>Create policy</DialogTitle><DialogDescription>Start a policy from an approved underwriting outcome. It will be created as Pending Issuance until an authorized user issues it.</DialogDescription></DialogHeader>
      <div className="grid gap-3">
        <label className="text-xs font-medium">Policyholder<input value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring" /></label>
        <label className="text-xs font-medium">Annual premium ($)<input value={form.premium} onChange={(e) => setForm({ ...form, premium: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring" /></label>
        <label className="text-xs font-medium">Line of business<select value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">{["Commercial Property", "Commercial Auto", "General Liability", "Cyber", "Personal Auto", "Homeowners"].map((x) => <option key={x}>{x}</option>)}</select></label>
      </div>
      <DialogFooter><Button variant="secondary" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={create}>Create policy</Button></DialogFooter></DialogContent></Dialog>
  </div></AppShell>;
}
