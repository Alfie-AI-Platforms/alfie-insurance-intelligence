export type PolicyStatus = "Active" | "Pending Issuance" | "Renewal Pending" | "Expired" | "Cancelled" | "Suspended";

export type Policy = {
  id: string;
  holder: string;
  line: string;
  coverage: string;
  premium: number;
  status: PolicyStatus;
  effective: string;
  expiration: string;
  effectiveISO: string;
  expirationISO: string;
  team: string;
  tiv: number;
  personal: boolean;
};

export const policyStatuses: readonly PolicyStatus[] = ["Active", "Pending Issuance", "Renewal Pending", "Expired", "Cancelled", "Suspended"];

export const policies: Policy[] = [
  { id: "POL-28491", holder: "Michael Brown", line: "Personal Auto", coverage: "Auto Coverage", premium: 2450, status: "Active", effective: "Jan 01, 2026", expiration: "Jan 01, 2027", effectiveISO: "2026-01-01", expirationISO: "2027-01-01", team: "Personal Lines", tiv: 38000, personal: true },
  { id: "POL-28492", holder: "Northstar Manufacturing Inc.", line: "Commercial Property", coverage: "Property Coverage", premium: 185000, status: "Active", effective: "Nov 01, 2026", expiration: "Nov 01, 2027", effectiveISO: "2026-11-01", expirationISO: "2027-11-01", team: "Commercial Property", tiv: 8_500_000, personal: false },
  { id: "POL-28493", holder: "Greenfield Logistics", line: "Commercial Auto", coverage: "Fleet Coverage", premium: 74500, status: "Renewal Pending", effective: "Dec 01, 2026", expiration: "Dec 01, 2027", effectiveISO: "2026-12-01", expirationISO: "2027-12-01", team: "Commercial Auto", tiv: 2_400_000, personal: false },
  { id: "POL-28494", holder: "Westbridge Hotels", line: "Commercial Property", coverage: "Property Coverage", premium: 92000, status: "Pending Issuance", effective: "Oct 15, 2026", expiration: "Oct 15, 2027", effectiveISO: "2026-10-15", expirationISO: "2027-10-15", team: "Commercial Property", tiv: 22_000_000, personal: false },
  { id: "POL-28480", holder: "Apex Technology Group", line: "Cyber", coverage: "Cyber Liability", premium: 74800, status: "Active", effective: "Dec 01, 2025", expiration: "Dec 01, 2026", effectiveISO: "2025-12-01", expirationISO: "2026-12-01", team: "Specialty", tiv: 5_000_000, personal: false },
  { id: "POL-28471", holder: "Emily Davis", line: "Homeowners", coverage: "Home Coverage", premium: 1980, status: "Active", effective: "Nov 20, 2025", expiration: "Nov 20, 2026", effectiveISO: "2025-11-20", expirationISO: "2026-11-20", team: "Personal Lines", tiv: 640000, personal: true },
  { id: "POL-28455", holder: "Lakeshore Dental", line: "General Liability", coverage: "Premises Liability", premium: 12400, status: "Renewal Pending", effective: "Nov 15, 2025", expiration: "Nov 15, 2026", effectiveISO: "2025-11-15", expirationISO: "2026-11-15", team: "Casualty", tiv: 2_000_000, personal: false },
  { id: "POL-28410", holder: "Redwood Chemical Co.", line: "Commercial Property", coverage: "Property Coverage", premium: 210000, status: "Cancelled", effective: "Mar 01, 2026", expiration: "Mar 01, 2027", effectiveISO: "2026-03-01", expirationISO: "2027-03-01", team: "Commercial Property", tiv: 15_000_000, personal: false },
  { id: "POL-28377", holder: "Henry Nguyen", line: "Homeowners", coverage: "Home Coverage", premium: 1640, status: "Expired", effective: "Sep 01, 2025", expiration: "Sep 01, 2026", effectiveISO: "2025-09-01", expirationISO: "2026-09-01", team: "Personal Lines", tiv: 520000, personal: true },
  { id: "POL-28362", holder: "Coastal Marine Supply", line: "Inland Marine", coverage: "Cargo Coverage", premium: 48600, status: "Suspended", effective: "Jun 01, 2026", expiration: "Jun 01, 2027", effectiveISO: "2026-06-01", expirationISO: "2027-06-01", team: "Specialty", tiv: 4_500_000, personal: false },
];

export const getPolicy = (id: string) => policies.find((p) => p.id === id);
export const dollars = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const shortDollars = (v: number) => (v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}M` : dollars(v));

export type Role = "Policy Administrator" | "Policy Servicing Specialist" | "Underwriter" | "Finance";
export type Permission = "view" | "analyze" | "prepare" | "edit" | "approveEndorsement" | "issue" | "approveRenewal" | "cancel" | "reinstate" | "viewFinancials";

export const rolePermissions: Record<Role, readonly Permission[]> = {
  "Policy Administrator": ["view", "analyze", "prepare", "edit", "approveEndorsement", "issue", "approveRenewal", "cancel", "reinstate", "viewFinancials"],
  "Policy Servicing Specialist": ["view", "analyze", "prepare", "edit"],
  Underwriter: ["view", "analyze", "approveEndorsement", "approveRenewal"],
  Finance: ["view", "analyze", "viewFinancials"],
};
export const can = (role: Role, p: Permission) => rolePermissions[role].includes(p);

export type PolicyEvent = { time: string; actor: string; actorType: "User" | "Alfie" | "System"; action: string; prev?: string; next?: string; source: string; approval: "Approved" | "Pending" | "Not required" | "Rejected" };

export const seedPolicyAudit: PolicyEvent[] = [
  { time: "Nov 2, 16:20", actor: "Alfie · Policy Agent", actorType: "Alfie", action: "Alfie analysis performed", source: "Policy record v3", approval: "Not required" },
  { time: "Oct 28, 10:05", actor: "Apex Insurance Brokers", actorType: "User", action: "Endorsement requested", prev: "4 locations", next: "5 locations (add 220 Industrial Pkwy)", source: "Broker portal", approval: "Pending" },
  { time: "Oct 22, 09:12", actor: "System", actorType: "System", action: "Documents uploaded", source: "Broker portal", next: "Coverage schedule v3", approval: "Not required" },
  { time: "Oct 15, 14:40", actor: "David Cho", actorType: "User", action: "Coverage changed (v3)", prev: "Equipment Breakdown $1.0M", next: "Equipment Breakdown $1.5M", source: "Endorsement END-0412", approval: "Approved" },
  { time: "Oct 15, 14:40", actor: "Finance Agent", actorType: "Alfie", action: "Premium adjusted", prev: "$179,600", next: "$185,000", source: "Pricing Agent · END-0412", approval: "Approved" },
  { time: "Oct 02, 11:00", actor: "Jane Doe", actorType: "User", action: "Policy issued (v1)", next: "Effective Nov 01, 2026", source: "Underwriting SUB-10482", approval: "Approved" },
];
