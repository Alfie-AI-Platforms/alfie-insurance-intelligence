import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, Copy, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { PricingHeader, SampleDataNote, card, selectCls } from "@/components/pricing-nav";
import { baseScenario, lines, runScenario, type ScenarioInputs } from "@/lib/pricing-data";
import { seedScenarios } from "@/lib/pricing-workspaces-data";

export const Route = createFileRoute("/pricing/scenarios")({
  head: () => ({ meta: [{ title: "Scenario Modeling | Alfie Insurance" }] }),
  component: ScenariosPage,
});

type SavedScenario = {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  status: string;
  owner: string;
  created: string;
  note: string;
};

function baseForLine(line: string): ScenarioInputs {
  if (line === "Commercial Property") return { ...baseScenario };
  const l = lines.find((x) => x.line === line) ?? lines[0]!;
  return {
    premium: l.premium,
    losses: l.losses,
    expenseRatio: +(l.combinedRatio - l.lossRatio).toFixed(1),
    baseRetention: 90,
    ratePct: 0,
    freqTrendPct: 0,
    sevTrendPct: 0,
    elasticity: 0.45,
  };
}

const pct = (n: number) => `${n.toFixed(1)}%`;

function ScenariosPage() {
  const [line, setLine] = useState("Commercial Property");
  const [inputs, setInputs] = useState<ScenarioInputs>({
    ...baseScenario,
    ratePct: 8,
    sevTrendPct: 9,
  });
  const [name, setName] = useState("");
  const [saved, setSaved] = useState<SavedScenario[]>(
    seedScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      inputs: {
        ...baseScenario,
        ratePct: s.ratePct,
        freqTrendPct: s.freqTrendPct,
        sevTrendPct: s.sevTrendPct,
      },
      status: s.status,
      owner: s.owner,
      created: s.created,
      note: s.note,
    })),
  );
  const [note, setNote] = useState<string | null>(null);

  const baseline = useMemo(
    () => runScenario({ ...inputs, ratePct: 0, freqTrendPct: 0, sevTrendPct: 0 }),
    [inputs],
  );
  const result = useMemo(() => runScenario(inputs), [inputs]);
  const sensitivity = useMemo(
    () =>
      [-5, 0, 5, 9, 15, 25].map((sev) => ({
        sev,
        r: runScenario({ ...inputs, sevTrendPct: sev }),
      })),
    [inputs],
  );

  function changeLine(next: string) {
    setLine(next);
    setInputs(baseForLine(next));
  }
  function set<K extends keyof ScenarioInputs>(key: K, value: number) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }
  function save() {
    const id = `SCN-${String.fromCharCode(68 + saved.length)}`;
    setSaved((prev) => [
      {
        id,
        name:
          name.trim() ||
          `Scenario ${id.slice(4)}, ${line} ${inputs.ratePct >= 0 ? "+" : ""}${inputs.ratePct}%`,
        inputs: { ...inputs },
        status: "Draft",
        owner: "Jane Doe",
        created: "Nov 04, 2026",
        note: "Saved from the scenario builder. Assumptions are versioned with the scenario.",
      },
      ...prev,
    ]);
    setName("");
    setNote(
      `Saved as ${id} (Draft). Scenarios are separate from live pricing: nothing here changes a production rate. To act on a scenario, convert it into a Rate Review so the approval workflow applies.`,
    );
  }
  function duplicate(s: SavedScenario) {
    setSaved((prev) => [
      { ...s, id: `${s.id}-copy`, name: `${s.name} (copy)`, status: "Draft" },
      ...prev,
    ]);
    setNote(
      `Duplicated ${s.id}. The copy keeps the original assumptions as its starting point and is versioned separately.`,
    );
  }

  const slider = (
    label: string,
    key: keyof ScenarioInputs,
    min: number,
    max: number,
    step: number,
    suffix: string,
    hint: string,
  ) => (
    <label className="block text-xs">
      <span className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {inputs[key]}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={inputs[key]}
        onChange={(e) => set(key, Number(e.target.value))}
        className="mt-1.5 w-full accent-primary"
      />
      <span className="mt-0.5 block text-[12px] leading-4 text-muted-foreground">{hint}</span>
    </label>
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <PricingHeader
          title="Scenario Modeling"
          subtitle="Test hypothetical rate, risk and mix changes against a baseline before anything is proposed. Scenarios are a controlled sandbox: they never modify production rates, models or filings."
        />
        <div className="mt-4">
          <SampleDataNote>
            Illustrative sample data. Results are simple arithmetic on the stated assumptions, not
            an actuarial forecast. Retention and conversion effects are model assumptions, not
            guaranteed outcomes.
          </SampleDataNote>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
          <section className={`${card} p-5`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Scenario builder</h2>
              <select
                value={line}
                onChange={(e) => changeLine(e.target.value)}
                className={selectCls}
              >
                {lines.map((l) => (
                  <option key={l.line}>{l.line}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Baseline: premium ${inputs.premium.toFixed(1)}M, incurred losses $
              {inputs.losses.toFixed(1)}M, {line}.
            </p>
            <div className="mt-4 space-y-4">
              {slider(
                "Rate change",
                "ratePct",
                -5,
                15,
                0.5,
                "%",
                "Applied uniformly in this builder. Segmented changes are documented in the Rate Review proposal.",
              )}
              {slider(
                "Claims frequency trend",
                "freqTrendPct",
                -5,
                20,
                0.5,
                "%",
                "Change in claim counts over the scenario horizon.",
              )}
              {slider(
                "Claims severity trend",
                "sevTrendPct",
                -5,
                30,
                0.5,
                "%",
                "Change in average claim cost. The actuarial selection for Commercial Property is +9%.",
              )}
              {slider(
                "Expense ratio",
                "expenseRatio",
                20,
                40,
                0.1,
                "%",
                "Operating and acquisition costs as a share of premium, from Finance.",
              )}
              {slider(
                "Retention elasticity",
                "elasticity",
                0,
                1,
                0.05,
                " pts per +1%",
                "Assumption: renewal retention points lost per point of rate increase. Under review in the assumptions register.",
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputs((p) => ({ ...p, freqTrendPct: 0, sevTrendPct: 0 }))}
              >
                Normal
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputs((p) => ({ ...p, freqTrendPct: 5, sevTrendPct: 15 }))}
              >
                Adverse
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputs((p) => ({ ...p, freqTrendPct: 10, sevTrendPct: 25 }))}
              >
                Severe stress
              </Button>
            </div>
            <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
              Stress presets change risk assumptions only. Results under stress are hypothetical
              estimates and are labelled as such in reports.
            </p>
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Scenario name (optional)"
                className="h-9 min-w-0 flex-1 rounded-lg border border-border bg-background px-2.5 text-xs outline-none focus:border-ring"
              />
              <Button size="sm" onClick={save}>
                <Save className="size-3.5" /> Save scenario
              </Button>
            </div>
            {note ? <p className="mt-2 text-xs font-medium text-positive">{note}</p> : null}
          </section>

          <div className="space-y-4">
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">Projected results vs baseline</h2>
              <table className="mt-2.5 w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Metric</th>
                    <th className="py-2 pr-3 font-medium">Baseline</th>
                    <th className="py-2 pr-3 font-medium">Scenario</th>
                    <th className="py-2 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Written premium",
                      `$${baseline.writtenPremium.toFixed(2)}M`,
                      `$${result.writtenPremium.toFixed(2)}M`,
                      result.writtenPremium - baseline.writtenPremium,
                      "M",
                    ],
                    [
                      "Loss ratio",
                      pct(baseline.lossRatio),
                      pct(result.lossRatio),
                      result.lossRatio - baseline.lossRatio,
                      "pts",
                    ],
                    [
                      "Combined ratio",
                      pct(baseline.combinedRatio),
                      pct(result.combinedRatio),
                      result.combinedRatio - baseline.combinedRatio,
                      "pts",
                    ],
                    [
                      "Expected retention (assumption)",
                      pct(baseline.retention),
                      pct(result.retention),
                      result.retention - baseline.retention,
                      "pts",
                    ],
                    [
                      "Underwriting result",
                      `$${baseline.underwritingResult.toFixed(2)}M`,
                      `$${result.underwritingResult.toFixed(2)}M`,
                      result.underwritingResult - baseline.underwritingResult,
                      "M",
                    ],
                  ].map(([label, b, s, d, unit]) => (
                    <tr key={label as string} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-medium">{label}</td>
                      <td className="py-2 pr-3">{b}</td>
                      <td className="py-2 pr-3 font-medium">{s}</td>
                      <td className="py-2">
                        {(d as number) >= 0 ? "+" : ""}
                        {(d as number).toFixed(1)}
                        {unit === "M" ? "M" : " pts"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
                Key driver: at a {inputs.ratePct}% rate change with severity trending{" "}
                {inputs.sevTrendPct}%, the loss ratio{" "}
                {result.lossRatio <= baseline.lossRatio ? "improves" : "worsens"} because premium
                and loss movements compound differently. Alfie can walk through the arithmetic, and
                the trade-off to watch is retention, which rests on the elasticity assumption above.
              </p>
            </section>

            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">
                Sensitivity: severity trend at the current rate change
              </h2>
              <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {sensitivity.map(({ sev, r }) => (
                  <div
                    key={sev}
                    className={`rounded-xl p-3 text-center ${sev === inputs.sevTrendPct ? "bg-primary/10 ring-1 ring-primary" : "bg-secondary/50"}`}
                  >
                    <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                      Severity {sev >= 0 ? "+" : ""}
                      {sev}%
                    </p>
                    <p className="mt-1 text-sm font-semibold">{pct(r.lossRatio)}</p>
                    <p className="text-[12px] text-muted-foreground">
                      combined {pct(r.combinedRatio)}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
                One variable at a time, everything else held at the builder values. To reach the 60%
                target loss ratio at a {inputs.sevTrendPct}% severity trend, the required rate
                change is materially higher than at trend levels below it, which is the sensitivity
                finding Alfie carries into reports.
              </p>
            </section>

            <section className={`${card} p-5`}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="size-4 text-primary" /> Alfie, scenario notes
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                Scenario B (+8%, severity +9%) is the evidence attached to rate review RR-2026-014.
                Alfie recommends comparing it with Scenario C before the review progresses: C takes
                less headline rate and leans on the segment loading, so its retention assumption is
                kinder, but it depends on building age data that is only 82% complete. Neither
                scenario changes anything in production on its own.
              </p>
            </section>
          </div>
        </div>

        <section className={`${card} mt-4 p-5`}>
          <h2 className="text-sm font-semibold">Scenario comparison</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Scenario</th>
                  <th className="py-2 pr-3 font-medium">Assumptions</th>
                  <th className="py-2 pr-3 font-medium">Written premium</th>
                  <th className="py-2 pr-3 font-medium">Loss ratio</th>
                  <th className="py-2 pr-3 font-medium">Combined</th>
                  <th className="py-2 pr-3 font-medium">Retention</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {saved.map((s) => {
                  const r = runScenario(s.inputs);
                  return (
                    <tr key={s.id} className="border-b border-border/60 last:border-0 align-top">
                      <td className="py-2.5 pr-3">
                        <span className="block font-medium">{s.name}</span>
                        <span className="text-muted-foreground">
                          {s.id} · {s.owner} · {s.created}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        Rate {s.inputs.ratePct >= 0 ? "+" : ""}
                        {s.inputs.ratePct}%, freq {s.inputs.freqTrendPct >= 0 ? "+" : ""}
                        {s.inputs.freqTrendPct}%, sev {s.inputs.sevTrendPct >= 0 ? "+" : ""}
                        {s.inputs.sevTrendPct}%
                      </td>
                      <td className="py-2.5 pr-3">${r.writtenPremium.toFixed(2)}M</td>
                      <td className="py-2.5 pr-3">{pct(r.lossRatio)}</td>
                      <td className="py-2.5 pr-3">{pct(r.combinedRatio)}</td>
                      <td className="py-2.5 pr-3">{pct(r.retention)}</td>
                      <td className="py-2.5 pr-3">{s.status}</td>
                      <td className="py-2.5">
                        <span className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => duplicate(s)}>
                            <Copy className="size-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/pricing/reviews">To Rate Review</Link>
                          </Button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
            All scenarios share the Commercial Property baseline unless saved from another line in
            the builder. Under the stated assumptions, the most favorable projected combined ratio
            comes from the highest rate scenario, at the cost of the weakest retention assumption.
            That trade-off is the decision, and it belongs to the Rate Review, not to this page.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
