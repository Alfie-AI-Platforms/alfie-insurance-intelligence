import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  Database,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import { agents } from "@/lib/agents-data";
import { auditEvents, platformServices, retentionPolicies } from "@/lib/admin-data";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring";

function Toggle({
  label,
  note,
  on,
  onClick,
}: {
  label: string;
  note?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-left text-xs"
    >
      <span>
        <span className="block font-medium">{label}</span>
        {note ? <span className="block text-[11px] text-muted-foreground">{note}</span> : null}
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full ${on ? "bg-primary" : "bg-border"}`}>
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

const notificationEvents = [
  "Pending approvals",
  "Failed automations",
  "Data source connection failures",
  "Security events",
  "Access changes",
  "Scheduled reports",
  "Document approval requests",
  "Operational escalations",
];

function SettingsPage() {
  const [savedNote, setSavedNote] = useState<string | null>(null);
  type ToggleKey = "mfa" | "sso" | "externalRetrieval" | "ipRestrictions";
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    mfa: true,
    sso: true,
    externalRetrieval: false,
    ipRestrictions: false,
  });
  const [agentEnabled, setAgentEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(agents.map((a) => [a.id, a.status === "Active"])),
  );
  const [notify, setNotify] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(notificationEvents.map((e) => [e, true])),
  );
  const [auditType, setAuditType] = useState("All types");
  const [instructions, setInstructions] = useState(
    "Use Northstar Mutual terminology. Refer to customers as policyholders. Escalate any claim unassigned for more than 2 business days to the Claims Manager. Never present sample or stale data as current: name the source and its sync time.",
  );

  const auditFiltered = useMemo(
    () => auditEvents.filter((e) => auditType === "All types" || e.type === auditType),
    [auditType],
  );
  const toggle = (k: ToggleKey) => setToggles((p) => ({ ...p, [k]: !p[k] }));
  const save = (what: string) =>
    setSavedNote(
      `${what} saved. The change applies across the organization and is recorded in the audit history with its previous value.`,
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Organization wide configuration for Alfie Insurance. Membership lives in Users &amp;
            Access and authorization lives in Policies &amp; Permissions. Settings holds the
            operating configuration both of them rely on, and only authorized administrators see
            this module.
          </p>
        </div>

        {savedNote ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-positive/30 bg-positive/5 px-4 py-3 text-sm leading-6">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" /> {savedNote}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Building2 className="size-4" /> Organization profile
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] text-muted-foreground">
                Organization name
                <input className={`${inputCls} mt-1`} defaultValue="Northstar Mutual" />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Legal entity name
                <input
                  className={`${inputCls} mt-1`}
                  defaultValue="Northstar Mutual Insurance Company"
                />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Organization identifier
                <input className={`${inputCls} mt-1`} defaultValue="NM-ORG-2026-001" />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Industry
                <input className={`${inputCls} mt-1`} defaultValue="Insurance" />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Primary address
                <input className={`${inputCls} mt-1`} defaultValue="200 Bay Street, Toronto, ON" />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Country
                <select className={`${inputCls} mt-1`} defaultValue="Canada">
                  <option>Canada</option>
                  <option>United States</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Business contact email
                <input
                  className={`${inputCls} mt-1`}
                  defaultValue="operations@northstarmutual.com"
                />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Business contact phone
                <input className={`${inputCls} mt-1`} defaultValue="+1 416 555 0100" />
              </label>
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              These details are used consistently across modules, documents, reports and generated
              communications. Brand assets and the organization logo are managed with the profile.
            </p>
            <Button className="mt-3" size="sm" onClick={() => save("Organization profile")}>
              Save profile
            </Button>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="size-4" /> General preferences
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] text-muted-foreground">
                Default language
                <select className={`${inputCls} mt-1`} defaultValue="English">
                  <option>English</option>
                  <option>French</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Time zone
                <select className={`${inputCls} mt-1`} defaultValue="America/Toronto (ET)">
                  <option>America/Toronto (ET)</option>
                  <option>America/Vancouver (PT)</option>
                  <option>UTC</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Date format
                <select className={`${inputCls} mt-1`} defaultValue="MMM DD, YYYY">
                  <option>MMM DD, YYYY</option>
                  <option>YYYY-MM-DD</option>
                  <option>DD/MM/YYYY</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Default currency
                <select className={`${inputCls} mt-1`} defaultValue="USD">
                  <option>USD</option>
                  <option>CAD</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Number formatting
                <select className={`${inputCls} mt-1`} defaultValue="1,234.56">
                  <option>1,234.56</option>
                  <option>1 234,56</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Measurement units
                <select className={`${inputCls} mt-1`} defaultValue="Metric">
                  <option>Metric</option>
                  <option>Imperial</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Business days
                <input className={`${inputCls} mt-1`} defaultValue="Monday to Friday" />
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Business hours
                <input className={`${inputCls} mt-1`} defaultValue="8:00 AM to 6:00 PM ET" />
              </label>
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              These are organization defaults. Where a preference is personal, such as a user's own
              date format, the personal setting overrides the default for that user only.
            </p>
            <Button className="mt-3" size="sm" onClick={() => save("General preferences")}>
              Save preferences
            </Button>
          </section>
        </div>

        <section className={`${card} mt-4`}>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="size-4 text-primary" /> Alfie configuration
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Organizational instructions for Alfie. These shape how Alfie works for Northstar Mutual
            without changing the platform's foundational behavior. Changes are versioned and
            auditable. Current version: 7 (updated Oct 15 by Jane Doe).
          </p>
          <label className="mt-3 block text-[11px] text-muted-foreground">
            Organization instructions
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs leading-5 outline-none focus:border-ring"
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
              <p className="font-semibold">Approved terminology</p>
              <p className="mt-1 text-muted-foreground">
                Policyholder (not customer) · Submission (not application, for commercial lines) ·
                Settlement (not payout)
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
              <p className="font-semibold">Escalation rules</p>
              <p className="mt-1 text-muted-foreground">
                Unassigned claim over 2 business days → Claims Manager. Reserve movement over
                $50,000 → Claims Manager. Failed automation → owner, then administrator.
              </p>
            </div>
            <div className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
              <p className="font-semibold">Defaults and knowledge</p>
              <p className="mt-1 text-muted-foreground">
                Default reporting period: monthly, calendar. Approved knowledge sources: Documents
                repository and SharePoint published procedures.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={() => save("Alfie configuration, as version 8")}>
              Save as new version
            </Button>
            <Toggle
              label="External information retrieval"
              note="When off, Alfie answers from internal sources and general knowledge only, and says which it used."
              on={!!toggles.externalRetrieval}
              onClick={() => toggle("externalRetrieval")}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Version history: v7 Oct 15, escalation wording · v6 Sep 28, terminology · v5 Aug 19,
            reporting defaults. Previous versions can be reviewed and restored by administrators.
          </p>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={card}>
            <h2 className="text-sm font-semibold">AI governance and usage</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Which agents are enabled for the organization. Department level availability and data
              source access are governed in Policies &amp; Permissions and Data Sources.
            </p>
            <div className="mt-3 space-y-1.5">
              {agents.map((a) => (
                <Toggle
                  key={a.id}
                  label={a.name}
                  note={`${a.department} · Status in Agents: ${a.status}`}
                  on={!!agentEnabled[a.id]}
                  onClick={() => setAgentEnabled((p) => ({ ...p, [a.id]: !p[a.id] }))}
                />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["Conversations, 30 days", "1,942"],
                ["Agent runs, 30 days", "6,318"],
                ["Actions approved by humans", "412"],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-secondary/50 p-2.5">
                  <p className="text-sm font-semibold">{v}</p>
                  <p className="text-[10px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              Usage and execution history are visible to administrators in aggregate. Private
              employee conversation content is not exposed to administrators without an
              organizational policy and an authorized purpose.
            </p>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4" /> Notifications
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Organization default channels: in app and email. Individuals may adjust personal
              preferences within what the organization permits.
            </p>
            <div className="mt-3 space-y-1.5">
              {notificationEvents.map((e) => (
                <Toggle
                  key={e}
                  label={e}
                  on={!!notify[e]}
                  onClick={() => setNotify((p) => ({ ...p, [e]: !p[e] }))}
                />
              ))}
            </div>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              onClick={() => save("Notification defaults")}
            >
              Save notification defaults
            </Button>
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4" /> Security configuration
            </h2>
            <div className="mt-3 space-y-1.5">
              <Toggle
                label="Multi factor authentication required"
                note="All employees, no exceptions for administrators"
                on={!!toggles.mfa}
                onClick={() => toggle("mfa")}
              />
              <Toggle
                label="Single sign on required"
                note="Provider: organization identity provider, SAML"
                on={!!toggles.sso}
                onClick={() => toggle("sso")}
              />
              <Toggle
                label="IP restrictions"
                note="Not currently enabled. When on, access is limited to trusted networks."
                on={!!toggles.ipRestrictions}
                onClick={() => toggle("ipRestrictions")}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-[11px] text-muted-foreground">
                Session expiration
                <select className={`${inputCls} mt-1`} defaultValue="12 hours">
                  <option>8 hours</option>
                  <option>12 hours</option>
                  <option>24 hours</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Account lockout after
                <select className={`${inputCls} mt-1`} defaultValue="5 failed attempts">
                  <option>3 failed attempts</option>
                  <option>5 failed attempts</option>
                  <option>10 failed attempts</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Password policy (where passwords are enabled)
                <select
                  className={`${inputCls} mt-1`}
                  defaultValue="14+ characters, breached password check"
                >
                  <option>14+ characters, breached password check</option>
                  <option>12+ characters</option>
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Trusted domains
                <input className={`${inputCls} mt-1`} defaultValue="northstarmutual.com" />
              </label>
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              Security alerts go to the Compliance and Risk group. Every change here is written to
              the audit history with its previous value.
            </p>
            <Button className="mt-3" size="sm" onClick={() => save("Security configuration")}>
              Save security settings
            </Button>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Database className="size-4" /> Platform services and retention
            </h2>
            <ul className="space-y-2 text-xs leading-5">
              {[
                ["Email delivery service", "Connected, verified domain"],
                ["Authentication provider and SSO", "Connected, SAML"],
                ["Notification service", "Connected, in app and email"],
                ["Webhooks", "2 endpoints configured, signing secrets rotated Sep 2026"],
                ["Organization API", "Enabled for administrators, credentials managed as secrets"],
              ].map(([n, s]) => (
                <li
                  key={n}
                  className="flex items-center justify-between gap-2 rounded-xl bg-secondary/50 px-3 py-2"
                >
                  <span className="font-medium">{n}</span>
                  <span className="text-muted-foreground">{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Business data integrations, such as the policy or claims systems, are managed in{" "}
              <Link to="/data-sources" className="font-medium text-primary underline">
                Data Sources
              </Link>
              , not here. Settings holds the platform level services that support them.
            </p>
            <h3 className="mt-4 text-xs font-semibold">Retention policies</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-1.5 pr-3 font-medium">Data</th>
                    <th className="py-1.5 pr-3 font-medium">Retention</th>
                    <th className="py-1.5 font-medium">Legal hold</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionPolicies.map((r) => (
                    <tr key={r.data} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-medium">{r.data}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{r.retention}</td>
                      <td className="py-2">{r.hold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Retention accounts for regulatory, legal and contractual obligations. Deletion happens
              only through approved workflows, and audit records are never deletable by
              administrators.
            </p>
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ScrollText className="size-4" /> Audit logs
              </h2>
              <select
                value={auditType}
                onChange={(e) => setAuditType(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {["All types", ...Array.from(new Set(auditEvents.map((e) => e.type)))].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Event</th>
                    <th className="py-2 pr-3 font-medium">Actor</th>
                    <th className="py-2 pr-3 font-medium">Resource and change</th>
                    <th className="py-2 font-medium">Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {auditFiltered.map((e) => (
                    <tr
                      key={e.time + e.resource}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2.5 pr-3">
                        <span className="block font-medium">{e.type}</span>
                        <span className="text-muted-foreground">{e.time}</span>
                      </td>
                      <td className="py-2.5 pr-3">{e.actor}</td>
                      <td className="py-2.5 pr-3">
                        <span className="font-medium">{e.resource}</span>
                        <span className="block text-muted-foreground">{e.detail}</span>
                      </td>
                      <td className="py-2.5">{e.outcome}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              Audit records capture the event, identity, time, affected resource, previous and new
              values where applicable, and the outcome. They are protected from unauthorized
              modification or deletion.
            </p>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="size-4" /> Platform health
            </h2>
            <div className="mt-3 space-y-2">
              {platformServices.map((s) => (
                <div key={s.name} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold">{s.name}</p>
                    <WorkspaceStatusBadge status={s.status} />
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{s.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl bg-warning/10 p-3 text-[11px] leading-4">
              Open incident: Broker and Customer CRM synchronization has failed twice on a changed
              broker identifier format. Owner: Elena Brooks. Alfie marks CRM data as stale wherever
              it would be used.
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
