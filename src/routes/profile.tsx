import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Mail, MapPin, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import { auditEvents } from "@/lib/admin-data";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-ring";
const labelCls = "text-[12px] font-semibold uppercase tracking-wide text-muted-foreground";

const moduleAccess = [
  "Claims",
  "Underwriting",
  "Policy",
  "Pricing & Actuarial",
  "Finance",
  "Reports",
  "Documents",
  "Data Sources",
  "Automations",
  "Agents",
  "Users & Access",
  "Billing",
  "Settings",
];

type Session = { id: string; device: string; detail: string; current?: boolean };

const initialSessions: Session[] = [
  { id: "s1", device: "This browser", detail: "Toronto, ON · Active now", current: true },
  { id: "s2", device: "iPhone, Alfie mobile web", detail: "Toronto, ON · Last active 2 hours ago" },
  { id: "s3", device: "Chrome on Windows", detail: "Toronto, ON · Last active Nov 12, 2026" },
];

function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [sessions, setSessions] = useState(initialSessions);
  const myActivity = auditEvents.filter((e) => e.actor === "Jane Doe").slice(0, 4);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader
          title="Profile"
          description="Your identity in this workspace: personal details, security, the modules your role can open, and your recent activity. Organization wide roles and permissions live in Users & Access and Policies & Permissions."
        />

        <div className="mt-6 grid items-start gap-4 xl:grid-cols-3">
          <div className="space-y-4">
            <section className={card}>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-avatar text-base font-semibold text-avatar-foreground">
                  JD
                </div>
                <div>
                  <p className="text-base font-semibold">Jane Doe</p>
                  <p className="text-[13px] text-muted-foreground">Insurance Manager</p>
                </div>
              </div>
              <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">
                Organization Administrator
              </span>
              <dl className="mt-4 space-y-2 text-[13px]">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>jane.doe@northstarmutual.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>Toronto, ON · Eastern Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" />
                  <span>Workspace member since 2024</span>
                </div>
              </dl>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">My access</h2>
              <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                Your role can open every module. Approval thresholds and separation of duties still
                apply: holding a role never approves your own work.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {moduleAccess.map((m) => (
                  <span key={m} className="rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium">
                    {m}
                  </span>
                ))}
              </div>
              <Link to="/permissions" className="mt-3 inline-block text-[13px] font-medium text-primary hover:underline">
                See the permission matrix
              </Link>
            </section>
          </div>

          <div className="space-y-4 xl:col-span-2">
            <section className={card}>
              <h2 className="text-sm font-semibold">Personal details</h2>
              <form
                className="mt-3 grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSaved(true);
                }}
              >
                <label className="block">
                  <span className={labelCls}>Full name</span>
                  <input className={`${inputCls} mt-1`} defaultValue="Jane Doe" />
                </label>
                <label className="block">
                  <span className={labelCls}>Job title</span>
                  <input className={`${inputCls} mt-1`} defaultValue="Insurance Manager" />
                </label>
                <label className="block">
                  <span className={labelCls}>Work email</span>
                  <input className={`${inputCls} mt-1`} defaultValue="jane.doe@northstarmutual.com" />
                </label>
                <label className="block">
                  <span className={labelCls}>Phone</span>
                  <input className={`${inputCls} mt-1`} defaultValue="+1 416 555 0148" />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Location</span>
                  <input className={`${inputCls} mt-1`} defaultValue="Toronto, ON" />
                </label>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <Button type="submit" size="sm">Save changes</Button>
                  {saved ? (
                    <p className="text-[13px] text-muted-foreground">
                      Saved. In this frontend build, changes are kept in the browser only.
                    </p>
                  ) : null}
                </div>
              </form>
            </section>

            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <KeyRound className="size-4 text-muted-foreground" /> Security
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Multi-factor authentication</dt>
                  <dd>
                    <span className="inline-flex rounded-full bg-positive/10 px-2 py-0.5 text-[12px] font-semibold text-positive">
                      Enabled, authenticator app
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Password last changed</dt>
                  <dd className="font-medium">September 2026</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Sign-in method</dt>
                  <dd className="font-medium">Email and password, MFA required by policy</dd>
                </div>
              </dl>
              <h3 className="mt-4 text-[13px] font-semibold">Active sessions</h3>
              <ul className="mt-2 divide-y divide-border/60">
                {sessions.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <MonitorSmartphone className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{s.device}</p>
                      <p className="text-[13px] text-muted-foreground">{s.detail}</p>
                    </div>
                    {s.current ? (
                      <span className="text-[12px] font-semibold text-positive">Current</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSessions((list) => list.filter((x) => x.id !== s.id))}
                      >
                        Revoke
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">My recent activity</h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Your latest entries from the workspace audit log in Settings.
              </p>
              <ul className="mt-3 divide-y divide-border/60">
                {myActivity.map((e, i) => (
                  <li key={i} className="py-2.5">
                    <p className="text-sm font-medium">{e.resource}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {e.detail} · {e.time}
                    </p>
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
