import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/help")({ component: HelpPage });

const card = "rounded-2xl border border-border bg-card p-5";
const inputCls =
  "h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:border-ring";
const selectCls =
  "select-chevron h-9 w-full rounded-lg border border-border bg-background pl-2.5 text-sm outline-none focus:border-ring";

const topics: { title: string; blurb: string; articles: string[] }[] = [
  {
    title: "Getting started",
    blurb: "The workspace layout, your queue, and how files move from intake to sign-off.",
    articles: ["Your first day in Alfie", "Home and your queue", "How the Alfie rail works"],
  },
  {
    title: "Claims",
    blurb: "Working a claim file: evidence, estimates, authority limits and settlement.",
    articles: ["Reviewing an Alfie file summary", "Authority limits and referrals", "Attaching evidence to a claim"],
  },
  {
    title: "Underwriting",
    blurb: "Submissions, broker documents, risk appetite checks and quotes.",
    articles: ["Reading a submission file", "When a submission is referred", "Comparing the ACORD and the SOV"],
  },
  {
    title: "Policy",
    blurb: "Policies, endorsements, renewals and proofs of insurance.",
    articles: ["Approving an endorsement", "Renewal workflow", "Issuing a proof of insurance"],
  },
  {
    title: "Pricing & approvals",
    blurb: "Rate reviews, filing status and who can approve what.",
    articles: ["The rate review path", "Approval thresholds by role", "Filing review with the regulator"],
  },
  {
    title: "Reports & exports",
    blurb: "Reading reports in place, the builder, schedules and exports.",
    articles: ["Previewing a report", "Building a scheduled report", "Export formats and limits"],
  },
  {
    title: "Billing & plans",
    blurb: "Your Alfie subscription: seats, usage, invoices and payment.",
    articles: ["How module seats are counted", "Reading an invoice", "Changing the payment method"],
  },
  {
    title: "Permissions & access",
    blurb: "Roles, the permission matrix, separation of duties and access reviews.",
    articles: ["How roles are assigned", "Separation of duties warnings", "Running an access review"],
  },
  {
    title: "Data sources & migration",
    blurb: "Connected systems, sync health and moving from a previous platform.",
    articles: ["Connecting a data source", "What a degraded sync means", "How a migration runs"],
  },
];

const services: { name: string; status: string; tone: string }[] = [
  { name: "Alfie workspace", status: "Operational", tone: "text-positive" },
  { name: "Document processing", status: "Operational", tone: "text-positive" },
  { name: "Report generation", status: "Operational", tone: "text-positive" },
  { name: "Broker and Customer CRM connector", status: "Degraded, sync delayed", tone: "text-warning" },
];

const whatsNew: string[] = [
  "Billing now lives under Administration, with invoices you can read in place.",
  "Documents and reports preview inside Alfie as document sheets. Downloads stay available.",
  "Migration console: follow each migration project, its phases and its validation evidence.",
  "Interface type is now Geist, with a 12px readability floor across the workspace.",
];

function HelpPage() {
  const [query, setQuery] = useState("");
  const [sent, setSent] = useState(false);
  const q = query.trim().toLowerCase();
  const visible = q
    ? topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.blurb.toLowerCase().includes(q) ||
          t.articles.some((a) => a.toLowerCase().includes(q)),
      )
    : topics;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 lg:px-10">
        <PageHeader
          title="Help"
          description="Guides for every module, the state of the platform, and a line to the Alfie support team. Most questions are answered faster by asking Alfie in any chat; support is for access, billing and platform problems."
        />

        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help topics, for example approvals or migration"
            aria-label="Search help topics"
            className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
        </div>

        <div className="mt-4 grid items-start gap-4 xl:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-2">
            {visible.map((t) => (
              <section key={t.title} className={card}>
                <h2 className="text-sm font-semibold">{t.title}</h2>
                <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{t.blurb}</p>
                <ul className="mt-2.5 space-y-1.5">
                  {t.articles.map((a) => (
                    <li key={a} className="text-[13px] font-medium text-primary">
                      {a}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No topic matches "{query}". Try a shorter word, or message support on the right.
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            <section className={card}>
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <LifeBuoy className="size-4 text-muted-foreground" /> Contact support
              </h2>
              {sent ? (
                <p className="mt-2 rounded-lg bg-positive/10 px-3 py-2 text-[13px] leading-5 text-positive">
                  Message noted. In this frontend build nothing leaves the browser; once support is
                  connected, the team replies within one business day, and within 4 hours for
                  access and billing problems.
                </p>
              ) : (
                <form
                  className="mt-3 space-y-2.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSent(true);
                  }}
                >
                  <select className={selectCls} defaultValue="Using a module" aria-label="Topic">
                    <option>Using a module</option>
                    <option>Access and sign-in</option>
                    <option>Billing and plan</option>
                    <option>Data sources and migration</option>
                    <option>Something is broken</option>
                  </select>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the problem or question. Include a claim, submission or report ID if there is one."
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none focus:border-ring"
                  />
                  <Button type="submit" size="sm">Send to support</Button>
                </form>
              )}
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">System status</h2>
              <ul className="mt-2.5 space-y-2">
                {services.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 text-[13px]">
                    <span className="font-medium">{s.name}</span>
                    <span className={`font-semibold ${s.tone}`}>{s.status}</span>
                  </li>
                ))}
              </ul>
              <Link to="/data-sources" className="mt-3 inline-block text-[13px] font-medium text-primary hover:underline">
                See connector health in Data Sources
              </Link>
            </section>

            <section className={card}>
              <h2 className="text-sm font-semibold">What's new</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-5 text-muted-foreground">
                {whatsNew.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
