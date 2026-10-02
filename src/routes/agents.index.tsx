import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, MoreHorizontal, Pause, Pencil, Play, Plus, Trash2, Activity, ExternalLink } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { agents as initialAgents } from "@/lib/agents-data";

export const Route = createFileRoute("/agents/")({ head: () => ({ meta: [{ title: "Agents | Alfie Insurance AI" }, { name: "description", content: "Create and manage specialized insurance AI agents." }, { property: "og:title", content: "Agents | Alfie Insurance AI" }, { property: "og:description", content: "Create and manage specialized insurance AI agents." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: AgentsPage });

function AgentsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialAgents);
  const [menu, setMenu] = useState<string | null>(null);
  return <AppShell><div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Agents</h1><p className="mt-2 text-sm text-muted-foreground">Create and manage AI agents that work across your insurance operations.</p></div><Button onClick={() => navigate({ to: "/agents/new" })}><Plus className="size-4" />Create Agent</Button></div>
    <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
      <div className="hidden grid-cols-[2fr_1fr_110px_110px_1fr_44px] gap-4 border-b border-border bg-secondary/50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground md:grid"><span>Agent</span><span>Department</span><span>Status</span><span>Last run</span><span>Access</span><span /></div>
      {items.map((agent) => <div key={agent.id} className="relative grid gap-3 border-b border-border px-4 py-4 last:border-0 md:grid-cols-[2fr_1fr_110px_110px_1fr_44px] md:items-center md:gap-4">
        <div className="flex min-w-0 gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary"><agent.icon className="size-4 text-primary" /></div><div className="min-w-0"><button className="truncate text-left text-sm font-semibold hover:text-primary" onClick={() => navigate({ to: "/agents/$agentId", params: { agentId: agent.id } })}>{agent.name}</button><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{agent.description}</p><p className="mt-1 text-[10px] text-muted-foreground">Created by {agent.createdBy}</p></div></div>
        <p className="text-xs font-medium">{agent.department}</p><StatusBadge status={agent.status} /><p className="text-xs text-muted-foreground">{agent.lastRun}</p><p className="text-xs text-muted-foreground">{agent.access}</p>
        <Button variant="ghost" size="icon" onClick={() => setMenu(menu === agent.id ? null : agent.id)} aria-label={`Actions for ${agent.name}`}><MoreHorizontal className="size-4" /></Button>
        {menu === agent.id ? <div className="absolute right-4 top-14 z-10 w-44 rounded-md border border-border bg-popover p-1 shadow-workspace">{[["Open", ExternalLink], ["Edit", Pencil], ["Duplicate", Copy], [agent.status === "Paused" ? "Resume" : "Pause", agent.status === "Paused" ? Play : Pause], ["View activity", Activity], ["Delete", Trash2]].map(([label, Icon]) => <Button key={label as string} variant="ghost" className="w-full justify-start px-3 text-xs" onClick={() => { if (label === "Open") navigate({ to: "/agents/$agentId", params: { agentId: agent.id } }); else if (label === "Edit") navigate({ to: "/agents/$agentId/edit", params: { agentId: agent.id } }); else if (label === "Delete") setItems((current) => current.filter((item) => item.id !== agent.id)); else if (label === "Pause" || label === "Resume") setItems((current) => current.map((item) => item.id === agent.id ? { ...item, status: item.status === "Paused" ? "Active" : "Paused" } : item)); else if (label === "Duplicate") setItems((current) => [...current, { ...agent, id: `${agent.id}-copy`, name: `${agent.name} Copy`, status: "Draft" }]); setMenu(null); }}><Icon className="size-4" />{label as string}</Button>)}</div> : null}
      </div>)}
    </div>
  </div></AppShell>;
}