import { Bot, FileCheck2, Landmark, Radar, Scale, ShieldCheck, TrendingUp } from "lucide-react";

export type AgentStatus = "Active" | "Draft" | "Paused";

export const agents = [
  { id: "claims-intelligence", name: "Claims Intelligence Agent", description: "Reviews open claims, identifies severity and coverage risks, and prepares adjuster recommendations.", department: "Claims", status: "Active" as AgentStatus, lastRun: "12 min ago", createdBy: "Jane Doe", access: "Claims Team + 2", icon: Radar },
  { id: "underwriting", name: "Underwriting Agent", description: "Assesses submissions against appetite, guidelines, and historical portfolio performance.", department: "Underwriting", status: "Active" as AgentStatus, lastRun: "34 min ago", createdBy: "Marcus Lee", access: "Underwriting Team", icon: ShieldCheck },
  { id: "policy-review", name: "Policy Review Agent", description: "Compares policy wording, endorsements, and exclusions against approved standards.", department: "Policy", status: "Draft" as AgentStatus, lastRun: "Not run", createdBy: "Jane Doe", access: "Policy Operations", icon: FileCheck2 },
  { id: "fraud-detection", name: "Fraud Detection Agent", description: "Surfaces unusual claim patterns and packages evidence for specialist review.", department: "Claims", status: "Active" as AgentStatus, lastRun: "1 hr ago", createdBy: "Priya Shah", access: "SIU + Claims Managers", icon: Bot },
  { id: "pricing-analysis", name: "Pricing Analysis Agent", description: "Analyzes rate adequacy, loss trends, and segment-level pricing performance.", department: "Pricing & Actuarial", status: "Paused" as AgentStatus, lastRun: "Yesterday", createdBy: "Daniel Cho", access: "Actuarial Team", icon: TrendingUp },
  { id: "finance-reconciliation", name: "Finance Reconciliation Agent", description: "Reconciles premium, claims payments, and ledger exceptions across systems.", department: "Finance", status: "Active" as AgentStatus, lastRun: "2 hrs ago", createdBy: "Sofia Martin", access: "Finance Operations", icon: Landmark },
  { id: "compliance-monitoring", name: "Compliance Monitoring Agent", description: "Monitors operational activity against regulatory and internal control requirements.", department: "Compliance", status: "Draft" as AgentStatus, lastRun: "Not run", createdBy: "Elena Brooks", access: "Compliance + Legal", icon: Scale },
];

export const knowledgeOptions = ["Underwriting guidelines", "Claims manuals", "Policy documents", "Pricing guidelines", "Compliance policies", "Internal procedures", "Claims database", "Policy administration system", "Customer database", "Finance system", "Data warehouse"];
export const dataAccessOptions = ["Read claims", "Read policies", "Read customer information", "Read documents", "Read financial data", "Read historical records"];
export const actionOptions = ["Create claim", "Update claim", "Request information", "Prepare report", "Create policy recommendation", "Prepare settlement recommendation", "Prepare payment", "Send notification", "Update system record", "Approve settlement"];
export const workflowBlocks = ["New Claim", "Retrieve Policy", "Analyze Claim", "Check Coverage", "Check Risk Signals", "Decision", "Human Review", "Prepare Recommendation", "Update Claim"];