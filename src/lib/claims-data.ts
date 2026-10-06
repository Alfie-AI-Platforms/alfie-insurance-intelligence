export type ClaimStatus = "Needs Review" | "Investigating" | "Awaiting Information" | "In Review" | "Approved" | "Closed";
export type Priority = "High" | "Medium" | "Low";

export type Claim = {
  id: string;
  claimant: string;
  type: string;
  status: ClaimStatus;
  priority: Priority;
  assignedTo: string;
  updated: string;
  updatedDays: number;
  policy: string;
  dateOfLoss: string;
  estimatedLoss: number;
  location: string;
};

export const claimStatuses: readonly ClaimStatus[] = ["Needs Review", "Investigating", "Awaiting Information", "In Review", "Approved", "Closed"];

export const claims: Claim[] = [
  { id: "CL-45821", claimant: "Michael Brown", type: "Auto Collision", status: "Needs Review", priority: "High", assignedTo: "Sarah Chen", updated: "12m ago", updatedDays: 0, policy: "P-28491", dateOfLoss: "September 28, 2026", estimatedLoss: 12400, location: "Toronto, ON" },
  { id: "CL-45820", claimant: "Emily Davis", type: "Water Damage", status: "Investigating", priority: "Medium", assignedTo: "James Lee", updated: "1h ago", updatedDays: 0, policy: "P-31877", dateOfLoss: "September 30, 2026", estimatedLoss: 8750, location: "Mississauga, ON" },
  { id: "CL-45819", claimant: "ABC Holdings", type: "Commercial Property", status: "Awaiting Information", priority: "Low", assignedTo: "Unassigned", updated: "3h ago", updatedDays: 0, policy: "CP-10442", dateOfLoss: "September 22, 2026", estimatedLoss: 46200, location: "Ottawa, ON" },
  { id: "CL-45818", claimant: "Daniel Wilson", type: "Auto Collision", status: "In Review", priority: "Medium", assignedTo: "Sarah Chen", updated: "5h ago", updatedDays: 0, policy: "P-27310", dateOfLoss: "September 26, 2026", estimatedLoss: 6380, location: "Hamilton, ON" },
  { id: "CL-45817", claimant: "Northgate Logistics", type: "Commercial Auto", status: "Needs Review", priority: "High", assignedTo: "Priya Shah", updated: "6h ago", updatedDays: 0, policy: "CA-55021", dateOfLoss: "September 25, 2026", estimatedLoss: 184500, location: "Brampton, ON" },
  { id: "CL-45816", claimant: "Olivia Martinez", type: "Theft", status: "Investigating", priority: "High", assignedTo: "James Lee", updated: "Yesterday", updatedDays: 1, policy: "H-90218", dateOfLoss: "September 24, 2026", estimatedLoss: 21900, location: "Toronto, ON" },
  { id: "CL-45815", claimant: "Robert Kim", type: "Fire", status: "In Review", priority: "Medium", assignedTo: "Marcus Lee", updated: "Yesterday", updatedDays: 1, policy: "H-88402", dateOfLoss: "September 19, 2026", estimatedLoss: 67300, location: "Kingston, ON" },
  { id: "CL-45814", claimant: "Grace Thompson", type: "Auto Glass", status: "Approved", priority: "Low", assignedTo: "Sarah Chen", updated: "2d ago", updatedDays: 2, policy: "P-30155", dateOfLoss: "September 21, 2026", estimatedLoss: 940, location: "Waterloo, ON" },
  { id: "CL-45813", claimant: "Lakeshore Dental", type: "General Liability", status: "Awaiting Information", priority: "Medium", assignedTo: "Priya Shah", updated: "3d ago", updatedDays: 3, policy: "GL-20981", dateOfLoss: "September 12, 2026", estimatedLoss: 32000, location: "Toronto, ON" },
  { id: "CL-45812", claimant: "Henry Nguyen", type: "Water Damage", status: "Closed", priority: "Low", assignedTo: "James Lee", updated: "5d ago", updatedDays: 5, policy: "H-87120", dateOfLoss: "September 3, 2026", estimatedLoss: 4210, location: "London, ON" },
];

export const getClaim = (id: string) => claims.find((claim) => claim.id === id);
export const money = (value: number) => value.toLocaleString("en-CA", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export type AuditEvent = { time: string; actor: string; actorType: "User" | "Alfie" | "System"; action: string; source: string; result: string };

export const seedAudit: AuditEvent[] = [
  { time: "Oct 6, 09:14", actor: "Alfie", actorType: "Alfie", action: "Analyzed repair estimate", source: "Estimate EST-8821", result: "Exceeds $5,000 authority threshold" },
  { time: "Oct 6, 09:12", actor: "Alfie", actorType: "Alfie", action: "Policy lookup", source: "Policy P-28491", result: "Collision coverage active" },
  { time: "Oct 6, 09:10", actor: "Alfie", actorType: "Alfie", action: "Analyzed damage photos", source: "3 photos", result: "Damage consistent with report" },
  { time: "Oct 5, 16:41", actor: "Sarah Chen", actorType: "User", action: "Assigned adjuster", source: "Claims queue", result: "Assigned to Sarah Chen" },
  { time: "Oct 5, 16:02", actor: "Michael Brown", actorType: "User", action: "Document uploaded", source: "Customer portal", result: "Claimant statement received" },
  { time: "Oct 5, 11:30", actor: "System", actorType: "System", action: "Document uploaded", source: "Toronto Police Service", result: "Police report attached" },
  { time: "Oct 4, 14:18", actor: "System", actorType: "System", action: "Status change", source: "Workflow engine", result: "Intake → Evidence Received" },
  { time: "Oct 4, 14:05", actor: "Michael Brown", actorType: "User", action: "First notice of loss", source: "Customer portal", result: "Claim CL-45821 created" },
];
