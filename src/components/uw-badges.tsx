import type { SubmissionStatus, UwPriority } from "@/lib/underwriting-data";

export function UwPriorityBadge({ priority }: { priority: UwPriority }) {
  const tone = priority === "High" ? "bg-destructive/10 text-destructive" : priority === "Medium" ? "bg-status-paused text-status-paused-foreground" : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[13px] font-medium ${tone}`}>{priority}</span>;
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const tone =
    status === "Needs Review" || status === "Referred" ? "bg-status-paused text-status-paused-foreground"
    : status === "Bound" || status === "Quoted" || status === "Ready for Review" ? "bg-status-active text-status-active-foreground"
    : status === "Analyzing" || status === "New" ? "bg-primary/10 text-primary"
    : status === "Declined" ? "bg-destructive/10 text-destructive"
    : "bg-secondary text-muted-foreground";
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[13px] font-medium ${tone}`}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}
