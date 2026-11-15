import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Bot, Check, ChevronDown, Circle, Download, FileText, HelpCircle, Lock, MoreHorizontal, Paperclip, Share2, ShieldAlert, Sparkle, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieChip, AlfieMark, AlfiePanelHeader, ReviewBar } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlfieComposer, AttachmentChip, FileGlyph, fileExt, type Attachment } from "@/components/alfie-composer";
import { SubmissionStatusBadge, UwPriorityBadge } from "@/components/uw-badges";
import { compactUsd, getSubmission, seedUwAudit, submissions, usd, type UwAuditEvent } from "@/lib/underwriting-data";
import property1 from "@/assets/property-1.jpg";

export const Route = createFileRoute("/underwriting/$submissionId")({
  head: ({ params }) => ({ meta: [{ title: `Submission ${params.submissionId} | Alfie Insurance` }, { name: "description", content: `Evaluate submission ${params.submissionId} with Alfie: evidence, appetite, pricing, and audit trail.` }, { property: "og:title", content: `Submission ${params.submissionId} | Alfie Insurance` }, { property: "og:description", content: "AI-assisted underwriting workspace with appetite, pricing, and human approval gates." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SubmissionWorkspace,
});

type Doc = { id: string; name: string; label: string; isImage: boolean; url?: string | undefined; size: string; summary: string };
type Reply = { intro: string; items?: string[]; fields?: [string, string][]; next?: string; appetite?: string; confidence?: string; sources?: string[] | undefined; note?: string };
type Msg = { id: string; role: "user" | "alfie"; text?: string; files?: Attachment[]; reply?: Reply; actions?: string[]; attached?: boolean };
type Tab = "file" | "pricing" | "activity";

const seedDocs: Doc[] = [
  { id: "d1", name: "ACORD_140_Northstar.pdf", label: "ACORD Application", isImage: false, size: "1.2 MB", summary: "ACORD 125/140. 4 locations listed (Buildings 1, 2, 4 and HQ). Class: metal fabrication. Requested limit $8.5M blanket, $25,000 deductible." },
  { id: "d2", name: "statement_of_values.xlsx", label: "Statement of Values", isImage: false, size: "84 KB", summary: "Total insured value $31.2M across 5 buildings, including Building 3 (warehouse, $2.4M) not listed on ACORD." },
  { id: "d3", name: "loss_runs_2021-2025.pdf", label: "5-Year Loss Runs", isImage: false, size: "640 KB", summary: "7 losses, $1.12M incurred. 3 losses in 2025 (above preferred frequency of 2/yr). Largest: 2024 water damage $410K." },
  { id: "d4", name: "supplemental_questionnaire.docx", label: "Supplemental Questionnaire", isImage: false, size: "96 KB", summary: "Hot work program in place. Fire protection section incomplete for Building 2 (sprinkler type and last inspection date blank)." },
  { id: "d5", name: "risk_inspection_2026.pdf", label: "Risk Inspection Report", isImage: false, size: "2.8 MB", summary: "Inspection Aug 2026. Overall housekeeping good. Recommendation: relocate exterior pallet storage ≥ 15 m from Building 1." },
  { id: "d6", name: "building1_exterior.jpg", label: "Property Photo", isImage: true, url: property1, size: "1.9 MB", summary: "Exterior of Building 1 with pallet storage along the north wall." },
];

const prompts = ["Analyze this submission.", "Is this risk within our appetite?", "What information is missing?", "What are the biggest risk factors?", "Compare the loss history with our appetite.", "Prepare an underwriting summary.", "Prepare questions for the broker.", "Prepare a referral recommendation.", "Give me the pricing factors I should consider."];
const workflow = ["Submission Received", "Documents Ingested", "Data Extracted", "Completeness Checked", "Appetite Assessment", "Underwriter Review", "Pricing", "Quote", "Referral / Approval", "Bind"];
const CURRENT = 5;
const standardActions = ["Request Missing Information", "Assign Underwriter", "Prepare Underwriting Summary", "Prepare Broker Questions", "Prepare Referral", "Run Pricing Analysis", "Generate Quote Summary", "Add Underwriting Note", "Escalate Submission"];
const appetiteRules: readonly (readonly [string, "ok" | "warn" | "unknown", string, string])[] = [
  ["Industry", "ok", "Within appetite", "Metal fabrication (NAICS 332) — Preferred class, §2.1"],
  ["Geography", "ok", "Within appetite", "Ontario, no CAT-zone restriction — §3.4"],
  ["Revenue", "ok", "Within appetite", "$42M within $5M–$150M band — §2.3"],
  ["Loss Frequency", "warn", "Above preferred threshold", "3 losses in 2025 vs. preferred ≤ 2/yr — §5.2"],
  ["Requested Limit", "warn", "Referral required", "$8.5M exceeds $5M class authority — §7.1"],
  ["Fire Protection", "unknown", "Information missing", "Sprinkler details required for all manufacturing locations — §4.6"],
];
const pricingFactors: readonly (readonly [string, string, string])[] = [["Exposure", "TIV $31.2M across 5 buildings", "+"], ["Loss History", "5-yr loss ratio 18.4%; 2025 frequency elevated", "+"], ["Industry", "Metal fabrication, preferred class", "−"], ["Geography", "Ontario, low CAT exposure", "−"], ["Requested Limits", "$8.5M blanket; above standard", "+"], ["Deductible", "$25,000 vs. $50,000 class norm", "+"]];

const mainAnalysis: Reply = {
  intro: "I reviewed the submission package, including the ACORD application, statement of values, five years of loss runs, and supplemental questionnaire. The risk appears generally within appetite, but three items require underwriter attention:",
  items: ["Prior-year loss frequency is above the preferred threshold.", "One manufacturing location has incomplete fire protection information.", "Requested limits exceed the standard authority for this class."],
  appetite: "Within appetite with referral.", next: "Request fire protection details and refer the limit exception for underwriting approval.", confidence: "High",
  sources: ["ACORD Application", "Statement of Values", "Loss Runs", "Commercial Property Appetite Guide"],
};

function replyFor(q: string, files: Attachment[]): { reply: Reply; actions: string[] } {
  const p = q.toLowerCase();
  const imgs = files.filter((f) => f.isImage);
  if (files.length && (files.length > imgs.length || p.includes("missing"))) return { reply: { intro: `I reviewed the ${files.length === 1 ? "uploaded file" : `${files.length} uploaded files`} against the existing submission. I found two issues:`, items: ["Building 3 appears on the Statement of Values but is not listed in the ACORD application.", "The loss runs contain a 2024 property loss that is not reflected in the submission summary."], next: "Request clarification from the broker before completing the appetite assessment.", confidence: "High", sources: files.map((f) => f.name), note: "Uploaded files are used in this conversation only and have not been added to the submission file." }, actions: ["Review Source", "Request Information", "Ask Follow-up"] };
  if (imgs.length) return { reply: { intro: "I identified several items that may warrant further underwriting review:", items: ["Exterior storage appears close to the primary structure.", "Roof condition cannot be fully determined from the available images.", "Fire protection equipment is not visible in the submitted photographs."], note: "These observations should be verified through the inspection report or additional documentation. Images alone do not support a coverage or acceptance decision.", confidence: "Medium", sources: imgs.map((f) => f.name) }, actions: ["Compare with Inspection Report", "Request Information", "Add to Underwriting Notes"] };
  if (p.includes("inspection")) return { reply: { intro: "Compared with Risk Inspection Report (Aug 2026):", items: ["Inspector also flagged exterior pallet storage within 15 m of Building 1 — recommendation still open.", "Roof: inspector rated condition 'fair', replaced 2011.", "Sprinklers confirmed for Buildings 1 and 4 only."], next: "Ask broker to confirm storage relocation and Building 2 sprinkler status.", confidence: "High", sources: ["Risk Inspection Report", "Property Photo"] }, actions: ["Request Information", "Ask Follow-up"] };
  if (p.includes("appetite") && !p.includes("loss")) return { reply: { intro: "Appetite assessment against Commercial Property Appetite Guide v4.2:", fields: appetiteRules.map(([k, , v]) => [k, v]), appetite: "Within appetite with referral.", confidence: "High", sources: ["Commercial Property Appetite Guide v4.2", "ACORD Application"] }, actions: ["View Applicable Guidelines", "Prepare Referral", "Ask Follow-up"] };
  if (p.includes("loss")) return { reply: { intro: "Loss history vs. appetite (5 years):", fields: [["Total losses", "7 · $1.12M incurred"], ["5-yr loss ratio", "18.4% (appetite ≤ 45%)"], ["2025 frequency", "3 losses (preferred ≤ 2/yr)"], ["Largest loss", "2024 water damage, $410K — closed"], ["Trend", "Severity stable; frequency rising"]], appetite: "Loss ratio within appetite; frequency above preferred threshold.", confidence: "High", sources: ["Loss Runs", "Appetite Guide §5.2"] }, actions: ["Prepare Broker Questions", "Ask Follow-up"] };
  if (p.includes("missing")) return { reply: { intro: "Submission is 92% complete. 2 items are missing:", items: ["Building 2 fire protection: sprinkler type, coverage %, last inspection date.", "Building 3 COPE details (listed on SOV, missing from ACORD)."], next: "Request missing information from Apex Insurance Brokers.", confidence: "High", sources: ["Supplemental Questionnaire", "Statement of Values", "ACORD Application"] }, actions: ["Request Information", "Prepare Broker Questions"] };
  if (p.includes("risk factor")) return { reply: { intro: "Biggest risk factors, ranked:", items: ["Rising loss frequency (3 losses in 2025).", "Incomplete fire protection at a manufacturing location with hot work.", "Exterior combustible storage near Building 1.", "Concentration: 62% of TIV at the HQ campus."], confidence: "Medium", sources: ["Loss Runs", "Supplemental Questionnaire", "Risk Inspection Report", "Statement of Values"] }, actions: ["Review Evidence", "Ask Follow-up"] };
  if (p.includes("broker")) return { reply: { intro: "Draft broker questions (for your review before sending):", items: ["Please confirm sprinkler type, coverage, and last inspection date for Building 2.", "Please provide COPE details for Building 3 (warehouse) and confirm whether it should be scheduled.", "Please explain the 2025 loss frequency and any corrective actions taken.", "Has exterior pallet storage been relocated per the Aug 2026 inspection?"], note: "Nothing has been sent. Use Request Information to send after review.", sources: ["Submission package"] }, actions: ["Request Information", "Ask Follow-up"] };
  if (p.includes("referral")) return { reply: { intro: "Draft referral recommendation:", fields: [["Exception", "Limit $8.5M vs. $5M class authority"], ["Mitigants", "Preferred class, 18.4% loss ratio, inspection completed"], ["Conditions", "Building 2 sprinkler confirmation; storage relocation warranty"], ["Refer to", "Senior Underwriter — Property (D. Cho)"]], note: "Draft only. Referral approval requires a human underwriter with appropriate authority.", sources: ["Appetite Guide §7.1", "Loss Runs", "Risk Inspection Report"] }, actions: ["Prepare Referral", "Ask Follow-up"] };
  if (p.includes("pricing")) return { reply: { intro: "Pricing factors to consider:", fields: pricingFactors.map(([k, v, d]) => [k, `${v} (${d === "+" ? "upward" : "downward"} pressure)`]), note: "Indicative premium $185,000. Final pricing is set by the underwriter.", confidence: "Medium", sources: ["Rating Guide CP-2026", "Statement of Values", "Loss Runs"] }, actions: ["Run Pricing Analysis", "Ask Follow-up"] };
  if (p.includes("summary")) return { reply: { intro: "Underwriting summary — SUB-10482 (draft):", fields: [["Insured", "Northstar Manufacturing Inc. · metal fabrication"], ["Exposure", "4 locations, TIV $31.2M, revenue $42M"], ["Request", "$8.5M limit, $25K deductible, eff. Nov 1, 2026"], ["Loss history", "7 losses, 18.4% loss ratio"], ["Appetite", "Within appetite with referral"], ["Open items", "Fire protection (Bldg 2), Building 3 COPE"]], next: "Refer limit exception; quote subject to conditions.", confidence: "High", sources: mainAnalysis.sources }, actions: ["Prepare Referral", "Ask Follow-up"] };
  return { reply: mainAnalysis, actions: ["Review Evidence", "Ask Follow-up", "Prepare Referral", "Request Information"] };
}

function SubmissionWorkspace() {
  const { submissionId } = Route.useParams();
  const sub = getSubmission(submissionId) ?? { ...submissions[0]!, id: submissionId };
  const [tab, setTab] = useState<Tab>("file");
  const [messages, setMessages] = useState<Msg[]>([{ id: "m0", role: "alfie", reply: { intro: "I've reviewed the available submission materials. I can help evaluate the risk, check completeness, compare it against underwriting appetite, identify issues, and prepare a decision-ready underwriting summary." } }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState<Attachment[]>([]);
  const [docs, setDocs] = useState(seedDocs);
  const [preview, setPreview] = useState<Doc | null>(null);
  const [confirm, setConfirm] = useState<Msg | null>(null);
  const [guidelines, setGuidelines] = useState(false);
  const [appetiteOpen, setAppetiteOpen] = useState(true);
  const [pricingRun, setPricingRun] = useState(false);
  const [audit, setAudit] = useState<UwAuditEvent[]>(seedUwAudit);
  const [notice, setNotice] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, thinking]);

  const now = () => new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  const log = (e: Omit<UwAuditEvent, "time">) => setAudit((a) => [{ time: now(), ...e }, ...a]);
  const flash = (t: string) => { setNotice(t); setTimeout(() => setNotice(""), 3500); };
  const say = (reply: Reply, actions?: string[]) => setMessages((m) => [...m, { id: crypto.randomUUID(), role: "alfie", reply, ...(actions ? { actions } : {}) }]);

  const send = (text: string, files: Attachment[] = []) => {
    const q = text || (files.length ? "Analyze these attachments." : "");
    if (!q) return;
    setInput(""); setPending([]);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q, files }]);
    if (files.length) log({ actor: "Jane Doe", actorType: "User", action: "Documents uploaded to conversation", source: files.map((f) => f.name).join(", "), result: "Conversation only — not in submission file" });
    setThinking(true);
    setTimeout(() => {
      const { reply, actions } = replyFor(q, files);
      say(reply, actions);
      log({ actor: "Alfie", actorType: "Alfie", action: files.length ? "Documents analyzed" : "Alfie analysis performed", source: reply.sources?.join(", ") ?? "Submission file", result: reply.appetite ?? reply.next ?? "Response provided" });
      setThinking(false);
    }, 900);
  };

  const runPricing = () => {
    setPricingRun(true); setTab("pricing");
    log({ actor: "Alfie", actorType: "Alfie", action: "Pricing analysis performed", source: "Rating Guide CP-2026", result: "Indicative $178K–$196K · review required" });
  };

  const runAction = (a: string) => {
    if (a === "Review Evidence" || a === "Review Source") { setPreview(docs[1] ?? null); return; }
    if (a === "Ask Follow-up") { document.querySelector<HTMLTextAreaElement>("textarea")?.focus(); return; }
    if (a === "Compare with Inspection Report") { send("Compare with the risk inspection report."); return; }
    if (a === "View Applicable Guidelines") { setGuidelines(true); return; }
    if (a === "Run Pricing Analysis") { runPricing(); return; }
    if (a === "Prepare Broker Questions") { send("Prepare questions for the broker."); return; }
    if (a === "Prepare Underwriting Summary") { send("Prepare an underwriting summary."); return; }
    if (a === "Prepare Referral") {
      say({ intro: "Referral draft created and routed for approval.", fields: [["Exception", "Requested limit $8.5M > $5M authority"], ["Approver", "Senior Underwriter — Property"], ["Status", "Awaiting human approval"]], note: "Alfie cannot approve exceptions or bind coverage." });
      log({ actor: "Alfie", actorType: "Alfie", action: "Referral created", source: "Appetite Guide §7.1", result: "Awaiting human approval" });
      return;
    }
    if (a === "Prepare Quote") {
      say({ intro: "Quote draft prepared for review:", fields: [["Indicative premium", usd(sub.premium || 185000)], ["Limit / deductible", `${compactUsd(sub.limit)} / $25,000`], ["Subjectivities", "Building 2 sprinkler confirmation; storage warranty"]], note: "Human approval required before this quote is issued to the broker." });
      log({ actor: "Alfie", actorType: "Alfie", action: "Quote draft prepared", source: "Pricing analysis", result: "Awaiting human approval" });
      return;
    }
    log({ actor: "Jane Doe", actorType: "User", action: a, source: "Underwriting actions", result: a === "Escalate Submission" ? "Escalated to underwriting manager" : a === "Request Missing Information" || a === "Request Information" ? "Request drafted for broker review" : "Completed" });
    say({ intro: `${a === "Request Information" ? "Request Missing Information" : a}: done. ${a.startsWith("Request") ? "A draft request to Apex Insurance Brokers is ready for your review before sending." : a.startsWith("Generate") ? "A draft is ready for your review." : "Logged to the audit trail."}` });
  };

  const attachToFile = (msg: Msg) => {
    const files = msg.files ?? [];
    setDocs((d) => [...d, ...files.map((f) => ({ id: f.id, name: f.name, label: f.isImage ? "Uploaded photo" : fileExt(f.name), isImage: f.isImage, url: f.url, size: `${Math.round(f.size / 1000)} KB`, summary: "Added from conversation by Jane Doe." }))]);
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, attached: true } : x)));
    log({ actor: "Jane Doe", actorType: "User", action: "Documents added to submission file", source: files.map((f) => f.name).join(", "), result: "Confirmed by user" });
    setConfirm(null); flash(`${files.length} file${files.length > 1 ? "s" : ""} added to submission documents.`);
  };
  const download = (d: Doc) => {
    const a = document.createElement("a");
    a.href = d.url ?? URL.createObjectURL(new Blob([`${d.label}\n\n${d.summary}`], { type: "text/plain" }));
    a.download = d.url ? d.name : `${d.name}.txt`; a.click();
  };
  const toAttachment = (d: Doc): Attachment => ({ id: d.id, name: d.name, size: 200000, type: "", isImage: d.isImage, url: d.url });

  const panel = <aside className="scrollbar-thin hidden w-[360px] shrink-0 flex-col border-l border-border bg-panel xl:flex">
    <div className="border-b border-border p-4"><AlfiePanelHeader context={`Submission ${sub.id} · ${sub.line}`} /></div>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
      {messages.map((m) => m.role === "user" ? <div key={m.id} className="flex flex-col items-end gap-2">
          {m.files?.length ? <><div className="flex flex-wrap justify-end gap-2">{m.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div><div className="flex items-center gap-2 text-[10px] text-muted-foreground"><Paperclip className="size-3" />{m.files.length} attachment{m.files.length > 1 ? "s" : ""} ready for analysis · Use in this conversation{m.attached ? <span className="text-positive">· Added to submission</span> : <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px]" onClick={() => setConfirm(m)}><Upload className="size-3" />Add to Submission</Button>}</div></> : null}
          <div className="max-w-[80%] rounded-2xl bg-ink px-4 py-2.5 text-sm text-ink-foreground">{m.text}</div>
        </div> : <div key={m.id} className="flex gap-3"><AlfieMark /><div className="min-w-0 flex-1 text-sm leading-6">
          {m.reply ? <ReplyView reply={m.reply} /> : null}
          {m.actions?.length ? <div className="mt-3 flex flex-wrap gap-2">{m.actions.map((a) => <Button key={a} size="sm" variant="secondary" onClick={() => runAction(a)}>{a}</Button>)}</div> : null}
          {m.id === "m0" ? <div className="mt-4 flex flex-wrap gap-2">{prompts.map((p) => <Button key={p} size="sm" variant="secondary" className="font-normal" onClick={() => send(p)}><Sparkle className="size-3 text-primary" />{p}</Button>)}</div> : null}
        </div></div>)}
        {thinking ? <div className="flex items-center gap-3 text-xs text-muted-foreground"><AlfieMark /><span className="animate-pulse">Reviewing submission package and appetite guides…</span></div> : null}
        <div ref={endRef} />
    </div>
    <div className="border-t border-border p-4"><AlfieComposer value={input} onChange={setInput} onSend={send} pending={pending} placeholder="Ask Alfie about this submission…" /><p className="mt-2 text-[10px] leading-4 text-muted-foreground">Alfie reads, extracts, and prepares. Acceptance, pricing, and binding decisions remain with authorized underwriters.</p></div>
  </aside>;

  return <AppShell rightPanel={panel}><div className="flex h-full flex-col">
    <div className="border-b border-border px-5 py-4 lg:px-8">
      <Link to="/underwriting" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" />Underwriting</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-semibold">Submission {sub.id}</h1><p className="mt-1 text-sm text-muted-foreground">{sub.insured} · {sub.line}</p><div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5">Status <SubmissionStatusBadge status={sub.status} /></span><span className="flex items-center gap-1.5">Priority <UwPriorityBadge priority={sub.priority} /></span></div></div>
        <div className="flex items-center gap-1">
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" size="sm">Actions<ChevronDown className="size-3.5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Underwriting actions</DropdownMenuLabel>
              {standardActions.map((a) => <DropdownMenuItem key={a} onSelect={() => runAction(a)}>{a}</DropdownMenuItem>)}
              <DropdownMenuSeparator /><DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Governed actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => runAction("Prepare Quote")} className="flex-col items-start gap-0.5"><span>Prepare Quote</span><span className="flex items-center gap-1 text-[10px] text-warning"><ShieldAlert className="size-3" />Human approval required</span></DropdownMenuItem>
              <DropdownMenuItem disabled className="flex-col items-start gap-0.5"><span>Bind Risk</span><span className="flex items-center gap-1 text-[10px]"><Lock className="size-3" />Permission required · Senior Underwriter</span></DropdownMenuItem>
              <DropdownMenuItem disabled className="flex-col items-start gap-0.5"><span>Approve Exception</span><span className="flex items-center gap-1 text-[10px]"><Lock className="size-3" />Permission required · Underwriting Manager</span></DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
          <Button variant="ghost" size="sm" onClick={() => { void navigator.clipboard?.writeText(window.location.href); flash("Link copied to clipboard."); }}><Share2 className="size-3.5" />Share</Button>
          <Button variant="ghost" size="sm" onClick={() => { download({ id: "x", name: `${sub.id}-summary`, label: `Submission ${sub.id}`, isImage: false, size: "", summary: `${sub.insured} · ${sub.line}\nBroker ${sub.broker}\nLimit ${compactUsd(sub.limit)}\nAppetite: within appetite with referral` }); log({ actor: "Jane Doe", actorType: "User", action: "Exported submission", source: "Submission workspace", result: "Summary downloaded" }); }}><Download className="size-3.5" />Export</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label="More"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setTab("activity")}>View activity</DropdownMenuItem><DropdownMenuItem onSelect={() => setTab("pricing")}>Open pricing</DropdownMenuItem><DropdownMenuItem onSelect={() => runAction("Add Underwriting Note")}>Add note</DropdownMenuItem><DropdownMenuItem asChild><Link to="/underwriting">Back to queue</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="mt-4 flex gap-1">{(["file", "pricing", "activity"] as const).map((t) => <Button key={t} size="sm" variant={tab === t ? "soft" : "ghost"} className={tab === t ? "text-foreground" : ""} onClick={() => setTab(t)}>{t === "file" ? "Submission file" : t === "pricing" ? "Pricing" : `Activity · ${audit.length}`}</Button>)}</div>
    </div>
    {notice ? <div className="mx-5 mt-3 rounded-lg border border-border bg-secondary px-3 py-2 text-xs lg:mx-8">{notice}</div> : null}

    {tab === "activity" ? <div className="flex-1 px-5 py-5 lg:px-8"><p className="mb-3 text-xs text-muted-foreground">Complete audit trail of user, Alfie, and system activity on this submission.</p><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">{["Timestamp", "Actor", "Action", "Source", "Result"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{audit.map((e, i) => <tr key={i} className="border-b border-border last:border-0"><td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{e.time}</td><td className="px-3 py-2.5"><span className="flex items-center gap-1.5 font-medium">{e.actorType === "Alfie" ? <Bot className="size-3.5 text-primary" /> : null}{e.actor}</span></td><td className="px-3 py-2.5">{e.action}</td><td className="px-3 py-2.5 text-muted-foreground">{e.source}</td><td className="px-3 py-2.5">{e.result}</td></tr>)}</tbody></table></div></div>

    : tab === "pricing" ? <div className="flex-1 px-5 py-6 lg:px-8"><div className="mx-auto max-w-3xl">
      <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border bg-card p-4"><p className="text-[11px] text-muted-foreground">Indicative Premium</p><p className="mt-1 text-2xl font-semibold">{usd(sub.premium || 185000)}</p>{pricingRun ? <p className="mt-1 text-[11px] text-muted-foreground">Range $178,000 – $196,000</p> : null}</div><div className="rounded-xl border border-border bg-card p-4"><p className="text-[11px] text-muted-foreground">Pricing Status</p><p className="mt-1 text-2xl font-semibold text-warning">Review Required</p></div></div>
      <h3 className="mb-2 mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Factors</h3>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">{pricingFactors.map(([k, v, d]) => <div key={k} className="flex items-center gap-3 px-4 py-3 text-sm"><span className="w-36 font-medium">{k}</span><span className="flex-1 text-xs text-muted-foreground">{v}</span>{pricingRun ? <span className={`text-xs font-medium ${d === "+" ? "text-warning" : "text-positive"}`}>{d === "+" ? "Upward" : "Downward"}</span> : null}</div>)}</div>
      <div className="mt-4 flex flex-wrap gap-2"><Button onClick={runPricing}><Sparkle className="size-3.5" />Run Pricing Analysis</Button><Button variant="secondary" onClick={() => send("Give me the pricing factors I should consider.")}>Prepare Pricing Summary</Button></div>
      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">Alfie provides indicative pricing analysis only. The final production price is set by an authorized underwriter; agent configuration does not permit autonomous rating for this line.</p>
    </div></div>

    : <div className="px-5 py-5 lg:px-8"><div className="mx-auto max-w-3xl">
      <ReviewBar status={`Underwriter review · step ${CURRENT + 1} of ${workflow.length}`} title="Requested limit $8.5M exceeds the $5M class authority" detail="Alfie assessed this submission as within appetite with referral. The limit exception needs a senior underwriter decision.">
        <Button size="sm" variant="secondary" onClick={() => runAction("Request Missing Information")}>Request information</Button>
        <Button size="sm" onClick={() => runAction("Prepare Referral")}>Prepare referral</Button>
      </ReviewBar>
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2"><AlfieChip label="Alfie draft" /><span className="text-xs text-muted-foreground">Submission assessment for underwriter review. Not an acceptance, pricing, or binding decision.</span></div>
        <div className="rounded-xl border border-border bg-card p-5"><ReplyView reply={mainAnalysis} />
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">{["Review Evidence", "Prepare Referral", "Request Information"].map((a) => <Button key={a} size="sm" variant="secondary" onClick={() => runAction(a)}>{a}</Button>)}</div>
        </div>
      </section>
      <Section title="Submission details">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs md:grid-cols-4">
          {([["Submission", sub.id], ["Insured", sub.insured], ["Broker", sub.broker], ["Line of Business", sub.line], ["Effective Date", sub.effective], ["Requested Limit", compactUsd(sub.limit)], ["Estimated Premium", sub.premium ? usd(sub.premium) : "—"]] as const).map(([k, v]) => <div key={k}><dt className="text-[10px] text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>)}
          <div><dt className="text-[10px] text-muted-foreground">Status</dt><dd className="mt-1"><SubmissionStatusBadge status={sub.status} /></dd></div>
          <div><dt className="text-[10px] text-muted-foreground">Priority</dt><dd className="mt-1"><UwPriorityBadge priority={sub.priority} /></dd></div>
        </dl>
      </Section>
      <Section title="Risk summary">
        <dl className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">{([["Locations", "4"], ["Annual Revenue", "$42M"], ["Employees", "286"], ["Prior Losses", "7"], ["Loss Ratio", "18.4%"], ["Requested Limit", "$8.5M"], ["Deductible", "$25,000"]] as const).map(([k, v]) => <div key={k} className="rounded-lg border border-border bg-card px-2.5 py-2"><dt className="text-[10px] text-muted-foreground">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>)}</dl>
      </Section>
      <Section title={`Documents · ${docs.length}`}>
        <div className="space-y-1.5">{docs.map((d) => <button key={d.id} onClick={() => setPreview(d)} className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card p-2 text-left hover:bg-secondary">{d.isImage && d.url ? <img src={d.url} alt={d.label} loading="lazy" width={944} height={704} className="size-8 rounded-md object-cover" /> : <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FileGlyph name={d.name} /></div>}<div className="min-w-0"><p className="text-xs font-medium">{d.label}</p><p className="truncate text-[10px] text-muted-foreground">{fileExt(d.name)} · {d.name}</p></div></button>)}</div>
      </Section>
      <Section title="Appetite assessment">
        <div className="space-y-1">{appetiteRules.map(([k, st, v]) => <div key={k} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs">{st === "ok" ? <Check className="size-3.5 text-positive" /> : st === "warn" ? <AlertTriangle className="size-3.5 text-warning" /> : <HelpCircle className="size-3.5 text-muted-foreground" />}<span className="flex-1">{k}</span><span className={`text-[11px] ${st === "warn" ? "text-warning" : "text-muted-foreground"}`}>{v}</span></div>)}
          <div className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs"><span className="text-muted-foreground">Overall: </span><span className="font-semibold">Within appetite with referral.</span></div>
          <Button size="sm" variant="ghost" className="mt-1 w-full justify-start" onClick={() => setGuidelines(true)}><FileText className="size-3.5" />View Applicable Guidelines</Button></div>
      </Section>
      <Section title="Assessment">
        {([["Submission Completeness", "92%", "text-positive", "What information is missing?"], ["Appetite", "Referral", "text-warning", "Is this risk within our appetite?"], ["Risk Level", "Moderate", "text-warning", "What are the biggest risk factors?"], ["Missing Information", "2 Items", "text-warning", "What information is missing?"], ["Pricing Review", "Recommended", "text-primary", "Give me the pricing factors I should consider."]] as const).map(([k, v, tone, q]) => <button key={k} onClick={() => send(q)} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-secondary"><span>{k}</span><span className={`font-medium ${tone}`}>{v}</span></button>)}
        <p className="mt-2 px-2 text-[10px] leading-4 text-muted-foreground">Assessment opens in the Alfie rail. AI assessment prepares the file for review. It is not an underwriting decision.</p>
      </Section>
      <Section title="Workflow">
        <ol className="space-y-0.5">{workflow.map((step, i) => <li key={step} className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs ${i === CURRENT ? "bg-primary/10 font-semibold text-primary" : i < CURRENT ? "text-foreground" : "text-muted-foreground"}`}>{i < CURRENT ? <Check className="size-3.5 text-positive" /> : i === CURRENT ? <ChevronDown className="size-3.5 -rotate-90" /> : <Circle className="size-3" />}{step}{i === CURRENT ? <span className="ml-auto text-[10px] font-medium">Current</span> : null}</li>)}</ol>
        <p className="mt-2 px-2 text-[10px] leading-4 text-muted-foreground">Alfie completed preparation steps. The decision-ready file is with the underwriter.</p>
      </Section>
    </div></div>}
    <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}><DialogContent className="max-w-xl">{preview ? <><DialogHeader><DialogTitle>{preview.label}</DialogTitle><DialogDescription>{fileExt(preview.name)} · {preview.name} · {preview.size}</DialogDescription></DialogHeader>
      {preview.isImage ? <img src={preview.url} alt={preview.label} className="w-full rounded-lg" /> : <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm"><FileText className="mb-2 size-5 text-muted-foreground" />{preview.summary}</div>}
      <DialogFooter className="flex-wrap gap-2 sm:justify-start"><Button size="sm" variant="secondary" onClick={() => download(preview)}><Download className="size-3.5" />Download</Button><Button size="sm" variant="secondary" onClick={() => { const d = preview; setPreview(null); send(d.isImage ? "Review these property photos for underwriting concerns." : `Analyze the ${d.label}.`, d.isImage ? [toAttachment(d)] : []); }}><Sparkle className="size-3.5" />Analyze with Alfie</Button><Button size="sm" variant="secondary" onClick={() => { const d = preview; setPending((p) => (p.some((x) => x.id === d.id) ? p : [...p, toAttachment(d)])); setPreview(null); }}><Paperclip className="size-3.5" />Attach to conversation</Button></DialogFooter></> : null}</DialogContent></Dialog>

    <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>Add to submission file?</DialogTitle><DialogDescription>These files will be added to the permanent document record for {sub.id} and logged in the audit trail.</DialogDescription></DialogHeader>
      <div className="flex flex-wrap gap-2">{confirm?.files?.map((f) => <AttachmentChip key={f.id} file={f} />)}</div>
      <DialogFooter><Button variant="secondary" onClick={() => setConfirm(null)}>Keep in conversation only</Button><Button onClick={() => confirm && attachToFile(confirm)}>Add to Submission</Button></DialogFooter></DialogContent></Dialog>

    <Dialog open={guidelines} onOpenChange={setGuidelines}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Applicable guidelines</DialogTitle><DialogDescription>Commercial Property Appetite Guide v4.2 · effective Jan 1, 2026. Sections Alfie evaluated for this submission.</DialogDescription></DialogHeader>
      <div className="divide-y divide-border rounded-lg border border-border">{appetiteRules.map(([k, s, , g]) => <div key={k} className="flex items-start gap-2 px-3 py-2.5 text-xs">{s === "ok" ? <Check className="mt-0.5 size-3.5 text-positive" /> : s === "warn" ? <AlertTriangle className="mt-0.5 size-3.5 text-warning" /> : <HelpCircle className="mt-0.5 size-3.5 text-muted-foreground" />}<div><p className="font-medium">{k}</p><p className="text-muted-foreground">{g}</p></div></div>)}</div>
      <DialogFooter><Button variant="secondary" onClick={() => setGuidelines(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
  </div></AppShell>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-6 border-t border-border pt-5"><h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>{children}</section>;
}

function ReplyView({ reply }: { reply: Reply }) {
  return <div className="space-y-3 font-display text-[15px] leading-7">
    <p>{reply.intro}</p>
    {reply.items ? <ol className="list-decimal space-y-1.5 pl-5">{reply.items.map((i) => <li key={i}>{i}</li>)}</ol> : null}
    {reply.fields ? <dl className="divide-y divide-border rounded-xl border border-border">{reply.fields.map(([k, v]) => <div key={k} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2 text-xs"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl> : null}
    {reply.note ? <p className="text-xs text-muted-foreground">{reply.note}</p> : null}
    {reply.appetite || reply.next || reply.confidence ? <div className="space-y-1 text-xs">{reply.appetite ? <p><span className="text-muted-foreground">Appetite assessment: </span><span className="font-semibold">{reply.appetite}</span></p> : null}{reply.next ? <p><span className="text-muted-foreground">Recommended next step: </span><span className="font-semibold">{reply.next}</span></p> : null}{reply.confidence ? <p><span className="text-muted-foreground">Confidence: </span><span className="font-semibold">{reply.confidence}</span></p> : null}</div> : null}
    {reply.sources ? <div className="flex flex-wrap items-center gap-1.5"><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sources</span>{reply.sources.map((s) => <span key={s} className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px]">{s}</span>)}</div> : null}
  </div>;
}
