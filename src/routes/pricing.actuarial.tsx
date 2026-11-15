import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { PricingHeader, SampleDataNote, card, selectCls } from "@/components/pricing-nav";
import {
  accidentYears,
  ageToAgeFactors,
  canPricing,
  expectedVsActual,
  incurredTriangle,
  lines,
  paidTriangle,
  pricingRoles,
  reserves as seedReserves,
  trends,
  ultimates,
  type PricingRole,
} from "@/lib/pricing-data";
import {
  actuarialAssumptions,
  reserveMethodComparison,
  reserveVariance,
} from "@/lib/pricing-workspaces-data";

export const Route = createFileRoute("/pricing/actuarial")({
  head: () => ({ meta: [{ title: "Actuarial Analysis | Alfie Insurance" }] }),
  component: ActuarialPage,
});

const fmtK = (n: number) => `$${(n / 1000).toFixed(1)}M`;

function ActuarialPage() {
  const [triKind, setTriKind] = useState<"incurred" | "paid">("incurred");
  const [role, setRole] = useState<PricingRole>("Actuary");
  const [reserveRows, setReserveRows] = useState(seedReserves);
  const [signedNote, setSignedNote] = useState<string | null>(null);

  const tri = triKind === "incurred" ? incurredTriangle : paidTriangle;
  const factors = useMemo(() => ageToAgeFactors(tri), [tri]);
  const ults = useMemo(() => ultimates(tri, factors), [tri, factors]);
  const totalLatest = ults.reduce((a, u) => a + u.latest, 0);
  const totalUltimate = ults.reduce((a, u) => a + u.ultimate, 0);

  function signOff(line: string) {
    setReserveRows((prev) =>
      prev.map((r) => (r.line === line ? { ...r, status: "Signed off" } : r)),
    );
    setSignedNote(
      `${line} reserves signed off by ${role}. The sign-off is recorded with the valuation date, method and assumptions, and the estimate remains an actuarial estimate, separate from booked accounting reserves.`,
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <PricingHeader
          title="Actuarial Analysis"
          subtitle="The technical workspace for loss experience, development, reserves and assumptions. Estimates here are actuarial estimates: they are not booked accounting reserves, and formal opinions require qualified professional sign-off."
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

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={`${card} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">
                  Loss development triangle, Commercial Property
                </h2>
                <p className="text-[13px] text-muted-foreground">
                  Cumulative {triKind} losses, $K, accident years 2021 to 2025, annual development.
                  Data cutoff Oct 31, 2026, Actuarial Data Warehouse (2 warnings on file).
                </p>
              </div>
              <div className="flex rounded-lg bg-secondary p-0.5">
                {(["incurred", "paid"] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setTriKind(k)}
                    className={`rounded-md px-2.5 py-1 text-[13px] capitalize ${triKind === k ? "bg-card font-medium shadow-sm" : "text-muted-foreground"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Accident year</th>
                    {[12, 24, 36, 48, 60].map((m) => (
                      <th key={m} className="py-2 pr-3 font-medium">
                        {m} mo
                      </th>
                    ))}
                    <th className="py-2 font-medium">Ultimate</th>
                  </tr>
                </thead>
                <tbody>
                  {tri.map((row, i) => (
                    <tr key={accidentYears[i]} className="border-b border-border/60 last:border-0">
                      <td className="py-2 pr-3 font-medium">{accidentYears[i]}</td>
                      {row.map((v, j) => (
                        <td key={j} className="py-2 pr-3">
                          {v != null ? (
                            v.toLocaleString()
                          ) : (
                            <span className="text-muted-foreground">not yet developed</span>
                          )}
                        </td>
                      ))}
                      <td className="py-2 font-medium">
                        {ults[i] ? Math.round(ults[i].ultimate).toLocaleString() : ""}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-border text-muted-foreground">
                    <td className="py-2 pr-3 font-medium">Age to age factors</td>
                    {factors.map((f, j) => (
                      <td key={j} className="py-2 pr-3">
                        {f.toFixed(3)}×
                      </td>
                    ))}
                    <td className="py-2">to ultimate</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
              Chain ladder, calculated live from the triangle above: total latest {triKind}{" "}
              {fmtK(totalLatest)}, indicated ultimate {fmtK(totalUltimate)}, implied development{" "}
              {fmtK(totalUltimate - totalLatest)}. AY 2025 is only 12 months developed, so its
              ultimate is the least reliable and is blended with Bornhuetter-Ferguson in the reserve
              review.
            </p>
          </section>

          <div className="space-y-4">
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">
                Reserving methods compared, Commercial Property
              </h2>
              <ul className="mt-2.5 space-y-2.5">
                {reserveMethodComparison.map((m) => (
                  <li key={m.method} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                    <p className="font-semibold">
                      {m.method}{" "}
                      <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
                        {m.status}
                      </span>
                    </p>
                    <p className="mt-0.5">
                      Ultimate:{" "}
                      {m.method === "Chain Ladder"
                        ? `${fmtK(totalUltimate)} all years, calculated live from the incurred triangle`
                        : m.ultimate}
                    </p>
                    <p className="text-muted-foreground">{m.ibnrNote}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">
                Expected vs actual, Commercial Property 2026
              </h2>
              <table className="mt-2 w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-1.5 pr-2 font-medium">Metric</th>
                    <th className="py-1.5 pr-2 font-medium">Expected</th>
                    <th className="py-1.5 pr-2 font-medium">Actual</th>
                    <th className="py-1.5 font-medium">Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {expectedVsActual.map((r) => (
                    <tr key={r.metric} className="border-b border-border/60 last:border-0">
                      <td className="py-1.5 pr-2 font-medium">{r.metric}</td>
                      <td className="py-1.5 pr-2">{r.expected}</td>
                      <td className="py-1.5 pr-2">{r.actual}</td>
                      <td className={`py-1.5 font-medium ${r.dev > 10 ? "text-destructive" : ""}`}>
                        +{r.dev}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
                Pure premium check: expected loss per exposure has risen with severity. The gap
                between expected and actual is the main evidence behind pricing exception EXC-04 and
                feeds the Pricing Analysis adequacy view.
              </p>
            </section>
          </div>
        </div>

        <section className={`${card} mt-4 p-5`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Reserves by line</h2>
            <p className="text-[13px] text-muted-foreground">
              Case reserves and IBNR in $M. Sign-off requires the Actuary role with reserve sign-off
              permission.
            </p>
          </div>
          {signedNote ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-positive">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> {signedNote}
            </p>
          ) : null}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Line</th>
                  <th className="py-2 pr-3 font-medium">Case reserve</th>
                  <th className="py-2 pr-3 font-medium">IBNR</th>
                  <th className="py-2 pr-3 font-medium">Ultimate (all years)</th>
                  <th className="py-2 pr-3 font-medium">Movement</th>
                  <th className="py-2 pr-3 font-medium">Method</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {reserveRows.map((r) => (
                  <tr key={r.line} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{r.line}</td>
                    <td className="py-2.5 pr-3">${r.caseReserve.toFixed(1)}M</td>
                    <td className="py-2.5 pr-3">${r.ibnr.toFixed(1)}M</td>
                    <td className="py-2.5 pr-3">${r.ultimate.toFixed(1)}M</td>
                    <td className="py-2.5 pr-3">
                      {r.movement >= 0
                        ? `+$${r.movement.toFixed(1)}M strengthening`
                        : `-$${Math.abs(r.movement).toFixed(1)}M release`}
                    </td>
                    <td className="py-2.5 pr-3">{r.method}</td>
                    <td className="py-2.5 pr-3">{r.status}</td>
                    <td className="py-2.5">
                      {r.status !== "Signed off" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canPricing(role, "signOffReserve")}
                          onClick={() => signOff(r.line)}
                        >
                          Sign off
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 grid gap-2.5 md:grid-cols-3">
            {reserveVariance.map((v) => (
              <div key={v.ay} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                <p className="font-semibold">
                  AY {v.ay}: ${v.priorUltimate.toFixed(1)}M to ${v.currentUltimate.toFixed(1)}M
                </p>
                <p className="mt-0.5 text-muted-foreground">{v.note}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className={`${card} p-5`}>
            <h2 className="text-sm font-semibold">Frequency and severity by line</h2>
            <table className="mt-2 w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1.5 pr-2 font-medium">Line</th>
                  <th className="py-1.5 pr-2 font-medium">Frequency</th>
                  <th className="py-1.5 pr-2 font-medium">Avg severity</th>
                  <th className="py-1.5 pr-2 font-medium">Freq change</th>
                  <th className="py-1.5 font-medium">Sev change</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => (
                  <tr key={l.line} className="border-b border-border/60 last:border-0">
                    <td className="py-1.5 pr-2 font-medium">{l.line}</td>
                    <td className="py-1.5 pr-2">{l.frequency} per 100</td>
                    <td className="py-1.5 pr-2">${l.severity.toLocaleString()}</td>
                    <td className="py-1.5 pr-2">
                      {l.freqChange >= 0 ? "+" : ""}
                      {l.freqChange}%
                    </td>
                    <td className="py-1.5">
                      {l.sevChange >= 0 ? "+" : ""}
                      {l.sevChange}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h3 className="mt-4 text-xs font-semibold">Trend observations</h3>
            <ul className="mt-2 space-y-2">
              {trends.map((t) => (
                <li key={t.name} className="text-xs leading-5">
                  <span className="font-medium">
                    {t.name}: {t.value}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    ({t.impact} impact) {t.note}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="space-y-4">
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold">Assumptions register</h2>
              <ul className="mt-2.5 space-y-2.5">
                {actuarialAssumptions.map((a) => (
                  <li key={a.name} className="rounded-xl bg-secondary/50 p-3 text-xs leading-5">
                    <p className="font-semibold">
                      {a.name}: {a.value}{" "}
                      <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-[12px] font-medium text-muted-foreground">
                        {a.status} · {a.version}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {a.segment} · {a.period} · Owner {a.owner}
                    </p>
                    <p className="text-muted-foreground">Source: {a.source}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[13px] leading-4 text-muted-foreground">
                Every assumption change creates a new version and is reviewable. Analyses record the
                assumption versions they used, so results stay reproducible.
              </p>
            </section>
            <section className={`${card} p-5`}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="size-4 text-primary" /> Alfie, actuarial notes
              </h2>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-muted-foreground">
                <li>
                  Development at 12 to 24 months runs about 1.39×, slightly above the current
                  selection, which is why AY 2024 and 2025 ultimates keep strengthening.
                </li>
                <li>
                  Severity, not frequency, explains most of the expected vs actual gap. Alfie can
                  show the working, but the trend selection itself needs an actuary's judgment, not
                  an AI default.
                </li>
                <li>
                  These are analysis findings, not an approved actuarial opinion. Findings flow into{" "}
                  <Link
                    to="/pricing/scenarios"
                    className="font-medium text-primary hover:underline"
                  >
                    Scenario Modeling
                  </Link>{" "}
                  and{" "}
                  <Link to="/pricing/reviews" className="font-medium text-primary hover:underline">
                    Rate Reviews
                  </Link>{" "}
                  as references, not copies.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
