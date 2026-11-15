export type UserStatus = "Active" | "Invited" | "Suspended" | "Deactivated";

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  title: string;
  department: string;
  roles: string[];
  manager: string;
  status: UserStatus;
  invitation: string;
  added: string;
  lastLogin: string;
  auth: string;
  sessions: number;
};

export const orgUsers: OrgUser[] = [
  {
    id: "USR-001",
    name: "Jane Doe",
    email: "jane.doe@northstarmutual.com",
    employeeId: "NM-1001",
    title: "Insurance Manager",
    department: "Operations",
    roles: ["Organization Administrator"],
    manager: "Executive Management",
    status: "Active",
    invitation: "Accepted",
    added: "Jan 06, 2026",
    lastLogin: "Today, 09:41 AM",
    auth: "SSO + MFA",
    sessions: 2,
  },
  {
    id: "USR-002",
    name: "Sarah Chen",
    email: "sarah.chen@northstarmutual.com",
    employeeId: "NM-1014",
    title: "Claims Manager",
    department: "Claims",
    roles: ["Claims Manager", "Claims Approver (group)"],
    manager: "Jane Doe",
    status: "Active",
    invitation: "Accepted",
    added: "Jan 06, 2026",
    lastLogin: "Today, 08:15 AM",
    auth: "SSO + MFA",
    sessions: 1,
  },
  {
    id: "USR-003",
    name: "Marcus Lee",
    email: "marcus.lee@northstarmutual.com",
    employeeId: "NM-1022",
    title: "Underwriting Manager",
    department: "Underwriting",
    roles: ["Underwriting Manager"],
    manager: "Jane Doe",
    status: "Active",
    invitation: "Accepted",
    added: "Jan 12, 2026",
    lastLogin: "Today, 09:02 AM",
    auth: "SSO + MFA",
    sessions: 1,
  },
  {
    id: "USR-004",
    name: "Sofia Martin",
    email: "sofia.martin@northstarmutual.com",
    employeeId: "NM-1031",
    title: "Finance Manager",
    department: "Finance",
    roles: ["Finance Manager"],
    manager: "Jane Doe",
    status: "Active",
    invitation: "Accepted",
    added: "Jan 12, 2026",
    lastLogin: "Yesterday, 05:48 PM",
    auth: "SSO + MFA",
    sessions: 0,
  },
  {
    id: "USR-005",
    name: "Elena Brooks",
    email: "elena.brooks@northstarmutual.com",
    employeeId: "NM-1040",
    title: "Compliance and Security Lead",
    department: "Compliance",
    roles: ["Security Administrator", "Compliance Officer"],
    manager: "Executive Management",
    status: "Active",
    invitation: "Accepted",
    added: "Jan 06, 2026",
    lastLogin: "Today, 07:57 AM",
    auth: "SSO + MFA + hardware key",
    sessions: 1,
  },
  {
    id: "USR-006",
    name: "Daniel Cho",
    email: "daniel.cho@northstarmutual.com",
    employeeId: "NM-1052",
    title: "Senior Actuarial Analyst",
    department: "Pricing & Actuarial",
    roles: ["Pricing & Actuarial Analyst"],
    manager: "Jane Doe",
    status: "Active",
    invitation: "Accepted",
    added: "Feb 02, 2026",
    lastLogin: "Today, 10:11 AM",
    auth: "SSO + MFA",
    sessions: 1,
  },
  {
    id: "USR-007",
    name: "Priya Shah",
    email: "priya.shah@northstarmutual.com",
    employeeId: "NM-1063",
    title: "SIU Specialist",
    department: "Claims",
    roles: ["Claims Adjuster"],
    manager: "Sarah Chen",
    status: "Active",
    invitation: "Accepted",
    added: "Feb 16, 2026",
    lastLogin: "Monday, 03:22 PM",
    auth: "SSO + MFA",
    sessions: 0,
  },
  {
    id: "USR-008",
    name: "Tom Becker",
    email: "tom.becker@northstarmutual.com",
    employeeId: "NM-1071",
    title: "Claims Adjuster",
    department: "Claims",
    roles: ["Claims Adjuster"],
    manager: "Sarah Chen",
    status: "Active",
    invitation: "Accepted",
    added: "Mar 02, 2026",
    lastLogin: "Oct 12, 2026",
    auth: "SSO + MFA",
    sessions: 0,
  },
  {
    id: "USR-009",
    name: "Alicia Gomez",
    email: "alicia.gomez@northstarmutual.com",
    employeeId: "NM-1080",
    title: "Underwriter",
    department: "Underwriting",
    roles: ["Underwriter"],
    manager: "Marcus Lee",
    status: "Invited",
    invitation: "Sent Nov 02, expires in 5 days",
    added: "Nov 02, 2026",
    lastLogin: "Never",
    auth: "Not activated",
    sessions: 0,
  },
  {
    id: "USR-010",
    name: "Kevin Wright",
    email: "kevin.wright@northstarmutual.com",
    employeeId: "NM-1088",
    title: "Finance Analyst",
    department: "Finance",
    roles: ["Finance Analyst"],
    manager: "Sofia Martin",
    status: "Suspended",
    invitation: "Accepted",
    added: "Apr 13, 2026",
    lastLogin: "Oct 28, 2026",
    auth: "SSO + MFA, sessions revoked",
    sessions: 0,
  },
  {
    id: "USR-011",
    name: "Nora Fields",
    email: "nora.fields@northstarmutual.com",
    employeeId: "NM-1095",
    title: "Reporting Analyst",
    department: "Operations",
    roles: ["Reporting Analyst", "Read-Only Employee"],
    manager: "Jane Doe",
    status: "Active",
    invitation: "Accepted",
    added: "May 04, 2026",
    lastLogin: "Today, 06:30 AM",
    auth: "SSO + MFA",
    sessions: 1,
  },
  {
    id: "USR-012",
    name: "Omar Haddad",
    email: "omar.haddad@northstarmutual.com",
    employeeId: "NM-1102",
    title: "Policy Administrator",
    department: "Policy",
    roles: ["Policy Administrator"],
    manager: "Jane Doe",
    status: "Deactivated",
    invitation: "Accepted",
    added: "Feb 23, 2026",
    lastLogin: "Sep 18, 2026",
    auth: "Deactivated, history preserved",
    sessions: 0,
  },
];

export const roleTemplates = [
  "Organization Owner",
  "Organization Administrator",
  "Security Administrator",
  "Department Administrator",
  "Department Manager",
  "Claims Manager",
  "Claims Adjuster",
  "Underwriting Manager",
  "Underwriter",
  "Policy Administrator",
  "Pricing & Actuarial Analyst",
  "Finance Manager",
  "Finance Analyst",
  "Reporting Analyst",
  "Compliance Officer",
  "Read-Only Employee",
];

export const departments = [
  "Claims",
  "Underwriting",
  "Policy",
  "Pricing & Actuarial",
  "Finance",
  "Operations",
  "Compliance",
  "Distribution",
];

export const orgGroups = [
  {
    name: "Claims Operations",
    members: 14,
    manager: "Sarah Chen",
    usedFor: "Notifications, task assignment",
  },
  { name: "Senior Underwriters", members: 5, manager: "Marcus Lee", usedFor: "Referral approvals" },
  {
    name: "Finance Team",
    members: 6,
    manager: "Sofia Martin",
    usedFor: "Close tasks, payment approvals",
  },
  { name: "Actuarial Team", members: 4, manager: "Daniel Cho", usedFor: "Pricing reviews" },
  {
    name: "Executive Management",
    members: 3,
    manager: "Jane Doe",
    usedFor: "Executive approvals, reports",
  },
  {
    name: "Compliance and Risk",
    members: 4,
    manager: "Elena Brooks",
    usedFor: "Access reviews, security alerts",
  },
  {
    name: "Claims Approvers",
    members: 3,
    manager: "Sarah Chen",
    usedFor: "Settlement approvals above adjuster authority",
  },
];

export const accessReviews = [
  {
    name: "Q4 2026 privileged access review",
    owner: "Elena Brooks",
    scope: "All users with administrator or approval roles",
    due: "Nov 20, 2026",
    status: "In Progress",
    progress: "18 of 26 reviewed",
  },
  {
    name: "Claims department access review",
    owner: "Sarah Chen",
    scope: "Claims department, 14 users",
    due: "Nov 27, 2026",
    status: "In Progress",
    progress: "9 of 14 reviewed",
  },
  {
    name: "Inactive account check",
    owner: "System, assigned to Elena Brooks",
    scope: "No login in 30 days: 1 account (Tom Becker)",
    due: "Nov 13, 2026",
    status: "Action Required",
    progress: "1 account flagged",
  },
  {
    name: "Direct permission assignments",
    owner: "Jane Doe",
    scope: "2 users hold direct permissions outside their roles",
    due: "Nov 20, 2026",
    status: "Not Started",
    progress: "2 assignments to confirm or revoke",
  },
];

export const platformModules = [
  "Claims",
  "Underwriting",
  "Policy",
  "Pricing & Actuarial",
  "Finance",
  "Reports",
  "Chat",
  "Documents",
  "Data Sources",
  "Automations",
  "Users & Access",
  "Policies & Permissions",
  "Settings",
];
export const permissionActions = [
  "View",
  "Create",
  "Edit",
  "Delete",
  "Approve",
  "Execute",
  "Administer",
];

// Baseline effective access per role family, used by the module matrix and the permission tester.
export function baselineAccess(role: string, module: string, action: string): boolean {
  if (role === "Organization Owner" || role === "Organization Administrator") return true;
  if (role === "Security Administrator")
    return module === "Users & Access" ||
      module === "Policies & Permissions" ||
      module === "Settings"
      ? true
      : action === "View";
  if (role === "Read-Only Employee")
    return (
      action === "View" &&
      module !== "Users & Access" &&
      module !== "Policies & Permissions" &&
      module !== "Settings"
    );
  if (role === "Compliance Officer") return action === "View" || module === "Documents";
  const home: Record<string, string> = {
    "Claims Manager": "Claims",
    "Claims Adjuster": "Claims",
    "Underwriting Manager": "Underwriting",
    Underwriter: "Underwriting",
    "Policy Administrator": "Policy",
    "Pricing & Actuarial Analyst": "Pricing & Actuarial",
    "Finance Manager": "Finance",
    "Finance Analyst": "Finance",
    "Reporting Analyst": "Reports",
    "Department Manager": "",
    "Department Administrator": "",
  };
  const shared = ["Chat", "Documents"];
  if (shared.includes(module)) return action === "View" || action === "Create";
  if (module === "Reports")
    return action === "View" || (role === "Reporting Analyst" && action !== "Administer");
  if (home[role] && module === home[role]) {
    if (role.endsWith("Manager")) return action !== "Administer";
    return ["View", "Create", "Edit", "Execute"].includes(action);
  }
  if (module === "Data Sources" || module === "Automations") return action === "View";
  return false;
}

export const approvalAuthorities = [
  {
    action: "Claims settlement approval",
    levels: "Adjuster up to $25,000 · Claims Manager up to $100,000 · Executive above $100,000",
    chain: "Adjuster → Claims Manager → Executive Management",
  },
  {
    action: "Underwriting referral",
    levels: "Senior Underwriters group for risks above appetite thresholds",
    chain: "Underwriter → Senior Underwriters",
  },
  {
    action: "Policy cancellation",
    levels: "Policy Administrator prepares · Department Manager approves",
    chain: "Policy Admin → Department Manager",
  },
  {
    action: "Financial payment approval",
    levels: "Finance Analyst prepares · Finance Manager up to $50,000 · CFO delegate above",
    chain: "Analyst → Finance Manager → Executive",
  },
  {
    action: "Journal entry approval",
    levels: "Preparer can never approve their own entry (segregation of duties)",
    chain: "Preparer → Finance Manager",
  },
  {
    action: "Pricing change to production",
    levels: "Actuarial prepares · independent reviewer approves",
    chain: "Analyst → Pricing Reviewer → Department Head",
  },
  {
    action: "Financial period close",
    levels: "Finance Manager sign off · CFO or delegate final",
    chain: "Finance Manager → Executive",
  },
  {
    action: "Document publication",
    levels: "Owner submits · assigned reviewer approves",
    chain: "Owner → Reviewer",
  },
  {
    action: "Automation activation",
    levels: "Creator configures · separate administrator or approver activates",
    chain: "Creator → Approver → Active",
  },
];

export const delegations = [
  {
    from: "Sofia Martin (Finance Manager)",
    to: "Kevin Wright (Finance Analyst)",
    scope: "Payment approvals up to $50,000",
    period: "Delegated Oct 20, revoked Oct 28, 2026 when the account was suspended",
    status: "Revoked",
  },
  {
    from: "Sarah Chen (Claims Manager)",
    to: "Priya Shah (SIU Specialist, acting)",
    scope: "Settlement approvals up to $25,000 only, Claims",
    period: "Nov 03 to Nov 10, 2026",
    status: "Active",
  },
];

export const sodRules = [
  {
    rule: "Payment creator cannot approve the same payment",
    appliesTo: "Finance",
    status: "Enforced",
  },
  {
    rule: "Journal entry preparer cannot approve their own entry",
    appliesTo: "Finance",
    status: "Enforced",
  },
  {
    rule: "Automation creator cannot be the sole activator of a sensitive automation",
    appliesTo: "Automations",
    status: "Enforced",
  },
  {
    rule: "Pricing change submitter requires an independent approver before production",
    appliesTo: "Pricing & Actuarial",
    status: "Enforced",
  },
  {
    rule: "No user can grant themselves additional privileges",
    appliesTo: "Platform wide",
    status: "Enforced",
  },
  {
    rule: "Claims adjuster cannot approve a settlement on a claim they created",
    appliesTo: "Claims",
    status: "Warning only, under review",
  },
];

export const agentProfiles = [
  {
    name: "Claims Intelligence Agent",
    can: [
      "Read authorized claims records",
      "Retrieve relevant policy information",
      "Analyze claims documentation",
      "Prepare recommendations and settlement drafts",
    ],
    cannot: [
      "Independently authorize settlements, unless an explicitly approved workflow grants that authority",
      "Access claims outside the operating user's or automation's permissions",
    ],
    approval: "Settlement authorization, customer communications",
    external: "No external communication without approval",
  },
  {
    name: "Underwriting Agent",
    can: [
      "Read authorized submissions and risk data",
      "Review application documents",
      "Prepare risk assessments and referral notes",
    ],
    cannot: [
      "Bind coverage or issue final underwriting decisions, unless authorized through a governed process",
      "Access confidential financial records outside underwriting scope",
    ],
    approval: "Referrals above appetite, any decision recorded on a submission",
    external: "No broker communication without approval",
  },
  {
    name: "Finance Reconciliation Agent",
    can: [
      "Read authorized financial information",
      "Prepare reconciliations and journal entries",
      "Identify and explain financial exceptions",
    ],
    cannot: [
      "Execute restricted payments",
      "Approve its own financial actions or post journals silently",
    ],
    approval: "Payments, journal postings, period close steps",
    external: "No external communication",
  },
];

export const auditEvents = [
  {
    time: "Nov 04, 09:12",
    type: "Automation",
    actor: "Jane Doe",
    resource: "Automation AUT-10 Sync Failure Watch",
    detail: "Status changed Draft → In Testing",
    outcome: "Recorded",
  },
  {
    time: "Nov 04, 08:47",
    type: "Data Source",
    actor: "Elena Brooks",
    resource: "Broker and Customer CRM",
    detail: "Sync failure investigated, mapping review opened",
    outcome: "Recorded",
  },
  {
    time: "Nov 03, 16:20",
    type: "Permission",
    actor: "Elena Brooks",
    resource: "Role: Finance Analyst",
    detail: "Execute on Data Sources changed from Allowed → Not allowed",
    outcome: "Applied",
  },
  {
    time: "Nov 03, 11:15",
    type: "Data Source",
    actor: "Jane Doe",
    resource: "Banking and Payments",
    detail: "Removed from general Chat, reporting kept",
    outcome: "Applied",
  },
  {
    time: "Nov 02, 09:03",
    type: "User",
    actor: "Jane Doe",
    resource: "Alicia Gomez",
    detail: "Invitation sent, Underwriter role, expires in 7 days",
    outcome: "Sent",
  },
  {
    time: "Oct 31, 14:44",
    type: "Document",
    actor: "Marcus Lee",
    resource: "DOC-1008 ABC Holdings Loss Run",
    detail: "Uploaded and stored as Draft v1.0, classification Confidential",
    outcome: "Recorded",
  },
  {
    time: "Oct 28, 10:30",
    type: "User",
    actor: "Elena Brooks",
    resource: "Kevin Wright",
    detail: "Account suspended, sessions revoked, delegation revoked",
    outcome: "Applied",
  },
  {
    time: "Oct 28, 09:14",
    type: "Authentication",
    actor: "System",
    resource: "Kevin Wright",
    detail: "3 failed login attempts before suspension",
    outcome: "Flagged",
  },
  {
    time: "Oct 21, 08:00",
    type: "Data Source",
    actor: "System",
    resource: "Weather and Catastrophe Data",
    detail: "Authentication failed, credential expired",
    outcome: "Flagged",
  },
  {
    time: "Oct 15, 13:02",
    type: "AI Configuration",
    actor: "Jane Doe",
    resource: "Alfie organizational instructions",
    detail: "Version 6 → 7, escalation wording updated",
    outcome: "Applied",
  },
];

export const platformServices = [
  { name: "Application services", status: "Operational", note: "All modules responding normally" },
  {
    name: "AI agent availability",
    status: "Operational",
    note: "7 agents enabled, 2 in draft or paused by configuration",
  },
  {
    name: "Integration health",
    status: "Degraded",
    note: "Broker CRM sync failing, weather provider credential expired",
  },
  {
    name: "Data synchronization",
    status: "Degraded",
    note: "8 of 10 sources current, 1 stale, 1 disabled",
  },
  {
    name: "Automation execution",
    status: "Operational",
    note: "1 execution awaiting approval, 1 failed this week with owner notified",
  },
  { name: "Document processing", status: "Operational", note: "Ingestion and OCR queue clear" },
  {
    name: "Background jobs and API",
    status: "Operational",
    note: "No elevated error rates in the last 24 hours",
  },
];

export const retentionPolicies = [
  {
    data: "Conversation history",
    retention: "2 years, then archive",
    hold: "Legal hold supported",
  },
  {
    data: "Documents",
    retention: "Per document type schedule, 7 years for insurance records",
    hold: "Legal hold blocks deletion",
  },
  {
    data: "Audit records",
    retention: "7 years, tamper evident",
    hold: "Never deletable by administrators",
  },
  { data: "Automation execution history", retention: "3 years", hold: "Legal hold supported" },
  {
    data: "Integration logs",
    retention: "1 year",
    hold: "Security investigations extend on request",
  },
  {
    data: "Generated reports",
    retention: "Per report type, Finance reports 7 years",
    hold: "Legal hold supported",
  },
  {
    data: "User access history",
    retention: "Kept after deactivation, 7 years",
    hold: "Preserved with the user record",
  },
];
