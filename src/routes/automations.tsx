import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Bot, CheckCircle2, Pause, Play, Plus, Search, ShieldCheck, Workflow } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { WorkspaceStatusBadge } from "@/components/workspace-badges";
import {
  automationCategories,
  automationTemplates,
  automations as seedAutomations,
  executions,
  submissionWorkflowSteps,
  type Automation,
} from "@/lib/workspace-data";

export const Route = createFileRoute("/automations")({ component: AutomationsPage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring";
const lifecycle = [
  "Draft",
  "Configuration",
  "Testing",
  "Approval",
  "Active",
  "Paused or Disabled",
  "Archived",
];
const agentChoices = [
  "Claims Intelligence Agent",
  "Underwriting Agent",
  "Policy Review Agent",
  "Pricing Analysis Agent",
  "Finance Reconciliation Agent",
  "Fraud Detection Agent",
  "Compliance Monitoring Agent",
];
const sourceChoices = [
  "Claims Management System",
  "Policy Administration System",
  "Underwriting Platform",
  "General Ledger and ERP",
  "Actuarial Data Warehouse",
  "SharePoint Document Library",
];

function AutomationsPage() {
  const [items, setItems] = useState<Automation[]>(seedAutomations);
  const [category, setCategory] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [search, setSearch] = useState("");
  const [selectedExecution, setSelectedExecution] = useState(executions[0]!);
  const builderRef = useRef<HTMLDivElement>(null);

  // Builder state
  const [bName, setBName] = useState("");
  const [bPurpose, setBPurpose] = useState("");
  const [bCategory, setBCategory] = useState("Claims");
  const [bTrigger, setBTrigger] = useState<Automation["trigger"]>("Event");
  const [bApproval, setBApproval] = useState("Approval required for consequential actions");
  const [bAgents, setBAgents] = useState<string[]>(["Claims Intelligence Agent"]);
  const [bSources, setBSources] = useState<string[]>(["Claims Management System"]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((a) => {
        if (category !== "All categories" && a.category !== category) return false;
        if (statusFilter !== "All statuses" && a.status !== statusFilter) return false;
        if (search && !`${a.name} ${a.purpose}`.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      }),
    [items, category, statusFilter, search],
  );

  function togglePause(a: Automation) {
    setItems((prev) =>
      prev.map((x) =>
        x.id === a.id ? { ...x, status: x.status === "Active" ? "Paused" : "Active" } : x,
      ),
    );
  }

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  function useTemplate(name: string, cat: string, steps: string) {
    setBName(name);
    setBCategory(cat);
    setBPurpose(steps);
    setTestResult(null);
    setSavedNote(null);
    builderRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function saveDraft() {
    if (!bName.trim()) return;
    const item: Automation = {
      id: `AUT-${items.length + 1}`,
      name: bName.trim(),
      category: bCategory,
      purpose: bPurpose || "Configured in the builder.",
      trigger: bTrigger,
      triggerDetail: "Configured in the builder",
      status: "Draft",
      agents: bAgents,
      sources: bSources,
      approval: bApproval,
      lastRun: "Not run yet",
      runs: 0,
    };
    setItems((prev) => [item, ...prev]);
    setSavedNote(
      `"${item.name}" saved as a Draft. It stays inactive until configuration is complete, a test run passes, and any required approval is recorded.`,
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Automations</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Repeatable workflows that connect triggers, conditions, specialist agents, data
              sources, actions, approvals and notifications. Automations are not Agents: agents
              define capabilities and responsibilities, automations define when work starts, which
              steps run, and where a human must approve.
            </p>
          </div>
          <Button onClick={() => builderRef.current?.scrollIntoView({ behavior: "smooth" })}>
            <Plus className="size-4" /> New automation
          </Button>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "Active automations",
              String(items.filter((a) => a.status === "Active").length),
              "Running under approved service identities",
            ],
            ["Executions this month", "1,284", "Across all categories"],
            ["Awaiting approval now", "3", "Paused at human approval steps"],
            ["Failed, last 30 days", "6", "Each with an error log and an owner notified"],
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

        <section className={`${card} mt-4`}>
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-44 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search automations"
                className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-2 text-xs outline-none focus:border-ring"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
            >
              {automationCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-ring"
            >
              {[
                "All statuses",
                "Active",
                "Paused",
                "Draft",
                "In Testing",
                "Awaiting Approval",
                "Archived",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {filtered.map((a) => (
              <article key={a.id} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{a.name}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {a.id} · {a.category} · {a.runs} runs · Last run {a.lastRun}
                    </p>
                  </div>
                  <WorkspaceStatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{a.purpose}</p>
                <dl className="mt-2.5 space-y-1 text-xs">
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Trigger</dt>
                    <dd>
                      <span className="font-medium">{a.trigger}</span> · {a.triggerDetail}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Agents</dt>
                    <dd>{a.agents.join(", ")}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-muted-foreground">Approval</dt>
                    <dd>{a.approval}</dd>
                  </div>
                </dl>
                {a.status === "Active" || a.status === "Paused" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => togglePause(a)}
                  >
                    {a.status === "Active" ? (
                      <>
                        <Pause className="size-3.5" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="size-3.5" /> Reactivate
                      </>
                    )}
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No automations match these filters.
            </p>
          ) : null}
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <section className={card}>
            <h2 className="text-sm font-semibold">Execution history</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Select an execution to inspect it. Failures are shown with their reason, and an
              automation never silently proceeds on incomplete data.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Execution</th>
                    <th className="py-2 pr-3 font-medium">Trigger</th>
                    <th className="py-2 pr-3 font-medium">Steps</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {executions.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => setSelectedExecution(e)}
                      className={`cursor-pointer border-b border-border/60 last:border-0 hover:bg-secondary/40 ${e.id === selectedExecution.id ? "bg-primary/5" : ""}`}
                    >
                      <td className="py-2.5 pr-3">
                        <span className="block font-medium">{e.automation}</span>
                        <span className="text-muted-foreground">
                          {e.id} · {e.started}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">{e.trigger}</td>
                      <td className="py-2.5 pr-3">{e.steps}</td>
                      <td className="py-2.5">
                        <WorkspaceStatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-xl bg-secondary/50 p-3.5 text-xs leading-5">
              <p className="font-semibold">
                {selectedExecution.id}: {selectedExecution.automation}
              </p>
              <p className="mt-1 text-muted-foreground">{selectedExecution.outcome}</p>
            </div>
          </section>

          <section className={card}>
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Workflow className="size-4" /> Inside an execution: EXE-8841
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              New Submission Processing, including the conditional branch and the approval pause.
            </p>
            <ol className="mt-3 space-y-2">
              {submissionWorkflowSteps.map((s, i) => (
                <li key={s.step} className="flex gap-2.5 text-xs leading-5">
                  <span
                    className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${s.state === "Completed" ? "bg-positive/10 text-positive" : s.state === "Awaiting Approval" ? "bg-warning/15 text-warning-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-medium">{s.step}</span>{" "}
                    <span className="text-muted-foreground">· {s.state}</span>
                    <span className="block text-muted-foreground">{s.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-xl bg-warning/10 p-3 text-xs leading-5">
              A recommendation or a completed analysis is never treated as approval. This execution
              stays paused until Marcus Lee approves, rejects, or requests changes, and the decision
              is recorded either way.
            </p>
          </section>
        </div>

        <section ref={builderRef} className={`${card} mt-4 scroll-mt-6`}>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="size-4 text-primary" /> Automation builder
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Create from scratch or from a template. The lifecycle is controlled: nothing activates
            until configuration, testing and any required approval are complete.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-1">
            {lifecycle.map((s, i) => (
              <span key={s} className="flex items-center gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${i === 0 ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                >
                  {s}
                </span>
                {i < lifecycle.length - 1 ? <span className="text-muted-foreground">→</span> : null}
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-[11px] text-muted-foreground">
              Automation name
              <input
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                placeholder="e.g. Weekly bordereaux check"
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Department or process
              <select
                value={bCategory}
                onChange={(e) => setBCategory(e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {automationCategories.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground md:col-span-2">
              Purpose
              <input
                value={bPurpose}
                onChange={(e) => setBPurpose(e.target.value)}
                placeholder="What this automation does and why"
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Trigger type
              <select
                value={bTrigger}
                onChange={(e) => setBTrigger(e.target.value as Automation["trigger"])}
                className={`${inputCls} mt-1`}
              >
                {["Event", "Scheduled", "Condition", "Manual", "AI Suggested"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Human approval
              <select
                value={bApproval}
                onChange={(e) => setBApproval(e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {[
                  "Approval required for consequential actions",
                  "Approval required before any external communication",
                  "No approval, internal notifications only",
                  "Approval required before activation only",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <div>
              <p className="text-[11px] text-muted-foreground">Specialist agents</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {agentChoices.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggle(bAgents, a, setBAgents)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${bAgents.includes(a) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Authorized data sources</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {sourceChoices.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(bSources, s, setBSources)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${bSources.includes(s) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-[11px] text-muted-foreground">
              Error handling and retries
              <select
                className={`${inputCls} mt-1`}
                defaultValue="Retry twice with delay, then pause and notify the owner"
              >
                <option>Retry twice with delay, then pause and notify the owner</option>
                <option>Fail immediately and notify an administrator</option>
                <option>Retry up to 5 times, idempotency checks on every consequential step</option>
              </select>
            </label>
            <label className="block text-[11px] text-muted-foreground">
              Notifications
              <select
                className={`${inputCls} mt-1`}
                defaultValue="Owner and department channel, on completion, approval needed and failure"
              >
                <option>
                  Owner and department channel, on completion, approval needed and failure
                </option>
                <option>Owner only</option>
                <option>Administrators on failure only</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setTestResult(
                  `Test run completed against sample records: steps executed in order, the approval step paused correctly, and no records were written. Retries are idempotent, so a rerun cannot duplicate a consequential action.`,
                )
              }
            >
              Run a test
            </Button>
            <Button onClick={saveDraft}>Save as draft</Button>
          </div>
          {testResult ? (
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" /> {testResult}
            </p>
          ) : null}
          {savedNote ? <p className="mt-2 text-xs font-medium text-positive">{savedNote}</p> : null}

          <div className="mt-5 border-t border-border pt-4">
            <h3 className="text-xs font-semibold">Start from a template</h3>
            <div className="mt-2.5 grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
              {automationTemplates.map((t) => (
                <div key={t.name} className="rounded-xl bg-secondary/50 p-3.5">
                  <p className="text-xs font-semibold">{t.name}</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {t.category}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">{t.steps}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2.5"
                    onClick={() =>
                      useTemplate(
                        t.name,
                        t.category === "Pricing & Actuarial" ? "Pricing & Actuarial" : t.category,
                        t.steps,
                      )
                    }
                  >
                    Use template
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Templates are configurable before
              activation and never assume your business rules or thresholds. Automations run under
              an approved service identity with defined permissions, not the creator's personal
              privileges. Changes to an active automation are versioned, may need reapproval, and
              never silently alter an execution already in progress. Alfie may suggest an automation
              from repeated work, but it cannot activate one on its own.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
