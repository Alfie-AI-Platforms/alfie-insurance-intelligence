import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, Bot, Check, ChevronDown, Circle, Download, Lock, MoreHorizontal, Paperclip, Share2, ShieldAlert, Sparkle, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieChip, AlfieMark, AlfiePanelHeader, ReviewBar } from "@/components/alfie-ui";
import { DocumentSheet } from "@/components/document-view";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlfieComposer, AttachmentChip, FileGlyph, fileExt, type Attachment } from "@/components/alfie-composer";
import { ClaimStatusBadge, PriorityBadge } from "@/components/claim-badges";
import { getClaim, money, seedAudit, type AuditEvent } from "@/lib/claims-data";
import damage1 from "@/assets/damage-1.jpg";
import damage2 from "@/assets/damage-2.jpg";
import damage3 from "@/assets/damage-3.jpg";

export const Route = createFileRoute("/claims/$claimId")({
  head: ({ params }) => ({ meta: [{ title: `Claim ${params.claimId} | Alfie Insurance` }, { name: "description", content: `Review evidence and work with Alfie on claim ${params.claimId}.` }, { property: "og:title", content: `Claim ${params.claimId} | Alfie Insurance` }, { property: "og:description", content: "AI-assisted claim workspace with evidence, context, and audit trail." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: ClaimWorkspace,
  notFoundComponent: () => <div className="p-10">Claim not found.</div>,
});

type Evidence = { id: string; name: string; label: string; isImage: boolean; url?: string | undefined; size: string; summary: string };
type Reply = { intro: string; items?: string[]; fields?: [string, string][]; next?: string; confidence?: string; sources?: string[] | undefined; note?: string };
type Msg = { id: string; role: "user" | "alfie"; text?: string; files?: Attachment[]; reply?: Reply; actions?: string[]; attached?: boolean };

const seedEvidence: Evidence[] = [
  { id: "e1", name: "damage_front_left.jpg", label: "Photo 1", isImage: true, url: damage1, size: "2.1 MB", summary: "Front-left bumper and fender damage." },
  { id: "e2", name: "damage_headlight.jpg", label: "Photo 2", isImage: true, url: damage2, size: "1.8 MB", summary: "Cracked headlight assembly, fender crease." },
  { id: "e3", name: "scene_intersection.jpg", label: "Photo 3", isImage: true, url: damage3, size: "2.4 MB", summary: "Vehicle at intersection post-collision." },
  { id: "e4", name: "police_report_TPS-26-118204.pdf", label: "Police Report", isImage: false, size: "412 KB", summary: "Toronto Police Service report. Rear-end collision, 2 vehicles, Queen St W & Bathurst St." },
  { id: "e5", name: "repair_estimate_EST-8821.pdf", label: "Repair Estimate", isImage: false, size: "286 KB", summary: "Lakeshore Collision Centre. Total $12,400: bumper, fender, headlight, labour 18.5h." },
  { id: "e6", name: "claimant_statement.docx", label: "Claimant Statement", isImage: false, size: "64 KB", summary: "Statement from Michael Brown. Lists incident location as King St W & Spadina Ave." },
];

const evidenceSections: Record<string, { heading: string; body: string }[]> = {
  e4: [
    { heading: "Occurrence", body: "On September 14, 2026 at approximately 4:40 PM, Unit 1 (the insured vehicle) was stopped in traffic westbound on Queen St W at Bathurst St when it was struck from behind by Unit 2. Both vehicles sustained damage. No injuries were reported at the scene." },
    { heading: "Statements and findings", body: "The driver of Unit 2 advised they did not stop in time. The attending officer recorded the point of impact at the rear of Unit 1 and noted no contributing factors on the part of the insured driver." },
    { heading: "Report particulars", body: "Report TPS-26-118204, Toronto Police Service, filed September 14, 2026. No charges were laid against the insured driver. This is the occurrence record Alfie compares against the claimant statement." },
  ],
  e5: [
    { heading: "Parts", body: "Front bumper cover and absorber, left fender, headlight assembly and grille trim. Parts subtotal $6,940, OEM specification as listed by Lakeshore Collision Centre." },
    { heading: "Labour and refinishing", body: "Labour 18.5 hours at the shop's posted rate, including panel alignment and paint blend to the adjacent panels. Labour and refinishing subtotal $4,260." },
    { heading: "Total and notes", body: "Total estimate $12,400 as shown on EST-8821. The estimate exceeds the adjuster's $5,000 authority, which is why this claim sits at supervisor review. The supplement process applies if teardown finds further damage." },
  ],
  e6: [
    { heading: "Account of the incident", body: "I was driving west on King Street and stopped near Spadina when the car behind hit me. It was around rush hour and traffic was stop and go. My car rolled a little but I did not hit anyone in front of me." },
    { heading: "Damage and condition", body: "The back bumper is pushed in and the trunk does not close properly. The car still drives. I have had no other accidents this year and the car had no damage before this." },
    { heading: "Declaration", body: "Statement provided by Michael Brown, recorded September 16, 2026 and signed electronically. The insured confirms the account is complete to the best of their knowledge." },
  ],
};

const prompts = ["Analyze this claim.", "What requires my attention?", "Compare the repair estimate with the damage photos.", "Check the policy information.", "What information is missing?", "Prepare a summary for the adjuster.", "Show me potential risk or fraud indicators."];
const workflow = ["Intake", "Evidence Received", "Policy Located", "AI Analysis", "Adjuster Review", "Decision", "Settlement", "Closed"];
const CURRENT = 4;
const standardActions = ["Request Missing Information", "Assign Adjuster", "Prepare Claim Summary", "Prepare Customer Update", "Add Note", "Add Evidence", "Generate Report", "Escalate Claim"];

const mainAnalysis: Reply = {
  intro: "I reviewed the claim, policy information, three submitted photos, the police report, and the repair estimate. Three items require attention:",
  items: ["The repair estimate is $12,400, above the configured $5,000 autonomous authority threshold.", "The police report and claimant statement contain a discrepancy regarding the accident location.", "Collision coverage appears active, but the deductible requires adjuster confirmation."],
  next: "Supervisor review.", confidence: "High", sources: ["Policy P-28491", "Police Report", "Estimate EST-8821", "Claimant Statement"],
};

function replyFor(q: string, files: Attachment[]): { reply: Reply; actions: string[] } {
  const p = q.toLowerCase();
  const imgs = files.filter((f) => f.isImage);
  const docs = files.filter((f) => !f.isImage);
  if (files.length && imgs.length && docs.length) return { reply: { intro: `${files.length} attachments ready for analysis. I compared ${imgs.length} image${imgs.length > 1 ? "s" : ""} with ${docs.map((d) => d.name).join(", ")}.`, items: ["Visible damage (bumper, fender, headlight) aligns with 4 of 6 estimate line items.", "Estimate includes a radiator support replacement ($1,850) not visible in the images — may relate to hidden damage.", "Labour hours (18.5h) are within the expected range for this damage pattern."], next: "Request teardown photos or an independent appraisal for the radiator support line.", confidence: "Medium", sources: files.map((f) => f.name), note: "Uploaded files are used in this conversation only and have not been added to the claim record." }, actions: ["Review Evidence", "Ask Follow-up", "Prepare Recommendation"] };
  if (imgs.length) return { reply: { intro: `I reviewed the ${imgs.length === 1 ? "image" : `${imgs.length} images`}.`, items: ["The images appear to show front-left bumper and fender damage.", "The visible damage is consistent with the reported collision.", "The images do not provide enough evidence to assess hidden structural damage."], note: "Would you like me to compare these images with the repair estimate? Image review supports, but does not determine, liability, coverage, or settlement.", confidence: "Medium", sources: imgs.map((f) => f.name) }, actions: ["Compare with Estimate", "Review Evidence", "Ask Alfie"] };
  if (docs.length) return { reply: { intro: "I found the following relevant information:", fields: [["Loss date", "September 28, 2026"], ["Location", "Toronto, Ontario"], ["Reported incident", "Rear-end collision"], ["Parties", "2 vehicles"], ["Potential discrepancy", "The claimant statement lists a different incident location."]], confidence: "High", sources: docs.map((f) => f.name) }, actions: ["View Source", "Add to Claim", "Ask Follow-up"] };
  if (p.includes("compare") || p.includes("estimate")) return { reply: { intro: "I compared Estimate EST-8821 with the three damage photos.", items: ["Bumper cover, fender, and headlight replacement are supported by Photos 1–2.", "Radiator support ($1,850) and front sensor calibration ($640) are not visible in any photo.", "Paint and blend labour appears reasonable for the panels shown."], next: "Request teardown photos before approving the unsupported line items.", confidence: "Medium", sources: ["Estimate EST-8821", "Photo 1", "Photo 2", "Photo 3"] }, actions: ["Review Evidence", "Ask Follow-up", "Prepare Recommendation"] };
  if (p.includes("policy")) return { reply: { intro: "Summary of Policy P-28491 (Personal Auto):", fields: [["Status", "In force · Jan 15 – Jan 15, 2027"], ["Collision", "Active · $1,000 deductible (per declarations)"], ["Comprehensive", "Active · $500 deductible"], ["Rental", "$50/day, 30 days max"], ["Endorsement", "OPCF 43 waiver of depreciation — verify applicability"]], next: "Adjuster to confirm deductible: the online declarations page and the renewal letter differ ($1,000 vs. $750).", confidence: "High", sources: ["Policy P-28491", "Renewal letter Jan 2026"] }, actions: ["Review Evidence", "Ask Follow-up"] };
  if (p.includes("missing")) return { reply: { intro: "2 items are missing to complete adjuster review:", items: ["Statement from the other driver (named in police report).", "Clarification from the claimant on the incident location."], next: "Request missing information from the claimant and third-party insurer.", confidence: "High", sources: ["Police Report", "Claimant Statement", "Claims checklist CLM-AUTO-04"] }, actions: ["Request Missing Information", "Ask Follow-up"] };
  if (p.includes("summary")) return { reply: { intro: "Adjuster summary — CL-45821 (draft, for your review):", fields: [["Loss", "Rear-end collision, Sept 28, 2026, Toronto"], ["Damage", "Front-left bumper, fender, headlight"], ["Estimate", "$12,400 (EST-8821)"], ["Coverage", "Collision active; deductible to be confirmed"], ["Open items", "Location discrepancy; third-party statement"]], next: "Route to supervisor — estimate exceeds $5,000 authority.", confidence: "High", sources: mainAnalysis.sources }, actions: ["Prepare Recommendation", "Ask Follow-up"] };
  if (p.includes("risk") || p.includes("fraud")) return { reply: { intro: "1 risk indicator flagged. This is a signal for review, not a fraud determination.", items: ["Location discrepancy: police report (Queen St W & Bathurst) vs. claimant statement (King St W & Spadina), ~1.2 km apart.", "No prior claims on this policy in 5 years (lowers risk).", "Repair shop is in the preferred network (lowers risk)."], next: "Clarify location with the claimant before considering SIU referral.", confidence: "Medium", sources: ["Police Report", "Claimant Statement", "Claims history"] }, actions: ["Review Evidence", "Escalate Claim", "Ask Follow-up"] };
  return { reply: mainAnalysis, actions: ["Review Evidence", "Ask Follow-up", "Prepare Recommendation"] };
}

function ClaimWorkspace() {
  const { claimId } = Route.useParams();
  const claim = getClaim(claimId) ?? { ...getClaim("CL-45821")!, id: claimId };
  const [tab, setTab] = useState<"file" | "activity">("file");
  const [messages, setMessages] = useState<Msg[]>([{ id: "m0", role: "alfie", reply: { intro: "I've reviewed the available information for this claim. I can help analyze the evidence, identify missing information, summarize the policy context, and prepare recommendations for review." } }]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [pending, setPending] = useState<Attachment[]>([]);
  const [evidence, setEvidence] = useState(seedEvidence);
  const [preview, setPreview] = useState<Evidence | null>(null);
  const [confirm, setConfirm] = useState<Msg | null>(null);
  const [audit, setAudit] = useState<AuditEvent[]>(seedAudit);
  const [notice, setNotice] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, thinking]);

  const now = () => new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
  const log = (e: Omit<AuditEvent, "time">) => setAudit((a) => [{ time: now(), ...e }, ...a]);
  const flash = (t: string) => { setNotice(t); setTimeout(() => setNotice(""), 3500); };

  const send = (text: string, files: Attachment[] = []) => {
    const q = text || (files.length ? "Analyze these attachments." : "");
    if (!q) return;
    setInput(""); setPending([]);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", text: q, files }]);
    if (files.length) log({ actor: "Jane Doe", actorType: "User", action: "Documents uploaded to conversation", source: files.map((f) => f.name).join(", "), result: "Conversation only — not in claim record" });
    setThinking(true);
    setTimeout(() => {
      const { reply, actions } = replyFor(q, files);
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "alfie", reply, actions }]);
      log({ actor: "Alfie", actorType: "Alfie", action: files.length ? "Analyzed uploaded material" : "Answered claim question", source: reply.sources?.join(", ") ?? "Claim record", result: reply.next ?? "Response provided" });
      setThinking(false);
    }, 900);
  };

  const runAction = (a: string) => {
    if (a === "Review Evidence" || a === "View Source") { setPreview(evidence[3] ?? null); return; }
    if (a === "Ask Follow-up" || a === "Ask Alfie") { document.querySelector<HTMLTextAreaElement>("textarea")?.focus(); return; }
    if (a === "Compare with Estimate") { send("Compare the repair estimate with the damage photos."); return; }
    if (a === "Add to Claim") { const last = [...messages].reverse().find((m) => m.role === "user" && m.files?.length && !m.attached); if (last) setConfirm(last); else flash("No conversation uploads to attach."); return; }
    if (a === "Prepare Recommendation") {
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "alfie", reply: { intro: "Draft recommendation prepared for human review:", fields: [["Recommendation", "Refer to supervisor for estimate approval"], ["Conditions", "Confirm deductible; resolve location discrepancy"], ["Reserve suggestion", "$12,400 (pending confirmation)"]], note: "This is a draft. Alfie cannot approve, deny, or settle this claim. Supervisor approval required.", sources: mainAnalysis.sources } }]);
      log({ actor: "Alfie", actorType: "Alfie", action: "Recommendation prepared", source: "Claim analysis", result: "Awaiting human approval" });
      return;
    }
    log({ actor: "Jane Doe", actorType: "User", action: a, source: "Claim actions", result: a === "Escalate Claim" ? "Escalated to supervisor" : "Completed" });
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "alfie", reply: { intro: `${a}: done. ${a.startsWith("Prepare") || a === "Generate Report" ? "A draft is ready for your review before anything is sent." : "Logged to the audit trail."}` } }]);
  };

  const attachToClaim = (msg: Msg) => {
    const files = msg.files ?? [];
    setEvidence((e) => [...e, ...files.map((f) => ({ id: f.id, name: f.name, label: f.isImage ? "Uploaded photo" : fileExt(f.name), isImage: f.isImage, url: f.url, size: `${Math.round(f.size / 1000)} KB`, summary: "Added from conversation by Jane Doe." }))]);
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, attached: true } : x)));
    log({ actor: "Jane Doe", actorType: "User", action: "Evidence added to claim record", source: files.map((f) => f.name).join(", "), result: "Confirmed by user" });
    setConfirm(null);
    flash(`${files.length} file${files.length > 1 ? "s" : ""} added to claim evidence.`);
  };

  const download = (e: Evidence) => {
    const a = document.createElement("a");
    a.href = e.url ?? URL.createObjectURL(new Blob([`${e.label}\n\n${e.summary}`], { type: "text/plain" }));
    a.download = e.url ? e.name : `${e.name}.txt`;
    a.click();
  };
  const attachEvidence = (e: Evidence) => { setPending((p) => (p.some((x) => x.id === e.id) ? p : [...p, { id: e.id, name: e.name, size: 200000, type: "", isImage: e.isImage, url: e.url }])); setPreview(null); };

  const alfieRail = <aside className="scrollbar-thin hidden w-[360px] shrink-0 flex-col border-l border-border bg-panel xl:flex">
    <div className="border-b border-border p-4"><AlfiePanelHeader context={`Claim ${claim.id} · ${claim.type}`} /></div>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
      {messages.map((m) => m.role === "user" ? <div key={m.id} className="flex flex-col items-end gap-2">
          {m.files?.length ? <><div className="flex flex-wrap justify-end gap-2">{m.files.map((f) => <AttachmentChip key={f.id} file={f} />)}</div><div className="flex items-center gap-2 text-[12px] text-muted-foreground"><Paperclip className="size-3" />{m.files.length} attachment{m.files.length > 1 ? "s" : ""} ready for analysis · Use in this conversation{m.attached ? <span className="text-positive">· Attached to claim</span> : <Button size="sm" variant="ghost" className="h-6 px-2 text-[12px]" onClick={() => setConfirm(m)}><Upload className="size-3" />Attach to Claim</Button>}</div></> : null}
          <div className="max-w-[80%] rounded-2xl bg-ink px-4 py-2.5 text-sm text-ink-foreground">{m.text}</div>
        </div> : <div key={m.id} className="flex gap-3"><AlfieMark /><div className="min-w-0 flex-1 text-sm leading-6">
          {m.reply ? <ReplyView reply={m.reply} /> : null}
          {m.actions?.length ? <div className="mt-3 flex flex-wrap gap-2">{m.actions.map((a) => <Button key={a} size="sm" variant="secondary" onClick={() => runAction(a)}>{a}</Button>)}</div> : null}
          {m.id === "m0" ? <div className="mt-4 flex flex-wrap gap-2">{prompts.map((p) => <Button key={p} size="sm" variant="secondary" className="max-w-full font-normal" onClick={() => send(p)}><Sparkle className="size-3 shrink-0 text-primary" /><span className="truncate">{p}</span></Button>)}</div> : null}
        </div></div>)}
        {thinking ? <div className="flex items-center gap-3 text-xs text-muted-foreground"><AlfieMark /><span className="animate-pulse">Reviewing claim evidence and policy…</span></div> : null}
        <div ref={endRef} />
    </div>
    <div className="border-t border-border p-4"><AlfieComposer value={input} onChange={setInput} onSend={send} pending={pending} placeholder="Ask Alfie about this claim…" /><p className="mt-2 text-[12px] leading-4 text-muted-foreground">Alfie prepares analysis and drafts. Coverage, liability, and settlement decisions remain with authorized adjusters.</p></div>
  </aside>;

  return <AppShell rightPanel={alfieRail}><div className="flex h-full flex-col">
    <div className="border-b border-border px-5 py-4 lg:px-8">
      <Link to="/claims" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" />Claims</Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-semibold">Claim {claim.id}</h1><p className="mt-1 text-sm text-muted-foreground">{claim.type} · {claim.claimant}</p><div className="mt-2 flex items-center gap-3 text-[13px] text-muted-foreground"><span className="flex items-center gap-1.5">Status <ClaimStatusBadge status={claim.status} /></span><span className="flex items-center gap-1.5">Priority <PriorityBadge priority={claim.priority} /></span></div></div>
        <div className="flex items-center gap-1">
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="secondary" size="sm">Actions<ChevronDown className="size-3.5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-[12px] uppercase tracking-wider text-muted-foreground">Claim actions</DropdownMenuLabel>
              {standardActions.map((a) => <DropdownMenuItem key={a} onSelect={() => a === "Add Evidence" ? document.querySelector<HTMLButtonElement>('[aria-label="Add attachment"]')?.click() : runAction(a)}>{a}</DropdownMenuItem>)}
              <DropdownMenuSeparator /><DropdownMenuLabel className="text-[12px] uppercase tracking-wider text-muted-foreground">Governed actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => runAction("Prepare Recommendation")} className="flex-col items-start gap-0.5"><span>Prepare Settlement Recommendation</span><span className="flex items-center gap-1 text-[12px] text-warning"><ShieldAlert className="size-3" />Human approval required</span></DropdownMenuItem>
              <DropdownMenuItem disabled className="flex-col items-start gap-0.5"><span>Approve Settlement</span><span className="flex items-center gap-1 text-[12px]"><Lock className="size-3" />Permission required · Claims Manager</span></DropdownMenuItem>
            </DropdownMenuContent></DropdownMenu>
          <Button variant="ghost" size="sm" onClick={() => { void navigator.clipboard?.writeText(window.location.href); flash("Link copied to clipboard."); }}><Share2 className="size-3.5" />Share</Button>
          <Button variant="ghost" size="sm" onClick={() => { download({ id: "x", name: `${claim.id}-summary`, label: `Claim ${claim.id}`, isImage: false, size: "", summary: `${claim.type} · ${claim.claimant}\nPolicy ${claim.policy}\nEstimated loss ${money(claim.estimatedLoss)}` }); log({ actor: "Jane Doe", actorType: "User", action: "Exported claim", source: "Claim workspace", result: "Summary downloaded" }); }}><Download className="size-3.5" />Export</Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-8" aria-label="More"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setTab("activity")}>View activity</DropdownMenuItem><DropdownMenuItem onSelect={() => runAction("Add Note")}>Add note</DropdownMenuItem><DropdownMenuItem asChild><Link to="/claims">Back to queue</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </div>
      <div className="mt-4 flex gap-1">{(["file", "activity"] as const).map((t) => <Button key={t} size="sm" variant={tab === t ? "soft" : "ghost"} className={tab === t ? "text-foreground" : ""} onClick={() => setTab(t)}>{t === "file" ? "Claim file" : `Activity · ${audit.length}`}</Button>)}</div>
    </div>
    {notice ? <div className="mx-5 mt-3 rounded-lg border border-border bg-secondary px-3 py-2 text-xs lg:mx-8">{notice}</div> : null}

    {tab === "activity" ? <div className="flex-1 px-5 py-5 lg:px-8"><p className="mb-3 text-xs text-muted-foreground">Complete audit trail of user, Alfie, and system activity on this claim.</p><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-border text-[12px] uppercase tracking-wider text-muted-foreground">{["Timestamp", "Actor", "Action", "Source", "Result"].map((h) => <th key={h} className="px-3 py-2.5 font-medium">{h}</th>)}</tr></thead><tbody>{audit.map((e, i) => <tr key={i} className="border-b border-border last:border-0"><td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{e.time}</td><td className="px-3 py-2.5"><span className="flex items-center gap-1.5 font-medium">{e.actorType === "Alfie" ? <Bot className="size-3.5 text-primary" /> : null}{e.actor}</span></td><td className="px-3 py-2.5">{e.action}</td><td className="px-3 py-2.5 text-muted-foreground">{e.source}</td><td className="px-3 py-2.5">{e.result}</td></tr>)}</tbody></table></div></div> :
    <div className="px-5 py-5 lg:px-8"><div className="mx-auto max-w-3xl">
      <ReviewBar status={`Adjuster review · step ${CURRENT + 1} of ${workflow.length}`} title="Estimate $12,400 is above your $5,000 authority" detail="Alfie has compared the estimate with the damage photos and drafted a recommendation below. A supervisor must approve any settlement.">
        <Button size="sm" variant="secondary" onClick={() => runAction("Escalate Claim")}>Escalate</Button>
        <Button size="sm" onClick={() => runAction("Prepare Recommendation")}>Prepare recommendation</Button>
      </ReviewBar>
      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2"><AlfieChip label="Alfie draft" /><span className="text-xs text-muted-foreground">Claim analysis for adjuster review. Not a coverage, liability, or settlement decision.</span></div>
        <div className="rounded-xl border border-border bg-card p-5"><ReplyView reply={mainAnalysis} />
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">{["Review Evidence", "Ask Follow-up", "Prepare Recommendation"].map((a) => <Button key={a} size="sm" variant="secondary" onClick={() => runAction(a)}>{a}</Button>)}</div>
        </div>
      </section>
      <Section title="Claim details">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-3 text-xs md:grid-cols-4">
          {([["Claim", claim.id], ["Policy", claim.policy], ["Claimant", claim.claimant], ["Loss Type", claim.type], ["Date of Loss", claim.dateOfLoss], ["Estimated Loss", money(claim.estimatedLoss)]] as const).map(([k, v]) => <div key={k}><dt className="text-[12px] text-muted-foreground">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>)}
          <div><dt className="text-[12px] text-muted-foreground">Status</dt><dd className="mt-1"><ClaimStatusBadge status={claim.status} /></dd></div>
          <div><dt className="text-[12px] text-muted-foreground">Priority</dt><dd className="mt-1"><PriorityBadge priority={claim.priority} /></dd></div>
        </dl>
      </Section>
      <Section title={`Evidence · ${evidence.length}`}>
        <div className="grid grid-cols-4 gap-2">{evidence.filter((e) => e.isImage).map((e) => <button key={e.id} onClick={() => setPreview(e)} className="overflow-hidden rounded-lg border border-border hover:ring-2 hover:ring-ring/30" aria-label={`Open ${e.label}`}><img src={e.url} alt={e.label} loading="lazy" width={944} height={704} className="aspect-square w-full object-cover" /></button>)}</div>
        <div className="mt-2 space-y-1.5">{evidence.filter((e) => !e.isImage).map((e) => <button key={e.id} onClick={() => setPreview(e)} className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card p-2 text-left hover:bg-secondary"><div className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground"><FileGlyph name={e.name} /></div><div className="min-w-0"><p className="text-xs font-medium">{e.label}</p><p className="truncate text-[12px] text-muted-foreground">{fileExt(e.name)} · {e.name}</p></div></button>)}</div>
      </Section>
      <Section title="Analysis">
        {([["Damage Analysis", "Available", "text-positive"], ["Coverage Review", "Needs Review", "text-warning"], ["Missing Information", "2 Items", "text-warning"], ["Risk Indicators", "1 Flag", "text-destructive"]] as const).map(([k, v, tone]) => <button key={k} onClick={() => send(k === "Damage Analysis" ? "Compare the repair estimate with the damage photos." : k === "Coverage Review" ? "Check the policy information." : k === "Missing Information" ? "What information is missing?" : "Show me potential risk or fraud indicators.")} className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-secondary"><span>{k}</span><span className={`font-medium ${tone}`}>{v}</span></button>)}
        <p className="mt-2 px-2 text-[12px] leading-4 text-muted-foreground">Analysis opens in the Alfie rail. AI analysis supports adjuster judgment. It is not a coverage, liability, or settlement decision.</p>
      </Section>
      <Section title="Workflow">
        <ol className="space-y-0.5">{workflow.map((step, i) => <li key={step} className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs ${i === CURRENT ? "bg-primary/10 font-semibold text-primary" : i < CURRENT ? "text-foreground" : "text-muted-foreground"}`}>{i < CURRENT ? <Check className="size-3.5 text-positive" /> : i === CURRENT ? <ChevronDown className="size-3.5 -rotate-90" /> : <Circle className="size-3" />}{step}{i === CURRENT ? <span className="ml-auto text-[12px] font-medium">Current</span> : null}</li>)}</ol>
      </Section>
    </div></div>}
    <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}><DialogContent className="max-w-2xl">{preview ? <><DialogHeader><DialogTitle>{preview.label}</DialogTitle><DialogDescription>{fileExt(preview.name)} · {preview.name} · {preview.size}</DialogDescription></DialogHeader>
      {preview.isImage ? <img src={preview.url} alt={preview.label} className="w-full rounded-lg" /> : <DocumentSheet summary={preview.summary} sections={evidenceSections[preview.id] ?? []} />}
      <DialogFooter className="flex-wrap gap-2 sm:justify-start"><Button size="sm" variant="secondary" onClick={() => download(preview)}><Download className="size-3.5" />Download</Button><Button size="sm" variant="secondary" onClick={() => { const e = preview; setPreview(null); send(`Analyze ${e.label}.`, [{ id: e.id, name: e.name, size: 200000, type: "", isImage: e.isImage, url: e.url }]); }}><Sparkle className="size-3.5" />Analyze with Alfie</Button><Button size="sm" variant="secondary" onClick={() => attachEvidence(preview)}><Paperclip className="size-3.5" />Attach to conversation</Button></DialogFooter></> : null}</DialogContent></Dialog>

    <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}><DialogContent><DialogHeader><DialogTitle>Attach to claim record?</DialogTitle><DialogDescription>These files will be added to the permanent evidence record for {claim.id} and logged in the audit trail. This cannot be undone from the conversation.</DialogDescription></DialogHeader>
      <div className="flex flex-wrap gap-2">{confirm?.files?.map((f) => <AttachmentChip key={f.id} file={f} />)}</div>
      <DialogFooter><Button variant="secondary" onClick={() => setConfirm(null)}>Keep in conversation only</Button><Button onClick={() => confirm && attachToClaim(confirm)}>Attach to Claim</Button></DialogFooter></DialogContent></Dialog>
  </div></AppShell>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-6 border-t border-border pt-5"><h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</h3>{children}</section>;
}

function ReplyView({ reply }: { reply: Reply }) {
  return <div className="space-y-3 font-display text-[15px] leading-7">
    <p>{reply.intro}</p>
    {reply.items ? <ol className="list-decimal space-y-1.5 pl-5">{reply.items.map((i) => <li key={i}>{i}</li>)}</ol> : null}
    {reply.fields ? <dl className="divide-y divide-border rounded-xl border border-border">{reply.fields.map(([k, v]) => <div key={k} className="grid grid-cols-[150px_1fr] gap-3 px-3 py-2 text-xs"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl> : null}
    {reply.note ? <p className="text-xs text-muted-foreground">{reply.note}</p> : null}
    {reply.next || reply.confidence ? <div className="flex flex-wrap gap-4 text-xs">{reply.next ? <p><span className="text-muted-foreground">Recommended next step: </span><span className="font-semibold">{reply.next}</span></p> : null}{reply.confidence ? <p><span className="text-muted-foreground">Confidence: </span><span className="font-semibold">{reply.confidence}</span></p> : null}</div> : null}
    {reply.sources ? <div className="flex flex-wrap items-center gap-1.5"><span className="text-[12px] uppercase tracking-wider text-muted-foreground">Sources</span>{reply.sources.map((s) => <span key={s} className="rounded-full border border-border bg-background px-2 py-0.5 text-[13px]">{s}</span>)}</div> : null}
  </div>;
}
