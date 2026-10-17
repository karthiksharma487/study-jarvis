import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { testPercentage } from "@/lib/study/progress";
import { formatPct } from "@/lib/utils";
import { EmptyState, PageHeader, Surface } from "@/components/app/shared";
import { kindLabel } from "@/lib/study/labels";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tests")({ component: TestsPage });

function TestsPage() {
  const data = useStudyStore();
  const deleteTest = useStudyStore((s) => s.deleteTest);
  const rows = data.tests;
  const avg =
    rows.length === 0
      ? null
      : Math.round(
          rows.reduce((a, t) => a + (testPercentage(t) ?? 0), 0) / rows.length,
        );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Work"
        title="Tests"
        description="Marks, percentage (calculated), analysis. Log a test with Add. Trends appear once more than one result exists."
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Logged</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{rows.length}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Average %</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{avg === null ? "—" : `${avg}%`}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Latest</p>
          <p className="mt-1 text-sm">{rows[0] ? `${rows[0].name} · ${formatPct(testPercentage(rows[0]))}` : "—"}</p>
        </Surface>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No tests yet" description="When you sit a mock or chapter test, log marks here. Percentage is never entered by hand." />
      ) : (
        <Surface className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {rows.map((t) => (
              <li key={t.id} className="px-4 py-3 sm:px-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.date} · {kindLabel(t.kind)}
                      {t.subjectId ? ` · ${data.subjects.find((s) => s.id === t.subjectId)?.name}` : ""}
                    </p>
                  </div>
                  <p className="font-mono text-sm tabular-nums">
                    {t.marks}/{t.maxMarks} · {formatPct(testPercentage(t))}
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => deleteTest(t.id)}>
                    Remove
                  </Button>
                </div>
                {t.analysis ? <p className="mt-2 text-sm text-muted-foreground">{t.analysis}</p> : null}
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}
