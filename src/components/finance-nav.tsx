import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Info } from "lucide-react";

const tabs = [
  ["Overview", "/finance"],
  ["Financial Analysis", "/finance/analysis"],
  ["Premium & Receivables", "/finance/receivables"],
  ["Claims Payments", "/finance/claims-payments"],
  ["Commissions", "/finance/commissions"],
  ["Reinsurance", "/finance/reinsurance"],
  ["Accounting & Reconciliation", "/finance/accounting"],
  ["Cash Flow & Forecasting", "/finance/cash-flow"],
  ["Reports", "/finance/reports"],
  ["Financial Close", "/finance/close"],
] as const;

export function FinanceNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Finance sections"
      className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto border-b border-border px-1"
    >
      {tabs.map(([label, to]) => {
        const active =
          to === "/finance" ? path === "/finance" || path === "/finance/" : path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-sm transition-colors ${active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SampleDataNote({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <Info className="size-3 shrink-0" />
      {children ??
        "Illustrative sample data, not verified financial records until connected to your systems."}
    </p>
  );
}

export function FinanceHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Finance</p>
          <h1 className="mt-1 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <FinanceNav />
    </div>
  );
}

export const card = "rounded-2xl border border-border bg-card";
export const selectCls =
  "h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring";
