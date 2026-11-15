/**
 * Workspace notifications for the signed-in user. Frontend only: the
 * list is sample data and read state is kept in the browser
 * (localStorage "alfie.notifications.v1") until the backend lands.
 */

export type NotificationKind =
  | "approval"
  | "automation"
  | "claim"
  | "system"
  | "report"
  | "billing";

export type NotificationLink =
  | { to: "/pricing/reviews" | "/automations" | "/data-sources" | "/reports" | "/billing" | "/preferences" }
  | { to: "/claims/$claimId"; params: { claimId: string } };

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  time: string;
  link: NotificationLink;
};

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    kind: "approval",
    title: "Rate review RR-2026-012 is waiting for sign-off",
    detail: "Homeowners +12% exceeds the Pricing Manager's 10% authority and needs a second approver.",
    time: "12 min ago",
    link: { to: "/pricing/reviews" },
  },
  {
    id: "n2",
    kind: "automation",
    title: "Automation paused at underwriter approval",
    detail: "Intake triage run EXE-8841 is holding submission SUB-2214 until an underwriter decides.",
    time: "48 min ago",
    link: { to: "/automations" },
  },
  {
    id: "n3",
    kind: "claim",
    title: "Settlement decision needed on CL-45821",
    detail: "Alfie's file review is complete. The $12,400 estimate is above the $5,000 adjuster authority.",
    time: "1 hr ago",
    link: { to: "/claims/$claimId", params: { claimId: "CL-45821" } },
  },
  {
    id: "n4",
    kind: "system",
    title: "Broker and Customer CRM sync is degraded",
    detail: "Last successful sync was 6 hours ago. 14 records are stale across Claims and Underwriting.",
    time: "2 hrs ago",
    link: { to: "/data-sources" },
  },
  {
    id: "n5",
    kind: "report",
    title: "November board pack is ready",
    detail: "RPT-301 generated with November figures: GWP $48.6M, combined ratio 96.8%.",
    time: "Yesterday",
    link: { to: "/reports" },
  },
  {
    id: "n6",
    kind: "billing",
    title: "Invoice INV-2026-0118 was paid",
    detail: "$18,237 charged to the Visa card ending 4471 on Nov 3, 2026.",
    time: "Nov 3",
    link: { to: "/billing" },
  },
];
