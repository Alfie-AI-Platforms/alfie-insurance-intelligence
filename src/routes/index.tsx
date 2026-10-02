import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileBarChart,
  FileText,
  FolderOpen,
  House,
  Landmark,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Network,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkle,
  Users,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alfie Insurance AI | Operations Workspace" },
      {
        name: "description",
        content: "Your AI-native workspace for insurance operations, analysis, and execution.",
      },
      { property: "og:title", content: "Alfie Insurance AI" },
      {
        property: "og:description",
        content: "Understand, analyze, and act across your insurance operations with Alfie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type NavItem = { label: string; icon: LucideIcon };

const primaryNavigation: NavItem[] = [
  { label: "Home", icon: House },
  { label: "Claims", icon: ClipboardCheck },
  { label: "Underwriting", icon: ShieldCheck },
  { label: "Policy", icon: FileText },
  { label: "Pricing & Actuarial", icon: CircleDollarSign },
  { label: "Finance", icon: Landmark },
  { label: "Reports", icon: FileBarChart },
];

const workspaceNavigation: NavItem[] = [
  { label: "Chats", icon: MessageSquareText },
  { label: "Documents", icon: FolderOpen },
  { label: "Data Sources", icon: Network },
  { label: "Automations", icon: Zap },
];

const administrationNavigation: NavItem[] = [
  { label: "Users & Access", icon: Users },
  { label: "Policies & Permissions", icon: ShieldCheck },
  { label: "Settings", icon: Settings },
];

const metrics = [
  { label: "Open Claims", value: "1,248", note: "42 need attention", tone: "text-warning" },
  { label: "Policies in Force", value: "84,392", note: "+2.8% this month", tone: "text-positive" },
  { label: "Written Premium", value: "$128.4M", note: "YTD · +6.2%", tone: "text-positive" },
  { label: "Combined Ratio", value: "94.6%", note: "1.8 pts better", tone: "text-positive" },
];

const prompts = [
  "Show me the highest-risk open claims.",
  "Which policies are approaching renewal?",
  "Analyze our underwriting performance.",
  "Why did our loss ratio change?",
  "Find potential fraud signals.",
  "Prepare a claims expense analysis.",
];

const activities = [
  { icon: FileBarChart, title: "Claims expense analysis completed", meta: "Commercial Auto · 18 minutes ago" },
  { icon: ShieldCheck, title: "Reviewed 126 renewal policies", meta: "Underwriting · 1 hour ago" },
  { icon: Sparkle, title: "Identified 8 potential fraud signals", meta: "Claims · 3 hours ago" },
];

function NavigationGroup({ title, items, active, collapsed, onSelect }: {
  title?: string;
  items: NavItem[];
  active: string;
  collapsed: boolean;
  onSelect: (label: string) => void;
}) {
  return (
    <div className="space-y-1">
      {title && !collapsed ? <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{title}</p> : null}
      {items.map(({ label, icon: Icon }) => (
        <Button
          key={label}
          variant="ghost"
          onClick={() => onSelect(label)}
          title={collapsed ? label : undefined}
          className={`w-full ${collapsed ? "px-0" : "justify-start px-3"} ${active === label ? "bg-secondary text-foreground" : ""}`}
        >
          <Icon className="size-4" strokeWidth={1.7} />
          {!collapsed ? <span className="truncate">{label}</span> : null}
        </Button>
      ))}
    </div>
  );
}

function Index() {
  const [active, setActive] = useState("Home");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [rightPanel, setRightPanel] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const submitPrompt = () => {
    const next = prompt.trim();
    if (!next) return;
    setSubmitted(next);
    setPrompt("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      {mobileNav ? <div className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={() => setMobileNav(false)} aria-hidden="true" /> : null}

      <aside className={`fixed inset-y-0 left-0 z-40 flex border-r border-border bg-sidebar transition-[width,transform] duration-200 lg:relative lg:translate-x-0 ${mobileNav ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "w-[72px]" : "w-[248px]"}`}>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className={`flex h-16 items-center border-b border-border ${collapsed ? "justify-center" : "justify-between px-4"}`}>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Bot className="size-4" /></div>
              {!collapsed ? <div><div className="text-[15px] font-semibold leading-none">Alfie</div><div className="mt-1 text-[10px] text-muted-foreground">Insurance AI</div></div> : null}
            </div>
            {!collapsed ? <Button variant="ghost" size="icon" onClick={() => setMobileNav(false)} className="lg:hidden" aria-label="Close navigation"><X className="size-4" /></Button> : null}
          </div>

          {!collapsed ? (
            <div className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-border bg-background p-2">
              <div className="flex size-7 items-center justify-center rounded bg-ink text-ink-foreground"><Building2 className="size-3.5" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">Northstar Mutual</p><p className="text-[10px] text-muted-foreground">Enterprise workspace</p></div>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </div>
          ) : null}

          <nav className="scrollbar-none flex-1 space-y-4 overflow-y-auto p-3">
            <NavigationGroup items={primaryNavigation} active={active} collapsed={collapsed} onSelect={(item) => { setActive(item); setMobileNav(false); }} />
            <NavigationGroup title="Workspace" items={workspaceNavigation} active={active} collapsed={collapsed} onSelect={(item) => { setActive(item); setMobileNav(false); }} />
            <NavigationGroup title="Administration" items={administrationNavigation} active={active} collapsed={collapsed} onSelect={(item) => { setActive(item); setMobileNav(false); }} />
          </nav>

          <div className="border-t border-border p-3">
            {!collapsed ? <div className="mb-2 rounded-md bg-premium p-3 text-premium-foreground"><div className="flex items-center gap-2 text-xs font-semibold"><WandSparkles className="size-4" /> Alfie Pro</div><p className="mt-1 text-[10px] text-premium-muted">Your AI copilot for insurance</p></div> : null}
            <Button variant="ghost" size={collapsed ? "icon" : "default"} onClick={() => setCollapsed((value) => !value)} className={collapsed ? "w-full" : "w-full justify-start px-3"} aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}>
              {collapsed ? <ChevronRight className="size-4" /> : <><ChevronLeft className="size-4" /><span>Collapse</span></>}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
          <Button variant="ghost" size="icon" onClick={() => setMobileNav(true)} className="lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
          <div className="relative mx-auto w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input className="h-10 w-full rounded-md border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Search across claims, policies, customers, or ask Alfie…" aria-label="Global search" />
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-notification" /></Button>
          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex size-8 items-center justify-center rounded-full bg-avatar text-xs font-semibold text-avatar-foreground">JD</div>
            <div className="hidden xl:block"><p className="text-xs font-semibold">Jane Davies</p><p className="text-[10px] text-muted-foreground">Insurance Manager</p></div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" onClick={() => setRightPanel((value) => !value)} className="xl:hidden" aria-label="Toggle context panel"><MoreHorizontal className="size-5" /></Button>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="scrollbar-thin flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full max-w-5xl flex-col px-5 pb-8 pt-8 lg:px-10 lg:pt-10">
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div><p className="mb-1 text-xs font-medium text-muted-foreground">Friday, October 2</p><h1 className="font-display text-3xl font-semibold tracking-normal">Good morning, Jane</h1><p className="mt-2 text-sm text-muted-foreground">Here’s what’s happening in your insurance operations today.</p></div>
                  <Button variant="secondary" size="sm" className="hidden sm:inline-flex"><FileBarChart className="size-3.5" /> Daily briefing</Button>
                </div>

                <div className="mt-8 grid grid-cols-2 border-y border-border lg:grid-cols-4">
                  {metrics.map((metric, index) => <div key={metric.label} className={`py-4 ${index % 2 === 0 ? "pr-4" : "pl-4"} ${index > 1 ? "border-t border-border lg:border-t-0" : ""} lg:border-r lg:px-5 lg:first:pl-0 lg:last:border-r-0`}><p className="text-[11px] font-medium text-muted-foreground">{metric.label}</p><p className="mt-2 font-display text-2xl font-semibold">{metric.value}</p><p className={`mt-1 text-[10px] font-medium ${metric.tone}`}>{metric.note}</p></div>)}
                </div>
              </section>

              <section className="flex flex-1 flex-col justify-end pt-12">
                <div className="mx-auto w-full max-w-3xl">
                  <div className="mb-5 text-center"><div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><Bot className="size-4" /></div><h2 className="font-display text-xl font-semibold">What can Alfie help you with?</h2></div>
                  {submitted ? <div className="mb-4 rounded-md border border-border bg-secondary/60 px-4 py-3 text-sm"><span className="mr-2 font-semibold">You asked:</span>{submitted}</div> : null}
                  <div className="rounded-lg border border-border bg-card p-2 shadow-workspace focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/15">
                    <textarea ref={inputRef} value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitPrompt(); } }} rows={3} placeholder="Ask Alfie anything about your insurance operations…" className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
                    <div className="flex flex-wrap items-center gap-1 border-t border-border px-1 pt-2">
                      {["Analyze", "Summarize", "Create Report", "Take Action"].map((action) => <Button key={action} variant="ghost" size="sm" onClick={() => setPrompt(`${action}: `)}>{action === "Analyze" ? <Sparkle className="size-3.5" /> : action === "Summarize" ? <FileText className="size-3.5" /> : action === "Create Report" ? <FileBarChart className="size-3.5" /> : <Zap className="size-3.5" />}{action}</Button>)}
                      <Button size="icon" onClick={submitPrompt} disabled={!prompt.trim()} className="ml-auto size-8" aria-label="Ask Alfie"><Send className="size-3.5" /></Button>
                    </div>
                  </div>

                  <div className="mt-6"><div className="mb-2 flex items-center justify-between"><h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Suggested prompts</h3><span className="text-[10px] text-muted-foreground">Tailored to your role</span></div><div className="grid gap-2 sm:grid-cols-2">{prompts.slice(0, 4).map((item) => <Button key={item} variant="secondary" onClick={() => setPrompt(item)} className="h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left text-xs font-normal"><Sparkle className="size-3.5 shrink-0 text-primary" />{item}</Button>)}</div></div>
                </div>

                <div className="mt-10 border-t border-border pt-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-xs font-semibold">Recent activity</h3><Button variant="ghost" size="sm">View all</Button></div><div className="grid gap-2 md:grid-cols-3">{activities.map(({ icon: Icon, title, meta }) => <button key={title} className="group flex min-h-20 items-start gap-3 rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-secondary"><div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded bg-secondary"><Icon className="size-3.5" /></div><div><p className="text-xs font-medium leading-5">{title}</p><p className="mt-1 text-[10px] text-muted-foreground">{meta}</p></div></button>)}</div></div>
              </section>
            </div>
          </main>

          <aside className={`${rightPanel ? "flex" : "hidden"} absolute inset-y-16 right-0 z-20 w-[300px] flex-col border-l border-border bg-panel p-5 shadow-workspace xl:relative xl:inset-auto xl:flex xl:shadow-none`}>
            <div className="mb-6 flex items-center justify-between"><h2 className="text-sm font-semibold">Workspace context</h2><Button variant="ghost" size="icon" onClick={() => setRightPanel(false)} className="xl:hidden" aria-label="Close context panel"><X className="size-4" /></Button></div>
            <div className="grid grid-cols-2 gap-2"><div className="rounded-md border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">Current context</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold"><Building2 className="size-3.5 text-primary" />Insurance</div></div><div className="rounded-md border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">Active workspace</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold"><ClipboardCheck className="size-3.5 text-primary" />Claims</div></div></div>
            <div className="mt-7"><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Quick actions</p>{["Create New Claim", "Underwrite a Policy", "Run Pricing Analysis", "Generate Report", "View Policy Details"].map((item) => <Button key={item} variant="ghost" onClick={() => setPrompt(item)} className="w-full justify-start px-2 text-xs"><Plus className="size-3.5" />{item}</Button>)}</div>
            <div className="mt-7"><div className="mb-2 flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent conversations</p><Button variant="ghost" size="icon" className="size-7" aria-label="New conversation"><Plus className="size-3.5" /></Button></div><div className="space-y-1">{[["Loss ratio drivers", "Pricing & Actuarial"], ["Hurricane claim exposure", "Claims"], ["Renewal risk summary", "Underwriting"], ["Q3 board report", "Reports"]].map(([title, category]) => <Button key={title} variant="ghost" className="h-auto w-full justify-start px-2 py-2 text-left"><MessageSquareText className="size-3.5 shrink-0" /><span className="min-w-0"><span className="block truncate text-xs text-foreground">{title}</span><span className="block text-[10px] font-normal text-muted-foreground">{category}</span></span></Button>)}</div></div>
            <div className="mt-auto border-t border-border pt-4"><p className="text-[10px] leading-4 text-muted-foreground">Alfie uses approved enterprise data sources and respects your access permissions.</p></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
