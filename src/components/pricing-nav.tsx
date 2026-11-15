import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Info } from "lucide-react";

const tabs = [
  ["Overview", "/pricing"],
  ["Pricing Analysis", "/pricing/analysis"],
  ["Actuarial Analysis", "/pricing/actuarial"],
  ["Scenario Modeling", "/pricing/scenarios"],
  ["Pricing Models", "/pricing/models"],
  ["Rate Reviews", "/pricing/reviews"],
  ["Reports", "/pricing/reports"],
] as const;

export function PricingNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return <nav aria-label="Pricing & Actuarial sections" className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b border-border px-1">
    {tabs.map(([label, to]) => { const active = to === "/pricing" ? path === "/pricing" || path === "/pricing/" : path.startsWith(to);
      return <Link key={to} to={to} className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-sm transition-colors ${active ? "border-primary font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</Link>; })}
  </nav>;
}

export function SampleDataNote({ children }: { children?: ReactNode }) {
  return <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Info className="size-3 shrink-0" />{children ?? "Illustrative sample data — not verified insurer data until connected to your systems."}</p>;
}

export function PricingHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return <div className="space-y-5">
    <div className="flex flex-wrap items-end justify-between gap-4"><div>{title !== "Pricing & Actuarial" ? <p className="text-xs font-medium text-muted-foreground">Pricing & Actuarial</p> : null}<h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p></div>{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}</div>
    <PricingNav />
  </div>;
}

export const card = "rounded-2xl border border-border bg-card";
export const selectCls = "select-chevron h-8 rounded-lg border border-border bg-background pl-2.5 text-xs text-foreground outline-none focus:border-ring";
