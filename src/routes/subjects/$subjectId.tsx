import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import {
  chapterProgress,
  deriveChapterStatus,
  lecturesOf,
  practiceAccuracy,
  resourcesOf,
  subjectProgress,
} from "@/lib/study/progress";
import { formatDuration, formatPct, subjectKey } from "@/lib/utils";
import { ChapterStatusBadge, EmptyState, PageHeader, ProgressRow, StatusBadge, Surface } from "@/components/app/shared";
import { StatusCycle } from "@/components/app/status-cycle";

export const Route = createFileRoute("/subjects/$subjectId")({ component: SubjectDetail });

function SubjectDetail() {
  const { subjectId } = Route.useParams();
  const data = useStudyStore();
  const setLectureStatus = useStudyStore((s) => s.setLectureStatus);
  const subject = data.subjects.find((s) => s.id === subjectId);
  if (!subject) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Subject not found" description="Choose another subject." action={<Link to="/subjects">Subjects</Link>} />
      </div>
    );
  }
  const p = subjectProgress(data, subject.id);
  const chapters = data.chapters.filter((c) => c.subjectId === subject.id).sort((a, b) => a.order - b.order);
  const lectures = lecturesOf(data, { subjectId: subject.id });
  const resources = resourcesOf(data, { subjectId: subject.id });
  const practice = data.practice.filter((x) => x.subjectId === subject.id);
  const minutes = data.sessions.filter((x) => x.subjectId === subject.id).reduce((a, x) => a + x.durationMin, 0);
  const tests = data.tests.filter((t) => t.subjectId === subject.id);
  const revisions = data.revisions.filter((r) => r.subjectId === subject.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Subject"
        title={subject.name}
        description="Chapters, lectures, resources, practice, revision, and time in one place."
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Progress</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatPct(p.pct)}</p>
          <p className="text-xs text-muted-foreground">
            {p.done}/{p.total} items
          </p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Study time</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatDuration(minutes)}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Practice accuracy</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatPct(practiceAccuracy(practice))}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Tests logged</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{tests.length}</p>
        </Surface>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Surface>
            <h2 className="mb-3 text-sm font-semibold">Chapters</h2>
            {chapters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No chapters yet.</p>
            ) : (
              <ul className="space-y-3">
                {chapters.map((c) => {
                  const cp = chapterProgress(data, c.id);
                  const st = deriveChapterStatus(data, c);
                  return (
                    <li key={c.id}>
                      <Link to="/chapters/$chapterId" params={{ chapterId: c.id }} className="block">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{c.name}</span>
                          <ChapterStatusBadge status={st} />
                        </div>
                        <ProgressRow label="" done={cp.done} total={cp.total} pct={cp.pct} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Surface>
          <Surface>
            <h2 className="mb-3 text-sm font-semibold">Lectures</h2>
            <ul className="divide-y divide-border">
              {lectures.map((l) => (
                <li key={l.id} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{l.title}</p>
                    <StatusBadge status={l.status} />
                  </div>
                  <StatusCycle status={l.status} onChange={(st) => setLectureStatus(l.id, st)} />
                </li>
              ))}
            </ul>
          </Surface>
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Surface>
            <h2 className="mb-3 text-sm font-semibold">Resources</h2>
            <p className="text-sm text-muted-foreground">
              {resources.filter((r) => r.status === "completed").length}/{resources.length} completed
            </p>
          </Surface>
          <Surface>
            <h2 className="mb-3 text-sm font-semibold">Revision</h2>
            {revisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Completing a lecture schedules a first review.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {revisions.slice(0, 8).map((r) => (
                  <li key={r.id} className="flex justify-between gap-2">
                    <span className="truncate">{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.nextRevision}</span>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
          <span className="sr-only">{subjectKey(subject.name)}</span>
        </div>
      </div>
    </div>
  );
}
