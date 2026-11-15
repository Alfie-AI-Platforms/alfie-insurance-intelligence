import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, Loader, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import {
  migrationGuardrails,
  migrationProcess,
  migrationProjects,
  type PhaseState,
} from "@/lib/migration-data";

export const Route = createFileRoute("/migration")({ component: MigrationPage });

const card = "rounded-2xl border border-border bg-card p-5";
const num = (n: number) => n.toLocaleString();

function PhaseIcon({ state }: { state: PhaseState }) {
  if (state === "Complete") return <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" />;
  if (state === "In progress") return <Loader className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />;
  return <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />;
}

function StatusChip({ status }: { status: string }) {
  const tone =
    status === "Complete"
      ? "bg-positive/10 text-positive"
      : status === "Validation"
        ? "bg-warning/10 text-warning"
        : "bg-primary/10 text-primary";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[12px] font-semibold ${tone}`}>
      {status}
    </span>
  );
}

function MigrationPage() {
  const [selectedId, setSelectedId] = useState(migrationProjects[0]?.id ?? "MIG-01");
  const project = migrationProjects.find((p) => p.id === selectedId) ?? migrationProjects[0];
  if (!project) return null;

  const totalMoved = migrationProjects.reduce(
    (sum, p) => sum + p.objects.reduce((s, o) => s + o.moved, 0),
    0,
  );
  const openExceptions = migrationProjects.reduce(
    (sum, p) => sum + p.objects.reduce((s, o) => s + o.exceptions, 0),
    0,
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader
          title="Migration"
          description="Moving Northstar's data and workload from its previous platforms onto Alfie. Each migration runs as a project with trial loads and reconciliation before anything switches. The source system is never written to."
        />
        <p className="mt-3 rounded-xl bg-secondary/60 px-4 py-2.5 text-[13px] leading-5 text-muted-foreground">
          Sample migration records. This console sets out the projects, phases and evidence; the
          batch jobs and connectors behind it are backend work, run with your existing Data
          Sources connections.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Migration projects", String(migrationProjects.length), "Policy history, claims archive and the document library."],
            ["Records moved", num(totalMoved), "Policies, endorsements, claims, documents and accounts loaded into Alfie so far."],
            ["Open exceptions", num(openExceptions), "Records flagged for business review. None are money differences except 3 claims under review."],
            ["Next cutover", "Dec 8, 2026", "Policy history switches to Alfie, with a 30-day hypercare window."],
          ].map(([label, value, detail]) => (
            <section key={label} className={card}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{detail}</p>
            </section>
          ))}
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
          <div className="space-y-4">
            <section className={card}>
              <h2 className="text-sm font-semibold">Projects</h2>
              <ul className="mt-3 space-y-2">
                {migrationProjects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${
                        p.id === selectedId
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-background hover:bg-secondary/50"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{p.name}</span>
                        <StatusChip status={p.status} />
                      </span>
                      <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
                        From {p.sourceSystem}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">How a migration runs</h2>
              <ol className="mt-3 space-y-3">
                {migrationProcess.map((s, i) => (
                  <li key={s.step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-semibold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{s.step}</p>
                      <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck className="size-4 text-muted-foreground" /> Guardrails
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-muted-foreground">
                {migrationGuardrails.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className={`${card} xl:col-span-2`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{project.name}</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{project.scope}</p>
              </div>
              <StatusChip status={project.status} />
            </div>
            <dl className="mt-3 grid gap-2 text-[13px] sm:grid-cols-3">
              <div className="rounded-lg bg-secondary/50 px-3 py-2">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="mt-0.5 font-medium">{project.sourceSystem}</dd>
              </div>
              <div className="rounded-lg bg-secondary/50 px-3 py-2">
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="mt-0.5 font-medium">{project.owner}</dd>
              </div>
              <div className="rounded-lg bg-secondary/50 px-3 py-2">
                <dt className="text-muted-foreground">Cutover</dt>
                <dd className="mt-0.5 font-medium">{project.targetCutover}</dd>
              </div>
            </dl>

            <h3 className="mt-5 text-sm font-semibold">Phases</h3>
            <ol className="mt-2 space-y-2.5">
              {project.phases.map((phase) => (
                <li key={phase.name} className="flex gap-2.5">
                  <PhaseIcon state={phase.state} />
                  <div>
                    <p className="text-sm font-medium">
                      {phase.name}
                      <span className="ml-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {phase.state}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{phase.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h3 className="mt-5 text-sm font-semibold">Records</h3>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[12px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Object</th>
                  <th className="py-2 pr-3 text-right font-medium">Source records</th>
                  <th className="py-2 pr-3 text-right font-medium">Moved</th>
                  <th className="py-2 text-right font-medium">Exceptions</th>
                </tr>
              </thead>
              <tbody>
                {project.objects.map((o) => (
                  <tr key={o.object} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{o.object}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{num(o.total)}</td>
                    <td className="py-2.5 pr-3 text-right tabular-nums">{num(o.moved)}</td>
                    <td className="py-2.5 text-right tabular-nums">
                      {o.exceptions === 0 ? (
                        <span className="text-positive">None</span>
                      ) : (
                        o.exceptions.toLocaleString()
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="mt-5 text-sm font-semibold">Validation evidence</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-muted-foreground">
              {project.validation.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
