import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Circle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import {
  implementationTeam,
  onboardingGroups,
  onboardingTimeline,
} from "@/lib/onboarding-data";

export const Route = createFileRoute("/onboarding")({ component: OnboardingPage });

const card = "rounded-2xl border border-border bg-card p-5";

function OnboardingPage() {
  const [done, setDone] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      onboardingGroups.flatMap((g) => g.items.map((i) => [i.id, i.done])),
    ),
  );

  const { doneCount, totalCount, pct } = useMemo(() => {
    const all = onboardingGroups.flatMap((g) => g.items);
    const d = all.filter((i) => done[i.id]).length;
    return {
      doneCount: d,
      totalCount: all.length,
      pct: Math.round((d / all.length) * 100),
    };
  }, [done]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader
          title="Onboarding"
          description="Everything between kickoff and go-live for this workspace: setup, data and migration, people and access, Alfie configuration, and the sign-off. Work through it with the implementation team; each item links to the module where it is finished."
        />
        <p className="mt-3 rounded-xl bg-secondary/60 px-4 py-2.5 text-[13px] leading-5 text-muted-foreground">
          Sample progress for Northstar's onboarding. Checking an item updates this page in your
          browser; the underlying work (connections, migrations, invitations) happens in the
          linked modules and the backend.
        </p>

        <section className={`${card} mt-6`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                Overall progress
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                {doneCount} of {totalCount} steps complete
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Pilot group is live in Claims. Remaining: data source health, migration validation,
                automation approvals, training and sign-off. Go-live target Dec 15, 2026.
              </p>
            </div>
            <p className="text-3xl font-semibold tabular-nums">{pct}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </section>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            {onboardingGroups.map((group) => (
              <section key={group.title} className={card}>
                <h2 className="text-sm font-semibold">{group.title}</h2>
                <ul className="mt-2 divide-y divide-border/60">
                  {group.items.map((item) => {
                    const isDone = !!done[item.id];
                    return (
                      <li key={item.id} className="flex items-start gap-3 py-3">
                        <button
                          type="button"
                          aria-label={isDone ? `Mark "${item.label}" not done` : `Mark "${item.label}" done`}
                          onClick={() => setDone((d) => ({ ...d, [item.id]: !d[item.id] }))}
                          className="mt-0.5 shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="size-5 text-positive" />
                          ) : (
                            <Circle className="size-5 text-muted-foreground" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${isDone ? "text-muted-foreground" : ""}`}>
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{item.detail}</p>
                        </div>
                        {item.link ? (
                          <Link
                            to={item.link.to}
                            className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-primary hover:underline"
                          >
                            {item.link.label} <ArrowUpRight className="size-3.5" />
                          </Link>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>

          <div className="space-y-4">
            <section className={card}>
              <h2 className="text-sm font-semibold">Timeline</h2>
              <ol className="mt-3 space-y-3">
                {onboardingTimeline.map((t) => (
                  <li key={t.label} className="flex gap-3">
                    {t.state === "Complete" ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" />
                    ) : (
                      <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {t.date} · {t.state}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">Implementation team</h2>
              <ul className="mt-3 space-y-3">
                {implementationTeam.map((person) => (
                  <li key={person.name}>
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-[13px] font-medium text-muted-foreground">{person.role}</p>
                    <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{person.note}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-[13px] leading-5">
                Weekly onboarding review: Tuesdays, 30 minutes, until go-live sign-off.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
