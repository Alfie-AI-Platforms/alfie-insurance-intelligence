import { createFileRoute } from "@tanstack/react-router";
import { Bot, Building2, ClipboardCheck, FileBarChart, FileText, Plus, Send, ShieldCheck, Sparkle, X, Zap, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Alfie Insurance AI | Operations Workspace" }, { name: "description", content: "Your AI-native workspace for insurance operations, analysis, and execution." }, { property: "og:title", content: "Alfie Insurance AI" }, { property: "og:description", content: "Understand, analyze, and act across your insurance operations with Alfie." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Index,
});

const metrics = [
  ["Open Claims", "1,248", "42 need attention", "text-warning"],
  ["Policies in Force", "84,392", "+2.8% this month", "text-positive"],
  ["Written Premium", "$128.4M", "YTD · +6.2%", "text-positive"],
  ["Combined Ratio", "94.6%", "1.8 pts better", "text-positive"],
];
const prompts = ["Show me the highest-risk open claims.", "Which policies are approaching renewal?", "Analyze our underwriting performance.", "Why did our loss ratio change?"];
const activities: readonly (readonly [LucideIcon, string, string])[] = [[FileBarChart, "Claims expense analysis completed", "Commercial Auto · 18 minutes ago"], [ShieldCheck, "Reviewed 126 renewal policies", "Underwriting · 1 hour ago"], [Sparkle, "Identified 8 potential fraud signals", "Claims · 3 hours ago"]];
const contextItems: readonly (readonly [string, string, LucideIcon])[] = [["Current context", "Insurance", Building2], ["Active workspace", "Claims", ClipboardCheck]];
const promptActions: readonly (readonly [string, LucideIcon])[] = [["Analyze", Sparkle], ["Summarize", FileText], ["Create Report", FileBarChart], ["Take Action", Zap]];

function Index() {
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [rightPanel, setRightPanel] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => inputRef.current?.focus(), []);
  const submit = () => { if (!prompt.trim()) return; setSubmitted(prompt.trim()); setPrompt(""); window.setTimeout(() => inputRef.current?.focus(), 0); };

  const contextPanel = <aside className={`${rightPanel ? "flex" : "hidden"} absolute inset-y-16 right-0 z-20 w-[300px] flex-col border-l border-border bg-panel p-5 shadow-workspace xl:relative xl:inset-auto xl:flex xl:shadow-none`}>
    <div className="mb-6 flex items-center justify-between"><h2 className="text-sm font-semibold">Workspace context</h2><Button variant="ghost" size="icon" onClick={() => setRightPanel(false)} className="xl:hidden" aria-label="Close context panel"><X className="size-4" /></Button></div>
    <div className="grid grid-cols-2 gap-2">{contextItems.map(([label, value, Icon]) => <div key={label} className="rounded-md border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">{label}</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold"><Icon className="size-3.5 text-primary" />{value}</div></div>)}</div>
    <div className="mt-7"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick actions</p>{["Create New Claim", "Underwrite a Policy", "Run Pricing Analysis", "Generate Report", "View Policy Details"].map((item) => <Button key={item} variant="ghost" onClick={() => setPrompt(item)} className="w-full justify-start px-2 text-xs"><Plus className="size-3.5" />{item}</Button>)}</div>
    <div className="mt-auto border-t border-border pt-4"><p className="text-[10px] leading-4 text-muted-foreground">Alfie uses approved enterprise data sources and respects your access permissions.</p></div>
  </aside>;

  return <AppShell rightPanel={contextPanel}><div className="mx-auto flex min-h-full max-w-5xl flex-col px-5 pb-8 pt-8 lg:px-10 lg:pt-10">
    <section><div className="flex items-end justify-between gap-4"><div><p className="mb-1 text-xs font-medium text-muted-foreground">Friday, October 2</p><h1 className="text-3xl font-semibold">Good morning, Jane</h1><p className="mt-2 text-sm text-muted-foreground">Here’s what’s happening in your insurance operations today.</p></div><Button variant="secondary" size="sm" className="hidden sm:inline-flex"><FileBarChart className="size-3.5" />Daily briefing</Button></div>
      <div className="mt-8 grid grid-cols-2 border-y border-border lg:grid-cols-4">{metrics.map(([label, value, note, tone], index) => <div key={label} className={`py-4 ${index % 2 === 0 ? "pr-4" : "pl-4"} ${index > 1 ? "border-t border-border lg:border-t-0" : ""} lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0`}><p className="text-[11px] font-medium text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className={`mt-1 text-[10px] font-medium ${tone}`}>{note}</p></div>)}</div>
    </section>
    <section className="flex flex-1 flex-col justify-end pt-12"><div className="mx-auto w-full max-w-3xl"><div className="mb-5 text-center"><div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Bot className="size-4" /></div><h2 className="text-xl font-semibold">What can Alfie help you with?</h2></div>
      {submitted ? <div className="mb-4 rounded-md border border-border bg-secondary/60 px-4 py-3 text-sm"><span className="mr-2 font-semibold">You asked:</span>{submitted}</div> : null}
      <div className="rounded-lg border border-border bg-card p-2 shadow-workspace focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15"><textarea ref={inputRef} value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={3} placeholder="Ask Alfie anything about your insurance operations…" className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" /><div className="flex flex-wrap items-center gap-1 border-t border-border px-1 pt-2">{promptActions.map(([action, Icon]) => <Button key={action} variant="ghost" size="sm" onClick={() => setPrompt(`${action}: `)}><Icon className="size-3.5" />{action}</Button>)}<Button size="icon" onClick={submit} disabled={!prompt.trim()} className="ml-auto size-8" aria-label="Ask Alfie"><Send className="size-3.5" /></Button></div></div>
      <div className="mt-6"><div className="mb-2 flex items-center justify-between"><h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggested prompts</h3><span className="text-[10px] text-muted-foreground">Tailored to your role</span></div><div className="grid gap-2 sm:grid-cols-2">{prompts.map((item) => <Button key={item} variant="secondary" onClick={() => setPrompt(item)} className="h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left text-xs font-normal"><Sparkle className="size-3.5 shrink-0 text-primary" />{item}</Button>)}</div></div>
    </div><div className="mt-10 border-t border-border pt-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold">Recent activity</h3><Button variant="ghost" size="sm">View all</Button></div><div className="grid gap-2 md:grid-cols-3">{activities.map(([Icon, title, meta]) => <Button key={title} variant="secondary" className="h-auto min-h-20 items-start justify-start gap-3 whitespace-normal p-3 text-left font-normal"><div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-secondary"><Icon className="size-3.5" /></div><span><span className="block text-xs font-medium leading-5">{title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{meta}</span></span></Button>)}</div></div></section>
  </div></AppShell>;
}