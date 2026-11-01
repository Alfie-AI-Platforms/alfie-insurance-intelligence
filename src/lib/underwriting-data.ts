export type SubmissionStatus = "New" | "Analyzing" | "Needs Review" | "Awaiting Information" | "Ready for Review" | "Quoted" | "Referred" | "Declined" | "Bound";
export type UwPriority = "High" | "Medium" | "Low";

export type Submission = {
  id: string;
  insured: string;
  line: string;
  status: SubmissionStatus;
  priority: UwPriority;
  underwriter: string;
  broker: string;
  received: string;
  receivedDays: number;
  effective: string;
  effectiveMonth: string;
  limit: number;
  premium: number;
  inAppetite: "Within appetite" | "Referral" | "Outside appetite";
  missing: number;
};

export const submissionStatuses: readonly SubmissionStatus[] = ["New", "Analyzing", "Needs Review", "Awaiting Information", "Ready for Review", "Quoted", "Referred", "Declined", "Bound"];

export const submissions: Submission[] = [
  { id: "SUB-10482", insured: "Northstar Manufacturing Inc.", line: "Commercial Property", status: "Needs Review", priority: "High", underwriter: "Sarah Chen", broker: "Apex Insurance Brokers", received: "12m ago", receivedDays: 0, effective: "November 1, 2026", effectiveMonth: "Nov 2026", limit: 8_500_000, premium: 185_000, inAppetite: "Referral", missing: 2 },
  { id: "SUB-10481", insured: "Greenfield Logistics", line: "Commercial Auto", status: "Analyzing", priority: "Medium", underwriter: "James Lee", broker: "Meridian Risk Partners", received: "38m ago", receivedDays: 0, effective: "December 1, 2026", effectiveMonth: "Dec 2026", limit: 2_000_000, premium: 96_400, inAppetite: "Within appetite", missing: 0 },
  { id: "SUB-10480", insured: "Westbridge Hotels", line: "Commercial Property", status: "Awaiting Information", priority: "High", underwriter: "Sarah Chen", broker: "Apex Insurance Brokers", received: "1h ago", receivedDays: 0, effective: "November 15, 2026", effectiveMonth: "Nov 2026", limit: 22_000_000, premium: 412_000, inAppetite: "Referral", missing: 3 },
  { id: "SUB-10479", insured: "Apex Technology Group", line: "Cyber", status: "Ready for Review", priority: "Medium", underwriter: "Michael Wong", broker: "Harbourline Brokerage", received: "2h ago", receivedDays: 0, effective: "December 1, 2026", effectiveMonth: "Dec 2026", limit: 5_000_000, premium: 74_800, inAppetite: "Within appetite", missing: 0 },
  { id: "SUB-10478", insured: "Lakeview Senior Living", line: "General Liability", status: "New", priority: "Medium", underwriter: "Unassigned", broker: "Meridian Risk Partners", received: "3h ago", receivedDays: 0, effective: "January 1, 2027", effectiveMonth: "Jan 2027", limit: 3_000_000, premium: 58_200, inAppetite: "Within appetite", missing: 1 },
  { id: "SUB-10477", insured: "Coastal Marine Supply", line: "Inland Marine", status: "Referred", priority: "High", underwriter: "Priya Shah", broker: "Harbourline Brokerage", received: "Yesterday", receivedDays: 1, effective: "November 1, 2026", effectiveMonth: "Nov 2026", limit: 4_500_000, premium: 121_000, inAppetite: "Referral", missing: 0 },
  { id: "SUB-10476", insured: "Brightline Construction", line: "Commercial Auto", status: "Quoted", priority: "Low", underwriter: "James Lee", broker: "Apex Insurance Brokers", received: "Yesterday", receivedDays: 1, effective: "December 15, 2026", effectiveMonth: "Dec 2026", limit: 1_000_000, premium: 43_600, inAppetite: "Within appetite", missing: 0 },
  { id: "SUB-10475", insured: "Redwood Chemical Co.", line: "Commercial Property", status: "Declined", priority: "Low", underwriter: "Michael Wong", broker: "Summit Insurance Group", received: "2d ago", receivedDays: 2, effective: "November 1, 2026", effectiveMonth: "Nov 2026", limit: 15_000_000, premium: 0, inAppetite: "Outside appetite", missing: 0 },
  { id: "SUB-10474", insured: "Maple Street Dental Group", line: "Professional Liability", status: "Bound", priority: "Low", underwriter: "Sarah Chen", broker: "Summit Insurance Group", received: "4d ago", receivedDays: 4, effective: "October 15, 2026", effectiveMonth: "Oct 2026", limit: 2_000_000, premium: 18_900, inAppetite: "Within appetite", missing: 0 },
];

export const getSubmission = (id: string) => submissions.find((s) => s.id === id);
export const usd = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const compactUsd = (v: number) => (v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : usd(v));

export type UwAuditEvent = { time: string; actor: string; actorType: "User" | "Alfie" | "System"; action: string; source: string; result: string };

export const seedUwAudit: UwAuditEvent[] = [
  { time: "Oct 31, 21:48", actor: "Alfie", actorType: "Alfie", action: "Appetite rules evaluated", source: "Commercial Property Appetite Guide v4.2", result: "Within appetite with referral" },
  { time: "Oct 31, 21:46", actor: "Alfie", actorType: "Alfie", action: "Completeness checked", source: "Submission package", result: "92% complete · 2 items missing" },
  { time: "Oct 31, 21:44", actor: "Alfie", actorType: "Alfie", action: "Documents analyzed", source: "ACORD 140, SOV, Loss Runs", result: "Data extracted to submission file" },
  { time: "Oct 31, 21:41", actor: "System", actorType: "System", action: "Documents uploaded", source: "Broker portal", result: "5 documents ingested" },
  { time: "Oct 31, 21:40", actor: "System", actorType: "System", action: "Status change", source: "Workflow engine", result: "New → Needs Review" },
  { time: "Oct 31, 21:36", actor: "Apex Insurance Brokers", actorType: "User", action: "Submission received", source: "Broker portal", result: "SUB-10482 created" },
];
