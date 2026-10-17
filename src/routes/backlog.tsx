import { LectureCheckbox } from "@/components/app/lecture-checkbox";
import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { backlogCounts, currentPhase, isDelivered } from "@/lib/study/progress";
import { todayKey } from "@/lib/utils";
import { PageHeader, ProgressRow, Stat, StatusBadge, Surface } from "@/components/app/shared";
import type { Chapter, Lecture } from "@/lib/study/types";

export const Route = createFileRoute("/backlog")({ component: BacklogPage });

function ChapterGroup({ chapter, lectures }: { chapter: Chapter; lectures: Lecture[] }) {
  const today = todayKey();
  const ticks = useStudyStore((s) => s.lectureTicks);
  const due = lectures.filter((l) => isDelivered(l, today));
  const doneCount = due.filter((l) => ticks?.[l.id] === true).length;
  if (lectures.length === 0) return null;
  return (
    <details className="group mb-2 rounded-lg border border-border bg-card" open={doneCount < due.length}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{chapter.name}</p>
          <p className="text-xs text-muted-foreground">
            {due.length} delivered so far · {doneCount} watched{due.length > 0 && doneCount === due.length ? " · Complete" : ""}
            {lectures.length > due.length ? ` · ${lectures.length - due.length} upcoming` : ""}
          </p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground group-open:hidden">Expand</span>
      </summary>
      <ul className="divide-y divide-border border-t border-border">
        {lectures.map((l) => {
          const isDue = isDelivered(l, today);
          return (
            <li key={l.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{l.title}</p>
                <p className="text-xs text-muted-foreground">
                  {l.plannedDate} {!isDue ? "· upcoming" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={l.status} />
                <LectureCheckbox lecture={l} />
              </div>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function SubjectSection({ subjectId, subjectName }: { subjectId: string; subjectName: string }) {
  const chapters = useStudyStore((s) => s.chapters);
  const lectures = useStudyStore((s) => s.lectures);
  const subjectChapters = useMemo(
    () => chapters.filter((c) => c.subjectId === subjectId).sort((a, b) => a.order - b.order),
    [chapters, subjectId],
  );
  return (
    <Surface className="mb-4">
      <h2 className="mb-3 text-sm font-semibold tracking-tight">{subjectName}</h2>
      {subjectChapters.map((c) => (
        <ChapterGroup key={c.id} chapter={c} lectures={lectures.filter((l) => l.chapterId === c.id)} />
      ))}
    </Surface>
  );
}

function BacklogPage() {
  const data = useStudyStore();
  const counts = backlogCounts(data);
  const phase = currentPhase(data);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Mission JEE — Drona JEE 2.0"
        title="Backlog"
        description="Every real class from your batch schedule, grouped by chapter. A lecture becomes backlog the day it's actually delivered."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Surface>
          <Stat label="Lectures remaining" value={`${counts.lectures.remaining}`} hint={`${counts.lectures.done} of ${counts.lectures.total} watched`} />
        </Surface>
        <Surface>
          <Stat label="PDFs to read" value={`${counts.pdfs.remaining}`} hint={`${counts.pdfs.done} of ${counts.pdfs.total} done`} />
        </Surface>
        <Surface>
          <Stat label="Upcoming" value={`${counts.upcoming.total}`} hint="Scheduled ahead, not due yet" />
        </Surface>
      </div>
      <Surface className="mb-4">
        <p className="text-sm font-medium">{phase.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{phase.detail}</p>
        <div className="mt-4 space-y-3">
          {data.subjects.map((s) => {
            const b = counts.bySubject(s.id);
            return (
              <ProgressRow
                key={s.id}
                label={`${s.name} lectures`}
                done={b.lectures.done}
                total={b.lectures.total}
                pct={b.lectures.pct}
              />
            );
          })}
        </div>
      </Surface>
      {data.subjects.map((s) => (
        <SubjectSection key={s.id} subjectId={s.id} subjectName={s.name} />
      ))}
    </div>
  );
}
