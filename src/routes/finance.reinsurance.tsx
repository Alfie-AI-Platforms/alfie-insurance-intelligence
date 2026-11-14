import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { FinanceHeader, SampleDataNote, card } from "@/components/finance-nav";
import { FinanceStatusBadge } from "@/components/finance-badges";
import { money, reinsurance } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/reinsurance")({
  head: () => ({
    meta: [
      { title: "Reinsurance | Alfie Insurance Finance" },
      {
        name: "description",
        content:
          "Monitor reinsurance recoverables, recoveries received and outstanding balances by reinsurer and treaty.",
      },
      { property: "og:title", content: "Reinsurance | Alfie Insurance" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReinsurancePage,
});

const workflow = [
  "Claim Identified",
  "Treaty Assessment",
  "Recovery Calculated",
  "Submitted to Reinsurer",
  "Recovery Received",
  "Reconciled",
];

function ReinsurancePage() {
  const navigate = useNavigate();
  const open = (q: string) => navigate({ to: "/finance/analysis", search: { q } });
  const totalRecoverable = reinsurance.reduce((s, r) => s + r.recoverable, 0);
  const totalRecovered = reinsurance.reduce((s, r) => s + r.recovered, 0);
  const overview = [
    ["Total Recoverable", money(totalRecoverable)],
    ["Recoveries Received", money(totalRecovered)],
    ["Outstanding Recoveries", money(totalRecoverable - totalRecovered)],
    ["Reinsurance Premium Expense", "$3.9M"],
  ] as const;
  const byReinsurer = [...new Set(reinsurance.map((r) => r.reinsurer))].map((name) => {
    const rows = reinsurance.filter((r) => r.reinsurer === name);
    return {
      name,
      recoverable: rows.reduce((s, r) => s + r.recoverable, 0),
      recovered: rows.reduce((s, r) => s + r.recovered, 0),
      treaties: [...new Set(rows.map((r) => r.treaty))].join(", "),
    };
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-5 pb-12 pt-8 lg:px-10">
        <FinanceHeader
          title="Reinsurance"
          subtitle="The financial side of reinsurance: recoverables, recoveries received and outstanding balances, connected to Claims and Policy records."
        />
        <div className="mt-4">
          <SampleDataNote>
            Treaty eligibility and allocation are based on the actual contract terms. Alfie does not
            assume a claim is recoverable without validating the treaty conditions.
          </SampleDataNote>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
          {overview.map(([label, value]) => (
            <div key={label} className="bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
              <p className="mt-1.5 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className={`${card} p-4`}>
            <h3 className="text-sm font-semibold">Recoverable by reinsurer and treaty</h3>
            <div className="mt-3 space-y-3">
              {byReinsurer.map((r) => (
                <div key={r.name} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold">{r.name}</span>
                    <span className="text-xs font-medium">
                      {money(r.recoverable - r.recovered)} outstanding
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{r.treaties}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{
                        width: `${r.recoverable ? Math.round((r.recovered / r.recoverable) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {money(r.recovered)} received of {money(r.recoverable)} recoverable
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className={`${card} p-4`}>
            <h3 className="text-sm font-semibold">Recovery workflow</h3>
            <ol className="mt-3 space-y-2">
              {workflow.map((step, i) => (
                <li key={step} className="flex items-center gap-2 text-xs">
                  <span
                    className={`flex size-4 items-center justify-center rounded-full ${i < 3 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"}`}
                  >
                    {i < 3 ? (
                      <Check className="size-2.5" />
                    ) : (
                      <span className="text-[9px]">{i + 1}</span>
                    )}
                  </span>
                  <span className={i === 3 ? "font-semibold" : ""}>{step}</span>
                  {i === 3 ? (
                    <span className="ml-auto text-[10px] text-primary">
                      Where most open recoveries sit
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  open(
                    "Identify overdue reinsurance recoverables and compare expected recoveries with amounts received.",
                  )
                }
              >
                Find overdue recoverables
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => open("Prepare a reinsurance recovery report for this period.")}
              >
                Prepare recovery report
              </Button>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
              One record below shows a recovery of $0 with the note Below retention. That is a
              treaty assessment result, not a missing recovery: the claim sits under the Casualty
              XOL retention, so nothing is recoverable on it.
            </p>
          </section>
        </div>

        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="p-4 pb-3">
            <h3 className="text-sm font-semibold">Reinsurance records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border text-left text-[11px] text-muted-foreground">
                  {[
                    "Reinsurer",
                    "Treaty",
                    "Claim",
                    "Policy",
                    "Gross claim",
                    "Share",
                    "Recoverable",
                    "Recovered",
                    "Outstanding",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reinsurance.map((r) => (
                  <tr
                    key={r.claim + r.reinsurer}
                    className="border-t border-border hover:bg-secondary/50"
                  >
                    <td className="px-4 py-2.5 font-medium">{r.reinsurer}</td>
                    <td className="px-4">{r.treaty}</td>
                    <td className="px-4">{r.claim}</td>
                    <td className="px-4">{r.policy}</td>
                    <td className="px-4">{money(r.gross)}</td>
                    <td className="px-4">{r.share}</td>
                    <td className="px-4">{money(r.recoverable)}</td>
                    <td className="px-4">{money(r.recovered)}</td>
                    <td className="px-4 font-medium">{money(r.recoverable - r.recovered)}</td>
                    <td className="px-4">
                      <FinanceStatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
