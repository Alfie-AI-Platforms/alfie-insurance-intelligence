import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Bot, Check, ChevronDown, Circle, Download, FileText, Lock, MoreHorizontal, Paperclip, Share2, ShieldAlert, Sparkle, Upload, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlfieComposer, AttachmentChip, FileGlyph, fileExt, type Attachment } from "@/components/alfie-composer";
import { PolicyStatusBadge } from "@/components/policy-badges";
import { can, dollars, getPolicy, policies, rolePermissions, seedPolicyAudit, shortDollars, type Permission, type PolicyEvent, type Role } from "@/lib/policy-data";

export const Route = createFileRoute("/policy/$policyId")({
  head: ({ params }) => ({ meta: [{ title: `Policy ${params.policyId} | Alfie Insurance` }, { name: "description", content: `Coverage, documents, servicing, and history for policy ${params.policyId}.` }, { property: "og:title", content: `Policy ${params.policyId} | Alfie Insurance` }, { property: "og:description", content: "AI-assisted policy workspace with coverage intelligence, endorsements, renewals, and a full audit trail." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: PolicyWorkspace,
});

type Doc = { id: string; name: string; label: string; date: string; summary: string; isImage?: boolean; url?: string | undefined };
type Reply = { intro: string; items?: string[]; fields?: [string, string][]; next?: string; sources?: string[] | undefined; note?: string; agents?: string[] };
type Msg = { id: string; role: "user" | "alfie"; text?: string; files?: Attachment[]; reply?: Reply; actions?: string[]; attached?: boolean };
type Tab = "conversation" | "details" | "operations" | "history";
type Coverage = { name: string; limit: number; deductible: string; status: string };

const roles = Object.keys(rolePermissions) as Role[];
const seedDocs: Doc[] = [
  { id: "p1", name: "declarations_POL-28492.pdf", label: "Declarations Page", date: "Oct 02, 2026", summary: "Named insured Northstar Manufacturing Inc. Policy period Nov 01, 2026 – Nov 01, 2027. Annual premium $185,000. TIV $8.5M." },
  { id: "p2", name: "policy_contract_CP-0010.pdf", label: "Full Policy Contract", date: "Oct 02, 2026", summary: "ISO CP 00 10 Building and Personal Property Coverage Form with CP 10 30 Causes of Loss – Special Form." },
  { id: "p3", name: "coverage_schedule_v3.xlsx", label: "Coverage Schedule", date: "Oct 22, 2026", summary: "4 locations. Building $5.0M, BI $2.0M (72-hr waiting period), Equipment Breakdown $1.5M." },
  { id: "p4", name: "endorsements_END-0412.pdf", label: "Endorsements", date: "Oct 15, 2026", summary: "END-0412: Equipment Breakdown limit $1.0M → $1.5M, effective Oct 15, 2026. Premium +$5,400." },
  { id: "p5", name: "risk_inspection_2026.pdf", label: "Inspection Report", date: "Aug 18, 2026", summary: "Not yet attached to the policy record. Recommends relocating exterior pallet storage ≥ 15 m from Building 1." },
  { id: "p6", name: "renewal_package_2027.docx", label: "Renewal Documents", date: "Draft", summary: "Draft renewal package. Exposure update and SOV refresh outstanding." },
  { id: "p7", name: "proof_of_insurance.pdf", label: "Proof of Insurance", date: "Oct 02, 2026", summary: "Certificate of insurance issued to Apex Insurance Brokers." },
];
const seedCoverage: Coverage[] = [
  { name: "Building Coverage", limit: 5_000_000, deductible: "$25,000", status: "Active" },
  { name: "Business Interruption", limit: 2_000_000, deductible: "72-hour waiting period", status: "Active" },
  { name: "Equipment Breakdown", limit: 1_500_000, deductible: "$10,000", status: "Active" },
];
const exclusions = ["Flood and surface water (unless endorsed)", "Earth movement", "Wear and tear, rust, corrosion", "Pollutant clean-up above $25,000 sublimit", "Cyber incident and data loss"];
const conditions = ["Protective safeguards: automatic sprinklers must be maintained (P-1)", "80% coinsurance on building coverage", "Hot work permit program required at manufacturing locations", "Vacancy: coverage reduced after 60 consecutive days"];
const lifecycle = ["Underwriting Approved", "Policy Issued", "Coverage Activated", "Policy Servicing", "Renewal Preparation", "Renewal Review", "Renewed / Expired"];
const LIFE_NOW = 4;
const endorsementTimeline = ["Change Requested", "Information Review", "Underwriting Review", "Approval", "Endorsement Issued", "Policy Updated"];
const endorsementSteps = ["Select Policy", "Describe Requested Change", "Review Required Information", "Assess Coverage and Premium Impact", "Prepare Endorsement", "Human Review / Approval", "Confirm Change"];
const prompts = ["Summarize this policy.", "What exactly does this policy cover?", "What are the exclusions?", "What is the deductible?", "Compare the current policy with its previous version.", "Prepare an endorsement to add a new location.", "When does this policy renew?", "Prepare a renewal summary.", "Are there any outstanding policy changes?", "Generate proof of insurance.", "Find inconsistencies in the policy documents."];
const detailTabs = ["Overview", "Coverage", "Insured Parties", "Insured Assets", "Documents", "Endorsements", "Renewals", "Billing", "History"] as const;
type DetailTab = (typeof detailTabs)[number];

const SRC = ["Policy Schedule", "Declarations Page", "Inspection Report", "Endorsement History"];
function replyFor(q: string, files: Attachment[], cov: Coverage[]): { reply: Reply; actions: string[] } {
  const p = q.toLowerCase();
  if (files.length) {
    const imgs = files.filter((f) => f.isImage);
    if (imgs.length === files.length) return { reply: { intro: `I reviewed the ${imgs.length === 1 ? "image" : `${imgs.length} images`} against the policy record.`, items: ["The building exterior appears consistent with Location 1 in the coverage schedule.", "Exterior storage visible along the north wall may conflict with the inspection recommendation.", "Sprinkler equipment and roof condition cannot be verified from these images."], note: "Visual observations require verification through inspection or broker confirmation before any policy change.", sources: imgs.map((f) => f.name) }, actions: ["View Differences", "Ask Follow-up"] };
    return { reply: { intro: "I reviewed the uploaded documents against the existing policy record. I identified two differences:", items: ["The updated property schedule contains a new location that is not currently listed on the policy.", "The requested equipment value differs from the amount in the existing coverage schedule."], next: "Prepare an endorsement for underwriter review.", sources: files.map((f) => f.name), note: "Uploaded files are used in this conversation only and have not changed the policy record." }, actions: ["View Differences", "Prepare Endorsement", "Ask Follow-up"] };
  }
  if (p.includes("cover") && !p.includes("proof")) return { reply: { intro: "Coverage details:", fields: cov.map((c) => [c.name, `${dollars(c.limit)} · ${c.deductible}`]), note: "Causes of Loss – Special Form (open perils) subject to exclusions and conditions.", sources: ["Coverage Schedule", "Full Policy Contract"] }, actions: ["Review Coverage", "Ask Follow-up"] };
  if (p.includes("exclusion")) return { reply: { intro: "Key exclusions:", items: exclusions, sources: ["Full Policy Contract §B", "CP 10 30"] }, actions: ["Review Coverage", "Ask Follow-up"] };
  if (p.includes("deductible")) return { reply: { intro: "Deductibles by coverage:", fields: cov.map((c) => [c.name, c.deductible]), sources: ["Declarations Page", "Coverage Schedule"] }, actions: ["Review Coverage", "Ask Follow-up"] };
  if (p.includes("previous version") || p.includes("compare")) return { reply: { intro: "Comparing v3 (current, Oct 15, 2026) with v2 (Oct 02, 2026):", fields: [["Equipment Breakdown", "$1,000,000 → $1,500,000"], ["Annual premium", "$179,600 → $185,000"], ["Endorsement", "END-0412 added"], ["Other coverages", "No change"]], note: "Previous versions are preserved and viewable in History.", sources: ["Endorsement History", "Policy record v2, v3"] }, actions: ["Compare Versions", "Ask Follow-up"] };
  if (p.includes("endorsement") && p.includes("location")) return { reply: { intro: "I've started an endorsement to add a new location. Information still required:", items: ["Address and construction type for 220 Industrial Pkwy", "Building value and contents value", "Fire protection / sprinkler details", "Requested effective date"], note: "Adding a location changes risk, so the Underwriting Agent will be engaged. Premium impact will be assessed by the Pricing and Finance Agents.", agents: ["Underwriting Agent", "Pricing Agent", "Finance Agent"], sources: ["Endorsement request (Oct 28)", "Coverage Schedule"] }, actions: ["Prepare Endorsement", "Ask Follow-up"] };
  if (p.includes("renewal summary")) return { reply: { intro: "Renewal summary (draft):", fields: [["Renewal date", "November 1, 2027"], ["Current premium", "$185,000"], ["Proposed premium", "$196,100 (+6.0%)"], ["Coverage changes", "Add 220 Industrial Pkwy (pending)"], ["Outstanding", "Updated SOV, 2026 inspection report"]], next: "Request updated information from the broker.", sources: ["Renewal Documents", "Loss Runs", "Pricing Agent"], agents: ["Pricing Agent"] }, actions: ["Review Renewal", "Ask Follow-up"] };
  if (p.includes("renew")) return { reply: { intro: "This policy renews on November 1, 2027. Renewal preparation is in progress.", fields: [["Days to renewal", "363"], ["Renewal status", "Preparation"], ["Outstanding items", "2"]], sources: ["Declarations Page", "Renewal calendar"] }, actions: ["Review Renewal", "Ask Follow-up"] };
  if (p.includes("outstanding")) return { reply: { intro: "1 outstanding policy change:", fields: [["Request", "Add location 220 Industrial Pkwy"], ["Requested by", "Apex Insurance Brokers, Oct 28"], ["Stage", "Information Review"], ["Approval", "Underwriting review required"]], sources: ["Endorsement History"] }, actions: ["Prepare Endorsement", "Ask Follow-up"] };
  if (p.includes("proof")) return { reply: { intro: "Proof of insurance is ready for review:", fields: [["Certificate", "COI-28492-004"], ["Holder", "Apex Insurance Brokers"], ["Coverages shown", "Building, BI, Equipment Breakdown"], ["Valid through", "November 1, 2027"]], note: "Draft only — confirm before issuing to a third party.", sources: ["Declarations Page"] }, actions: ["Ask Follow-up"] };
  if (p.includes("inconsisten")) return { reply: { intro: "I found 2 inconsistencies across the policy documents:", items: ["Declarations list 4 locations; the broker's latest SOV lists 5.", "Coverage schedule shows Equipment Breakdown $1.5M; the proof of insurance still shows $1.0M."], next: "Reissue proof of insurance and resolve the location count via endorsement.", sources: ["Declarations Page", "Coverage Schedule", "Proof of Insurance"] }, actions: ["View Differences", "Prepare Endorsement"] };
  return { reply: { intro: "This is an active commercial property policy for Northstar Manufacturing Inc.", fields: [["Policy Number", "POL-28492"], ["Effective Date", "November 1, 2026"], ["Expiration Date", "November 1, 2027"], ["Annual Premium", "$185,000"], ["Total Insured Value", "$8.5M"], ["Coverage", "Commercial Property · Business Interruption · Equipment Breakdown"]], items: ["The policy's next renewal is approaching.", "The latest inspection report has not been added to the policy record.", "One insured location has a pending mid-term change request."], next: "Review the outstanding location change before renewal preparation.", sources: SRC }, actions: ["Review Coverage", "Compare Versions", "Prepare Endorsement", "Ask Follow-up"] };
}

function PolicyWorkspace() {
  const { policyId } = Route.useParams();
  const pol = getPolicy(policyId) ?? { ...policies[1]!, id: policyId };
  const [role, setRole] = useState<Role>("Policy Administrator");
  const [tab, setTab] = useState<Tab>("conversation");
  const [detail, setDetail] = useState<DetailTab>("Overview");
  const [messages, setMessages] = useState<Msg[]>([{ id: "m0", role: "alfie", reply: { intro: "I've loaded the policy record and its available documentation. I can help you understand coverage, review policy terms, compare versions, prepare endorsements, monitor renewal dates, and manage policy servicing." } }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState<Attachment[]>([]);
  const [docs, setDocs] = useState(seedDocs);
  const [docsOpen, setDocsOpen] = useState(true);
  const [preview, setPreview] = useState<Doc | null>(null);
  const [confirm, setConfirm] = useState<Msg | null>(null);
  const [audit, setAudit] = useState<PolicyEvent[]>(seedPolicyAudit);
  const [coverage, setCoverage] = useState(seedCoverage);
  const [premium, setPremium] = useState(pol.premium);
  const [version, setVersion] = useState(3);
  const [endStep, setEndStep] = useState(0);
  const [endChange, setEndChange] = useState("Increase Building Coverage limit to $6,000,000");
  const [endApproved, setEndApproved] = useState(false);
  const [issued, setIssued] = useState(pol.status !== "Pending Issuance");
  const [cancelReq, setCancelReq] = useState<"" | "prepared" | "submitted">("");
  const [notice, setNotice] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, thinking]);

  const allowed = (p: Permission) => can(role, p);
  const now = () => new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
  const log = (e: Omit<PolicyEvent, "time">) => setAudit((a) => [{ time: now(), ...e }, ...a]);
  const flash = (t: string) => { setNotice(t); setTimeout(() => setNotice(""), 3500); };
  const say = (reply: Reply, actions?: string[]) => setMessages((m) => [...m, { id: crypto.randomUUID(), role: "alfie", reply, ...(actions ? { actions } : {}) }]);
  const deny = (what: string) => flash(`${role} cannot ${what}. This action requires additional permission.`);

  const send = (text: string, files: Attachment[] = []) => {
    const q = text || (files.length ? "Analyze these attachments." : "");
    if (!q) return;
    setInput(""); setPending([]); setTab("conversation");
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q, files }]);
    if (files.length) log({ actor: "Jane Doe", actorType: "User", action: "Documents uploaded to conversation", source: files.map((f) => f.name).join(", "), approval: "Not required", next: "Conversation only" });
    setThinking(true);
    setTimeout(() => {
      const { reply, actions } = replyFor(q, files, coverage);
      say(reply, actions);
      log({ actor: "Alfie · Policy Agent", actorType: "Alfie", action: "Alfie analysis performed", source: reply.sources?.join(", ") ?? "Policy record", approval: "Not required" });
      setThinking(false);
    }, 900);
  };

  const runAction = (a: string) => {
    if (a === "Review Coverage") { setTab("details"); setDetail("Coverage"); return; }
    if (a === "Compare Versions" || a === "View Differences") { setTab("details"); setDetail("History"); return; }
    if (a === "Prepare Endorsement") { if (!allowed("prepare")) return deny("prepare endorsements"); setTab("operations"); setEndStep(1); return; }
    if (a === "Review Renewal") { setTab("details"); setDetail("Renewals"); return; }
    if (a === "Ask Follow-up") { document.querySelector<HTMLTextAreaElement>("textarea")?.focus(); }
  };

  const approveEndorsement = () => {
    if (!allowed("approveEndorsement")) return deny("approve endorsements");
    setEndApproved(true); setEndStep(6);
    log({ actor: "Jane Doe", actorType: "User", action: "Endorsement approved", prev: "Building $5,000,000", next: "Building $6,000,000", source: "END-0418", approval: "Approved" });
  };
  const confirmEndorsement = () => {
    setCoverage((c) => c.map((x) => (x.name === "Building Coverage" ? { ...x, limit: 6_000_000 } : x)));
    setPremium((p) => p + 8500); setVersion((v) => v + 1);
    log({ actor: "System", actorType: "System", action: `Coverage changed (v${version + 1})`, prev: "Building $5,000,000", next: "Building $6,000,000", source: "END-0418", approval: "Approved" });
    log({ actor: "Finance Agent", actorType: "Alfie", action: "Premium adjusted", prev: dollars(premium), next: dollars(premium + 8500), source: "Pricing Agent · END-0418", approval: "Approved" });
    setEndStep(0); setEndApproved(false);
    flash(`Endorsement END-0418 applied. Policy v${version + 1} created; v${version} preserved in History.`);
  };
  const attachToPolicy = (msg: Msg) => {
    const files = msg.files ?? [];
    setDocs((d) => [...d, ...files.map((f) => ({ id: f.id, name: f.name, label: f.isImage ? "Uploaded image" : fileExt(f.name), date: "Today", summary: "Added from conversation by Jane Doe.", isImage: f.isImage, url: f.url }))]);
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, attached: true } : x)));
    log({ actor: "Jane Doe", actorType: "User", action: "Documents uploaded", next: files.map((f) => f.name).join(", "), source: "Conversation", approval: "Not required" });
    setConfirm(null); flash(`${files.length} file${files.length > 1 ? "s" : ""} attached to the policy record.`);
  };
  const download = (d: Doc) => { const a = document.createElement("a"); a.href = d.url ?? URL.createObjectURL(new Blob([`${d.label}\n\n${d.summary}`], { type: "text/plain" })); a.download = d.url ? d.name : `${d.name}.txt`; a.click(); };
  const toAttachment = (d: Doc): Attachment => ({ id: d.id, name: d.name, size: 180000, type: "", isImage: !!d.isImage, url: d.url });

  const panel = <aside className="scrollbar-thin hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-border bg-panel p-5 xl:flex">
    <h2 className="text-sm font-semibold">Policy Context</h2>
    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
      {([["Policy Number", pol.id], ["Policyholder", pol.holder], ["Line of Business", pol.line], ["Effective Date", "November 1, 2026"], ["Expiration Date", "November 1, 2027"], ["Annual Premium", dollars(premium)], ["Total Insured Value", shortDollars(pol.tiv)], ["Assigned Team", pol.team], ["Version", `v${version}`]] as const).map(([k, v]) => <div key={k}><dt className="text-[10px] text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>)}
      <div><dt className="text-[10px] text-muted-foreground">Policy Status</dt><dd className="mt-1"><PolicyStatusBadge status={issued && pol.status === "Pending Issuance" ? "Active" : pol.status} /></dd></div>
    </dl>
    <section className="mt-6 border-t border-border pt-5">
      <button onClick={() => setDocsOpen((v) => !v)} aria-expanded={docsOpen} className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Policy Documents · {docs.length}<ChevronDown className={`size-3.5 transition-transform ${docsOpen ? "" : "-rotate-90"}`} /></button>
      {docsOpen ? <div className="mt-3 space-y-1.5">{docs.map((d) => <button key={d.id} onClick={() => setPreview(d)} className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-background p-2 text-left hover:bg-secondary">{d.isImage && d.url ? <img src={d.url} alt={d.label} className="size-8 rounded-md object-cover" /> : <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FileGlyph name={d.name} /></div>}<div className="min-w-0 flex-1"><p className="text-xs font-medium">{d.label}</p><p className="truncate text-[10px] text-muted-foreground">{fileExt(d.name)} · {d.name}</p></div><span className="shrink-0 text-[10px] text-muted-foreground">{d.date}</span></button>)}</div> : null}
    </section>
    <Section title="Policy Lifecycle">
      <Timeline steps={lifecycle} current={LIFE_NOW} />
    </Section>
    {endStep > 0 || audit.some((e) => e.approval === "Pending") ? <Section title="Endorsement in progress · END-0418">
      <Timeline steps={endorsementTimeline} current={endStep >= 6 ? 4 : endStep >= 5 ? 3 : endStep >= 3 ? 2 : 1} />
    </Section> : null}
    <Section title="Your access">
      <p className="mb-2 text-xs font-medium">{role}</p>
      <div className="flex flex-wrap gap-1">{(["view", "analyze", "prepare", "edit", "approveEndorsement", "issue", "approveRenewal", "cancel", "reinstate", "viewFinancials"] as const).map((p) => <span key={p} className={`rounded-full px-2 py-0.5 text-[10px] ${allowed(p) ? "bg-status-active text-status-active-foreground" : "bg-secondary text-muted-foreground line-through"}`}>{permLabel[p]}</span>)}</div>
    </Section>
  </aside>;

  return <AppShell rightPanel={panel}><div className="flex h-full flex-col">
    <div className="border-b border-border px-5 py-4 lg:px-8">
      <Link to="/policy" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" />Policy</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-semibold">Policy {pol.id}</h1><p className="mt-1 text-sm text-muted-foreground">{pol.holder} · {pol.line}</p><div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">Status <PolicyStatusBadge status={issued && pol.status === "Pending Issuance" ? "Active" : pol.status} /></div></div>
        <div className="flex items-center gap-1">
          <label className="mr-1 flex items-center gap-1.5 text-[11px] text-muted-foreground"><Users className="size-3.5" /><select aria-label="Viewing as role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground">{roles.map((r) => <option key={r}>{r}</option>)}</select></label>
          <Button variant="ghost" size="sm" onClick={() => { void navigator.clipboard?.writeText(window.location.href); flash("Link copied to clipboard."); }}><Share2 className="size-3.5" />Share</Button>
          <Button variant="ghost" size="sm" onClick={() => { download({ id: "x", name: `${pol.id}-v${version}`, label: `Policy ${pol.id} v${version}`, date: "", summary: `${pol.holder} · ${pol.line}\nPremium ${dollars(premium)}\n${coverage.map((c) => `${c.name}: ${dollars(c.limit)} / ${c.deductible}`).join("\n")}` }); log({ actor: "Jane Doe", actorType: "User", action: "Exported policy", source: `Policy v${version}`, approval: "Not required" }); }}><Download className="size-3.5" />Export</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label="More"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setTab("history")}>View history</DropdownMenuItem><DropdownMenuItem onSelect={() => setTab("operations")}>Policy operations</DropdownMenuItem><DropdownMenuItem onSelect={() => send("Generate proof of insurance.")}>Generate proof of insurance</DropdownMenuItem><DropdownMenuItem asChild><Link to="/policy">Back to portfolio</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="mt-4 flex gap-1 overflow-x-auto">{(["conversation", "details", "operations", "history"] as const).map((t) => <Button key={t} size="sm" variant={tab === t ? "soft" : "ghost"} className={tab === t ? "text-foreground" : ""} onClick={() => setTab(t)}>{t === "conversation" ? "Alfie conversation" : t === "details" ? "Policy details" : t === "operations" ? "Policy Operations" : `History · ${audit.length}`}</Button>)}</div>
    </div>
    {notice ? <div className="mx-5 mt-3 rounded-lg border border-border bg-secondary px-3 py-2 text-xs lg:mx-8">{notice}</div> : null}

    {tab === "history" ? <div className="flex-1 px-5 py-5 lg:px-8"><p className="mb-3 text-xs text-muted-foreground">Every change creates a new version or dated transaction. Previous versions and their effective dates are preserved.</p>
      <div className="mb-4 flex flex-wrap gap-2">{Array.from({ length: version }, (_, i) => version - i).map((v) => <span key={v} className={`rounded-full border border-border px-2.5 py-1 text-[11px] ${v === version ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground"}`}>v{v}{v === version ? " · current" : v === 1 ? " · issued Oct 02" : ""}</span>)}</div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">{["Timestamp", "Actor", "Action", "Previous Value", "New Value", "Source", "Approval"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{audit.map((e, i) => <tr key={i} className="border-b border-border last:border-0"><td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{e.time}</td><td className="px-3 py-2.5"><span className="flex items-center gap-1.5 font-medium">{e.actorType === "Alfie" ? <Bot className="size-3.5 text-primary" /> : null}{e.actor}</span></td><td className="px-3 py-2.5">{e.action}</td><td className="px-3 py-2.5 text-muted-foreground">{e.prev ?? "—"}</td><td className="px-3 py-2.5">{e.next ?? "—"}</td><td className="px-3 py-2.5 text-muted-foreground">{e.source}</td><td className="px-3 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] ${e.approval === "Approved" ? "bg-status-active text-status-active-foreground" : e.approval === "Pending" ? "bg-status-paused text-status-paused-foreground" : "bg-secondary text-muted-foreground"}`}>{e.approval}</span></td></tr>)}</tbody></table></div></div>

    : tab === "details" ? <div className="flex-1 px-5 py-5 lg:px-8"><div className="mx-auto max-w-4xl">
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-border pb-2">{detailTabs.map((d) => <Button key={d} size="sm" variant={detail === d ? "soft" : "ghost"} className={detail === d ? "text-foreground" : ""} onClick={() => setDetail(d)}>{d}</Button>)}</div>
      <div className="mt-5 text-sm">{detail === "Overview" ? <KV rows={[["Policyholder", pol.holder], ["Line / form", `${pol.line} · CP 00 10 / CP 10 30`], ["Policy period", "Nov 01, 2026 – Nov 01, 2027"], ["Annual premium", dollars(premium)], ["Total insured value", shortDollars(pol.tiv)], ["Current version", `v${version}`], ["Broker / producer", "Apex Insurance Brokers"]]} />
        : detail === "Coverage" ? <><div className="overflow-hidden rounded-xl border border-border"><table className="w-full text-left text-xs"><thead><tr className="border-b border-border bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground">{["Coverage", "Limit", "Deductible", "Status"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{coverage.map((c) => <tr key={c.name} className="border-b border-border last:border-0"><td className="px-3 py-2.5 font-medium">{c.name}</td><td className="px-3 py-2.5 tabular-nums">{dollars(c.limit)}</td><td className="px-3 py-2.5">{c.deductible}</td><td className="px-3 py-2.5 text-positive">{c.status}</td></tr>)}</tbody></table></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2"><List title="Exclusions" items={exclusions} /><List title="Special conditions" items={conditions} /></div></>
        : detail === "Insured Parties" ? <KV rows={pol.personal ? [["Primary policyholder", pol.holder], ["Named insureds", `${pol.holder}, Sarah Brown`], ["Listed drivers", "Michael Brown, Sarah Brown"], ["Loss payee", "TD Auto Finance"], ["Broker / producer", "Apex Insurance Brokers"]] : [["Primary policyholder", pol.holder], ["Named insureds", "Northstar Manufacturing Inc.; Northstar Fabrication Ltd."], ["Additional insureds", "Bayview Industrial REIT (landlord, Location 2)"], ["Mortgagee / loss payee", "Royal Commercial Bank"], ["Broker / producer", "Apex Insurance Brokers · Lisa Moreno"]]} />
        : detail === "Insured Assets" ? (pol.personal ? <KV rows={[["Vehicle 1", "2023 Toyota Camry SE · VIN 4T1G11AK…8821"], ["Vehicle 2", "2021 Honda CR-V · VIN 2HKRW2H8…4410"], ["Garaging address", "48 Roncesvalles Ave, Toronto, ON"]]} /> : <div className="overflow-hidden rounded-xl border border-border"><table className="w-full text-left text-xs"><thead><tr className="border-b border-border bg-secondary/50 text-[10px] uppercase tracking-wider text-muted-foreground">{["Location", "Building", "Construction", "Building value", "Equipment"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{[["1 · 1450 Northstar Dr, Mississauga", "Main plant", "Non-combustible", "$2.6M", "CNC & press line $900K"], ["2 · 1460 Northstar Dr, Mississauga", "Fabrication", "Non-combustible", "$1.1M", "Welding cells $380K"], ["3 · 88 Commerce Rd, Brampton", "Warehouse", "Joisted masonry", "$0.8M", "Racking $70K"], ["4 · 12 King St W, Toronto", "Head office", "Fire resistive", "$0.5M", "IT equipment $150K"]].map((r) => <tr key={r[0]} className="border-b border-border last:border-0">{r.map((c, i) => <td key={i} className={`px-3 py-2.5 ${i === 0 ? "font-medium" : ""}`}>{c}</td>)}</tr>)}</tbody></table></div>)
        : detail === "Documents" ? <div className="grid gap-2 sm:grid-cols-2">{docs.map((d) => <button key={d.id} onClick={() => setPreview(d)} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left hover:bg-secondary"><FileGlyph name={d.name} className="size-5 text-muted-foreground" /><div className="min-w-0"><p className="text-xs font-medium">{d.label}</p><p className="truncate text-[10px] text-muted-foreground">{fileExt(d.name)} · {d.name} · {d.date}</p></div></button>)}</div>
        : detail === "Endorsements" ? <KV rows={[["END-0412 · Oct 15, 2026", "Equipment Breakdown $1.0M → $1.5M · Approved · +$5,400"], ["END-0418 · Requested Oct 28", "Add location 220 Industrial Pkwy · Pending underwriting review"]]} />
        : detail === "Renewals" ? <><KV rows={[["Upcoming renewal date", "November 1, 2027"], ["Current premium", dollars(premium)], ["Proposed renewal premium", dollars(Math.round(premium * 1.06))], ["Coverage changes", "Add Location 5 (pending endorsement)"], ["Outstanding requirements", "Updated SOV · 2026 inspection report"], ["Renewal status", "Preparation"]]} />
          <div className="mt-4 flex flex-wrap gap-2">{["Summarize renewal history.", "Identify coverage changes.", "Compare current and proposed terms.", "Identify missing documents.", "Prepare renewal recommendations.", "Prepare renewal communications."].map((q) => <Button key={q} size="sm" variant="secondary" className="font-normal" onClick={() => send(q.includes("history") || q.includes("recommend") ? "Prepare a renewal summary." : q.includes("missing") ? "Find inconsistencies in the policy documents." : q.includes("compare") ? "Compare the current policy with its previous version." : "Prepare a renewal summary.")}><Sparkle className="size-3 text-primary" />{q}</Button>)}</div></>
        : detail === "Billing" ? (allowed("viewFinancials") || role === "Policy Servicing Specialist" ? <KV rows={[["Billing plan", "Quarterly direct bill"], ["Annual premium", dollars(premium)], ["Paid to date", "$46,250 (Q1)"], ["Next installment", "$46,250 · Feb 01, 2027"], ["Outstanding balance", "$0"]]} /> : <Locked text="Billing details require the View financials permission." />)
        : <p className="text-xs text-muted-foreground">Full history is in the History tab. <Button size="sm" variant="link" onClick={() => setTab("history")}>Open history</Button></p>}</div>
    </div></div>

    : tab === "operations" ? <div className="flex-1 space-y-4 px-5 py-5 lg:px-8"><div className="mx-auto max-w-4xl space-y-4">
      <p className="text-xs text-muted-foreground">Viewing as <span className="font-semibold text-foreground">{role}</span>. Consequential actions require the matching permission and human approval. Alfie prepares; authorized people decide.</p>

      <Op title="A. Issue Policy" badge={issued ? "Issued" : "Pending issuance"}>
        <KV rows={[["Approved quote", "Q-10482-02 · approved by D. Cho, Oct 01"], ["Coverage", coverage.map((c) => c.name).join(", ")], ["Premium", dollars(premium)], ["Effective date", "November 1, 2026"], ["Policy documents", "Declarations, contract, schedule"]]} />
        <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => flash("Issuance review: all underwriting conditions satisfied.")}>Review Issuance</Button><Button size="sm" variant="secondary" disabled={!allowed("prepare")} onClick={() => { log({ actor: "Alfie · Policy Agent", actorType: "Alfie", action: "Policy documents generated", source: "Approved quote Q-10482-02", approval: "Not required" }); flash("Draft policy documents generated for review."); }}>Generate Policy Documents</Button><Gate ok={allowed("issue")} label="Issue Policy" need="Issue policy" onClick={() => { setIssued(true); log({ actor: "Jane Doe", actorType: "User", action: "Policy issued", next: "Active", source: "Q-10482-02", approval: "Approved" }); flash("Policy issued."); }} disabled={issued} /></div>
      </Op>

      <Op title="B. Endorsements" badge={endStep ? `Step ${endStep} of 7` : "Mid-term change"}>
        {endStep === 0 ? <><p className="text-xs text-muted-foreground">Add or remove insured assets, add locations, change limits or deductibles, add insured parties, or update policyholder information.</p><Gate ok={allowed("prepare")} label="Start endorsement" need="Prepare policy changes" onClick={() => setEndStep(1)} /></> : <>
          <ol className="mb-4 flex flex-wrap gap-1.5">{endorsementSteps.map((s, i) => <li key={s} className={`rounded-full px-2.5 py-1 text-[10px] ${i + 1 === endStep ? "bg-primary text-primary-foreground" : i + 1 < endStep ? "bg-status-active text-status-active-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}. {s}</li>)}</ol>
          {endStep === 1 ? <p className="text-sm">Policy <span className="font-semibold">{pol.id}</span> · {pol.holder} · v{version}</p>
          : endStep === 2 ? <label className="block text-xs font-medium">Requested change<select value={endChange} onChange={(e) => setEndChange(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-border bg-background px-2 text-sm">{["Increase Building Coverage limit to $6,000,000", "Add a new property location", "Update deductibles", "Add an insured party", "Remove an insured asset", "Update policyholder information"].map((x) => <option key={x}>{x}</option>)}</select></label>
          : endStep === 3 ? <List title="Required information (Alfie checked)" items={["Updated building valuation — received (appraisal Oct 2026)", "Sprinkler confirmation — on file", "Broker signed request — received Oct 28"]} />
          : endStep === 4 ? <><div className="grid gap-3 sm:grid-cols-3"><Stat k="Current Building Limit" v="$5,000,000" /><Stat k="Requested Building Limit" v="$6,000,000" /><Stat k="Estimated Premium Change" v="+$8,500" /></div><p className="mt-3 text-[11px] text-muted-foreground">Coordinated with Underwriting Agent (risk change), Pricing Agent and Finance Agent (premium impact).</p></>
          : endStep === 5 ? <div className="rounded-xl border border-border bg-secondary/40 p-3 text-xs">Endorsement END-0418 prepared: “{endChange}”. <span className="font-semibold text-warning">Pending approval — not yet applied to the policy.</span></div>
          : endStep === 6 ? <div className="space-y-3"><div className="rounded-xl border border-border p-3 text-xs">{endApproved ? <span className="font-semibold text-positive">Approved by Jane Doe. Ready to confirm.</span> : <span className="font-semibold text-warning">Awaiting human review / approval. Change has not been applied.</span>}</div>{!endApproved ? <Gate ok={allowed("approveEndorsement")} label="Approve endorsement" need="Approve endorsements" onClick={approveEndorsement} /> : null}</div>
          : <div className="space-y-2 text-xs"><p>Confirming will create policy <span className="font-semibold">v{version + 1}</span> effective today and preserve v{version}.</p><div className="grid gap-3 sm:grid-cols-2"><Stat k="Before" v={`Building $5,000,000 · ${dollars(premium)}`} /><Stat k="After" v={`Building $6,000,000 · ${dollars(premium + 8500)}`} /></div></div>}
          <div className="mt-4 flex gap-2"><Button size="sm" variant="ghost" onClick={() => setEndStep((s) => Math.max(0, s - 1))}><ArrowLeft className="size-3.5" />Back</Button>
            {endStep < 5 ? <Button size="sm" onClick={() => { if (endStep === 4) log({ actor: "Jane Doe", actorType: "User", action: "Endorsement requested", prev: "Building $5,000,000", next: "Building $6,000,000", source: "END-0418", approval: "Pending" }); setEndStep((s) => s + 1); }}>Continue<ArrowRight className="size-3.5" /></Button>
            : endStep === 5 ? <Button size="sm" onClick={() => setEndStep(6)}>Submit for approval<ArrowRight className="size-3.5" /></Button>
            : endStep === 6 ? <Button size="sm" disabled={!endApproved} onClick={() => setEndStep(7)}>Continue<ArrowRight className="size-3.5" /></Button>
            : <Button size="sm" onClick={confirmEndorsement}><Check className="size-3.5" />Confirm Change</Button>}</div>
        </>}
      </Op>

      <Op title="C. Renewals" badge="Preparation">
        <div className="grid gap-3 sm:grid-cols-3"><Stat k="Upcoming Renewal Date" v="Nov 1, 2027" /><Stat k="Current Premium" v={dollars(premium)} /><Stat k="Proposed Renewal Premium" v={dollars(Math.round(premium * 1.06))} /><Stat k="Coverage Changes" v="Add Location 5" /><Stat k="Outstanding Requirements" v="2 items" /><Stat k="Renewal Status" v="Preparation" /></div>
        <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => { setTab("details"); setDetail("Renewals"); }}>Review Renewal</Button><Button size="sm" variant="secondary" onClick={() => send("Prepare a renewal summary.")}>Prepare Renewal Summary</Button><Button size="sm" variant="secondary" disabled={!allowed("prepare")} onClick={() => { log({ actor: "Jane Doe", actorType: "User", action: "Renewal initiated", next: "Request sent for updated SOV", source: "Renewal workspace", approval: "Not required" }); flash("Draft request for updated information prepared for broker."); }}>Request Updated Information</Button><Gate ok={allowed("approveRenewal")} label="Prepare Renewal Offer" need="Approve renewals" onClick={() => { log({ actor: "Alfie · Policy Agent", actorType: "Alfie", action: "Renewal offer prepared", next: dollars(Math.round(premium * 1.06)), source: "Pricing Agent", approval: "Pending" }); flash("Renewal offer drafted. Human approval required before it is sent."); }} /></div>
      </Op>

      <Op title="D. Cancellation and Reinstatement" badge={cancelReq === "submitted" ? "Awaiting approval" : "None requested"}>
        <KV rows={[["Reason", "Insured request — sale of Location 3"], ["Requested effective date", "December 15, 2026"], ["Financial impact", "Pro-rata return premium approx. −$4,120 (Finance Agent)"], ["Required approvals", "Policy Administrator + Underwriting Manager"], ["Customer notification", "Notice to insured and broker, 30 days"]]} />
        <div className="mt-3 flex flex-wrap gap-2"><Gate ok={allowed("prepare") || allowed("cancel")} label={cancelReq ? "Request prepared" : "Prepare cancellation request"} need="Prepare policy changes" disabled={!!cancelReq} onClick={() => { setCancelReq("prepared"); flash("Cancellation request prepared. It has not been executed."); }} /><Gate ok={allowed("cancel")} label="Submit for approval" need="Cancel policy" disabled={cancelReq !== "prepared"} onClick={() => { setCancelReq("submitted"); log({ actor: "Jane Doe", actorType: "User", action: "Cancellation requested", prev: "Location 3 insured", next: "Location 3 removed Dec 15", source: "Cancellation workspace", approval: "Pending" }); }} /><Gate ok={allowed("reinstate")} label="Prepare reinstatement" need="Reinstate policy" onClick={() => flash("No lapse on record — reinstatement not applicable.")} /></div>
      </Op>
    </div></div>

    : <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 px-5 py-6 lg:px-8"><div className="mx-auto max-w-3xl space-y-6">
        {messages.map((m) => m.role === "user" ? <div key={m.id} className="flex flex-col items-end gap-2">
          {m.files?.length ? <><div className="flex flex-wrap justify-end gap-2">{m.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div><div className="flex items-center gap-2 text-[10px] text-muted-foreground"><Paperclip className="size-3" />{m.files.length} attachment{m.files.length > 1 ? "s" : ""} ready for analysis · Use in this Conversation{m.attached ? <span className="text-positive">· Attached to policy</span> : <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setConfirm(m)}><Upload className="size-3" />Attach to Policy</Button>}</div></> : null}
          <div className="max-w-[80%] rounded-2xl bg-ink px-4 py-2.5 text-sm text-ink-foreground">{m.text}</div>
        </div> : <div key={m.id} className="flex gap-3"><AlfieMark /><div className="min-w-0 flex-1 text-sm leading-6">
          {m.reply ? <ReplyView reply={m.reply} /> : null}
          {m.actions?.length ? <div className="mt-3 flex flex-wrap gap-2">{m.actions.map((a) => <Button key={a} size="sm" variant="secondary" onClick={() => runAction(a)}>{a}</Button>)}</div> : null}
          {m.id === "m0" ? <div className="mt-4 flex flex-wrap gap-2">{prompts.map((p) => <Button key={p} size="sm" variant="secondary" className="font-normal" onClick={() => send(p)}><Sparkle className="size-3 text-primary" />{p}</Button>)}</div> : null}
        </div></div>)}
        {thinking ? <div className="flex items-center gap-3 text-xs text-muted-foreground"><AlfieMark /><span className="animate-pulse">Policy Agent is reviewing the policy record…</span></div> : null}
        <div ref={endRef} />
      </div></div>
      <div className="sticky bottom-0 bg-background px-5 pb-5 pt-2 lg:px-8"><div className="mx-auto max-w-3xl"><AlfieComposer value={input} onChange={setInput} onSend={send} pending={pending} placeholder="Ask Alfie about this policy..." /><p className="mt-2 text-center text-[10px] text-muted-foreground">Alfie prepares policy changes. Issuance, endorsements, renewals, and cancellations require authorized human approval.</p></div></div>
    </div>}

    <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}><DialogContent className="max-w-xl">{preview ? <><DialogHeader><DialogTitle>{preview.label}</DialogTitle><DialogDescription>{fileExt(preview.name)} · {preview.name} · {preview.date}</DialogDescription></DialogHeader>
      {preview.isImage && preview.url ? <img src={preview.url} alt={preview.label} className="w-full rounded-lg" /> : <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm"><FileText className="mb-2 size-5 text-muted-foreground" />{preview.summary}</div>}
      <DialogFooter className="flex-wrap gap-2 sm:justify-start"><Button size="sm" variant="secondary" onClick={() => download(preview)}><Download className="size-3.5" />Download</Button><Button size="sm" variant="secondary" onClick={() => { const d = preview; setPreview(null); send(d.label === "Inspection Report" || d.label === "Proof of Insurance" ? "Find inconsistencies in the policy documents." : "Summarize this policy."); }}><Sparkle className="size-3.5" />Analyze with Alfie</Button><Button size="sm" variant="secondary" onClick={() => { const d = preview; setPending((p) => (p.some((x) => x.id === d.id) ? p : [...p, toAttachment(d)])); setPreview(null); setTab("conversation"); }}><Paperclip className="size-3.5" />Attach to Conversation</Button></DialogFooter></> : null}</DialogContent></Dialog>

    <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>Attach to policy record?</DialogTitle><DialogDescription>These files will be added to the permanent record for {pol.id} and logged in the policy history. The policy version itself does not change.</DialogDescription></DialogHeader>
      <div className="flex flex-wrap gap-2">{confirm?.files?.map((f) => <AttachmentChip key={f.id} file={f} />)}</div>
      <DialogFooter><Button variant="secondary" onClick={() => setConfirm(null)}>Use in this Conversation only</Button><Button onClick={() => confirm && attachToPolicy(confirm)}>Attach to Policy</Button></DialogFooter></DialogContent></Dialog>
  </div></AppShell>;
}

const permLabel: Record<Permission, string> = { view: "View", analyze: "Analyze", prepare: "Prepare changes", edit: "Edit details", approveEndorsement: "Approve endorsements", issue: "Issue", approveRenewal: "Approve renewals", cancel: "Cancel", reinstate: "Reinstate", viewFinancials: "View financials" };

function Gate({ ok, label, need, onClick, disabled }: { ok: boolean; label: string; need: string; onClick: () => void; disabled?: boolean }) {
  if (!ok) return <Button size="sm" variant="secondary" disabled title={`Permission required: ${need}`}><Lock className="size-3.5" />{label} · Permission required</Button>;
  return <Button size="sm" onClick={onClick} disabled={!!disabled}><ShieldAlert className="size-3.5" />{label}</Button>;
}
function Op({ title, badge, children }: { title: string; badge: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">{title}</h3><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{badge}</span></div>{children}</section>;
}
function KV({ rows }: { rows: (readonly [string, string])[] }) {
  return <dl className="divide-y divide-border rounded-xl border border-border">{rows.map(([k, v]) => <div key={k} className="grid grid-cols-[180px_1fr] gap-3 px-3 py-2 text-xs"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>;
}
function List({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h4><ul className="space-y-1.5 text-xs">{items.map((i) => <li key={i} className="flex gap-2"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />{i}</li>)}</ul></div>;
}
function Stat({ k, v }: { k: string; v: string }) {
  return <div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">{k}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>;
}
function Locked({ text }: { text: string }) {
  return <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 p-4 text-xs text-muted-foreground"><Lock className="size-4" />{text}</div>;
}
function Timeline({ steps, current }: { steps: string[]; current: number }) {
  return <ol className="space-y-0.5">{steps.map((s, i) => <li key={s} className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs ${i === current ? "bg-primary/10 font-semibold text-primary" : i < current ? "text-foreground" : "text-muted-foreground"}`}>{i < current ? <Check className="size-3.5 text-positive" /> : i === current ? <ChevronDown className="size-3.5 -rotate-90" /> : <Circle className="size-3" />}{s}{i === current ? <span className="ml-auto text-[10px] font-medium">Current</span> : null}</li>)}</ol>;
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-6 border-t border-border pt-5"><h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>{children}</section>;
}
function ReplyView({ reply }: { reply: Reply }) {
  return <div className="space-y-3 font-display text-[15px] leading-7">
    <p>{reply.intro}</p>
    {reply.fields ? <dl className="divide-y divide-border rounded-xl border border-border">{reply.fields.map(([k, v]) => <div key={k} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2 text-xs"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl> : null}
    {reply.items ? <>{reply.fields ? <p className="text-xs font-semibold">Items requiring attention:</p> : null}<ol className="list-decimal space-y-1.5 pl-5">{reply.items.map((i) => <li key={i}>{i}</li>)}</ol></> : null}
    {reply.note ? <p className="text-xs text-muted-foreground">{reply.note}</p> : null}
    {reply.next ? <p className="text-xs"><span className="text-muted-foreground">Recommended next step: </span><span className="font-semibold">{reply.next}</span></p> : null}
    {reply.agents ? <div className="flex flex-wrap items-center gap-1.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Coordinating with</span>{reply.agents.map((a) => <span key={a} className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"><Bot className="size-3" />{a}</span>)}</div> : null}
    {reply.sources ? <div className="flex flex-wrap items-center gap-1.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sources</span>{reply.sources.map((s) => <span key={s} className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px]">{s}</span>)}</div> : null}
  </div>;
}
