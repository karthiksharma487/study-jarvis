import type { ComponentProps, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { cn, formatPct, subjectKey } from "@/lib/utils";
import type { ChapterStatus, ItemStatus, Priority } from "@/lib/study/types";
import { CHAPTER_STATUS_LABEL, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/study/labels";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-card px-6 py-16 text-center shadow-[var(--shadow-border)]">
      <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Inbox className="size-5" strokeWidth={1.6} />
      </div>
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Surface({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-xl bg-card p-5 shadow-[var(--shadow-border)] sm:p-6", className)}>{children}</section>;
}

export function StatusBadge({ status }: { status: ItemStatus }) {
  const variant = status === "completed" ? "success" : status === "in_progress" ? "primary" : "outline";
  return <Badge variant={variant}>{STATUS_LABEL[status]}</Badge>;
}

export function ChapterStatusBadge({ status }: { status: ChapterStatus }) {
  const variant =
    status === "completed" || status === "strong"
      ? "success"
      : status === "needs_revision"
        ? "warning"
        : status === "in_progress"
          ? "primary"
          : "outline";
  return <Badge variant={variant}>{CHAPTER_STATUS_LABEL[status]}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const variant = priority === "critical" ? "danger" : priority === "high" ? "warning" : "outline";
  return <Badge variant={variant}>{PRIORITY_LABEL[priority]}</Badge>;
}

export function SubjectChip({ name }: { name: string }) {
  const key = subjectKey(name);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className="size-1.5 rounded-full"
        style={{ background: `var(--subject-${key})` }}
        aria-hidden
      />
      {name}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl tabular-nums tracking-tight text-foreground sm:text-2xl">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ProgressRow({
  label,
  done,
  total,
  pct,
}: {
  label: string;
  done: number;
  total: number;
  pct: number | null;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-foreground">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {done}/{total} · {formatPct(pct)}
        </span>
      </div>
      <Progress value={pct ?? 0} />
    </div>
  );
}

export function FilterPills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium transition-colors",
              active ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-sm font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}

export function RowButton({
  onClick,
  children,
  className,
}: {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/70",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function GhostAction(props: ComponentProps<typeof Button>) {
  return <Button variant="outline" size="sm" {...props} />;
}
