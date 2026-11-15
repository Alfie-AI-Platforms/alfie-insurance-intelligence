import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";

export const Route = createFileRoute("/preferences")({ component: PreferencesPage });

const card = "rounded-2xl border border-border bg-card p-5";
const selectCls =
  "select-chevron h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-sm outline-none focus:border-ring";
const labelCls = "text-[12px] font-semibold uppercase tracking-wide text-muted-foreground";

function Toggle({
  label,
  note,
  on,
  onClick,
}: {
  label: string;
  note?: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2.5 text-left"
    >
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {note ? <span className="mt-0.5 block text-[13px] text-muted-foreground">{note}</span> : null}
      </span>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white transition-all ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </span>
    </button>
  );
}

function PreferencesPage() {
  const [touched, setTouched] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [notifs, setNotifs] = useState({
    approvals: true,
    automations: true,
    reports: true,
    billing: false,
    digest: true,
  });
  const [citations, setCitations] = useState(true);

  const mark = () => setTouched(true);

  const applyTheme = (next: "light" | "dark" | "system") => {
    setTheme(next);
    mark();
    if (next === "system") {
      window.localStorage.removeItem("alfie-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      window.localStorage.setItem("alfie-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

  const flip = (key: keyof typeof notifs) => {
    setNotifs((n) => ({ ...n, [key]: !n[key] }));
    mark();
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader
          title="Preferences"
          description="Your personal settings for this workspace: appearance, which notifications reach you, and the defaults Alfie starts from. Preferences are yours alone; they never change organization settings."
        />
        {touched ? (
          <p className="mt-3 rounded-xl bg-positive/10 px-4 py-2.5 text-[13px] font-medium text-positive">
            Preferences saved on this device.
          </p>
        ) : null}

        <div className="mt-6 grid items-start gap-4 xl:grid-cols-2">
          <div className="space-y-4">
            <section className={card}>
              <h2 className="text-sm font-semibold">Appearance</h2>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                The same choice as the header toggle. System follows your device setting.
              </p>
              <div className="mt-3 flex gap-2">
                {(["light", "dark", "system"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => applyTheme(t)}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium capitalize ${
                      theme === t
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-background hover:bg-secondary/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">Workspace defaults</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={labelCls}>Default landing page</span>
                  <select className={`${selectCls} mt-1`} defaultValue="Home" onChange={mark}>
                    <option>Home</option>
                    <option>Claims</option>
                    <option>Underwriting</option>
                    <option>Reports</option>
                  </select>
                </label>
                <label className="block">
                  <span className={labelCls}>Date format</span>
                  <select className={`${selectCls} mt-1`} defaultValue="Nov 15, 2026" onChange={mark}>
                    <option>Nov 15, 2026</option>
                    <option>2026-11-15</option>
                    <option>15 Nov 2026</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Alfie response style</span>
                  <select className={`${selectCls} mt-1`} defaultValue="Balanced" onChange={mark}>
                    <option>Balanced</option>
                    <option>Concise, key points only</option>
                    <option>Detailed, full reasoning</option>
                  </select>
                </label>
              </div>
              <div className="mt-3">
                <Toggle
                  label="Show sources on Alfie answers"
                  note="Alfie cites the file, document or figure behind each answer."
                  on={citations}
                  onClick={() => {
                    setCitations((v) => !v);
                    mark();
                  }}
                />
              </div>
            </section>
          </div>

          <section className={card}>
            <h2 className="text-sm font-semibold">Notifications</h2>
            <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
              Choose what reaches the bell and your inbox. Approval requests that carry a deadline
              always arrive, whatever is chosen here.
            </p>
            <div className="mt-3 space-y-2">
              <Toggle
                label="Approvals waiting for me"
                note="Rate reviews, settlements and sign-offs assigned to you."
                on={notifs.approvals}
                onClick={() => flip("approvals")}
              />
              <Toggle
                label="Automation pauses and failures"
                note="Runs that stop for a human decision or fail a step."
                on={notifs.automations}
                onClick={() => flip("automations")}
              />
              <Toggle
                label="Reports ready"
                note="Scheduled reports and board packs when they generate."
                on={notifs.reports}
                onClick={() => flip("reports")}
              />
              <Toggle
                label="Billing events"
                note="Invoices issued and paid, payment failures, seat changes."
                on={notifs.billing}
                onClick={() => flip("billing")}
              />
              <Toggle
                label="Weekly summary email"
                note="One email on Monday with your queue, approvals and workspace changes."
                on={notifs.digest}
                onClick={() => flip("digest")}
              />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
