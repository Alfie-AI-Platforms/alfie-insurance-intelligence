import type { AgentStatus } from "@/lib/agents-data";

export function StatusBadge({ status }: { status: AgentStatus }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium ${status === "Active" ? "bg-status-active text-status-active-foreground" : status === "Paused" ? "bg-status-paused text-status-paused-foreground" : "bg-secondary text-muted-foreground"}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}