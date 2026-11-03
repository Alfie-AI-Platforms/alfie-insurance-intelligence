import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Bell, Bot, Building2, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardCheck, FileBarChart, FileText, FolderOpen, House, Landmark, Menu, MessageSquareText, Moon, Network, Settings, ShieldCheck, Sun, User, Users, WandSparkles, X, Zap, LifeBuoy, LogOut, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = readonly [string, "/" | "/agents" | "/claims" | "/underwriting" | "/policy", LucideIcon];
type NavGroup = { title: string; items: readonly NavItem[] };
const groups: readonly NavGroup[] = [
  { title: "", items: [["Home", "/", House], ["Claims", "/claims", ClipboardCheck], ["Underwriting", "/underwriting", ShieldCheck], ["Policy", "/policy", FileText], ["Pricing & Actuarial", "/", CircleDollarSign], ["Finance", "/", Landmark], ["Reports", "/", FileBarChart]] },
  { title: "Workspace", items: [["Chats", "/", MessageSquareText], ["Documents", "/", FolderOpen], ["Data Sources", "/", Network], ["Automations", "/", Zap]] },
  { title: "Administration", items: [["Users & Access", "/", Users], ["Policies & Permissions", "/", ShieldCheck], ["Agents", "/agents", Bot], ["Settings", "/", Settings]] },
];
const profileItems: readonly (readonly [string, LucideIcon])[] = [["Profile", User], ["Preferences", SlidersHorizontal], ["Help", LifeBuoy], ["Sign out", LogOut]];

export function AppShell({ children, rightPanel }: { children: ReactNode; rightPanel?: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const activeLabel = path.startsWith("/agents") ? "Agents" : path.startsWith("/claims") ? "Claims" : path.startsWith("/underwriting") ? "Underwriting" : path.startsWith("/policy") ? "Policy" : "Home";

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("alfie-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", shouldUseDark);
    setDarkMode(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    setDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("alfie-theme", next ? "dark" : "light");
      return next;
    });
  };

  return <div className="flex h-screen overflow-hidden bg-background text-foreground">
    {mobileOpen ? <div className="fixed inset-0 z-30 bg-overlay lg:hidden" onClick={() => setMobileOpen(false)} /> : null}
    <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-sidebar transition-[width,transform] duration-200 ease-out lg:relative lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "w-[72px]" : "w-[248px]"}`}>
      <div className={`flex h-16 shrink-0 items-center ${collapsed ? "justify-center" : "justify-between px-3"}`}>
        <div className={`flex min-w-0 items-center ${collapsed ? "hidden" : "gap-2.5"}`}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-ink text-ink-foreground"><Building2 className="size-4" /></div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">Northstar Mutual</p><p className="text-[10px] text-muted-foreground">Insurance workspace</p></div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)} className="hidden lg:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</Button>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Close navigation"><X className="size-4" /></Button>
      </div>
      <nav className="scrollbar-none flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((group) => <div key={group.title || "primary"} className="space-y-1">
          {group.title && !collapsed ? <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{group.title}</p> : null}
          {group.items.map(([label, to, Icon]) => <Button key={label} asChild variant="ghost" title={collapsed ? label : undefined} className={`w-full ${collapsed ? "px-0" : "justify-start px-3"} ${activeLabel === label ? "bg-secondary text-foreground" : ""}`}><Link to={to} onClick={() => setMobileOpen(false)}><Icon className="size-4" strokeWidth={1.7} />{!collapsed ? <span className="truncate">{label}</span> : null}</Link></Button>)}
        </div>)}
      </nav>
      <div className="relative p-3">
        <div className={`mb-2 rounded-md bg-premium text-premium-foreground ${collapsed ? "flex size-10 items-center justify-center p-0" : "p-3"}`} title="Alfie Pro">
          <div className="flex items-center gap-2 text-xs font-semibold"><WandSparkles className="size-4" />{!collapsed ? "Alfie Pro" : null}</div>{!collapsed ? <p className="mt-1 text-[10px] text-premium-muted">Your AI copilot for insurance</p> : null}
        </div>
        {profileOpen ? <div className={`absolute bottom-[66px] z-50 w-52 rounded-md border border-border bg-popover p-1 shadow-workspace ${collapsed ? "left-14" : "left-3"}`}>{profileItems.map(([label, Icon]) => <Button key={label} variant="ghost" className="w-full justify-start px-3 text-xs" onClick={() => setProfileOpen(false)}><Icon className="size-4" />{label}</Button>)}</div> : null}
        <Button variant="ghost" onClick={() => setProfileOpen((value) => !value)} className={`h-auto w-full ${collapsed ? "px-0" : "justify-start px-2 py-2"}`} aria-label="Open user menu">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-avatar text-xs font-semibold text-avatar-foreground">JD</div>
          {!collapsed ? <><span className="min-w-0 flex-1 text-left"><span className="block text-xs font-semibold text-foreground">Jane Doe</span><span className="block text-[10px] font-normal text-muted-foreground">Insurance Manager</span></span><ChevronDown className="size-3.5" /></> : null}
        </Button>
      </div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 bg-background px-4 lg:px-6">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
        <div className="relative mx-auto w-full max-w-2xl"><SearchField /></div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"}>{darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-notification" /></Button>
      </header>
      <div className="flex min-h-0 flex-1"><main className="scrollbar-thin flex-1 overflow-y-auto">{children}</main>{rightPanel}</div>
    </div>
  </div>;
}

function SearchField() {
  return <><svg aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg><input className="h-10 w-full rounded-md border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Search across claims, policies, customers, or ask Alfie…" aria-label="Global search" /></>;
}