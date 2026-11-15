import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  MailPlus,
  Search,
  ShieldCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import {
  accessReviews,
  departments,
  orgGroups,
  orgUsers,
  roleTemplates,
  type OrgUser,
} from "@/lib/admin-data";

export const Route = createFileRoute("/users")({ component: UsersPage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring";
const offboardingSteps = [
  "Suspend or deactivate the account",
  "Revoke active sessions",
  "Revoke authentication tokens and credentials",
  "Remove access to connected organizational resources",
  "Reassign outstanding tasks and approvals",
  "Reassign ownership of automations and documents",
  "Preserve historical activity and audit records",
];

function UsersPage() {
  const [users, setUsers] = useState<OrgUser[]>(orgUsers);
  const [selectedId, setSelectedId] = useState(orgUsers[0]!.id);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All departments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteDept, setInviteDept] = useState("Claims");
  const [inviteRole, setInviteRole] = useState("Claims Adjuster");
  const [inviteExpiry, setInviteExpiry] = useState("7 days");
  const [offboardTarget, setOffboardTarget] = useState<OrgUser | null>(null);
  const [offboardDone, setOffboardDone] = useState<number[]>([]);
  const [actionNote, setActionNote] = useState<string | null>(null);

  const selected = users.find((u) => u.id === selectedId) ?? users[0]!;
  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (department !== "All departments" && u.department !== department) return false;
        if (statusFilter !== "All statuses" && u.status !== statusFilter) return false;
        if (
          search &&
          !`${u.name} ${u.email} ${u.title} ${u.roles.join(" ")}`
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [users, department, statusFilter, search],
  );

  function setStatus(user: OrgUser, status: OrgUser["status"], note: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, status, sessions: status === "Active" ? u.sessions : 0 } : u,
      ),
    );
    setActionNote(
      `${user.name}: ${note} The change is recorded in the audit history and applies to active sessions immediately.`,
    );
  }

  function sendInvite() {
    if (!inviteName.trim()) return;
    const user: OrgUser = {
      id: `USR-${100 + users.length}`,
      name: inviteName.trim(),
      email: inviteEmail.trim() || "pending@northstarmutual.com",
      employeeId: "Assigned on activation",
      title: inviteRole,
      department: inviteDept,
      roles: [inviteRole],
      manager: "Jane Doe",
      status: "Invited",
      invitation: `Sent today, expires in ${inviteExpiry}`,
      added: "Today",
      lastLogin: "Never",
      auth: "Not activated",
      sessions: 0,
    };
    setUsers((prev) => [user, ...prev]);
    setSelectedId(user.id);
    setInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setActionNote(
      `Invitation sent to ${user.name}. The account activates only after they complete the organization's SSO and MFA requirements. Invitations can be resent or revoked while pending.`,
    );
  }

  function finishOffboarding() {
    if (!offboardTarget) return;
    setStatus(
      offboardTarget,
      "Deactivated",
      "offboarding completed. Access removed, work reassigned, and historical activity preserved.",
    );
    setOffboardTarget(null);
    setOffboardDone([]);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <PageHeader title="Users & Access" description="The people who can access this organization, their departments, roles and account status. Department membership alone never grants unrestricted access to a department's records: data level permissions in Policies & Permissions apply on top of every role." actions={<>
          <Button onClick={() => setInviteOpen(true)}>
            <MailPlus className="size-4" /> Invite employee
          </Button>
        </>} />

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total users", String(users.length * 9), "Across 8 departments, sample directory"],
            [
              "Active",
              String(users.filter((u) => u.status === "Active").length * 9),
              "Signed in within the last 30 days: most",
            ],
            [
              "Invited, pending",
              String(users.filter((u) => u.status === "Invited").length),
              "Invitations expire and can be revoked",
            ],
            [
              "Suspended or deactivated",
              String(
                users.filter((u) => u.status === "Suspended" || u.status === "Deactivated").length,
              ),
              "History preserved for both",
            ],
          ].map(([label, value, note]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
            </div>
          ))}
        </section>

        {actionNote ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-positive/30 bg-positive/5 px-4 py-3 text-sm leading-6">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" /> {actionNote}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className={card}>
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-44 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, title, role"
                  className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-ring"
                />
              </div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {["All departments", ...departments].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
              >
                {["All statuses", "Active", "Invited", "Suspended", "Deactivated"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">User</th>
                    <th className="py-2 pr-3 font-medium">Department</th>
                    <th className="py-2 pr-3 font-medium">Role</th>
                    <th className="py-2 pr-3 font-medium">Last login</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedId(u.id)}
                      className={`cursor-pointer border-b border-border/60 last:border-0 hover:bg-secondary/40 ${u.id === selected.id ? "bg-primary/5" : ""}`}
                    >
                      <td className="py-2.5 pr-3">
                        <span className="block font-medium">{u.name}</span>
                        <span className="text-muted-foreground">
                          {u.email} · {u.title}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{u.department}</td>
                      <td className="py-2.5 pr-3">{u.roles.join(", ")}</td>
                      <td className="py-2.5 pr-3">{u.lastLogin}</td>
                      <td className="py-2.5">
                        <WorkspaceStatusBadge status={u.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  No users match these filters.
                </p>
              ) : null}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <Users className="size-4" /> Teams and groups
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Groups are used for permissions, notifications, approvals and workflow assignments.
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {orgGroups.map((g) => (
                  <div key={g.name} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                    <p className="font-semibold">
                      {g.name}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {g.members} members
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Manager: {g.manager} · Used for: {g.usedFor}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <ClipboardCheck className="size-4" /> Access reviews
              </h3>
              <div className="mt-3 space-y-2">
                {accessReviews.map((r) => (
                  <div
                    key={r.name}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-border p-3"
                  >
                    <div className="text-xs leading-5">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-muted-foreground">
                        {r.scope} · Owner {r.owner} · Due {r.due} · {r.progress}
                      </p>
                    </div>
                    <WorkspaceStatusBadge status={r.status} />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                Reviews flag inactive accounts, privileged access, recently changed roles and direct
                permission assignments. Reviewers confirm or revoke access, and the outcome is
                recorded.
              </p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className={card}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">{selected.name}</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {selected.id} · Employee {selected.employeeId}
                  </p>
                </div>
                <WorkspaceStatusBadge status={selected.status} />
              </div>
              <dl className="mt-3 space-y-1.5 text-xs">
                {[
                  ["Title", selected.title],
                  ["Department", selected.department],
                  ["Manager", selected.manager],
                  ["Email", selected.email],
                  ["Roles", selected.roles.join(", ")],
                  ["Invitation", selected.invitation],
                  ["Added", selected.added],
                  ["Authentication", selected.auth],
                  ["Active sessions", String(selected.sessions)],
                  ["Last login", selected.lastLogin],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 rounded-xl bg-secondary/50 p-3 text-[11px] leading-4 text-muted-foreground">
                Permissions shown here are inherited from roles and groups. Direct permission
                assignments, where permitted, are listed separately in Policies &amp; Permissions
                and are always included in access reviews.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selected.status === "Active" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setStatus(
                        selected,
                        "Suspended",
                        "account suspended and active sessions revoked.",
                      )
                    }
                  >
                    Suspend
                  </Button>
                ) : null}
                {selected.status === "Suspended" ? (
                  <Button
                    size="sm"
                    onClick={() => setStatus(selected, "Active", "account reinstated.")}
                  >
                    Reinstate
                  </Button>
                ) : null}
                {selected.status === "Invited" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setActionNote(
                          `Invitation resent to ${selected.name}. The previous link no longer works.`,
                        )
                      }
                    >
                      Resend invitation
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setStatus(selected, "Deactivated", "pending invitation revoked.")
                      }
                    >
                      Revoke invitation
                    </Button>
                  </>
                ) : null}
                {selected.status !== "Deactivated" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setActionNote(
                        `${selected.name}: credential reset started through the approved SSO process. No password is ever shown to an administrator.`,
                      )
                    }
                  >
                    <KeyRound className="size-3.5" /> Reset credentials
                  </Button>
                ) : null}
                {selected.sessions > 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setUsers((prev) =>
                        prev.map((u) => (u.id === selected.id ? { ...u, sessions: 0 } : u)),
                      );
                      setActionNote(
                        `${selected.name}: all active sessions revoked and reauthentication required.`,
                      );
                    }}
                  >
                    Revoke sessions
                  </Button>
                ) : null}
                {selected.status === "Active" || selected.status === "Suspended" ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setOffboardTarget(selected);
                      setOffboardDone([]);
                    }}
                  >
                    <UserMinus className="size-3.5" /> Start offboarding
                  </Button>
                ) : null}
              </div>
              {selected.status === "Deactivated" ? (
                <p className="mt-3 text-[11px] leading-4 text-muted-foreground">
                  This account is deactivated. Its historical actions, approvals and audit records
                  are preserved and remain attributable to {selected.name}.
                </p>
              ) : null}
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4" /> Authentication policy in force
              </h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                <li>
                  Single sign-on required for all employees, MFA enforced, hardware keys for
                  security administrators.
                </li>
                <li>
                  Sessions expire after 12 hours. Administrators can revoke sessions and require
                  reauthentication at any time.
                </li>
                <li>
                  Failed logins are monitored: 3 failed attempts on Oct 28 were flagged and reviewed
                  the same day.
                </li>
                <li>Full requirements are configured in Settings, Security.</li>
              </ul>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">Role templates</h2>
              <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                Starting templates. Administrators can create and customize roles in Policies &amp;
                Permissions. Users may hold more than one role where policy permits.
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {roleTemplates.map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite an employee</DialogTitle>
            <DialogDescription>
              Individual or batch invites follow the same flow: details, department, role, manager,
              initial access, then the invitation. The account activates only after the employee
              completes SSO and MFA setup.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium">
              Full name
              <input
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className={`${inputCls} mt-1`}
                placeholder="e.g. Alicia Gomez"
              />
            </label>
            <label className="block text-xs font-medium">
              Work email
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`${inputCls} mt-1`}
                placeholder="name@northstarmutual.com"
              />
            </label>
            <label className="block text-xs font-medium">
              Department
              <select
                value={inviteDept}
                onChange={(e) => setInviteDept(e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium">
              Role
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {roleTemplates.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium">
              Manager
              <select className={`${inputCls} mt-1`} defaultValue="Jane Doe">
                <option>Jane Doe</option>
                <option>Sarah Chen</option>
                <option>Marcus Lee</option>
                <option>Sofia Martin</option>
              </select>
            </label>
            <label className="block text-xs font-medium">
              Invitation expires after
              <select
                value={inviteExpiry}
                onChange={(e) => setInviteExpiry(e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {["3 days", "7 days", "14 days"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={sendInvite}>Send invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!offboardTarget} onOpenChange={(o) => !o && setOffboardTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offboard {offboardTarget?.name}</DialogTitle>
            <DialogDescription>
              Work through each step. Deactivation never deletes the employee's historical actions
              or records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {offboardingSteps.map((s, i) => (
              <label
                key={s}
                className="flex items-center gap-2.5 rounded-lg bg-secondary/50 px-3 py-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={offboardDone.includes(i)}
                  onChange={(e) =>
                    setOffboardDone((prev) =>
                      e.target.checked ? [...prev, i] : prev.filter((x) => x !== i),
                    )
                  }
                  className="size-4 accent-primary"
                />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOffboardTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={offboardDone.length < offboardingSteps.length}
              onClick={finishOffboarding}
            >
              Complete offboarding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
