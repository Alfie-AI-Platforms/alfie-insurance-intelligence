const tones: Record<string, string> = {
  // good
  Connected: "bg-positive/10 text-positive",
  Published: "bg-positive/10 text-positive",
  Approved: "bg-positive/10 text-positive",
  Completed: "bg-positive/10 text-positive",
  Active: "bg-positive/10 text-positive",
  Paid: "bg-positive/10 text-positive",
  Operational: "bg-positive/10 text-positive",
  Enforced: "bg-positive/10 text-positive",
  // info
  Synchronizing: "bg-primary/10 text-primary",
  "Under Review": "bg-primary/10 text-primary",
  "In Testing": "bg-primary/10 text-primary",
  Running: "bg-primary/10 text-primary",
  Confidential: "bg-primary/10 text-primary",
  Executing: "bg-primary/10 text-primary",
  Invited: "bg-primary/10 text-primary",
  "In Progress": "bg-primary/10 text-primary",
  // warn
  "Needs Attention": "bg-warning/15 text-warning-foreground",
  "Awaiting Approval": "bg-warning/15 text-warning-foreground",
  "Awaiting Confirmation": "bg-warning/15 text-warning-foreground",
  Paused: "bg-warning/15 text-warning-foreground",
  Restricted: "bg-warning/15 text-warning-foreground",
  Suspended: "bg-warning/15 text-warning-foreground",
  Degraded: "bg-warning/15 text-warning-foreground",
  "Action Required": "bg-warning/15 text-warning-foreground",
  // bad
  "Authentication Expired": "bg-destructive/10 text-destructive",
  "Connection Failed": "bg-destructive/10 text-destructive",
  Failed: "bg-destructive/10 text-destructive",
  "Highly Restricted": "bg-destructive/10 text-destructive",
  Cancelled: "bg-destructive/10 text-destructive",
};

export function WorkspaceStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tones[status] ?? "bg-secondary text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}
