const good = new Set([
  "Paid",
  "Reconciled",
  "Received",
  "Matched",
  "Complete",
  "Approved",
  "Posted",
  "Approved for Payment",
  "Final",
]);
const warn = new Set([
  "Overdue",
  "Disputed",
  "Requires Review",
  "Potential Duplicate",
  "Unmatched",
  "Blocked",
  "Failed",
  "On Hold",
]);
const info = new Set([
  "Processing",
  "In Progress",
  "In Review",
  "Submitted",
  "Partially Paid",
  "Partially Matched",
  "Awaiting Authorization",
  "Pending Approval",
  "Draft ready",
  "In review",
]);

export function FinanceStatusBadge({ status }: { status: string }) {
  const tone = good.has(status)
    ? "bg-status-active text-status-active-foreground"
    : warn.has(status)
      ? "bg-destructive/10 text-destructive"
      : info.has(status)
        ? "bg-status-paused text-status-paused-foreground"
        : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${tone}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
