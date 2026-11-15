import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { PricingHeader, SampleDataNote, card, selectCls } from "@/components/pricing-nav";
import {
  canApproveRate,
  canImplement,
  lines,
  pricingRoles,
  rateReviews,
  reviewStages,
  runScenario,
  type PricingRole,
  type RateReview,
} from "@/lib/pricing-data";
import { filingRecord, postImplementation, pricingExceptions } from "@/lib/pricing-workspaces-data";

export const Route = createFileRoute("/pricing/reviews")({
  head: () => ({ meta: [{ title: "Rate Reviews | Alfie Insurance" }] }),
  component: ReviewsPage,
});

const pct = (n: number) => `${n.toFixed(1)}%`;

function ReviewsPage() {
  const [role, setRole] = useState<PricingRole>("Pricing Manager");
  const [reviews, setReviews] = useState<RateReview[]>(rateReviews);
  const [selectedId, setSelectedId] = useState("RR-2026-014");
  const [lineFilter, setLineFilter] = useState("All lines");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [comment, setComment] = useState("");
  const [actionNote, setActionNote] = useState<string | null>(null);

  const selected = reviews.find((r) => r.id === selectedId) ?? reviews[0]!;
  const filtered = reviews.filter(
    (r) =>
      (lineFilter === "All lines" || r.line === lineFilter) &&
      (statusFilter === "All statuses" || r.status === statusFilter),
  );

  const impact = useMemo(() => {
    const l = lines.find((x) => x.line === selected.line) ?? lines[0]!;
    const base = {
      premium: l.premium,
      losses: l.losses,
      expenseRatio: +(l.combinedRatio - l.lossRatio).toFixed(1),
      baseRetention: 89,
      ratePct: 0,
      freqTrendPct: 0,
      sevTrendPct: l.sevChange,
      elasticity: 0.45,
    };
    return {
      before: runScenario({ ...base, sevTrendPct: 0 }),
      after: runScenario({ ...base, ratePct: selected.proposedPct }),
    };
  }, [selected]);

  const approvable = selected.stage === 5;
  const canApprove = approvable && canApproveRate(role, selected.proposedPct);
  const implementable = canImplement(role, selected.status);

  function approve() {
    setReviews((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, stage: 6, status: "Filing Review" } : r)),
    );
    setActionNote(
      `${selected.id} approved by ${role} and moved to Regulatory / Filing Review. Approval is not implementation: the change reaches production only after filing requirements are met and implementation is recorded against the authoritative rating system.`,
    );
  }
  function implement() {
    setReviews((prev) =>
      prev.map((r) => (r.id === selected.id ? { ...r, stage: 7, status: "Implemented" } : r)),
    );
    setActionNote(
      `${selected.id} recorded as implemented. In production this state requires confirmation from the authoritative rating system; the review now moves to post-implementation monitoring against its original scenario.`,
    );
  }
  function addComment() {
    if (!comment.trim()) return;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === selected.id
          ? {
              ...r,
              comments: [
                ...r.comments,
                { who: `Jane Doe, ${role}`, when: "Nov 04", text: comment.trim() },
              ],
            }
          : r,
      ),
    );
    setComment("");
  }
  function escalate(excId: string, segment: string, line: string) {
    const id = `RR-2026-0${20 + reviews.length}`;
    const review: RateReview = {
      id,
      title: `${line} review, from exception ${excId}`,
      line,
      current: "See Pricing Analysis",
      proposedPct: 0,
      segments: segment,
      premiumImpact: "To be assessed",
      stage: 0,
      status: "Draft",
      owner: "Jane Doe",
      comments: [
        {
          who: "Alfie",
          when: "Nov 04",
          text: `Initiated from pricing exception ${excId}. The originating exception, its metric, threshold and period are linked as evidence.`,
        },
      ],
    };
    setReviews((prev) => [review, ...prev]);
    setSelectedId(id);
    setActionNote(
      `Rate review ${id} initiated from ${excId}. It starts at Analysis Initiated and cannot skip stages: evidence, actuarial assessment and scenario evaluation come before any proposal.`,
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <PricingHeader
          title="Rate Reviews"
          subtitle="The formal, traceable process for evaluating, approving and implementing rate changes. Every review keeps its evidence, proposal, approvals, filing record and implementation record in one place."
          actions={
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Acting role
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as PricingRole)}
                className={selectCls}
              >
                {pricingRoles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
          }
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>
        {actionNote ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-positive/10 p-3 text-xs font-medium leading-5 text-positive">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {actionNote}
          </p>
        ) : null}

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="flex flex-wrap items-center gap-2 p-4 pb-2">
            <h2 className="text-sm font-semibold">Review register</h2>
            <span className="ml-auto flex gap-2">
              <select
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                className={selectCls}
              >
                <option>All lines</option>
                {lines.map((l) => (
                  <option key={l.line}>{l.line}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={selectCls}
              >
                <option>All statuses</option>
                {[
                  "Draft",
                  "In Review",
                  "Pending Approval",
                  "Approved",
                  "Filing Review",
                  "Implemented",
                  "Rejected",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Review</th>
                  <th className="px-4 py-2 font-medium">Line</th>
                  <th className="px-4 py-2 font-medium">Proposed</th>
                  <th className="px-4 py-2 font-medium">Stage</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={`cursor-pointer border-b border-border/60 last:border-0 ${selected.id === r.id ? "bg-primary/5" : "hover:bg-secondary/40"}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="block font-medium">{r.title}</span>
                      <span className="text-muted-foreground">{r.id}</span>
                    </td>
                    <td className="px-4 py-2.5">{r.line}</td>
                    <td className="px-4 py-2.5">
                      {r.proposedPct >= 0 ? "+" : ""}
                      {r.proposedPct}%
                    </td>
                    <td className="px-4 py-2.5">{reviewStages[r.stage]}</td>
                    <td className="px-4 py-2.5">{r.status}</td>
                    <td className="px-4 py-2.5">{r.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {reviewStages.map((stage, i) => (
            <span key={stage} className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${i === selected.stage ? "bg-primary text-primary-foreground" : i < selected.stage ? "bg-positive/15 text-positive" : "bg-secondary text-muted-foreground"}`}
              >
                {stage}
              </span>
              {i < reviewStages.length - 1 ? (
                <span className="text-muted-foreground">→</span>
              ) : null}
            </span>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={`${card} p-5`}>
            <h2 className="text-sm font-semibold">{selected.title}</h2>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
              {[
                ["Review", selected.id],
                ["Current average premium", selected.current],
                [
                  "Proposed change",
                  `${selected.proposedPct >= 0 ? "+" : ""}${selected.proposedPct}%`,
                ],
                ["Affected segments", selected.segments],
                ["Premium impact", selected.premiumImpact],
                ["Owner", selected.owner],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-secondary/50 px-2.5 py-1.5">
                  <span className="block text-[12px] uppercase tracking-wide text-muted-foreground">
                    {k}
                  </span>
                  {v}
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-xs font-semibold">
              Impact assessment (from the linked scenario)
            </h3>
            <table className="mt-2 w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Metric</th>
                  <th className="py-1.5 pr-2 font-medium">Before</th>
                  <th className="py-1.5 font-medium">Projected after</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="py-1.5 pr-2">Loss ratio (with severity trend)</td>
                  <td className="py-1.5 pr-2">{pct(impact.before.lossRatio)}</td>
                  <td className="py-1.5">{pct(impact.after.lossRatio)}</td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="py-1.5 pr-2">Combined ratio</td>
                  <td className="py-1.5 pr-2">{pct(impact.before.combinedRatio)}</td>
                  <td className="py-1.5">{pct(impact.after.combinedRatio)}</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-2">Renewal retention (assumption)</td>
                  <td className="py-1.5 pr-2">{pct(impact.before.retention)}</td>
                  <td className="py-1.5">{pct(impact.after.retention)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
              Projections use the scenario engine and its stated assumptions, including retention
              elasticity. They are the proposal's expectations, and post-implementation monitoring
              compares actuals against them.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <Button size="sm" disabled={!canApprove} onClick={approve}>
                Approve review
              </Button>
              <Button size="sm" variant="outline" disabled={!implementable} onClick={implement}>
                Record implementation
              </Button>
            </div>
            <ul className="mt-2.5 space-y-1.5 text-[13px] leading-4 text-muted-foreground">
              <li className="flex gap-1.5">
                <Lock className="mt-0.5 size-3 shrink-0" /> Approval is available only at the
                Approval stage.{" "}
                {approvable
                  ? canApproveRate(role, selected.proposedPct)
                    ? `As ${role}, you can approve this ${selected.proposedPct}% change.`
                    : `This ${selected.proposedPct}% change exceeds the Pricing Manager's 10% authority and routes to the Pricing Committee, so no role here can approve it directly.`
                  : `This review is at "${reviewStages[selected.stage]}", so approval is not yet available.`}
              </li>
              <li className="flex gap-1.5">
                <Lock className="mt-0.5 size-3 shrink-0" /> Implementation recording requires the
                Pricing Manager role and a review in Filing Review with its filing requirements
                satisfied.{" "}
                {selected.status === "Implemented"
                  ? "This review is implemented and is being monitored."
                  : ""}
              </li>
            </ul>
          </section>

          <div className="space-y-4">
            {selected.id === "RR-2026-009" ? (
              <section className={`${card} p-5`}>
                <h2 className="text-sm font-semibold">Regulatory filing</h2>
                <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Jurisdiction", filingRecord.jurisdiction],
                    ["Requirement", filingRecord.requirement],
                    ["Filing", filingRecord.filingId],
                    ["Submitted", filingRecord.submitted],
                    ["Regulatory status", filingRecord.status],
                    ["Approval / effective date", filingRecord.approvalDate],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg bg-secondary/50 px-2.5 py-1.5">
                      <span className="block text-[12px] uppercase tracking-wide text-muted-foreground">
                        {k}
                      </span>
                      {v}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
                  {filingRecord.note}
                </p>
              </section>
            ) : null}
            {selected.id === "RR-2026-004" ? (
              <section className={`${card} p-5`}>
                <h2 className="text-sm font-semibold">Post-implementation monitoring</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {postImplementation.implemented}.
                </p>
                <table className="mt-2 w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="py-1.5 pr-2 font-medium">Metric</th>
                      <th className="py-1.5 pr-2 font-medium">Projected</th>
                      <th className="py-1.5 pr-2 font-medium">Actual</th>
                      <th className="py-1.5 font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postImplementation.rows.map((r) => (
                      <tr key={r.metric} className="border-b border-border/60 last:border-0">
                        <td className="py-1.5 pr-2 font-medium">{r.metric}</td>
                        <td className="py-1.5 pr-2">{r.projected}</td>
                        <td className="py-1.5 pr-2">{r.actual}</td>
                        <td className="py-1.5 text-muted-foreground">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : null}
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">Comments and history</h2>
              <ul className="mt-2.5 space-y-2.5">
                {selected.comments.length ? (
                  selected.comments.map((c, i) => (
                    <li key={i} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                      <span className="font-semibold">{c.who}</span>{" "}
                      <span className="text-muted-foreground">· {c.when}</span>
                      <span className="block">{c.text}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-muted-foreground">
                    No comments yet. The full history, including revised proposals, approvals and
                    rejections, is preserved on the review.
                  </li>
                )}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment as Jane Doe"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring"
                />
                <Button size="sm" variant="outline" onClick={addComment}>
                  Add
                </Button>
              </div>
            </section>
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">Pricing exceptions that may need a review</h2>
              <ul className="mt-2.5 space-y-2.5">
                {pricingExceptions.map((e) => (
                  <li key={e.id} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                    <p className="font-semibold">
                      {e.id}: {e.metric}, {e.observed}{" "}
                      <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
                        {e.severity} · {e.status}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {e.segment} · {e.period} · Threshold: {e.threshold}. Owner {e.owner}.
                    </p>
                    <p className="text-muted-foreground">{e.detail}</p>
                    <p className="mt-1">
                      <span className="font-medium">Suggested investigation:</span>{" "}
                      {e.investigation}
                    </p>
                    {e.status.startsWith("Escalated") ? null : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          escalate(
                            e.id,
                            e.segment,
                            e.segment.includes("Homeowners")
                              ? "Homeowners"
                              : e.segment.includes("Auto")
                                ? "Auto"
                                : "Commercial Property",
                          )
                        }
                      >
                        Escalate to Rate Review
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
