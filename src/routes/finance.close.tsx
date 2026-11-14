import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { closeTasks, type CloseTask } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/close")({
  head: () => ({
    meta: [
      { title: "Financial Close | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Manage month end, quarter end and year end financial close, with checklist, approvals and reconciliation status.",
      },
      { property: "og:title", content: "Financial Close | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ClosePage,
});

function ClosePage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<CloseTask[]>(closeTasks);
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const complete = tasks.filter((t) => t.status === "Complete").length;
  const pendingApprovals = tasks.filter((t) => t.approval === "Pending").length;

  const advance = (task: CloseTask) =>
    setTasks((current) =>
      current.map((t) =>
        t.task === task.task
          ? {
              ...t,
              status: t.status === "Not Started" ? "In Progress" : "Complete",
              approval: t.status === "In Progress" ? "Pending" : t.approval,
            }
          : t,
      ),
    );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Financial Close"
          subtitle="Month end, quarter end and year end close, managed as a controlled process with owners, due dates, approvals and reconciliation status."
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-5">
          {[
            ["Current Reporting Period", "October 2026"],
            ["Close Status", "In progress"],
            ["Completed Tasks", `${complete} of ${tasks.length}`],
            ["Outstanding Tasks", `${tasks.length - complete}`],
            ["Pending Approvals", `${pendingApprovals}`],
          ].map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${Math.round((complete / tasks.length) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Reconciliation status: 7 transactions still need review in Accounting and Reconciliation,
          which is why Complete Financial Reconciliations is blocked.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              open("Summarize our financial close progress and identify incomplete tasks.")
            }
          >
            Summarize close progress with Alfie
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => open("Prepare variance explanations for the October financial close.")}
          >
            Prepare variance explanations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => open("Which reconciliations are missing before we can close October?")}
          >
            Find missing reconciliations
          </Button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-panel p-3 text-xs leading-5">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Closing a financial period is a controlled, authorized action. It stays unavailable
            until every task is complete and the Finance Manager sign-off is recorded. Closed
            periods are not silently modified.
          </p>
        </div>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="p-4 pb-3">
            <h3 className="text-sm font-semibold">Financial close checklist, October 2026</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[11px] text-muted-foreground">
                  {["#", "Task", "Responsible", "Due date", "Status", "Approval", "Action"].map(
                    (h) => (
                      <th key={h} className="px-4 py-2 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, i) => (
                  <tr key={t.task} className="border-t border-border hover:bg-secondary/50">
                    <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                    <td className="px-4 font-medium">{t.task}</td>
                    <td className="px-4">{t.owner}</td>
                    <td className="px-4">{t.due}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={t.status} />
                    </td>
                    <td className="px-4 text-muted-foreground">{t.approval}</td>
                    <td className="px-4">
                      {t.status === "Not Started" || t.status === "In Progress" ? (
                        <Button variant="outline" size="sm" onClick={() => advance(t)}>
                          {t.status === "Not Started" ? "Start" : "Mark complete"}
                        </Button>
                      ) : t.status === "Blocked" ? (
                        <span className="text-[11px] text-muted-foreground">
                          Resolve reconciliations first
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border p-4">
            <Button disabled={complete < tasks.length}>Close Reporting Period</Button>
            <p className="text-[11px] text-muted-foreground">
              {complete < tasks.length
                ? `Available after all ${tasks.length} tasks are complete and sign-off is recorded. ${tasks.length - complete} tasks remain.`
                : "All tasks complete. Closing still requires Finance Manager authorization."}
            </p>
          </div>
        </section>

        <section className={`${card} mt-4 p-4`}>
          <h3 className="text-sm font-semibold">Roles, permissions and audit in Finance</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Finance Analyst",
                "View financial information, run analysis, prepare reports and investigate discrepancies. Cannot post journal entries or execute payments unless explicitly authorized.",
              ],
              [
                "Accounts Payable / Receivable Specialist",
                "Manage assigned receivables and payables, prepare payment batches and perform permitted reconciliations. Cannot approve payments beyond configured authority.",
              ],
              [
                "Accountant",
                "Access general ledger information, prepare journal entries, reconcile transactions and prepare financial statements. Posts entries only if authorized.",
              ],
              [
                "Finance Manager",
                "Review financial reports, approve authorized transactions and journal entries within configured limits, and review financial close activities.",
              ],
              [
                "CFO / Finance Executive",
                "Access consolidated financial information, review performance, approve high level financial actions within configured authority, and approve financial reporting.",
              ],
              [
                "Administrator",
                "Manage user access, permissions, integrations and agent configurations.",
              ],
            ].map(([role, desc]) => (
              <div key={role} className="rounded-xl border border-border p-3.5">
                <h4 className="text-xs font-semibold">{role}</h4>
                <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Audit trail: every material Finance action records the user or agent responsible, the
            action, date and time, the financial record affected, original and proposed values, data
            source, approval status and final result. The history is immutable or appropriately
            controlled, and Alfie never bypasses configured approval thresholds.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
