// Illustrative sample data for the Pricing & Actuarial prototype. Not insurer data.

export type PricingRole = "Pricing Analyst" | "Actuary" | "Pricing Manager" | "Administrator";
export type PricingPermission = "view" | "runAnalysis" | "createScenario" | "prepareRecommendation" | "reviewAssumptions" | "signOffReserve" | "approvePricing" | "implementProduction" | "manageModels";

export const pricingRolePermissions: Record<PricingRole, readonly PricingPermission[]> = {
  "Pricing Analyst": ["view", "runAnalysis", "createScenario", "prepareRecommendation"],
  Actuary: ["view", "runAnalysis", "createScenario", "prepareRecommendation", "reviewAssumptions", "signOffReserve"],
  "Pricing Manager": ["view", "runAnalysis", "createScenario", "prepareRecommendation", "reviewAssumptions", "approvePricing", "implementProduction"],
  Administrator: ["view", "manageModels"],
};
export const pricingRoles = Object.keys(pricingRolePermissions) as PricingRole[];
export const canPricing = (role: PricingRole, p: PricingPermission) => pricingRolePermissions[role].includes(p);

/** Pricing Manager approval authority: absolute rate change, in percent. */
export const MANAGER_RATE_AUTHORITY = 10;
export function canApproveRate(role: PricingRole, ratePct: number) {
  return canPricing(role, "approvePricing") && Math.abs(ratePct) <= MANAGER_RATE_AUTHORITY;
}

export type ReviewStage = "Analysis Initiated" | "Data Validated" | "Actuarial Assessment" | "Pricing Recommendation Prepared" | "Internal Review" | "Approval" | "Regulatory / Filing Review" | "Production Implementation" | "Performance Monitoring";
export const reviewStages: readonly ReviewStage[] = ["Analysis Initiated", "Data Validated", "Actuarial Assessment", "Pricing Recommendation Prepared", "Internal Review", "Approval", "Regulatory / Filing Review", "Production Implementation", "Performance Monitoring"];
export type ReviewStatus = "Draft" | "In Review" | "Pending Approval" | "Approved" | "Filing Review" | "Implemented" | "Rejected";

/** Production implementation is only possible once a rate is approved and filing review is complete. */
export function canImplement(role: PricingRole, status: ReviewStatus) {
  return canPricing(role, "implementProduction") && status === "Filing Review";
}

// ---------- Scenario modeling (illustrative arithmetic, not an actuarial forecast) ----------
export type ScenarioInputs = { premium: number; losses: number; expenseRatio: number; baseRetention: number; ratePct: number; freqTrendPct: number; sevTrendPct: number; elasticity: number };
export type ScenarioResult = { writtenPremium: number; lossRatio: number; combinedRatio: number; retention: number; underwritingResult: number };
export const baseScenario: ScenarioInputs = { premium: 18.4, losses: 11.9, expenseRatio: 30.1, baseRetention: 88, ratePct: 0, freqTrendPct: 0, sevTrendPct: 0, elasticity: 0.45 };
export function runScenario(i: ScenarioInputs): ScenarioResult {
  const writtenPremium = i.premium * (1 + i.ratePct / 100);
  const losses = i.losses * (1 + i.freqTrendPct / 100) * (1 + i.sevTrendPct / 100);
  const lossRatio = (losses / writtenPremium) * 100;
  const combinedRatio = lossRatio + i.expenseRatio;
  const retention = Math.max(0, Math.min(100, i.baseRetention - Math.max(0, i.ratePct) * i.elasticity));
  return { writtenPremium, lossRatio, combinedRatio, retention, underwritingResult: writtenPremium - losses - writtenPremium * (i.expenseRatio / 100) };
}

// ---------- Overview ----------
export const kpis = [
  { key: "gwp", label: "Gross Written Premium", value: "$48.6M", delta: "+6.2% vs prior period", up: true, good: true, prompt: "Analyze gross written premium growth by line of business." },
  { key: "lr", label: "Loss Ratio", value: "62.4%", delta: "+1.8 pts vs prior period", up: true, good: false, prompt: "Analyze our loss ratio over the last 12 months." },
  { key: "cr", label: "Combined Ratio", value: "94.8%", delta: "+1.1 pts vs prior period", up: true, good: false, prompt: "What is driving our combined ratio movement?" },
  { key: "avg", label: "Average Premium", value: "$1,840", delta: "+4.3% YoY", up: true, good: true, prompt: "Explain the change in average premium year over year." },
  { key: "ra", label: "Rate Adequacy", value: "96.2%", delta: "Target 100%", up: false, good: false, prompt: "Identify portfolios that may require a rate review." },
] as const;

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const prem = [3.72, 3.81, 3.88, 3.9, 3.97, 4.02, 4.05, 4.11, 4.15, 4.19, 4.24, 4.31];
const loss = [2.21, 2.3, 2.52, 2.39, 2.41, 2.47, 2.55, 2.6, 2.71, 2.62, 2.7, 2.78];
export const monthly = months.map((m, idx) => ({ period: m, premium: prem[idx], losses: loss[idx], lossRatio: +((loss[idx] / prem[idx]) * 100).toFixed(1) }));
export const quarterly = [0, 1, 2, 3].map((q) => { const p = prem.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0); const l = loss.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0); return { period: ["Q4 '25", "Q1 '26", "Q2 '26", "Q3 '26"][q], premium: +p.toFixed(2), losses: +l.toFixed(2), lossRatio: +((l / p) * 100).toFixed(1) }; });
export const annual = [{ period: "2022", premium: 38.1, losses: 22.4 }, { period: "2023", premium: 41.2, losses: 24.6 }, { period: "2024", premium: 44.0, losses: 26.9 }, { period: "2025", premium: 45.8, losses: 28.0 }, { period: "2026 YTD", premium: 48.6, losses: 30.3 }].map((r) => ({ ...r, lossRatio: +((r.losses / r.premium) * 100).toFixed(1) }));

export type LineRow = { line: string; premium: number; losses: number; lossRatio: number; combinedRatio: number; frequency: number; severity: number; freqChange: number; sevChange: number };
export const lines: LineRow[] = [
  { line: "Commercial Property", premium: 18.4, losses: 11.9, lossRatio: 64.7, combinedRatio: 94.8, frequency: 3.1, severity: 46_200, freqChange: 0.4, sevChange: 11.8 },
  { line: "Auto", premium: 11.2, losses: 7.6, lossRatio: 67.9, combinedRatio: 99.4, frequency: 8.4, severity: 9_800, freqChange: 3.9, sevChange: 7.2 },
  { line: "General Liability", premium: 7.1, losses: 3.9, lossRatio: 54.9, combinedRatio: 86.2, frequency: 1.2, severity: 38_500, freqChange: -0.8, sevChange: 4.1 },
  { line: "Professional Liability", premium: 4.3, losses: 2.1, lossRatio: 48.8, combinedRatio: 81.5, frequency: 0.6, severity: 71_300, freqChange: 0.2, sevChange: 2.6 },
  { line: "Homeowners", premium: 5.0, losses: 3.6, lossRatio: 72.0, combinedRatio: 103.1, frequency: 4.7, severity: 15_400, freqChange: 6.3, sevChange: 9.1 },
  { line: "Workers' Compensation", premium: 2.6, losses: 1.4, lossRatio: 53.8, combinedRatio: 88.0, frequency: 2.3, severity: 12_100, freqChange: -1.5, sevChange: 3.4 },
];

// ---------- Actuarial ----------
export const accidentYears = ["2021", "2022", "2023", "2024", "2025"];
/** Cumulative incurred loss triangle ($K), Commercial Property. */
export const incurredTriangle: (number | null)[][] = [
  [6120, 8340, 9010, 9220, 9280],
  [6480, 8910, 9640, 9890, null],
  [7010, 9720, 10480, null, null],
  [7560, 10560, null, null, null],
  [8240, null, null, null, null],
];
export const paidTriangle: (number | null)[][] = [
  [3410, 6120, 7880, 8710, 9050],
  [3620, 6510, 8390, 9260, null],
  [3880, 7090, 9110, null, null],
  [4150, 7690, null, null, null],
  [4480, null, null, null, null],
];
export function ageToAgeFactors(tri: (number | null)[][]) {
  const n = tri[0].length;
  return Array.from({ length: n - 1 }, (_, j) => {
    let num = 0, den = 0;
    tri.forEach((row) => { const a = row[j], b = row[j + 1]; if (a != null && b != null) { num += b; den += a; } });
    return den ? num / den : 1;
  });
}
export function ultimates(tri: (number | null)[][], factors: number[]) {
  return tri.map((row) => {
    const lastIdx = row.reduce<number>((acc, v, i) => (v != null ? i : acc), 0);
    const cdf = factors.slice(lastIdx).reduce((a, f) => a * f, 1);
    return { latest: row[lastIdx] as number, cdf, ultimate: (row[lastIdx] as number) * cdf };
  });
}

export const expectedVsActual = [
  { metric: "Claims count", expected: "2,480", actual: "2,611", dev: 5.3 },
  { metric: "Frequency (per 100 exposures)", expected: "2.95", actual: "3.10", dev: 5.1 },
  { metric: "Average severity", expected: "$41,300", actual: "$46,200", dev: 11.9 },
  { metric: "Incurred losses", expected: "$10.4M", actual: "$11.9M", dev: 14.4 },
  { metric: "Loss ratio", expected: "58.0%", actual: "64.7%", dev: 11.6 },
];
export const reserves = [
  { line: "Commercial Property", caseReserve: 4.2, ibnr: 1.9, ultimate: 49.8, movement: 0.6, method: "Chain Ladder / Bornhuetter-Ferguson", status: "Pending sign-off" },
  { line: "Auto", caseReserve: 2.8, ibnr: 1.1, ultimate: 31.2, movement: 0.3, method: "Chain Ladder", status: "Signed off" },
  { line: "General Liability", caseReserve: 3.1, ibnr: 2.4, ultimate: 18.9, movement: -0.2, method: "Bornhuetter-Ferguson", status: "Signed off" },
  { line: "Homeowners", caseReserve: 1.2, ibnr: 0.5, ultimate: 14.6, movement: 0.4, method: "Chain Ladder", status: "Pending sign-off" },
];
export const trends = [
  { name: "Construction & repair cost inflation", value: "+8.7% YoY", impact: "High", note: "Driving Commercial Property and Homeowners severity." },
  { name: "Auto parts and labour", value: "+6.1% YoY", impact: "Medium", note: "ADAS sensor replacement increasing average repair cost." },
  { name: "Medical cost trend", value: "+4.2% YoY", impact: "Medium", note: "Relevant to Auto bodily injury and Workers' Compensation." },
  { name: "Geographic loss trend — Ontario GTA", value: "+13.4% severity", impact: "High", note: "Concentrated in pre-1980 commercial buildings." },
  { name: "Catastrophe exposure — convective storm", value: "3 events YTD", impact: "Medium", note: "Hail losses above 5-year average in Alberta." },
];

// ---------- Models ----------
export type ModelStatus = "Draft" | "Under Review" | "Approved" | "Active" | "Archived";
export type PricingModel = { id: string; name: string; product: string; line: string; version: string; updated: string; owner: string; status: ModelStatus; description: string; factors: { name: string; relativity: string; contribution: number }[]; versions: { version: string; date: string; note: string; approvedBy: string }[]; validation: { metric: string; value: string; ok: boolean }[]; drift: string; reviewDate: string };
export const pricingModels: PricingModel[] = [
  { id: "PM-CP-01", name: "Commercial Property Pricing Model", product: "Commercial Package", line: "Commercial Property", version: "v4.2", updated: "Oct 18, 2026", owner: "Priya Natarajan", status: "Active", description: "GLM-based base rate and relativity model for commercial property, rating building, contents and business interruption exposures.", factors: [{ name: "Geographic territory", relativity: "0.82 – 1.46", contribution: 28 }, { name: "Property age", relativity: "0.90 – 1.38", contribution: 21 }, { name: "Construction type", relativity: "0.85 – 1.30", contribution: 18 }, { name: "Occupancy", relativity: "0.88 – 1.52", contribution: 14 }, { name: "Protection class", relativity: "0.92 – 1.20", contribution: 9 }, { name: "Deductible", relativity: "0.78 – 1.00", contribution: 6 }, { name: "Claims history", relativity: "0.95 – 1.25", contribution: 4 }], versions: [{ version: "v4.2", date: "Oct 18, 2026", note: "Territory relativities refreshed", approvedBy: "Marcus Hill, Pricing Manager" }, { version: "v4.1", date: "Apr 02, 2026", note: "Property age bands extended to pre-1960", approvedBy: "Marcus Hill, Pricing Manager" }, { version: "v4.0", date: "Nov 14, 2025", note: "GLM refit on 2020–2024 experience", approvedBy: "Pricing Committee" }], validation: [{ metric: "Gini coefficient", value: "0.41", ok: true }, { metric: "Actual / expected (holdout)", value: "1.12", ok: false }, { metric: "Lift (top decile)", value: "2.8×", ok: true }], drift: "Moderate — severity drift in pre-1980 buildings", reviewDate: "Jan 15, 2027" },
  { id: "PM-PA-03", name: "Personal Auto Pricing Model", product: "Personal Auto", line: "Auto", version: "v7.0", updated: "Sep 30, 2026", owner: "Daniel Okafor", status: "Active", description: "Frequency-severity GLM for personal auto covering collision, comprehensive and liability.", factors: [{ name: "Driver experience", relativity: "0.80 – 2.10", contribution: 26 }, { name: "Vehicle symbol", relativity: "0.85 – 1.45", contribution: 22 }, { name: "Territory", relativity: "0.88 – 1.35", contribution: 19 }, { name: "Claims history", relativity: "1.00 – 1.60", contribution: 17 }, { name: "Deductible", relativity: "0.80 – 1.00", contribution: 9 }, { name: "Annual mileage", relativity: "0.92 – 1.15", contribution: 7 }], versions: [{ version: "v7.0", date: "Sep 30, 2026", note: "ADAS vehicle symbol update", approvedBy: "Pricing Committee" }, { version: "v6.4", date: "Mar 11, 2026", note: "Territory refresh", approvedBy: "Marcus Hill, Pricing Manager" }], validation: [{ metric: "Gini coefficient", value: "0.38", ok: true }, { metric: "Actual / expected (holdout)", value: "1.04", ok: true }, { metric: "Lift (top decile)", value: "2.5×", ok: true }], drift: "Low", reviewDate: "Mar 30, 2027" },
  { id: "PM-GL-02", name: "General Liability Pricing Model", product: "Commercial Package", line: "General Liability", version: "v3.1", updated: "Aug 12, 2026", owner: "Priya Natarajan", status: "Approved", description: "Exposure-based liability rating by class code, revenue and limits.", factors: [{ name: "Class code", relativity: "0.70 – 2.40", contribution: 38 }, { name: "Revenue band", relativity: "0.85 – 1.60", contribution: 27 }, { name: "Limits", relativity: "1.00 – 1.85", contribution: 20 }, { name: "Claims history", relativity: "0.95 – 1.40", contribution: 15 }], versions: [{ version: "v3.1", date: "Aug 12, 2026", note: "Increased limits factors", approvedBy: "Marcus Hill, Pricing Manager" }, { version: "v3.0", date: "Jan 20, 2026", note: "Class plan consolidation", approvedBy: "Pricing Committee" }], validation: [{ metric: "Gini coefficient", value: "0.33", ok: true }, { metric: "Actual / expected (holdout)", value: "0.97", ok: true }], drift: "Low", reviewDate: "Aug 12, 2027" },
  { id: "PM-HO-05", name: "Homeowners Pricing Model", product: "Homeowners", line: "Homeowners", version: "v5.3-draft", updated: "Nov 02, 2026", owner: "Elena Rossi", status: "Under Review", description: "Peril-by-peril homeowners model with water, wind/hail, fire and liability components.", factors: [{ name: "Dwelling age", relativity: "0.88 – 1.42", contribution: 24 }, { name: "Roof age", relativity: "0.90 – 1.55", contribution: 22 }, { name: "Territory", relativity: "0.80 – 1.50", contribution: 21 }, { name: "Coverage A limit", relativity: "0.95 – 1.30", contribution: 18 }, { name: "Water protection devices", relativity: "0.90 – 1.00", contribution: 8 }, { name: "Claims history", relativity: "1.00 – 1.35", contribution: 7 }], versions: [{ version: "v5.3-draft", date: "Nov 02, 2026", note: "Proposed roof age relativities (pending review)", approvedBy: "—" }, { version: "v5.2", date: "May 05, 2026", note: "Water peril refit", approvedBy: "Pricing Committee" }], validation: [{ metric: "Gini coefficient", value: "0.36", ok: true }, { metric: "Actual / expected (holdout)", value: "1.15", ok: false }], drift: "High — water and hail severity", reviewDate: "Dec 10, 2026" },
  { id: "PM-WC-01", name: "Workers' Compensation Rating Plan", product: "Workers' Compensation", line: "Workers' Compensation", version: "v2.0", updated: "Jun 01, 2025", owner: "Daniel Okafor", status: "Archived", description: "Superseded experience-rating plan retained for audit.", factors: [{ name: "Industry class", relativity: "0.60 – 2.80", contribution: 55 }, { name: "Experience modifier", relativity: "0.75 – 1.40", contribution: 45 }], versions: [{ version: "v2.0", date: "Jun 01, 2025", note: "Archived — replaced by bureau rates", approvedBy: "Pricing Committee" }], validation: [{ metric: "Actual / expected (holdout)", value: "—", ok: true }], drift: "Not monitored (archived)", reviewDate: "—" },
];

// ---------- Rate reviews ----------
export type RateReview = { id: string; title: string; line: string; current: string; proposedPct: number; segments: string; premiumImpact: string; stage: number; status: ReviewStatus; owner: string; comments: { who: string; when: string; text: string }[] };
export const rateReviews: RateReview[] = [
  { id: "RR-2026-014", title: "Commercial Property — Ontario rate adjustment", line: "Commercial Property", current: "$2,186 avg", proposedPct: 8, segments: "Ontario GTA, pre-1980 buildings, manufacturing occupancy", premiumImpact: "+$1.47M written premium (illustrative)", stage: 4, status: "In Review", owner: "Jane Doe", comments: [{ who: "Priya Natarajan, Actuary", when: "Nov 03", text: "Severity trend selection of 9% looks reasonable; please show sensitivity at 7% and 11%." }] },
  { id: "RR-2026-012", title: "Homeowners — water peril adjustment", line: "Homeowners", current: "$1,412 avg", proposedPct: 12, segments: "Pre-1990 dwellings, finished basements", premiumImpact: "+$0.60M written premium (illustrative)", stage: 5, status: "Pending Approval", owner: "Elena Rossi", comments: [{ who: "Marcus Hill, Pricing Manager", when: "Nov 01", text: "+12% exceeds my 10% authority — routing to Pricing Committee." }] },
  { id: "RR-2026-009", title: "Personal Auto — ADAS symbol refresh", line: "Auto", current: "$1,690 avg", proposedPct: 3, segments: "Model years 2021+", premiumImpact: "+$0.34M written premium (illustrative)", stage: 6, status: "Filing Review", owner: "Daniel Okafor", comments: [{ who: "Compliance Monitoring Agent", when: "Oct 28", text: "Rate filing package complete; awaiting regulator acknowledgement." }] },
  { id: "RR-2026-004", title: "General Liability — contractor class", line: "General Liability", current: "$3,240 avg", proposedPct: -2, segments: "Low-hazard contractor classes", premiumImpact: "−$0.09M written premium (illustrative)", stage: 8, status: "Implemented", owner: "Priya Natarajan", comments: [] },
];

export const dataSources = [
  { name: "Policy Administration System", type: "Core system", updated: "12 min ago", status: "Connected", coverage: "2018 – present", validation: "Validated" },
  { name: "Claims Management System", type: "Core system", updated: "8 min ago", status: "Connected", coverage: "2015 – present", validation: "Validated" },
  { name: "Historical Premium Database", type: "Data warehouse", updated: "Yesterday", status: "Connected", coverage: "2012 – 2026 Q3", validation: "Validated" },
  { name: "Actuarial Data Warehouse", type: "Data warehouse", updated: "2 days ago", status: "Connected", coverage: "AY 2010 – 2025", validation: "2 warnings" },
  { name: "Loss Development Triangles", type: "Dataset", updated: "Oct 31, 2026", status: "Connected", coverage: "AY 2021 – 2025", validation: "Validated" },
  { name: "Rate Filings Repository", type: "Documents", updated: "Oct 28, 2026", status: "Connected", coverage: "2019 – 2026", validation: "Validated" },
  { name: "Building Age Attributes", type: "Underwriting data", updated: "41 days ago", status: "Stale", coverage: "82% of policies", validation: "Incomplete" },
  { name: "StatCan Construction Price Index", type: "External economic data", updated: "Oct 15, 2026", status: "Connected", coverage: "Quarterly", validation: "Validated" },
];

export const reports = [
  { id: "RPT-Q3-26", name: "Q3 2026 Actuarial Performance Summary", type: "Quarterly report", date: "Oct 30, 2026", status: "Final" },
  { id: "RPT-RR-014", name: "Commercial Property Pricing Recommendation", type: "Pricing recommendation", date: "Nov 04, 2026", status: "Draft" },
  { id: "RPT-RES-Q3", name: "Q3 2026 Reserve Review", type: "Reserve analysis", date: "Oct 22, 2026", status: "Pending sign-off" },
  { id: "RPT-MDL-HO", name: "Homeowners Model Validation Report", type: "Model validation", date: "Nov 02, 2026", status: "Under review" },
];

export type PricingEvent = { time: string; actor: string; type: "User" | "Alfie" | "Agent" | "System"; action: string; detail: string };
export const pricingAudit: PricingEvent[] = [
  { time: "Nov 04, 2026 09:12", actor: "Jane Doe", type: "User", action: "Analysis started", detail: "Commercial Property Rate Adequacy Analysis (PA-2026-031)" },
  { time: "Nov 04, 2026 09:12", actor: "Alfie", type: "Alfie", action: "Data retrieved", detail: "Policy Admin, Claims, Actuarial Data Warehouse · AY 2021–2025" },
  { time: "Nov 04, 2026 09:13", actor: "Claims Trend Analysis Agent", type: "Agent", action: "Severity trend computed", detail: "+11.8% YoY severity · method: log-linear fit" },
  { time: "Nov 04, 2026 09:13", actor: "Alfie", type: "Alfie", action: "Data limitation flagged", detail: "Building age missing for 18% of policies" },
  { time: "Nov 04, 2026 09:20", actor: "Jane Doe", type: "User", action: "Scenario saved", detail: "Scenario B (+8%) · model PM-CP-01 v4.2" },
];
