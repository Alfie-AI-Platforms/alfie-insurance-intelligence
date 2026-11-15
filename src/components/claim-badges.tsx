import type { ClaimStatus, Priority } from "@/lib/claims-data";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const tone = priority === "High" ? "bg-destructive/10 text-destructive" : priority === "Medium" ? "bg-status-paused text-status-paused-foreground" : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[13px] font-medium ${tone}`}>{priority}</span>;
}
export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const tone = status === "Needs Review" ? "bg-status-paused text-status-paused-foreground" : status === "Approved" ? "bg-status-active text-status-active-foreground" : status === "Investigating" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[13px] font-medium ${tone}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

