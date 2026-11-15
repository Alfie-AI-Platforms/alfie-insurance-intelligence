import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Copy,
  Scale,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import {
  agentProfiles,
  approvalAuthorities,
  baselineAccess,
  delegations,
  orgUsers,
  permissionActions,
  platformModules,
  roleTemplates,
  sodRules,
} from "@/lib/admin-data";

export const Route = createFileRoute("/permissions")({ component: PermissionsPage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring";
const selectCls =
  "select-chevron h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring";

function PermissionsPage() {
  const [role, setRole] = useState("Claims Manager");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [roles, setRoles] = useState(roleTemplates);
  const [newRole, setNewRole] = useState("");
  const [roleNote, setRoleNote] = useState<string | null>(null);
  // Permission tester
  const [testUser, setTestUser] = useState(orgUsers[1]!.name);
  const [testModule, setTestModule] = useState("Claims");
  const [testAction, setTestAction] = useState("Approve");
  const [testResult, setTestResult] = useState<string | null>(null);

  const assignedCount = useMemo(
    () =>
      orgUsers.filter((u) => u.roles.some((r) => role.startsWith(r) || r.startsWith(role))).length,
    [role],
  );

  function access(module: string, action: string) {
    const key = `${role}|${module}|${action}`;
    return overrides[key] ?? baselineAccess(role, module, action);
  }

  function toggleAccess(module: string, action: string) {
    const key = `${role}|${module}|${action}`;
    setOverrides((prev) => ({
      ...prev,
      [key]: !(prev[key] ?? baselineAccess(role, module, action)),
    }));
    setRoleNote(
      `Change staged for the ${role} role. Because this role is assigned to ${assignedCount || "several"} employees, changes are reviewed before they take effect, and the review is recorded.`,
    );
  }

  const financeConflict = access("Finance", "Create") && access("Finance", "Approve");

  function runTest() {
    const user = orgUsers.find((u) => u.name === testUser);
    if (!user) return;
    if (user.status !== "Active") {
      setTestResult(
        `${user.name} is ${user.status.toLowerCase()}, so all access is currently denied regardless of role.`,
      );
      return;
    }
    const allowed = user.roles.some((r) =>
      baselineAccess(r.replace(" (group)", ""), testModule, testAction),
    );
    setTestResult(
      allowed
        ? `Allowed. ${user.name} can ${testAction.toLowerCase()} in ${testModule} through the ${user.roles.join(", ")} role${user.roles.length > 1 ? "s" : ""}. Data level restrictions still apply: assigned records and classification limits are checked at access time.`
        : `Denied. None of ${user.name}'s roles (${user.roles.join(", ")}) grant ${testAction.toLowerCase()} in ${testModule}. This check, including the denial, is written to the permission audit history.`,
    );
  }

  function addRole(duplicate = false) {
    const name = duplicate ? `${role} (copy)` : newRole.trim();
    if (!name) return;
    setRoles((prev) => [name, ...prev]);
    setRole(name);
    setNewRole("");
    setRoleNote(
      `Role "${name}" created as a draft${duplicate ? `, duplicated from ${role}` : ""}. Configure its module access, data restrictions and approval authority, then submit it for review before assigning it.`,
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
<PageHeader title="Policies & Permissions" description="The authorization framework for people, specialist agents, automations and integrations. This is not the Policy module: Policy manages insurance contracts, Policies & Permissions manages who and what may access, change, approve and execute across the platform." />

        <section className={`${card} mt-5`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Module permissions by role</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Viewing is always separate from creating, editing, approving and executing. Toggle a
                cell to stage a change for the selected role.
              </p>
            </div>
            <label className="block text-[11px] text-muted-foreground">
              Role
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setRoleNote(null);
                }}
                className="select-chevron mt-1 h-9 rounded-lg border border-border bg-background pl-2.5 text-xs outline-none focus:border-ring"
              >
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>
          {financeConflict && role.toLowerCase().includes("finance") ? (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-warning/10 px-3 py-2.5 text-xs leading-5">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-foreground" />{" "}
              Segregation of duties warning: this role can both create and approve in Finance. The
              enforced rule "payment creator cannot approve the same payment" will still block the
              same person from doing both on one payment, but the combination itself is flagged for
              the Q4 access review.
            </p>
          ) : null}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Module</th>
                  {permissionActions.map((a) => (
                    <th key={a} className="py-2 pr-2 text-center font-medium">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platformModules.map((m) => (
                  <tr key={m} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{m}</td>
                    {permissionActions.map((a) => {
                      const on = access(m, a);
                      return (
                        <td key={a} className="py-2 pr-2 text-center">
                          <button
                            type="button"
                            aria-label={`${a} in ${m}`}
                            onClick={() => toggleAccess(m, a)}
                            className={`inline-flex size-5 items-center justify-center rounded-md border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-transparent hover:border-ring"}`}
                          >
                            <CheckCircle2 className="size-3.5" />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roleNote ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">{roleNote}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4">
            <label className="block min-w-52 flex-1 text-[11px] text-muted-foreground">
              New custom role name
              <input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Senior Claims Adjuster"
                className={`${inputCls} mt-1`}
              />
            </label>
            <Button variant="outline" onClick={() => addRole(false)}>
              Create custom role
            </Button>
            <Button variant="outline" onClick={() => addRole(true)}>
              <Copy className="size-3.5" /> Duplicate {role}
            </Button>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
            A role also carries data access, restrictions and approval authority, configured below.
            Department assignment alone does not define what a role can see.
          </p>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={card}>
            <h2 className="text-sm font-semibold">Data level permissions</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Module access is only the first check. Records are further restricted by department,
              team, business line, region, assignment, ownership and classification. Examples in
              force today:
            </p>
            <ul className="mt-2.5 space-y-2 text-xs leading-5">
              <li className="rounded-xl bg-secondary/50 p-3">
                A claims adjuster views and updates{" "}
                <span className="font-medium">assigned claims</span>, not every claim in the
                organization.
              </li>
              <li className="rounded-xl bg-secondary/50 p-3">
                A finance analyst accesses financial records but not{" "}
                <span className="font-medium">restricted employee information</span>.
              </li>
              <li className="rounded-xl bg-secondary/50 p-3">
                An underwriter accesses assigned submissions, not{" "}
                <span className="font-medium">confidential financial records</span>.
              </li>
              <li className="rounded-xl bg-secondary/50 p-3">
                Executives see consolidated reports without automatically gaining permission to{" "}
                <span className="font-medium">modify operational records</span>.
              </li>
              <li className="rounded-xl bg-secondary/50 p-3">
                Where a connected system enforces its own permissions, Alfie respects them rather
                than assuming broader access.
              </li>
            </ul>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <SearchCheck className="size-4" /> Permission tester
            </h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Evaluate the effective access of any user, combining roles, account status and direct
              assignments.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <label className="block text-[11px] text-muted-foreground">
                User
                <select
                  value={testUser}
                  onChange={(e) => setTestUser(e.target.value)}
                  className={`${selectCls} mt-1`}
                >
                  {orgUsers.map((u) => (
                    <option key={u.id}>{u.name}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Module
                <select
                  value={testModule}
                  onChange={(e) => setTestModule(e.target.value)}
                  className={`${selectCls} mt-1`}
                >
                  {platformModules.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[11px] text-muted-foreground">
                Action
                <select
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value)}
                  className={`${selectCls} mt-1`}
                >
                  {permissionActions.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
            </div>
            <Button className="mt-3" onClick={runTest}>
              Check effective access
            </Button>
            {testResult ? (
              <p className="mt-3 rounded-xl bg-secondary/50 p-3 text-xs leading-5">{testResult}</p>
            ) : null}
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs font-semibold">Recent access denials</p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-4 text-muted-foreground">
                <li>
                  Nov 04: Pricing Analysis Agent denied Weather and Catastrophe data, credential
                  expired at the source.
                </li>
                <li>
                  Nov 03: Finance Analyst role denied Execute on Data Sources, after the Nov 03
                  permission change.
                </li>
                <li>
                  Oct 30: A Chat request for a Restricted document was denied for a Read-Only user
                  and logged.
                </li>
              </ul>
            </div>
          </section>
        </div>

        <section className={`${card} mt-4`}>
          <h2 className="text-sm font-semibold">Approval authority and thresholds</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Action</th>
                  <th className="py-2 pr-3 font-medium">Thresholds and rules</th>
                  <th className="py-2 font-medium">Approval chain</th>
                </tr>
              </thead>
              <tbody>
                {approvalAuthorities.map((a) => (
                  <tr key={a.action} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{a.action}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{a.levels}</td>
                    <td className="py-2.5">{a.chain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="text-xs font-semibold">Delegations of approval authority</h3>
            <div className="mt-2 space-y-2">
              {delegations.map((d) => (
                <div
                  key={d.from}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-xl bg-secondary/50 p-3 text-xs leading-5"
                >
                  <p>
                    <span className="font-medium">{d.from}</span> → {d.to}
                    <br />
                    <span className="text-muted-foreground">
                      Scope: {d.scope} · {d.period}. A delegation can never exceed what the
                      delegating employee may delegate.
                    </span>
                  </p>
                  <WorkspaceStatusBadge status={d.status === "Active" ? "Active" : "Cancelled"} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Scale className="size-4" /> Segregation of duties
            </h2>
            <div className="mt-3 space-y-2">
              {sodRules.map((r) => (
                <div
                  key={r.rule}
                  className="flex items-start justify-between gap-2 rounded-xl border border-border p-3 text-xs leading-5"
                >
                  <p>
                    <span className="font-medium">{r.rule}</span>
                    <br />
                    <span className="text-muted-foreground">Applies to: {r.appliesTo}</span>
                  </p>
                  <WorkspaceStatusBadge
                    status={r.status.startsWith("Enforced") ? "Enforced" : "Needs Attention"}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-4 text-muted-foreground">
              Conflicting combinations are checked when roles or permissions are assigned, not
              discovered afterwards. The one warning level rule above is tracked in the Q4 access
              review.
            </p>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4" /> Automation permissions
            </h2>
            <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-muted-foreground">
              <li>
                Trigger, data retrieval, agent invocation, write and external communication
                permissions are configured separately for each automation.
              </li>
              <li>Execution limits and department restrictions apply per automation.</li>
              <li>
                A scheduled automation runs under its own approved service identity, never under its
                creator's personal privileges.
              </li>
              <li>
                Activation always requires an approver who is not the creator, for sensitive
                automations.
              </li>
            </ul>
            <h3 className="mt-4 text-xs font-semibold">Security and compliance policies</h3>
            <ul className="mt-1.5 space-y-1.5 text-xs leading-5 text-muted-foreground">
              <li>
                Authentication, session, export and external sharing rules are set in Settings and
                enforced here across every module.
              </li>
              <li>
                Every policy or permission change records who created, changed, approved or revoked
                it.
              </li>
            </ul>
          </section>
        </div>

        <section className={`${card} mt-4`}>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="size-4 text-primary" /> AI agent authorization profiles
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Each specialist agent has an explicit profile. Agents inherit the restrictions of the
            employee, automation or service context they operate under, and never gain broader
            access because Alfie coordinates the task.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-3">
            {agentProfiles.map((p) => (
              <article
                key={p.name}
                className="rounded-xl border border-border p-4 text-xs leading-5"
              >
                <h3 className="text-sm font-semibold">{p.name}</h3>
                <p className="mt-2 font-semibold text-positive">Can</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {p.can.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
                <p className="mt-2.5 font-semibold text-destructive">Cannot</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {p.cannot.map((c) => (
                    <li key={c}>· {c}</li>
                  ))}
                </ul>
                <p className="mt-2.5">
                  <span className="font-medium">Requires human approval:</span>{" "}
                  <span className="text-muted-foreground">{p.approval}</span>
                </p>
                <p className="mt-1">
                  <span className="font-medium">External communication:</span>{" "}
                  <span className="text-muted-foreground">{p.external}</span>
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
