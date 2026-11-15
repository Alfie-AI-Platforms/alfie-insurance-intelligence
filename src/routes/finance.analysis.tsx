import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Circle,
  Database,
  Download,
  PanelRightClose,
  PanelRightOpen,
  Sparkle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AlfieMark } from "@/components/alfie-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlfieComposer, AttachmentChip, type Attachment } from "@/components/alfie-composer";
import { FinanceNav, SampleDataNote } from "@/components/finance-nav";
import { financeAudit, financeSources } from "@/lib/finance-data";

export const Route = createFileRoute("/finance/analysis")({
  validateSearch: (s: Record<string, unknown>): { q?: string } =>
    typeof s["q"] === "string" && s["q"] ? { q: s["q"] } : {},
  head: () => ({
    meta: [
      { title: "Financial Analysis | Alfie Insurance" },
      {
        name: "description",
        content:
          "Investigate financial performance, transactions and variances in a conversation with Alfie.",
      },
      { property: "og:title", content: "Financial Analysis | Alfie Insurance" },
      {
        property: "og:description",
        content: "AI financial analysis workspace with sources, workflow and governance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FinanceAnalysis,
});

type Section = { title: string; items: string[] };
type Reply = {
  intro: string;
  sections?: Section[];
  table?: string[][];
  confidence?: string;
  limitations?: string[];
  sources?: string[];
  agents?: string[];
  actions?: string[];
};
type Msg = {
  id: string;
  role: "user" | "alfie";
  text?: string;
  files?: Attachment[];
  reply?: Reply;
};

const followUps = [
  "Break down the claims expenses.",
  "Compare this quarter with the previous quarter.",
  "Why did our operating expenses increase?",
  "Show me all outstanding receivables.",
  "Which transactions have not reconciled?",
  "Prepare a financial summary for management.",
];

const workflow = [
  "Data Collection",
  "Data Validation",
  "Financial Analysis",
  "Variance Investigation",
  "Recommendations",
  "Finance Review",
  "Approval",
  "Reporting",
];
const currentStage = 3;

const summarySections: Section[] = [
  {
    title: "1. Revenue Overview",
    items: [
      "Gross Written Premium: $48.6M year to date, up 6.4% on the previous period.",
      "Earned Premium: $46.3M.",
      "Premium Receipts: $44.4M collected, $4.2M still receivable.",
      "Other Revenue: investment income $4.6M.",
    ],
  },
  {
    title: "2. Expenses",
    items: [
      "Claims Paid: $21.8M, up 9.1%. Claims Incurred: $29.2M.",
      "Broker Commissions: $5.6M.",
      "Operating Expenses: $8.7M, up 3.8%.",
      "Reinsurance Costs: ceded premium is reflected in the net figures in Pricing and Reinsurance.",
    ],
  },
  {
    title: "3. Financial Position",
    items: [
      "Cash Position: $23.5M across operating accounts at the last bank sync.",
      "Accounts Receivable: $4.2M, of which $612K is overdue.",
      "Accounts Payable: $3.8M, including $1.1M broker commissions and $1.8M approved claims settlements awaiting processing.",
      "Outstanding obligations are all inside their payment terms except the overdue receivables noted below.",
    ],
  },
  {
    title: "4. Key Observations",
    items: [
      "Claims paid rose faster than premium in Q3, driven by Commercial Property severity and Auto frequency.",
      "Overdue receivables are concentrated in 46 invoices, with the largest single balance at ABC Holdings, $184,600.",
      "CL-45821 was paid $600 below its approved settlement and is flagged in reconciliation.",
      "A possible duplicate payment of $940 exists on CL-45814.",
    ],
  },
  {
    title: "5. Recommended Actions",
    items: [
      "Investigate the 46 overdue receivables, starting with the over 60 day buckets.",
      "Review the unusual claims payment movement on CL-45821 before it is reconciled.",
      "Reconcile the 7 unmatched or partially matched transactions in Accounting.",
      "Review the operating expense variance in professional services.",
      "Prepare the monthly management report from this analysis.",
    ],
  },
  {
    title: "6. Data Quality and Confidence",
    items: [
      "Reporting period: October 2026, year to date where stated.",
      "Sources: General Ledger, Policy Administration, Claims, Billing and Bank feeds.",
      "Broker Commission System last synced 2 hours ago, so commission figures may move.",
      "Figures are illustrative sample data until connected systems are verified. Latest sync: 12 minutes ago for the General Ledger.",
    ],
  },
];

function replyFor(q: string, files: Attachment[]): Reply {
  const p = q.toLowerCase();
  if (files.length)
    return {
      intro: `I read ${files.length === 1 ? "the attached file" : `the ${files.length} attached files`} in the context of this financial analysis.`,
      sections: [
        {
          title: "What I extracted",
          items: files.map((f) =>
            /receiv/i.test(f.name)
              ? `${f.name}: invoice level receivables detected, columns mapped to policy, due date and outstanding balance.`
              : /claims/i.test(f.name)
                ? `${f.name}: claims payment rows detected, mapped to claim number, approved settlement and payment amount.`
                : /commission/i.test(f.name)
                  ? `${f.name}: broker commission schedule detected, rates are treated as unverified until checked against the configured contracts.`
                  : /recon|bank/i.test(f.name)
                    ? `${f.name}: bank and ledger rows detected, ready to match against reconciliation records.`
                    : /ledger|financial|statement/i.test(f.name)
                      ? `${f.name}: structured financial data detected, mapped to revenue, expense and balance lines.`
                      : `${f.name}: content summarized, no conflicting figures found against this analysis.`,
          ),
        },
        {
          title: "How it affects this analysis",
          items: [
            "Used as conversation context only, not added to any permanent record.",
            "Figures from uploaded files are treated as unverified until reconciled with source systems. Use Add to repository if you want a file kept permanently, which asks for confirmation first.",
          ],
        },
      ],
      confidence: "Moderate, uploaded data not yet reconciled",
      sources: files.map((f) => f.name),
      actions: ["Add to repository", "Ask Follow-up"],
    };
  if (p.includes("receivable") || p.includes("outstanding premium") || p.includes("collected"))
    return {
      intro:
        "Premium receivables total $4.2M across 318 open invoices. $612K is overdue, and collections this month were $4.6M against $4.9M billed.",
      table: [
        ["Bucket", "Amount", "Invoices"],
        ["Current", "$3,588,000", "272"],
        ["1 to 30 days overdue", "$342,000", "24"],
        ["31 to 60 days overdue", "$158,000", "13"],
        ["61 to 90 days overdue", "$74,000", "6"],
        ["Over 90 days overdue", "$38,000", "3"],
      ],
      sections: [
        {
          title: "Largest balances",
          items: [
            "ABC Holdings, CP-10442, $184,600, overdue since Oct 18.",
            "Bayview Industrial REIT, CP-10518, $121,300, due Nov 28.",
            "Northgate Logistics, CA-55021, $48,100 remaining after a partial payment.",
          ],
        },
        {
          title: "Recommended Actions",
          items: [
            "Prepare payment reminders for the over 60 day balances.",
            "Ask Alfie to identify policyholders with repeated late payments.",
          ],
        },
      ],
      confidence: "High for billing data, synced 34 minutes ago",
      sources: ["Premium Billing System", "Policy Administration System"],
      agents: ["Premium Receivables Agent"],
      actions: ["Open Premium & Receivables", "Prepare payment reminders", "Ask Follow-up"],
    };
  if (p.includes("unreconciled") || p.includes("not reconciled") || p.includes("reconcile"))
    return {
      intro:
        "Of 1,284 transactions this period, 1,241 are matched. 7 need attention, and 2 need review before the period can close.",
      table: [
        ["Transaction", "Issue", "Amount"],
        ["TXN-90211", "Paid $600 below approved settlement, CL-45821", "$11,800"],
        ["TXN-90197", "Unidentified bank receipt, no matching record", "$1,940"],
        ["TXN-90195", "Possible duplicate payment, CL-45814", "$940"],
        ["TXN-90202", "Partially matched premium receipt, INV-8790", "$48,100"],
      ],
      sections: [
        {
          title: "Recommended Actions",
          items: [
            "Review TXN-90211 with the Claims Payments record before proposing a correcting entry.",
            "Hold TXN-90195 from posting until the duplicate is confirmed or cleared.",
            "Alfie can propose reconciliation entries, but nothing is posted without your approval.",
          ],
        },
      ],
      confidence: "High for bank and ledger feeds, both synced within the last hour",
      sources: ["Bank Accounts", "General Ledger", "Claims Management System"],
      agents: ["Reconciliation Agent", "Accounting Agent"],
      actions: ["Open Accounting & Reconciliation", "Ask Follow-up"],
    };
  if (p.includes("cash flow") || p.includes("forecast"))
    return {
      intro:
        "On the base case, cash rises from $23.5M today to about $27.4M in 90 days. Inflows average $5.0M a month against outflows of $3.8M.",
      table: [
        ["Month", "Inflows", "Outflows", "Closing cash"],
        ["Nov 2026", "$4.9M", "$3.6M", "$24.8M"],
        ["Dec 2026", "$5.0M", "$3.8M", "$26.0M"],
        ["Jan 2027", "$5.1M", "$3.7M", "$27.4M"],
      ],
      sections: [
        {
          title: "Assumptions",
          items: [
            "Premium collections follow the last 6 months, including current overdue receivables.",
            "Claims payments follow approved settlements and recent payment timing.",
            "Forecast figures are estimates, clearly separate from actual results. Scenarios for higher claims, delayed collections and lower recoveries are in Cash Flow and Forecasting.",
          ],
        },
      ],
      confidence: "Moderate, forecast, depends on collection timing",
      sources: ["Bank Accounts", "Premium Billing System", "Claims Management System"],
      agents: ["Cash Flow Agent"],
      actions: ["Open Cash Flow & Forecasting", "Ask Follow-up"],
    };
  if (
    p.includes("claims") &&
    (p.includes("expense") ||
      p.includes("higher") ||
      p.includes("increase") ||
      p.includes("break down"))
  )
    return {
      intro:
        "Claims paid are $21.8M year to date, up 9.1%, against premium growth of 6.4%. The increase is cost driven, not just volume driven.",
      sections: [
        {
          title: "Breakdown by line",
          items: [
            "Commercial Property: $6.9M paid, severity up on two large fire and water losses.",
            "Auto: $7.1M paid, frequency up, average payment broadly flat.",
            "General Liability: $3.4M paid, in line with plan.",
            "Homeowners and Workers' Compensation make up the remainder.",
          ],
        },
        {
          title: "Why it moved",
          items: [
            "Payment timing: several large Q2 settlements were paid in Q3.",
            "Large losses: CL-45817 at $184,500 is the largest single open settlement.",
            "One payment, CL-45821, differs from its approved settlement and is under review in Finance, not in Claims.",
          ],
        },
        {
          title: "Recommended Actions",
          items: [
            "Prepare a financial variance report for management.",
            "Coordinate with the Claims Agent and Pricing Agent on Property severity.",
          ],
        },
      ],
      confidence: "High for paid amounts, moderate for cause attribution",
      sources: ["Claims Management System", "General Ledger"],
      agents: ["Claims Payments Agent", "Finance Agent"],
      actions: ["Open Claims Payments", "Prepare variance report", "Ask Follow-up"],
    };
  if (p.includes("operating expenses") || p.includes("opex"))
    return {
      intro:
        "Operating expenses are $8.7M year to date, up 3.8%. Most of the increase sits in two categories.",
      sections: [
        {
          title: "What changed",
          items: [
            "Professional services: up $186K, linked to the IFRS 17 reporting project.",
            "Technology: up $92K, new claims platform licences.",
            "People costs and premises are broadly flat against the previous period.",
          ],
        },
        {
          title: "Recommended Actions",
          items: [
            "Review the professional services variance against the project plan before close.",
            "No expense line is outside its approved budget by more than 5%.",
          ],
        },
      ],
      confidence: "High, General Ledger synced 12 minutes ago",
      sources: ["General Ledger", "Accounting / ERP System"],
      agents: ["Accounting Agent"],
      actions: ["Open Accounting & Reconciliation", "Ask Follow-up"],
    };
  if (
    p.includes("profit") ||
    p.includes("underwriting result") ||
    p.includes("products are generating")
  )
    return {
      intro:
        "Professional Liability and General Liability are the most profitable lines relative to premium. Commercial Property earns the most in absolute terms but carries the highest claims cost.",
      table: [
        ["Line", "GWP", "Net underwriting result"],
        ["Commercial Property", "$13.8M", "$1.9M"],
        ["Auto", "$11.6M", "$1.4M"],
        ["General Liability", "$7.4M", "$1.2M"],
        ["Professional Liability", "$5.1M", "$1.1M"],
        ["Homeowners", "$6.3M", "$0.9M"],
        ["Workers' Compensation", "$4.4M", "$0.4M"],
      ],
      confidence: "High for year to date actuals",
      sources: ["General Ledger", "Policy Administration System"],
      agents: ["Finance Agent"],
      actions: ["Ask Follow-up"],
    };
  if (p.includes("unusual") || p.includes("investigate"))
    return {
      intro:
        "I found 3 movements that differ from the pattern of similar records and are worth a look. These are indicators for review, not conclusions.",
      sections: [
        {
          title: "Flagged movements",
          items: [
            "CL-45821 paid $600 below its approved settlement, with no correcting entry yet.",
            "A $1,940 bank receipt has no matching invoice or ledger record.",
            "Commission on WC-77120 is disputed because the amount paid differs from the schedule by $2,756.",
          ],
        },
        {
          title: "Recommended Actions",
          items: [
            "Open each item in its Finance section and review the source record.",
            "Nothing here has been changed or posted by Alfie.",
          ],
        },
      ],
      confidence: "Moderate, pattern based flags",
      sources: ["Bank Accounts", "Claims Management System", "Broker Commission System"],
      agents: ["Reconciliation Agent", "Commission Agent"],
      actions: ["Open Accounting & Reconciliation", "Ask Follow-up"],
    };
  if (p.includes("report") || p.includes("summary for management") || p.includes("monthly"))
    return {
      intro:
        "I have prepared the structure of the Monthly Financial Performance report for October 2026 from this analysis. You can preview and export it in Reports.",
      sections: [
        {
          title: "Report contents",
          items: [
            "Executive summary and financial position.",
            "Revenue, expenses and net underwriting result, with period comparisons.",
            "Variance analysis, including claims payments and operating expenses.",
            "Key findings, data sources, assumptions and limitations.",
          ],
        },
      ],
      confidence: "Draft, requires Finance Review before it is final",
      sources: ["General Ledger", "Premium Billing System", "Claims Management System"],
      agents: ["Financial Reporting Agent"],
      actions: ["Open Reports", "Ask Follow-up"],
    };
  if (p.includes("compare"))
    return {
      intro:
        "Against the previous quarter, premium grew 6.5%, claims paid grew 11.6%, and the net underwriting result improved by $0.4M because earned premium grew faster than incurred claims in Liability lines.",
      sections: summarySections.slice(3, 5),
      confidence: "High for actuals in both quarters",
      sources: ["General Ledger", "Policy Administration System"],
      actions: ["Ask Follow-up"],
    };
  return {
    intro:
      "I've reviewed the available financial records for the reporting period. Here is an overview of the organization's financial performance.",
    sections: summarySections,
    confidence: "High for actuals, moderate for flagged items",
    limitations: [
      "Broker Commission System last synced 2 hours ago.",
      "Figures are illustrative sample data until connected systems are verified.",
    ],
    sources: [
      "General Ledger",
      "Accounting / ERP System",
      "Policy Administration System",
      "Claims Management System",
      "Bank Accounts",
    ],
    agents: ["Finance Agent", "Accounting Agent", "Reconciliation Agent"],
    actions: [
      "Open Premium & Receivables",
      "Open Accounting & Reconciliation",
      "Open Reports",
      "Ask Follow-up",
    ],
  };
}

function FinanceAnalysis() {
  const { q } = Route.useSearch();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [prompt, setPrompt] = useState("");
  const [rightOpen, setRightOpen] = useState(true);
  const [repoFile, setRepoFile] = useState<Attachment | null>(null);
  const [repoDone, setRepoDone] = useState<string[]>([]);
  const started = useRef(false);

  const ask = (text: string, files: Attachment[] = []) => {
    if (!text.trim() && files.length === 0) return;
    const question = text.trim() || "Analyze the attached files.";
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", text: question, files },
      { id: crypto.randomUUID(), role: "alfie", reply: replyFor(question, files) },
    ]);
    setPrompt("");
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (q) ask(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onAction = (action: string, reply: Reply) => {
    if (action === "Add to repository") {
      const f = messages.flatMap((m) => m.files ?? [])[0];
      if (f) setRepoFile(f);
      return;
    }
    if (action === "Ask Follow-up") return;
    return;
  };

  const rightPanel = (
    <aside
      className={`${rightOpen ? "flex" : "hidden"} absolute inset-y-0 right-0 z-20 w-[320px] flex-col overflow-y-auto border-l border-border bg-panel p-5 shadow-workspace xl:relative xl:flex xl:shadow-none`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Financial context</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRightOpen(false)}
          className="xl:hidden"
          aria-label="Close context panel"
        >
          <PanelRightClose className="size-4" />
        </Button>
      </div>

      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Analysis details
      </p>
      <dl className="space-y-2 text-xs">
        {[
          ["Analysis", "Monthly Financial Performance Analysis"],
          ["Analysis ID", "FIN-2026-014"],
          ["Reporting period", "October 2026"],
          ["Financial entity", "Northstar Mutual"],
          ["Currency", "USD"],
          ["Created by", "Jane Doe"],
          ["Date created", "Nov 04, 2026"],
          ["Last updated", "Nov 04, 2026, 09:24"],
          ["Status", "In progress"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mb-2 mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Financial summary
      </p>
      <dl className="space-y-2 text-xs">
        {[
          ["Gross Written Premium", "$48.6M"],
          ["Earned Premium", "$46.3M"],
          ["Claims Paid", "$21.8M"],
          ["Claims Incurred", "$29.2M"],
          ["Operating Expenses", "$8.7M"],
          ["Outstanding Receivables", "$4.2M"],
          ["Outstanding Payables", "$3.8M"],
          ["Net Underwriting Result", "$6.4M"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mb-2 mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Data sources
      </p>
      <div className="space-y-2">
        {financeSources.map((s) => (
          <div key={s.name} className="flex items-start gap-2 text-xs">
            <Database className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>
              <span className="block font-medium">{s.name}</span>
              <span className="text-[12px] text-muted-foreground">
                {s.status}, synced {s.sync}
              </span>
            </span>
          </div>
        ))}
      </div>

      <p className="mb-2 mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Key findings
      </p>
      <ul className="list-disc space-y-1.5 pl-4 text-xs leading-5">
        <li>Claims paid up 9.1%, ahead of premium growth.</li>
        <li>$612K of receivables are overdue.</li>
        <li>One claims payment differs from its approved settlement.</li>
        <li>One possible duplicate payment needs review.</li>
      </ul>

      <p className="mb-2 mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Analysis workflow
      </p>
      <ol className="space-y-2">
        {workflow.map((step, i) => (
          <li key={step} className="flex items-center gap-2 text-xs">
            {i < currentStage ? (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-2.5" />
              </span>
            ) : i === currentStage ? (
              <span className="flex size-4 items-center justify-center rounded-full border-2 border-primary" />
            ) : (
              <Circle className="size-4 text-muted-foreground" />
            )}
            <span
              className={
                i === currentStage
                  ? "font-semibold"
                  : i < currentStage
                    ? ""
                    : "text-muted-foreground"
              }
            >
              {step}
            </span>
            {i === currentStage ? (
              <span className="ml-auto text-[12px] text-primary">Current</span>
            ) : null}
          </li>
        ))}
      </ol>

      <details className="mt-6 border-t border-border pt-4">
        <summary className="flex cursor-pointer items-center gap-1 text-xs font-semibold">
          Audit trail <ChevronDown className="size-3.5" />
        </summary>
        <div className="mt-3 space-y-3">
          {financeAudit.map((e) => (
            <div key={`${e.time}-${e.action}`} className="text-[13px]">
              <p className="font-medium">{e.action}</p>
              <p className="text-muted-foreground">
                {e.actor}, {e.type} · {e.time}
              </p>
              <p className="text-muted-foreground">{e.detail}</p>
            </div>
          ))}
        </div>
      </details>
      <p className="mt-auto border-t border-border pt-4 text-[12px] leading-4 text-muted-foreground">
        Alfie prepares and recommends. Payments, postings and period closures need the configured
        permissions and approvals, and are never done silently.
      </p>
    </aside>
  );

  return (
    <AppShell rightPanel={rightPanel}>
      <div className="mx-auto flex min-h-full max-w-4xl flex-col px-5 pb-8 pt-8 lg:px-10">
        <div className="mb-4">
          <FinanceNav />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Finance · FIN-2026-014</p>
            <h1 className="mt-1 text-2xl font-semibold">Monthly Financial Performance Analysis</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Reviewing financial performance, premium receipts, claims payments, operating
              expenses, and outstanding balances.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/finance/reports">
                <Download className="size-3.5" /> Export
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRightOpen((v) => !v)}
              className="xl:hidden"
              aria-label="Toggle context panel"
            >
              {rightOpen ? (
                <PanelRightClose className="size-4" />
              ) : (
                <PanelRightOpen className="size-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <SampleDataNote />
        </div>

        <div className="mt-6 flex-1 space-y-5">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-border bg-panel p-5 text-center">
              <AlfieMark className="mx-auto mb-3 size-9 rounded-lg" />
              <h2 className="text-base font-semibold">Start a financial analysis</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Ask about financial position, premium, claims payments, expenses, receivables,
                reconciliation or cash flow. Attach statements, receivables, payment reports,
                commission schedules or ledger exports.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "Give me a summary of our financial position.",
                  "Identify unreconciled transactions.",
                  "Forecast our cash flow for the next 90 days.",
                ].map((p) => (
                  <Button key={p} variant="secondary" size="sm" onClick={() => ask(p)}>
                    <Sparkle className="size-3 text-primary" /> {p}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="ml-auto max-w-[85%]">
                <div className="rounded-2xl rounded-br-md bg-secondary px-4 py-3 text-sm">
                  {m.text}
                </div>
                {m.files?.length ? (
                  <div className="mt-2 flex flex-wrap justify-end gap-2">
                    {m.files.map((f) => (
                      <AttachmentChip key={f.id} file={f} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : m.reply ? (
              <div key={m.id} className="max-w-[92%]">
                <div className="mb-2 flex items-center gap-2">
                  <AlfieMark className="size-6 rounded-md" />
                  <span className="text-xs font-semibold">Alfie</span>
                  {m.reply.agents ? (
                    <span className="text-[12px] text-muted-foreground">
                      via {m.reply.agents.join(", ")}
                    </span>
                  ) : null}
                </div>
                <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3.5 text-sm leading-6">
                  <p>{m.reply.intro}</p>
                  {m.reply.table ? (
                    <div className="mt-3 overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-secondary/60 text-left">
                            {(m.reply.table[0] ?? []).map((h) => (
                              <th key={h} className="px-3 py-2 font-medium">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.reply.table.slice(1).map((row) => (
                            <tr key={row.join("-")} className="border-t border-border">
                              {row.map((c, i) => (
                                <td key={i} className={`px-3 py-2 ${i === 0 ? "font-medium" : ""}`}>
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {m.reply.sections?.map((s) => (
                    <div key={s.title} className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide">{s.title}</h3>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5">
                        {s.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {m.reply.confidence ? (
                    <p className="mt-4 border-t border-border pt-3 text-[13px] text-muted-foreground">
                      Confidence: {m.reply.confidence}
                    </p>
                  ) : null}
                  {m.reply.limitations?.length ? (
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Limitations: {m.reply.limitations.join(" ")}
                    </p>
                  ) : null}
                  {m.reply.sources?.length ? (
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      Sources: {m.reply.sources.join(", ")}
                    </p>
                  ) : null}
                  {repoDone.length && m.reply.actions?.includes("Add to repository") ? (
                    <p className="mt-2 text-[13px] text-positive">
                      Added to the organizational repository: {repoDone.join(", ")}
                    </p>
                  ) : null}
                  {m.reply.actions ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.reply.actions.map((a) =>
                        a.startsWith("Open ") ? (
                          <Button key={a} size="sm" variant="outline" asChild>
                            <Link
                              to={
                                a.includes("Receivables")
                                  ? "/finance/receivables"
                                  : a.includes("Accounting")
                                    ? "/finance/accounting"
                                    : a.includes("Claims Payments")
                                      ? "/finance/claims-payments"
                                      : a.includes("Cash Flow")
                                        ? "/finance/cash-flow"
                                        : "/finance/reports"
                              }
                            >
                              {a}
                            </Link>
                          </Button>
                        ) : a === "Prepare payment reminders" || a === "Prepare variance report" ? (
                          <Button key={a} size="sm" variant="outline" onClick={() => ask(a)}>
                            {a}
                          </Button>
                        ) : (
                          <Button
                            key={a}
                            size="sm"
                            variant="outline"
                            onClick={() => onAction(a, m.reply!)}
                          >
                            {a}
                          </Button>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null,
          )}
        </div>

        <div className="sticky bottom-0 mt-6 bg-background pb-1 pt-2">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {followUps.map((f) => (
              <button
                key={f}
                onClick={() => ask(f)}
                className="rounded-full border border-border px-2.5 py-1 text-[13px] text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {f}
              </button>
            ))}
          </div>
          <AlfieComposer
            value={prompt}
            onChange={setPrompt}
            onSend={ask}
            placeholder="Ask a follow-up, or attach financial statements, receivables, payment reports or ledger exports..."
          />
          <p className="mt-1.5 text-center text-[12px] text-muted-foreground">
            Example attachments: Q3 Financial Statements.xlsx, Premium Receivables.csv, Claims
            Payments Report.xlsx, Broker Commission Schedule.pdf, Bank Reconciliation.xlsx, General
            Ledger Export.csv
          </p>
        </div>
      </div>

      <Dialog
        open={!!repoFile}
        onOpenChange={(open) => {
          if (!open) setRepoFile(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to organizational repository?</DialogTitle>
            <DialogDescription>
              {repoFile?.name} is currently a conversation attachment only. Adding it will keep it
              in the permanent organizational repository, visible under the organization&apos;s
              document permissions. This cannot be undone from here.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRepoFile(null)}>
              Keep as attachment only
            </Button>
            <Button
              onClick={() => {
                if (repoFile) setRepoDone((d) => [...d, repoFile.name]);
                setRepoFile(null);
              }}
            >
              Add to repository
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
