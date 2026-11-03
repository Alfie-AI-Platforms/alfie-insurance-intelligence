import type { PolicyStatus } from "@/lib/policy-data";

export function PolicyStatusBadge({ status }: { status: PolicyStatus }) {
  const tone =
    status === "Active" ? "bg-status-active text-status-active-foreground"
    : status === "Renewal Pending" || status === "Pending Issuance" ? "bg-status-paused text-status-paused-foreground"
    : status === "Cancelled" || status === "Suspended" ? "bg-destructive/10 text-destructive"
    : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}
