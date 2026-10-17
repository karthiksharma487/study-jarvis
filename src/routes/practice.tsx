import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { practiceAccuracy } from "@/lib/study/progress";
import { formatPct } from "@/lib/utils";
import { EmptyState, PageHeader, Surface } from "@/components/app/shared";
import { kindLabel } from "@/lib/study/labels";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/practice")({ component: PracticePage });

function PracticePage() {
  const data = useStudyStore();
  const deletePractice = useStudyStore((s) => s.deletePractice);
  const rows = data.practice;
  const acc = practiceAccuracy(rows);
  const attempted = rows.reduce((a, r) => a + r.attempted, 0);
  const bySubject = data.subjects.map((s) => {
    const list = rows.filter((r) => r.subjectId === s.id);
    return { s, acc: practiceAccuracy(list), n: list.reduce((a, r) => a + r.attempted, 0) };
  });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Work"
        title="Practice"
        description="Questions attempted, correct, incorrect, skipped. Accuracy is calculated — never typed in."
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Accuracy</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatPct(acc)}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Questions</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{attempted}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Sessions</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{rows.length}</p>
        </Surface>
      </div>
      <Surface className="mb-4">
        <h2 className="mb-3 text-sm font-semibold">By subject</h2>
        <ul className="space-y-2 text-sm">
          {bySubject.map(({ s, acc: a, n }) => (
            <li key={s.id} className="flex justify-between">
              <span>{s.name}</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {n} q · {formatPct(a)}
              </span>
            </li>
          ))}
        </ul>
      </Surface>
      {rows.length === 0 ? (
        <EmptyState
          title="No practice logged"
          description="Use Add → Practice after a problem set. Accuracy appears as soon as you enter counts."
        />
      ) : (
        <Surface className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {rows.map((r) => {
              const a = r.attempted ? Math.round((r.correct / r.attempted) * 100) : null;
              return (
                <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {data.subjects.find((s) => s.id === r.subjectId)?.name} · {kindLabel(r.examKind)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.date} · {r.correct}/{r.attempted} correct · {r.incorrect} wrong · {r.skipped} skipped
                      {r.source ? ` · ${r.source}` : ""} · {r.timeMin}m
                    </p>
                  </div>
                  <span className="font-mono text-sm tabular-nums">{formatPct(a)}</span>
                  <Button size="sm" variant="ghost" onClick={() => deletePractice(r.id)}>
                    Remove
                  </Button>
                </li>
              );
            })}
          </ul>
        </Surface>
      )}
    </div>
  );
}
