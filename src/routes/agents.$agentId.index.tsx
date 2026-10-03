import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Bot, CheckCircle2, Copy, Database, FileText, Pause, Pencil, Play, ShieldCheck, Users, Zap } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { agents } from "@/lib/agents-data";

export const Route = createFileRoute("/agents/$agentId/")({
  head: () => ({ meta: [{ title: "Agent Overview | Alfie Insurance AI" }, { name: "description", content: "Review agent capabilities, controls, access, and activity." }, { property: "og:title", content: "Agent Overview | Alfie Insurance AI" }, { property: "og:description", content: "Review agent capabilities, controls, access, and activity." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: AgentOverview,
});

function AgentOverview() {
  const { agentId } = Route.useParams();
  const navigate = useNavigate();
  const agent = agents.find((item) => item.id === agentId) ?? { ...agents[0], id: agentId, name: agentId === "commercial-claims" ? "Commercial Claims Agent" : agents[0].name };
  const sections = [
    ["Purpose", Bot, "Review commercial claims, validate coverage, identify material risks, and prepare evidence-based recommendations for assigned adjusters."],
    ["Knowledge Sources", FileText, "Claims Manual · Commercial Policy Wordings · Policy Database · Claims Database"],
    ["Connected Systems", Database, "Guidewire Claims · Policy Administration · Customer Master · Document Repository"],
    ["Actions", Zap, "Read claims · Read policies · Request information · Prepare recommendation · Update claim"],
    ["Guardrails", ShieldCheck, "Human approval for claim decisions · $25,000 authority limit · Sources required · High-risk escalation"],
    ["Access", Users, "Claims Team — Run · Claims Managers — Edit · Compliance — View · Administrators — Full Access"],
  ] as const;
  return <AppShell><div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
    <div className="flex flex-wrap items-start justify-between gap-5"><div className="flex gap-4"><div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground"><agent.icon className="size-5" /></div><div><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold">{agent.name}</h1><StatusBadge status={agent.status === "Draft" ? "Active" : agent.status} /></div><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{agent.description}</p></div></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => navigate({ to: "/agents/$agentId/edit", params: { agentId } })}><Pencil className="size-4" />Edit Agent</Button><Button variant="secondary"><Pause className="size-4" />Pause Agent</Button><Button variant="secondary"><Copy className="size-4" />Duplicate</Button><Button variant="secondary"><Activity className="size-4" />View Activity</Button><Button onClick={() => navigate({ to: "/agents/$agentId/test", params: { agentId } })}><Play className="size-4" />Run Agent</Button></div></div>
    <div className="mt-9 grid gap-4 md:grid-cols-2">{sections.map(([title, Icon, copy]) => <section key={title} className="rounded-md border border-border bg-card p-5"><div className="flex items-center gap-2"><Icon className="size-4 text-primary" /><h2 className="text-sm font-semibold">{title}</h2></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{copy}</p></section>)}</div>
    <div className="mt-7 grid gap-5 lg:grid-cols-3"><section className="rounded-md border border-border bg-card p-5"><h2 className="text-sm font-semibold">Performance</h2><div className="mt-5 grid grid-cols-3 gap-3">{[["Runs", "1,284"], ["Completed", "97.2%"], ["Escalated", "8.4%"]].map(([label, value]) => <div key={label}><p className="text-xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-muted-foreground">{label}</p></div>)}</div></section><section className="rounded-md border border-border bg-card p-5 lg:col-span-2"><h2 className="text-sm font-semibold">Recent Runs</h2><div className="mt-3 space-y-3">{[["CL-45821", "Recommendation prepared", "12 min ago"], ["CL-45798", "Escalated for human review", "31 min ago"], ["CL-45761", "Missing information requested", "1 hr ago"]].map(([id, result, time]) => <div key={id} className="flex items-center gap-3 border-t border-border pt-3 text-xs"><CheckCircle2 className="size-4 text-positive" /><span className="font-semibold">{id}</span><span className="flex-1 text-muted-foreground">{result}</span><span className="text-muted-foreground">{time}</span></div>)}</div></section></div>
    <section className="mt-5 rounded-md border border-border bg-card p-5"><h2 className="text-sm font-semibold">Audit Activity</h2><div className="mt-3 grid gap-3 text-xs md:grid-cols-3">{[["Agent configuration published", "Jane Doe · Today, 9:42 AM"], ["Claims Manual v4 connected", "Marcus Lee · Yesterday"], ["Approval threshold updated", "Jane Doe · Sep 29"]].map(([event, meta]) => <div key={event} className="border-l-2 border-primary pl-3"><p className="font-medium">{event}</p><p className="mt-1 text-muted-foreground">{meta}</p></div>)}</div></section>
  </div></AppShell>;
}