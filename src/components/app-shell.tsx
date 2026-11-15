import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeftRight, Bell, Bot, Building2, ChevronDown, ChevronLeft, ChevronRight, CircleDollarSign, ClipboardCheck, CreditCard, FileBarChart, FileText, FolderOpen, House, Landmark, Menu, MessageSquareText, Moon, Network, Settings, ShieldCheck, Sparkles, Sun, User, Users, WandSparkles, X, Zap, LifeBuoy, LogOut, Rocket, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notifications, type NotificationItem, type NotificationKind } from "@/lib/notifications-data";
import { searchEntries, type SearchEntry } from "@/lib/search-data";

type NavItem = readonly [string, "/" | "/agents" | "/claims" | "/underwriting" | "/policy" | "/pricing" | "/finance" | "/chats" | "/documents" | "/data-sources" | "/automations" | "/users" | "/permissions" | "/billing" | "/settings" | "/reports" | "/migration" | "/onboarding", LucideIcon];
type NavGroup = { title: string; items: readonly NavItem[] };
const groups: readonly NavGroup[] = [
  { title: "", items: [["Home", "/", House]] },
  { title: "Work", items: [["Claims", "/claims", ClipboardCheck], ["Underwriting", "/underwriting", ShieldCheck], ["Policy", "/policy", FileText]] },
  { title: "Intelligence", items: [["Pricing & Actuarial", "/pricing", CircleDollarSign], ["Finance", "/finance", Landmark], ["Reports", "/reports", FileBarChart]] },
  { title: "Library", items: [["Chats", "/chats", MessageSquareText], ["Documents", "/documents", FolderOpen], ["Data Sources", "/data-sources", Network], ["Migration", "/migration", ArrowLeftRight], ["Automations", "/automations", Zap], ["Agents", "/agents", Bot]] },
  { title: "Administration", items: [["Onboarding", "/onboarding", Rocket], ["Users & Access", "/users", Users], ["Policies & Permissions", "/permissions", ShieldCheck], ["Billing", "/billing", CreditCard], ["Settings", "/settings", Settings]] },
];
const profileItems: readonly (readonly [string, LucideIcon, ("/profile" | "/preferences" | "/help")?])[] = [["Profile", User, "/profile"], ["Preferences", SlidersHorizontal, "/preferences"], ["Help", LifeBuoy, "/help"], ["Sign out", LogOut]];

const notificationIcons: Record<NotificationKind, LucideIcon> = {
  approval: ShieldCheck,
  automation: Zap,
  claim: ClipboardCheck,
  system: Network,
  report: FileBarChart,
  billing: CreditCard,
};

export function AppShell({ children, rightPanel }: { children: ReactNode; rightPanel?: ReactNode }) {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("alfie.notifications.v1");
      if (raw) setReadIds(JSON.parse(raw) as string[]);
    } catch {
      // unread state is a convenience; ignore storage errors
    }
  }, []);

  const persistReadIds = (ids: string[]) => {
    setReadIds(ids);
    try {
      window.localStorage.setItem("alfie.notifications.v1", JSON.stringify(ids));
    } catch {
      // see above
    }
  };

  const markRead = (id: string) => {
    if (!readIds.includes(id)) persistReadIds([...readIds, id]);
  };
  const activeLabel = path.startsWith("/agents") ? "Agents" : path.startsWith("/claims") ? "Claims" : path.startsWith("/underwriting") ? "Underwriting" : path.startsWith("/policy") ? "Policy" : path.startsWith("/pricing") ? "Pricing & Actuarial" : path.startsWith("/finance") ? "Finance" : path.startsWith("/chats") ? "Chats" : path.startsWith("/documents") ? "Documents" : path.startsWith("/data-sources") ? "Data Sources" : path.startsWith("/automations") ? "Automations" : path.startsWith("/users") ? "Users & Access" : path.startsWith("/permissions") ? "Policies & Permissions" : path.startsWith("/migration") ? "Migration" : path.startsWith("/onboarding") ? "Onboarding" : path.startsWith("/profile") ? "Profile" : path.startsWith("/preferences") ? "Preferences" : path.startsWith("/help") ? "Help" : path.startsWith("/billing") ? "Billing" : path.startsWith("/settings") ? "Settings" : path.startsWith("/reports") ? "Reports" : "Home";

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
          <div className="min-w-0"><p className="truncate text-sm font-semibold">Northstar Mutual</p><p className="text-[12px] text-muted-foreground">Insurance workspace</p></div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed((value) => !value)} className="hidden lg:inline-flex" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</Button>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="lg:hidden" aria-label="Close navigation"><X className="size-4" /></Button>
      </div>
      <nav className="scrollbar-none flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((group) => <div key={group.title || "primary"} className="space-y-1">
          {group.title && !collapsed ? <p className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{group.title}</p> : null}
          {group.items.map(([label, to, Icon]) => <Button key={label} asChild variant="ghost" title={collapsed ? label : undefined} className={`w-full ${collapsed ? "px-0" : "justify-start px-3"} ${activeLabel === label ? "bg-secondary text-foreground" : ""}`}><Link to={to} onClick={() => setMobileOpen(false)}><Icon className="size-4" strokeWidth={1.7} />{!collapsed ? <span className="truncate">{label}</span> : null}</Link></Button>)}
        </div>)}
      </nav>
      <div className="relative p-3">
        <div className={`alfie-surface mb-2 rounded-md text-white ${collapsed ? "flex size-10 items-center justify-center p-0" : "p-3"}`} title="Alfie Pro">
          <div className="flex items-center gap-2 text-xs font-semibold"><WandSparkles className="size-4 text-brand-cyan" />{!collapsed ? "Alfie Pro" : null}</div>{!collapsed ? <p className="mt-1 text-[12px] text-white/70">Your AI copilot for insurance</p> : null}
        </div>
        {profileOpen ? <div className={`absolute bottom-[66px] z-50 w-52 rounded-md border border-border bg-popover p-1 shadow-workspace ${collapsed ? "left-14" : "left-3"}`}>{profileItems.map(([label, Icon, to]) => to ? <Button key={label} asChild variant="ghost" className="w-full justify-start px-3 text-xs"><Link to={to} onClick={() => setProfileOpen(false)}><Icon className="size-4" />{label}</Link></Button> : <Button key={label} variant="ghost" className="w-full justify-start px-3 text-xs" onClick={() => setProfileOpen(false)}><Icon className="size-4" />{label}</Button>)}</div> : null}
        <Button variant="ghost" onClick={() => setProfileOpen((value) => !value)} className={`h-auto w-full ${collapsed ? "px-0" : "justify-start px-2 py-2"}`} aria-label="Open user menu">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-avatar text-xs font-semibold text-avatar-foreground">JD</div>
          {!collapsed ? <><span className="min-w-0 flex-1 text-left"><span className="block text-xs font-semibold text-foreground">Jane Doe</span><span className="block text-[12px] font-normal text-muted-foreground">Insurance Manager</span></span><ChevronDown className="size-3.5" /></> : null}
        </Button>
      </div>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 bg-background px-4 lg:px-6">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></Button>
        <div className="relative mx-auto w-full max-w-2xl"><SearchField /></div>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"} title={darkMode ? "Light mode" : "Dark mode"}>{darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}</Button>
        <div className="relative">
          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative" onClick={() => setNotificationsOpen((value) => !value)}>
            <Bell className="size-4" />
            {unreadCount > 0 ? <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-notification px-1 text-[12px] font-semibold text-white">{unreadCount}</span> : null}
          </Button>
          {notificationsOpen ? <>
            <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={() => setNotificationsOpen(false)} />
            <div className="absolute right-0 top-12 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-popover p-2 shadow-workspace">
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="text-sm font-semibold">Notifications</p>
                <button type="button" className="text-[13px] font-medium text-primary hover:underline disabled:text-muted-foreground" disabled={unreadCount === 0} onClick={() => persistReadIds(notifications.map((n) => n.id))}>Mark all read</button>
              </div>
              <ul className="max-h-[55vh] divide-y divide-border/60 overflow-y-auto">
                {notifications.map((n) => <li key={n.id}><NotificationRow item={n} unread={!readIds.includes(n.id)} onSelect={() => { markRead(n.id); setNotificationsOpen(false); }} /></li>)}
              </ul>
              <div className="border-t border-border px-2 py-2">
                <Link to="/preferences" className="text-[13px] font-medium text-primary hover:underline" onClick={() => setNotificationsOpen(false)}>Notification preferences</Link>
              </div>
            </div>
          </> : null}
        </div>
      </header>
      <div className="flex min-h-0 flex-1"><main className="scrollbar-thin flex-1 overflow-y-auto">{children}</main>{rightPanel}</div>
    </div>
  </div>;
}

function NotificationRow({ item, unread, onSelect }: { item: NotificationItem; unread: boolean; onSelect: () => void }) {
  const Icon = notificationIcons[item.kind];
  const inner = <>
    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary"><Icon className="size-4" strokeWidth={1.7} /></span>
    <span className="min-w-0 flex-1">
      <span className={`block text-[13px] leading-5 ${unread ? "font-semibold" : "font-medium"}`}>{item.title}</span>
      <span className="mt-0.5 block text-[13px] leading-5 text-muted-foreground">{item.detail}</span>
      <span className="mt-0.5 block text-[12px] text-muted-foreground">{item.time}</span>
    </span>
    {unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-notification" /> : null}
  </>;
  const cls = "flex w-full items-start gap-3 px-2 py-2.5 text-left hover:bg-secondary/60";
  return item.link.to === "/claims/$claimId"
    ? <Link to="/claims/$claimId" params={item.link.params} className={cls} onClick={onSelect}>{inner}</Link>
    : <Link to={item.link.to} className={cls} onClick={onSelect}>{inner}</Link>;
}

function SearchResultRow({ entry, onSelect }: { entry: SearchEntry; onSelect: () => void }) {
  const inner = <>
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium">{entry.title}</span>
      <span className="block truncate text-[13px] text-muted-foreground">{entry.detail}</span>
    </span>
    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[12px] font-semibold text-muted-foreground">{entry.kind}</span>
  </>;
  const cls = "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary/60";
  const link = entry.link;
  if (link.to === "/claims/$claimId") return <Link to="/claims/$claimId" params={link.params} className={cls} onClick={onSelect}>{inner}</Link>;
  if (link.to === "/underwriting/$submissionId") return <Link to="/underwriting/$submissionId" params={link.params} className={cls} onClick={onSelect}>{inner}</Link>;
  if (link.to === "/policy/$policyId") return <Link to="/policy/$policyId" params={link.params} className={cls} onClick={onSelect}>{inner}</Link>;
  return <Link to={link.to} className={cls} onClick={onSelect}>{inner}</Link>;
}

function SearchField() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchEntries(query), [query]);
  const close = () => { setOpen(false); setQuery(""); };
  const showPanel = open && query.trim().length > 0;
  return <>
    <span aria-hidden="true" className="alfie-gradient absolute left-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-white"><Sparkles className="size-3" /></span>
    <input
      value={query}
      onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      onFocus={() => setOpen(true)}
      onKeyDown={(e) => { if (e.key === "Escape") close(); }}
      className="h-10 w-full rounded-md border border-border bg-secondary/50 pl-10 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-brand-teal focus:ring-2 focus:ring-brand-cyan/25"
      placeholder="Search across claims, policies, customers, or ask Alfie…"
      aria-label="Global search"
    />
    {showPanel ? <>
      <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-40 cursor-default" onClick={close} />
      <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-border bg-popover py-1.5 shadow-workspace">
        <Link to="/chats" className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary/60" onClick={close}>
          <span className="alfie-gradient flex size-6 shrink-0 items-center justify-center rounded-md text-white"><Sparkles className="size-3.5" /></span>
          <span className="min-w-0 flex-1 truncate text-sm">Ask Alfie: <span className="font-medium">“{query.trim()}”</span></span>
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">Alfie</span>
        </Link>
        {results.length > 0 ? <ul className="mt-1 border-t border-border/60 pt-1">
          {results.map((entry) => <li key={`${entry.kind}-${entry.title}`}><SearchResultRow entry={entry} onSelect={close} /></li>)}
        </ul> : <p className="border-t border-border/60 px-3 pb-1 pt-2.5 text-[13px] text-muted-foreground">No records match. Alfie can still take the question in a chat.</p>}
      </div>
    </> : null}
  </>;
}
