import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PricingHeader, SampleDataNote, card, selectCls } from "@/components/pricing-nav";
import { pricingModels, type PricingModel } from "@/lib/pricing-data";
import { modelAlerts } from "@/lib/pricing-workspaces-data";

export const Route = createFileRoute("/pricing/models")({
  head: () => ({ meta: [{ title: "Pricing Models | Alfie Insurance" }] }),
  component: ModelsPage,
});

const lifecycle = [
  "Draft",
  "Development",
  "Testing",
  "Validation",
  "Review",
  "Approved",
  "Scheduled",
  "Production",
  "Retired",
];
const stageIndex: Record<PricingModel["status"], number> = {
  Draft: 1,
  "Under Review": 4,
  Approved: 5,
  Active: 7,
  Archived: 8,
};

function rangeOf(relativity: string): [number, number] {
  const parts = relativity.split(/[–-]/).map((p) => parseFloat(p.trim()));
  return [parts[0] ?? 1, parts[1] ?? parts[0] ?? 1];
}

function ModelsPage() {
  const [selected, setSelected] = useState<PricingModel>(pricingModels[0]!);
  const [base, setBase] = useState(1200);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [compare, setCompare] = useState<string[]>([]);

  const failing = selected.validation.filter((v) => !v.ok);
  const eligible = failing.length === 0;

  const calc = useMemo(() => {
    let premium = base;
    const steps = selected.factors.map((f) => {
      const [lo, hi] = rangeOf(f.relativity);
      const pos = positions[f.name] ?? 0.5;
      const factor = lo + (hi - lo) * pos;
      premium *= factor;
      return { name: f.name, factor };
    });
    return { steps, premium };
  }, [selected, base, positions]);

  function toggleCompare(version: string) {
    setCompare((prev) =>
      prev.includes(version) ? prev.filter((v) => v !== version) : [...prev.slice(-1), version],
    );
  }
  const compared = selected.versions.filter((v) => compare.includes(v.version));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <PricingHeader
          title="Pricing Models"
          subtitle="The controlled registry of the rating models that calculate production premiums. Models are versioned, validated and approved here; implementation happens in the authoritative rating system, and an approved model is not an implemented one until that system confirms it."
        />
        <div className="mt-4">
          <SampleDataNote />
        </div>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Model</th>
                  <th className="px-4 py-2.5 font-medium">Line</th>
                  <th className="px-4 py-2.5 font-medium">Version</th>
                  <th className="px-4 py-2.5 font-medium">Owner</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Drift</th>
                  <th className="px-4 py-2.5 font-medium">Next review</th>
                </tr>
              </thead>
              <tbody>
                {pricingModels.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => {
                      setSelected(m);
                      setPositions({});
                      setCompare([]);
                    }}
                    className={`cursor-pointer border-b border-border/60 last:border-0 ${selected.id === m.id ? "bg-primary/5" : "hover:bg-secondary/40"}`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="block font-medium">{m.name}</span>
                      <span className="text-muted-foreground">
                        {m.id} · {m.product}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">{m.line}</td>
                    <td className="px-4 py-2.5">{m.version}</td>
                    <td className="px-4 py-2.5">{m.owner}</td>
                    <td className="px-4 py-2.5">{m.status}</td>
                    <td className="px-4 py-2.5">{m.drift}</td>
                    <td className="px-4 py-2.5">{m.reviewDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {lifecycle.map((stage, i) => (
            <span key={stage} className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${i === stageIndex[selected.status] ? "bg-primary text-primary-foreground" : i < stageIndex[selected.status] ? "bg-positive/15 text-positive" : "bg-secondary text-muted-foreground"}`}
              >
                {stage}
              </span>
              {i < lifecycle.length - 1 ? <span className="text-muted-foreground">→</span> : null}
            </span>
          ))}
          <span className="ml-2 text-[11px] text-muted-foreground">
            {selected.id} is at the {lifecycle[stageIndex[selected.status]]} stage.
          </span>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={`${card} p-5`}>
            <h2 className="text-sm font-semibold">{selected.name}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{selected.description}</p>
            <h3 className="mt-4 text-xs font-semibold">Rating variables and factors</h3>
            <table className="mt-2 w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Variable</th>
                  <th className="py-1.5 pr-2 font-medium">Relativity range</th>
                  <th className="py-1.5 font-medium">Contribution</th>
                </tr>
              </thead>
              <tbody>
                {selected.factors.map((f) => (
                  <tr key={f.name} className="border-b border-border/60 last:border-0">
                    <td className="py-1.5 pr-2 font-medium">{f.name}</td>
                    <td className="py-1.5 pr-2">{f.relativity}</td>
                    <td className="py-1.5">
                      <span className="flex items-center gap-2">
                        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{ width: `${f.contribution}%` }}
                          />
                        </span>
                        {f.contribution}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
              Variables are documented with their effect on the final premium and must comply with
              legal, regulatory and fairness requirements. Prohibited characteristics are never
              rating variables.
            </p>

            <h3 className="mt-4 text-xs font-semibold">Test calculation</h3>
            <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              Base premium $
              <input
                type="number"
                value={base}
                onChange={(e) => setBase(Number(e.target.value) || 0)}
                className="h-8 w-24 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring"
              />
            </label>
            <div className="mt-2 space-y-1.5">
              {calc.steps.map((s) => {
                const f = selected.factors.find((x) => x.name === s.name)!;
                const [lo, hi] = rangeOf(f.relativity);
                return (
                  <label key={s.name} className="flex items-center justify-between gap-3 text-xs">
                    <span className="w-40 shrink-0">
                      {s.name}{" "}
                      <span className="text-muted-foreground">
                        ({lo} to {hi})
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={positions[s.name] ?? 0.5}
                      onChange={(e) =>
                        setPositions((p) => ({ ...p, [s.name]: Number(e.target.value) }))
                      }
                      className="min-w-0 flex-1 accent-primary"
                    />
                    <span className="w-12 text-right font-medium">×{s.factor.toFixed(2)}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs">
              Indicated premium:{" "}
              <span className="text-base font-semibold">
                ${calc.premium.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>{" "}
              <span className="text-muted-foreground">
                before minimum premium, fees and taxes. Test calculations use the documented factors
                only and change nothing in production.
              </span>
            </p>
          </section>

          <div className="space-y-4">
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">Validation</h2>
              <ul className="mt-2.5 space-y-2">
                {selected.validation.map((v) => (
                  <li key={v.metric} className="flex items-center justify-between gap-2 text-xs">
                    <span>{v.metric}</span>
                    <span
                      className={`flex items-center gap-1.5 font-medium ${v.ok ? "text-positive" : "text-destructive"}`}
                    >
                      {v.ok ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <AlertTriangle className="size-3.5" />
                      )}
                      {v.value}
                      {v.ok ? "" : " (outside tolerance)"}
                    </span>
                  </li>
                ))}
              </ul>
              <p
                className={`mt-3 rounded-xl p-3 text-xs leading-5 ${eligible ? "bg-positive/10" : "bg-destructive/10"}`}
              >
                {eligible
                  ? "All validation checks pass. This version is eligible to be considered for production approval through the review workflow."
                  : `Not eligible for production approval: ${failing.map((f) => f.metric).join(", ")} failed. A model with a failing required check cannot be promoted until it is recalibrated and revalidated.`}
              </p>
              <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                Validation covers backtesting, predicted vs actual losses, frequency and severity,
                discrimination, calibration, stability and data quality. Results, limitations and
                reviewer comments are kept with the version.
              </p>
            </section>

            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">Versions</h2>
              <ul className="mt-2.5 space-y-2">
                {selected.versions.map((v) => (
                  <li
                    key={v.version}
                    className="flex items-start justify-between gap-2 rounded-xl bg-secondary/50 p-3 text-xs leading-5"
                  >
                    <span>
                      <span className="font-semibold">{v.version}</span> · {v.date}
                      <span className="block text-muted-foreground">{v.note}</span>
                      <span className="block text-muted-foreground">
                        Approved by: {v.approvedBy}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(v.version)}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${compare.includes(v.version) ? "bg-primary text-primary-foreground" : "bg-card"}`}
                    >
                      Compare
                    </button>
                  </li>
                ))}
              </ul>
              {compared.length === 2 ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs leading-5">
                  {compared.map((v) => (
                    <div key={v.version} className="rounded-xl border border-border p-3">
                      <p className="font-semibold">{v.version}</p>
                      <p className="text-muted-foreground">
                        {v.date} · {v.note} · Approved by {v.approvedBy}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Select two versions to compare their change notes and approvals. Versions used for
                  production pricing are never overwritten, only superseded.
                </p>
              )}
            </section>

            <section className={`${card} p-5`}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="size-4 text-primary" /> Monitoring and Alfie notes
              </h2>
              <ul className="mt-2.5 space-y-2">
                {modelAlerts.map((a) => (
                  <li key={a.model} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                    <p className="font-semibold">
                      {a.model}{" "}
                      <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {a.severity}
                      </span>
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {a.alert}. {a.action}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                Alfie can explain a model's behavior, compare versions and summarize validation. It
                never alters an active production model. Select a model above and ask in{" "}
                <span className="font-medium text-foreground">Pricing Analysis</span> why a
                particular premium came out as it did.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
