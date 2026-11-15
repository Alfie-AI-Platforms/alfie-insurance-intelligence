/**
 * Onboarding checklist for this workspace: what Northstar and the
 * Alfie implementation team set up between kickoff and go-live.
 * Sample progress, frontend only: checking an item here updates the
 * page state in the browser, nothing is provisioned behind it.
 */

export type OnboardingItem = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
  link?: {
    to: "/billing" | "/data-sources" | "/migration" | "/users" | "/permissions" | "/settings" | "/agents" | "/automations";
    label: string;
  };
};

export type OnboardingGroup = { title: string; items: OnboardingItem[] };

export const onboardingGroups: OnboardingGroup[] = [
  {
    title: "Workspace setup",
    items: [
      { id: "ob-1", label: "Organization profile confirmed", detail: "Northstar Mutual Insurance Company, Toronto. Legal name and workspace name verified.", done: true },
      { id: "ob-2", label: "Workspace name and branding set", detail: "The sidebar carries Northstar's name. Alfie's gradient stays on Alfie surfaces only.", done: true },
      { id: "ob-3", label: "Plan and billing confirmed", detail: "Alfie Platform annual plan, module seats and payment method are in place.", done: true, link: { to: "/billing", label: "Open Billing" } },
    ],
  },
  {
    title: "Data and migration",
    items: [
      { id: "ob-4", label: "Data sources connected", detail: "7 of 10 sources are healthy. The CRM sync is degraded and the weather provider needs reauthentication.", done: false, link: { to: "/data-sources", label: "Open Data Sources" } },
      { id: "ob-5", label: "Document library migrated", detail: "412,208 documents moved from SharePoint, validated and searchable.", done: true, link: { to: "/migration", label: "Open Migration" } },
      { id: "ob-6", label: "Policy history in validation", detail: "Full load complete. 214 format exceptions are with the Policy team for review.", done: false, link: { to: "/migration", label: "Open Migration" } },
      { id: "ob-7", label: "Claims archive trial load", detail: "Trial batch reconciles on counts. A $1,240 reserve difference on 3 claims is under review.", done: false, link: { to: "/migration", label: "Open Migration" } },
    ],
  },
  {
    title: "People and access",
    items: [
      { id: "ob-8", label: "Team invited", detail: "108 users across 9 departments, each with a role from the permission matrix.", done: true, link: { to: "/users", label: "Open Users & Access" } },
      { id: "ob-9", label: "Roles and permissions reviewed", detail: "The 13 module by 7 action matrix was reviewed with department heads. Separation of duties warnings are acknowledged.", done: true, link: { to: "/permissions", label: "Open Permissions" } },
      { id: "ob-10", label: "First access review scheduled", detail: "Quarterly access review to be scheduled before go-live, owned by the Organization Administrator.", done: false, link: { to: "/users", label: "Open Users & Access" } },
    ],
  },
  {
    title: "Alfie configuration",
    items: [
      { id: "ob-11", label: "Alfie instructions published", detail: "Organization instructions are at v7: tone, escalation and authority rules for every module.", done: true, link: { to: "/settings", label: "Open Settings" } },
      { id: "ob-12", label: "Agents enabled", detail: "Intake triage and documentation agents are live in Claims and Underwriting.", done: true, link: { to: "/agents", label: "Open Agents" } },
      { id: "ob-13", label: "Automations approved for production", detail: "Two automations still run in supervised mode and pause for human approval.", done: false, link: { to: "/automations", label: "Open Automations" } },
    ],
  },
  {
    title: "Go-live",
    items: [
      { id: "ob-14", label: "Pilot group live in Claims", detail: "12 adjusters have worked live claim files in Alfie since Oct 27, 2026.", done: true },
      { id: "ob-15", label: "Training sessions for all teams", detail: "Claims and Underwriting are done. Policy, Pricing and Finance sessions run in December.", done: false },
      { id: "ob-16", label: "Go-live sign-off", detail: "Sign-off by the Organization Administrator once migration cutover and training are complete.", done: false },
    ],
  },
];

export const onboardingTimeline: { date: string; label: string; state: "Complete" | "In progress" | "Scheduled" }[] = [
  { date: "Oct 6, 2026", label: "Kickoff with the Alfie implementation team", state: "Complete" },
  { date: "Oct 20, 2026", label: "Data sources connected and syncing", state: "Complete" },
  { date: "Oct 27, 2026", label: "Pilot group live in Claims", state: "Complete" },
  { date: "Dec 8, 2026", label: "Policy history cutover", state: "Scheduled" },
  { date: "Dec 15, 2026", label: "Go-live sign-off", state: "Scheduled" },
  { date: "Jan 20, 2027", label: "Claims archive cutover", state: "Scheduled" },
];

export const implementationTeam: { name: string; role: string; note: string }[] = [
  { name: "Alfie implementation team", role: "Onboarding and migration", note: "Runs the migration process with Northstar IT and reviews exceptions weekly." },
  { name: "Jane Doe", role: "Northstar sponsor", note: "Organization Administrator. Owns sign-off for access, billing and go-live." },
  { name: "Northstar IT, data team", role: "Source systems", note: "Owns the legacy PAS, claims system and SharePoint extracts." },
];
