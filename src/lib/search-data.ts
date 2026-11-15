import { claims } from "./claims-data";
import { submissions } from "./underwriting-data";
import { policies } from "./policy-data";
import { orgDocuments } from "./workspace-data";
import { reportLibrary } from "./reports-data";

/**
 * The global search index. Entries are built from the same module data
 * the queues and libraries render, so a result always matches what the
 * destination page shows. Search runs entirely in the browser over
 * this index (frontend only, no backend yet).
 */

export type SearchLink =
  | {
      to:
        | "/"
        | "/claims"
        | "/underwriting"
        | "/policy"
        | "/pricing"
        | "/finance"
        | "/reports"
        | "/chats"
        | "/documents"
        | "/data-sources"
        | "/migration"
        | "/automations"
        | "/agents"
        | "/users"
        | "/permissions"
        | "/billing"
        | "/settings"
        | "/onboarding"
        | "/profile"
        | "/preferences"
        | "/help";
    }
  | { to: "/claims/$claimId"; params: { claimId: string } }
  | { to: "/underwriting/$submissionId"; params: { submissionId: string } }
  | { to: "/policy/$policyId"; params: { policyId: string } };

export type SearchEntry = {
  title: string;
  kind: "Page" | "Claim" | "Submission" | "Policy" | "Document" | "Report";
  detail: string;
  link: SearchLink;
};

const pages: SearchEntry[] = [
  { title: "Home", kind: "Page", detail: "Your queue, recent files and activity", link: { to: "/" } },
  { title: "Claims", kind: "Page", detail: "Claims queue and claim files", link: { to: "/claims" } },
  { title: "Underwriting", kind: "Page", detail: "Submission queue and submission files", link: { to: "/underwriting" } },
  { title: "Policy", kind: "Page", detail: "Policy portfolio and policy files", link: { to: "/policy" } },
  { title: "Pricing & Actuarial", kind: "Page", detail: "Pricing analysis, rate reviews, models and scenarios", link: { to: "/pricing" } },
  { title: "Finance", kind: "Page", detail: "Premium, claims payments, commissions, reinsurance and close", link: { to: "/finance" } },
  { title: "Reports", kind: "Page", detail: "KPIs, report library, builder and schedules", link: { to: "/reports" } },
  { title: "Chats", kind: "Page", detail: "Conversations with Alfie", link: { to: "/chats" } },
  { title: "Documents", kind: "Page", detail: "The governed document library", link: { to: "/documents" } },
  { title: "Data Sources", kind: "Page", detail: "Connected systems, sync health and access levels", link: { to: "/data-sources" } },
  { title: "Migration", kind: "Page", detail: "Move data and workload onto Alfie from a previous platform", link: { to: "/migration" } },
  { title: "Automations", kind: "Page", detail: "Automation runs, approvals and schedules", link: { to: "/automations" } },
  { title: "Agents", kind: "Page", detail: "Alfie agents, builder and tests", link: { to: "/agents" } },
  { title: "Users & Access", kind: "Page", detail: "People, roles and access reviews", link: { to: "/users" } },
  { title: "Policies & Permissions", kind: "Page", detail: "Permission matrix, thresholds and separation of duties", link: { to: "/permissions" } },
  { title: "Billing", kind: "Page", detail: "Plan, module seats, usage, payment method and invoices", link: { to: "/billing" } },
  { title: "Settings", kind: "Page", detail: "Organization configuration, retention and audit log", link: { to: "/settings" } },
  { title: "Onboarding", kind: "Page", detail: "Setup checklist and go-live plan for this workspace", link: { to: "/onboarding" } },
  { title: "Profile", kind: "Page", detail: "Your details, security and recent activity", link: { to: "/profile" } },
  { title: "Preferences", kind: "Page", detail: "Appearance, notifications and workspace defaults", link: { to: "/preferences" } },
  { title: "Help", kind: "Page", detail: "Guides, support and system status", link: { to: "/help" } },
];

export const searchIndex: SearchEntry[] = [
  ...pages,
  ...claims.map((c) => ({
    title: `${c.id} · ${c.claimant}`,
    kind: "Claim" as const,
    detail: `${c.type} · ${c.status} · ${c.location}`,
    link: { to: "/claims/$claimId" as const, params: { claimId: c.id } },
  })),
  ...submissions.map((s) => ({
    title: `${s.id} · ${s.insured}`,
    kind: "Submission" as const,
    detail: `${s.line} · ${s.status} · Broker ${s.broker}`,
    link: { to: "/underwriting/$submissionId" as const, params: { submissionId: s.id } },
  })),
  ...policies.map((p) => ({
    title: `${p.id} · ${p.holder}`,
    kind: "Policy" as const,
    detail: `${p.line} · ${p.status}`,
    link: { to: "/policy/$policyId" as const, params: { policyId: p.id } },
  })),
  ...orgDocuments.map((d) => ({
    title: d.name,
    kind: "Document" as const,
    detail: `${d.id} · ${d.category} · ${d.department}`,
    link: { to: "/documents" as const },
  })),
  ...reportLibrary.map((r) => ({
    title: r.name,
    kind: "Report" as const,
    detail: `${r.id} · ${r.category} · ${r.period}`,
    link: { to: "/reports" as const },
  })),
];

export function searchEntries(query: string, limit = 8): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return searchIndex
    .filter((e) => {
      const hay = `${e.title} ${e.kind} ${e.detail}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    })
    .slice(0, limit);
}
