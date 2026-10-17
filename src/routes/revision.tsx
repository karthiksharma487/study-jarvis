import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { revisionDue } from "@/lib/study/progress";
import { todayKey } from "@/lib/utils";
import { EmptyState, PageHeader, Surface } from "@/components/app/shared";
import { kindLabel } from "@/lib/study/labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Strength } from "@/lib/study/types";

export const Route = createFileRoute("/revision")({ component: RevisionPage });

function RevisionPage() {
  const data = useStudyStore();
  const markRevised = useStudyStore((s) => s.markRevised);
  const deleteRevision = useStudyStore((s) => s.deleteRevision);
  const due = revisionDue(data.revisions, todayKey());
  const recent = [...data.revisions].sort((a, b) => b.lastRevised.localeCompare(a.lastRevised)).slice(0, 8);

  function Row({
    id,
    title,
    meta,
    badge,
  }: {
    id: string;
    title: string;
    meta: string;
    badge?: string;
  }) {
    const item = data.revisions.find((r) => r.id === id);
    return (
      <li className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
        {badge ? <Badge variant="warning">{badge}</Badge> : null}
        <div className="flex flex-wrap gap-1">
          {(["weak", "developing", "good", "strong"] as Strength[]).map((st) => (
            <Button key={st} size="sm" variant={item?.strength === st ? "secondary" : "ghost"} onClick={() => markRevised(id, st)}>
              {kindLabel(st)}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => deleteRevision(id)}>
            Remove
          </Button>
        </div>
      </li>
    );
  }

  const empty = data.revisions.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Work"
        title="Revision"
        description="Spaced reviews: 1, 3, 7, 14, 30 days. Completing a lecture creates the first pass automatically."
      />
      {empty ? (
        <EmptyState
          title="Nothing to revise yet"
          description="Mark a lecture complete and a review will be scheduled. You can also add a topic from Add."
        />
      ) : (
        <div className="space-y-4">
          <Surface>
            <h2 className="text-sm font-semibold">Overdue</h2>
            {due.overdue.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">None.</p>
            ) : (
              <ul className="divide-y divide-border">
                {due.overdue.map((r) => (
                  <Row
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    meta={`${data.subjects.find((s) => s.id === r.subjectId)?.name ?? ""} · due ${r.nextRevision} · ${r.count} passes`}
                    badge="Overdue"
                  />
                ))}
              </ul>
            )}
          </Surface>
          <Surface>
            <h2 className="text-sm font-semibold">Due today</h2>
            {due.today.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">None today.</p>
            ) : (
              <ul className="divide-y divide-border">
                {due.today.map((r) => (
                  <Row
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    meta={`${data.subjects.find((s) => s.id === r.subjectId)?.name ?? ""} · ${kindLabel(r.strength)}`}
                  />
                ))}
              </ul>
            )}
          </Surface>
          <Surface>
            <h2 className="text-sm font-semibold">This week</h2>
            {due.week.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nothing else this week.</p>
            ) : (
              <ul className="divide-y divide-border">
                {due.week.map((r) => (
                  <Row
                    key={r.id}
                    id={r.id}
                    title={r.title}
                    meta={`Next ${r.nextRevision} · ${kindLabel(r.strength)}`}
                  />
                ))}
              </ul>
            )}
          </Surface>
          <Surface>
            <h2 className="text-sm font-semibold">Recently revised</h2>
            <ul className="divide-y divide-border">
              {recent.map((r) => (
                <li key={r.id} className="flex justify-between gap-2 py-2 text-sm">
                  <span>{r.title}</span>
                  <span className="text-xs text-muted-foreground">{kindLabel(r.strength)}</span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>
      )}
    </div>
  );
}
