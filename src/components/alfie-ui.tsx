import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

/*
 * Shared building blocks for the Alfie workbench pattern.
 *
 * AlfieMark and AlfieChip are the only places the brand gradient appears as
 * an identity marker: if the gradient is on it, Alfie made it or is speaking.
 * PageHeader and SectionLabel give every module the same page scaffolding so
 * moving between modules feels like moving between files in one system.
 */

export function AlfieMark({ className = "size-7 rounded-lg" }: { className?: string }) {
  return (
    <span className={`alfie-gradient flex shrink-0 items-center justify-center text-white ${className}`} aria-hidden="true">
      <Sparkles className="size-[55%]" />
    </span>
  );
}

export function AlfieChip({ label = "Alfie" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background py-0.5 pl-1 pr-2 text-[13px] font-medium">
      <span className="alfie-gradient flex size-4 items-center justify-center rounded-full text-white" aria-hidden="true">
        <Sparkles className="size-2.5" />
      </span>
      {label}
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p> : null}
        <h1 className={`${eyebrow ? "mt-1 " : ""}text-2xl font-semibold tracking-tight`}>{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{children}</p>;
}

export function AlfiePanelHeader({ context, title = "Alfie" }: { context: string; title?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <AlfieMark className="size-8 rounded-lg" />
      <div>
        <p className="text-sm font-semibold leading-5">{title}</p>
        <p className="text-[13px] leading-4 text-muted-foreground">{context}</p>
      </div>
    </div>
  );
}

const chipTones = {
  active: "bg-status-active text-status-active-foreground",
  paused: "bg-status-paused text-status-paused-foreground",
  neutral: "bg-secondary text-secondary-foreground",
  danger: "bg-destructive/10 text-destructive",
} as const;

export function StatusChip({ tone = "neutral", children }: { tone?: keyof typeof chipTones; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${chipTones[tone]}`}>{children}</span>;
}

/*
 * The review bar is the one place a human decision is asked for on a file:
 * what is pending, why it needs a person, and the actions that resolve it.
 * Every module renders approvals through this bar so review feels the same
 * on a claim, a submission, or a rate change.
 */
export function ReviewBar({ status, title, detail, children }: { status: string; title: string; detail?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip tone="paused">{status}</StatusChip>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        {detail ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p> : null}
      </div>
      {children ? <div className="flex items-center gap-2">{children}</div> : null}
    </div>
  );
}
