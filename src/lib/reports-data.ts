export type ReportKpi = {
  label: string;
  value: string;
  change: string;
  source: string;
  updated: string;
};

export const reportKpis: ReportKpi[] = [
  {
    label: "Gross Written Premium",
    value: "$48.6M",
    change: "+6.4% vs last quarter",
    source: "Policy Administration System",
    updated: "28 min ago",
  },
  {
    label: "Net Written Premium",
    value: "$44.9M",
    change: "+5.8% vs last quarter",
    source: "Policy + Reinsurance",
    updated: "28 min ago",
  },
  {
    label: "Claims Incurred",
    value: "$29.2M",
    change: "+8.7% vs last quarter",
    source: "Claims Management System",
    updated: "9 min ago",
  },
  {
    label: "Claims Paid",
    value: "$21.8M",
    change: "+9.1% vs last quarter",
    source: "Claims + Finance",
    updated: "9 min ago",
  },
  {
    label: "Loss Ratio",
    value: "63.1%",
    change: "+2.4 pts vs last quarter",
    source: "Actuarial Data Warehouse",
    updated: "41 min ago",
  },
  {
    label: "Combined Ratio",
    value: "96.8%",
    change: "+1.6 pts vs last quarter",
    source: "Actuarial + Finance",
    updated: "41 min ago",
  },
  {
    label: "Average Claim Severity",
    value: "$8,420",
    change: "+3.2% vs last quarter",
    source: "Claims Management System",
    updated: "9 min ago",
  },
  {
    label: "Claims Frequency",
    value: "6.8 per 100 policies",
    change: "+0.5 vs last quarter",
    source: "Claims + Policy",
    updated: "41 min ago",
  },
  {
    label: "Active Policies",
    value: "84,392",
    change: "+2,140 this quarter",
    source: "Policy Administration System",
    updated: "28 min ago",
  },
  {
    label: "New Policies Issued",
    value: "3,842",
    change: "+11.2% vs last quarter",
    source: "Policy Administration System",
    updated: "28 min ago",
  },
  {
    label: "Renewal Retention",
    value: "91.2%",
    change: "-0.8 pts vs last year",
    source: "Policy Administration System",
    updated: "28 min ago",
  },
  {
    label: "Cancellations",
    value: "412",
    change: "+6.0% vs last quarter",
    source: "Policy Administration System",
    updated: "28 min ago",
  },
  {
    label: "Underwriting Acceptance Rate",
    value: "58%",
    change: "Referrals 24%, declines 18%",
    source: "Underwriting Platform",
    updated: "Syncing now",
  },
  {
    label: "Average Premium",
    value: "$576",
    change: "+2.1% vs last quarter",
    source: "Policy Administration System",
    updated: "28 min ago",
  },
  {
    label: "Operating Expenses",
    value: "$8.7M",
    change: "+3.8% vs last quarter",
    source: "General Ledger and ERP",
    updated: "12 min ago",
  },
  {
    label: "Net Underwriting Result",
    value: "$6.4M",
    change: "Profitable, margin 13.8%",
    source: "Finance workspace",
    updated: "12 min ago",
  },
];

export const lossTrend = [
  { month: "May", gwp: 3.8, lossRatio: 58.4 },
  { month: "Jun", gwp: 3.9, lossRatio: 59.1 },
  { month: "Jul", gwp: 4.0, lossRatio: 60.8 },
  { month: "Aug", gwp: 4.1, lossRatio: 61.5 },
  { month: "Sep", gwp: 4.2, lossRatio: 64.9 },
  { month: "Oct", gwp: 4.3, lossRatio: 63.1 },
];

export type LibraryReport = {
  id: string;
  name: string;
  category: string;
  description: string;
  period: string;
  owner: string;
  created: string;
  updated: string;
  access: string;
  status: "Final" | "Preliminary" | "Estimated";
  version: string;
  sources: string;
};

export const reportLibrary: LibraryReport[] = [
  {
    id: "RPT-301",
    name: "Q3 2026 Claims Performance",
    category: "Claims",
    description: "Frequency, severity, settlement trends and aging across all lines.",
    period: "Q3 2026",
    owner: "Sarah Chen",
    created: "Oct 06, 2026",
    updated: "Oct 30, 2026",
    access: "Claims, Executives",
    status: "Final",
    version: "2.1",
    sources: "Claims Management System",
  },
  {
    id: "RPT-302",
    name: "Claims Leakage and Exception Analysis",
    category: "Claims",
    description: "Payments outside authority, duplicate indicators and process exceptions.",
    period: "Q3 2026",
    owner: "Priya Shah",
    created: "Oct 08, 2026",
    updated: "Oct 28, 2026",
    access: "Claims Managers, Compliance",
    status: "Final",
    version: "1.3",
    sources: "Claims Management System, Finance",
  },
  {
    id: "RPT-303",
    name: "Submission Conversion by Line",
    category: "Underwriting",
    description: "Submission volume, acceptance, referral and decline rates by business line.",
    period: "Oct 2026",
    owner: "Marcus Lee",
    created: "Nov 02, 2026",
    updated: "Nov 03, 2026",
    access: "Underwriting",
    status: "Preliminary",
    version: "1.0",
    sources: "Underwriting Platform",
  },
  {
    id: "RPT-304",
    name: "Renewals and Retention Review",
    category: "Policy",
    description:
      "Renewals, retention movement, cancellations and reinstatements by line and region.",
    period: "Last 12 months",
    owner: "Jane Doe",
    created: "Oct 20, 2026",
    updated: "Nov 01, 2026",
    access: "Policy, Executives",
    status: "Final",
    version: "3.0",
    sources: "Policy Administration System",
  },
  {
    id: "RPT-305",
    name: "Premium Distribution by Policy Type",
    category: "Policy",
    description: "Written and earned premium split by product and policy type.",
    period: "Oct 2026",
    owner: "Nora Fields",
    created: "Nov 02, 2026",
    updated: "Nov 02, 2026",
    access: "All departments",
    status: "Final",
    version: "1.1",
    sources: "Policy Administration System",
  },
  {
    id: "RPT-306",
    name: "Loss Ratio by Business Line",
    category: "Pricing & Actuarial",
    description: "Loss ratio and combined ratio by line with prior quarter comparison.",
    period: "Q3 2026",
    owner: "Daniel Cho",
    created: "Oct 10, 2026",
    updated: "Oct 31, 2026",
    access: "Actuarial, Executives, Finance",
    status: "Final",
    version: "2.4",
    sources: "Actuarial Data Warehouse",
  },
  {
    id: "RPT-307",
    name: "Reserve and IBNR Analysis",
    category: "Pricing & Actuarial",
    description: "Reserve adequacy, development and IBNR by accident quarter.",
    period: "Q3 2026",
    owner: "Daniel Cho",
    created: "Oct 14, 2026",
    updated: "Oct 29, 2026",
    access: "Actuarial, Finance leads",
    status: "Preliminary",
    version: "1.2",
    sources: "Actuarial Data Warehouse, Claims",
  },
  {
    id: "RPT-308",
    name: "Monthly Financial Performance",
    category: "Finance",
    description:
      "Revenue, expenses, underwriting result and cash position. Same report as FIN-2026-014 in Finance.",
    period: "Oct 2026",
    owner: "Sofia Martin",
    created: "Nov 03, 2026",
    updated: "Nov 04, 2026",
    access: "Finance, Executives",
    status: "Preliminary",
    version: "1.0",
    sources: "General Ledger and ERP, Banking feed",
  },
  {
    id: "RPT-309",
    name: "Broker Production and Commission",
    category: "Finance",
    description: "Premium production, commission and loss experience by broker.",
    period: "Q3 2026",
    owner: "Sofia Martin",
    created: "Oct 12, 2026",
    updated: "Oct 26, 2026",
    access: "Finance, Distribution",
    status: "Final",
    version: "1.5",
    sources: "Policy Administration System, CRM (stale, flagged in report)",
  },
  {
    id: "RPT-310",
    name: "Executive Business Review",
    category: "Executive",
    description:
      "Consolidated performance: growth, profitability, claims, underwriting, retention and risks.",
    period: "Q3 2026",
    owner: "Jane Doe",
    created: "Oct 16, 2026",
    updated: "Nov 01, 2026",
    access: "Executives",
    status: "Final",
    version: "2.0",
    sources: "All departments",
  },
  {
    id: "RPT-311",
    name: "Portfolio Health and Risk Exposure",
    category: "Executive",
    description: "Concentration, large exposures and lines trending outside appetite.",
    period: "Oct 2026",
    owner: "Jane Doe",
    created: "Nov 01, 2026",
    updated: "Nov 04, 2026",
    access: "Executives, Underwriting leads",
    status: "Preliminary",
    version: "0.9",
    sources: "Underwriting, Policy, Actuarial",
  },
];

/*
 * Readable content for the in-app report preview, keyed by report id.
 * Opening a report shows its summary and headline figures in the workspace;
 * exporting to PDF, Excel or CSV stays available for anyone who needs the
 * file itself. Figures match the workspace KPI set above.
 */
export const reportContent: Record<
  string,
  { summary: string; figures: [string, string, string][] }
> = {
  "RPT-301": {
    summary:
      "Claims frequency is steady and severity is doing the moving, concentrated in Commercial Property water damage. Settlement cycle time shortened again this quarter, and the open inventory is aging better than it did in Q2.",
    figures: [
      ["Claims incurred", "$29.2M", "+8.7% vs last quarter"],
      ["Claims paid", "$21.8M", "+9.1% vs last quarter"],
      ["Average claim severity", "$8,420", "+3.2% vs last quarter"],
      ["Claims frequency", "6.8 per 100 policies", "+0.5 vs last quarter"],
    ],
  },
  "RPT-302": {
    summary:
      "Exceptions are concentrated in auto physical damage supplements and payments made close to authority limits. One payment was made below its approved settlement amount; it is flagged here for review and has not been corrected silently.",
    figures: [
      ["Payments reviewed", "12,480", "Q3 2026"],
      ["Exceptions flagged", "37", "0.3% of payments"],
      ["Payments above authority", "6", "Referred to Claims Manager"],
      ["Duplicate indicators", "3", "Under investigation"],
    ],
  },
  "RPT-303": {
    summary:
      "Acceptance held at 58% while referral volume rose, which points to more borderline submissions rather than a tighter appetite. Commercial Property converts best; Commercial Auto declines most often on incomplete information.",
    figures: [
      ["Underwriting acceptance rate", "58%", "Q3 2026"],
      ["Referrals", "24%", "Of submissions received"],
      ["Declines", "18%", "Of submissions received"],
      ["New policies issued", "3,842", "+11.2% vs last quarter"],
    ],
  },
  "RPT-304": {
    summary:
      "Retention slipped 0.8 points against last year, driven by price-led cancellations in Personal Auto. Commercial lines renewed strongly, and 126 policies fall due in the next 60 days with renewal preparation already under way.",
    figures: [
      ["Renewal retention", "91.2%", "-0.8 pts vs last year"],
      ["Cancellations", "412", "+6.0% vs last quarter"],
      ["Renewals due in 60 days", "126", "Preparation started"],
      ["Average premium", "$576", "+2.1% vs last quarter"],
    ],
  },
  "RPT-305": {
    summary:
      "Commercial Property remains the largest premium line and the fastest growing. Personal lines still provide the policy count, while commercial lines provide most of the premium per policy.",
    figures: [
      ["Gross written premium", "$48.6M", "+6.4% vs last quarter"],
      ["Net written premium", "$44.9M", "+5.8% vs last quarter"],
      ["Policies in force", "84,392", "+2,140 this quarter"],
      ["Average premium", "$576", "+2.1% vs last quarter"],
    ],
  },
  "RPT-306": {
    summary:
      "The portfolio loss ratio rose 2.4 points to 63.1%, with Commercial Property severity the main driver. Two lines are trending outside their target range and are named in the body of the report with the supporting development.",
    figures: [
      ["Loss ratio", "63.1%", "+2.4 pts vs last quarter"],
      ["Combined ratio", "96.8%", "+1.6 pts vs last quarter"],
      ["Claims incurred", "$29.2M", "+8.7% vs last quarter"],
      ["Gross written premium", "$48.6M", "+6.4% vs last quarter"],
    ],
  },
  "RPT-307": {
    summary:
      "Reserves developed favourably on older accident years and adversely on AY 2025, which is still immature. IBNR is held with the same method as last quarter so the movement shown is experience, not a method change.",
    figures: [
      ["Claims incurred", "$29.2M", "+8.7% vs last quarter"],
      ["Claims paid", "$21.8M", "+9.1% vs last quarter"],
      ["Accident quarters covered", "AY 2021 to 2026", "Development basis"],
      ["Method", "Chain Ladder with BF blend", "Unchanged this quarter"],
    ],
  },
  "RPT-308": {
    summary:
      "Premium growth of 6.4% outpaced expenses, and the net underwriting result improved to $6.4M despite claims paid rising faster than premium. Premium receivables need attention: $612K is overdue.",
    figures: [
      ["Gross written premium", "$48.6M", "+6.4% vs last period"],
      ["Claims paid", "$21.8M", "+9.1% vs last period"],
      ["Operating expenses", "$8.7M", "+3.8% vs last period"],
      ["Net underwriting result", "$6.4M", "Margin 13.8%"],
    ],
  },
  "RPT-309": {
    summary:
      "Apex Insurance Brokers remains the largest producing broker. Commission follows the configured agreement rates only, and receivables aging by broker is set out in the body of the report.",
    figures: [
      ["Premium receivables", "$4.2M", "All brokers"],
      ["Receivables overdue", "$612K", "Aging in report body"],
      ["Gross written premium", "$48.6M", "+6.4% vs last quarter"],
      ["Brokers reporting", "214", "Active agreements"],
    ],
  },
  "RPT-310": {
    summary:
      "The quarter in one view: growth is real, the combined ratio is drifting the wrong way on severity, and retention is the number to protect. Each section of the review ties back to the module report behind it.",
    figures: [
      ["Gross written premium", "$48.6M", "+6.4% vs last quarter"],
      ["Combined ratio", "96.8%", "+1.6 pts vs last quarter"],
      ["Renewal retention", "91.2%", "-0.8 pts vs last year"],
      ["Net underwriting result", "$6.4M", "Margin 13.8%"],
    ],
  },
  "RPT-311": {
    summary:
      "Concentration is within appetite overall. One line, Commercial Property, is trending outside its severity range, and the largest single locations are listed with their protection status in the body of the report.",
    figures: [
      ["Policies in force", "84,392", "+2,140 this quarter"],
      ["New policies issued", "3,842", "+11.2% vs last quarter"],
      ["Cancellations", "412", "+6.0% vs last quarter"],
      ["Lines outside appetite trend", "1", "Commercial Property severity"],
    ],
  },
};

export const reportCategories = [
  "All categories",
  "Claims",
  "Underwriting",
  "Policy",
  "Pricing & Actuarial",
  "Finance",
  "Executive",
];

export const scheduledReports = [
  {
    name: "Daily Claims Summary",
    schedule: "Daily, 7:30 AM",
    recipients: "Claims Operations group",
    nextRun: "Tomorrow, 7:30 AM",
    lastRun: "Today, Completed and delivered",
    review: "No review, internal",
  },
  {
    name: "Weekly Underwriting Performance",
    schedule: "Weekly, Monday 8:00 AM",
    recipients: "Underwriting team",
    nextRun: "Monday, 8:00 AM",
    lastRun: "Monday, Completed and delivered",
    review: "No review",
  },
  {
    name: "Monthly Financial Performance",
    schedule: "Monthly, 4th business day",
    recipients: "Finance Team, Executive Management",
    nextRun: "Dec 04, 2026",
    lastRun: "Nov 04, Completed, awaiting Finance review before wider distribution",
    review: "Finance Manager review required",
  },
  {
    name: "Quarterly Executive Business Review",
    schedule: "Quarterly, 10th business day",
    recipients: "Executive Management",
    nextRun: "Jan 14, 2027",
    lastRun: "Oct 16, Completed and delivered",
    review: "Organization Administrator review",
  },
  {
    name: "Broker Production and Commission",
    schedule: "Monthly, 5th business day",
    recipients: "Finance Team",
    nextRun: "Paused",
    lastRun:
      "Oct run completed with a data warning: CRM figures were stale and are flagged in the report",
    review: "No review",
  },
];

export const reportAudit = [
  {
    time: "Nov 04, 09:20",
    actor: "Jane Doe",
    action: "Report refreshed",
    detail: "RPT-311 Portfolio Health, refreshed as version 0.9, original preserved",
  },
  {
    time: "Nov 04, 08:15",
    actor: "Sofia Martin",
    action: "Report exported",
    detail: "RPT-308 Monthly Financial Performance exported to Excel by its owner",
  },
  {
    time: "Nov 03, 15:40",
    actor: "Nora Fields",
    action: "Report created",
    detail: "RPT-305 Premium Distribution by Policy Type, from the report builder",
  },
  {
    time: "Nov 03, 11:02",
    actor: "System",
    action: "Scheduled run completed",
    detail: "Daily Claims Summary delivered to Claims Operations",
  },
  {
    time: "Oct 30, 10:18",
    actor: "Daniel Cho",
    action: "Report shared",
    detail: "RPT-306 Loss Ratio by Business Line shared as a live report with Finance leads",
  },
];

export const executiveTargets = [
  { metric: "Gross Written Premium", actual: "$48.6M", target: "$46.0M", status: "Ahead" },
  { metric: "Combined Ratio", actual: "96.8%", target: "95.0%", status: "Behind" },
  { metric: "Renewal Retention", actual: "91.2%", target: "92.0%", status: "Behind" },
  { metric: "Claims Settlement Time", actual: "21 days avg", target: "20 days", status: "Near" },
  { metric: "New Policies Issued", actual: "3,842", target: "3,500", status: "Ahead" },
];
