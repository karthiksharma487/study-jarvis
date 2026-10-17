import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { courseProgress, currentPhase, lecturesOf, resourcesOf, subjectProgress } from "@/lib/study/progress";
import { EmptyState, PageHeader, ProgressRow, StatusBadge, Surface } from "@/components/app/shared";

export const Route = createFileRoute("/courses/$courseId")({ component: CourseDetail });

function CourseDetail() {
  const { courseId } = Route.useParams();
  const data = useStudyStore();
  const course = data.courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Course not found" description="It may have been removed." action={<Link to="/courses">Back to courses</Link>} />
      </div>
    );
  }
  const p = courseProgress(data, course.id);
  const subjects = data.subjects.filter((s) => s.courseIds.includes(course.id));
  const lectures = lecturesOf(data, { courseId: course.id });
  const resources = resourcesOf(data, { courseId: course.id });
  const recent = data.activities.filter((a) => a.kind === "lecture" || a.kind === "resource").slice(0, 6);
  const phase = currentPhase(data);
  const current =
    lectures.find((l) => l.status === "in_progress") ?? lectures.find((l) => l.status === "not_started");
  const remaining = lectures.filter((l) => l.status !== "completed").slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Course" title={course.name} description={course.description} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Surface className="lg:col-span-2">
          <ProgressRow label="Overall" done={p.done} total={p.total} pct={p.pct} />
          <p className="mt-4 text-sm text-muted-foreground">{phase.label} · {phase.detail}</p>
          {current ? (
            <p className="mt-3 text-sm">
              Current: <span className="font-medium">{current.title}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No remaining lectures in this course.</p>
          )}
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Contents</p>
          <p className="mt-2 font-mono text-lg tabular-nums">
            {lectures.length} lectures · {resources.length} resources
          </p>
        </Surface>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Subjects</h2>
          <div className="space-y-4">
            {subjects.map((s) => {
              const sp = subjectProgress(data, s.id);
              return (
                <Link key={s.id} to="/subjects/$subjectId" params={{ subjectId: s.id }} className="block">
                  <ProgressRow label={s.name} done={sp.done} total={sp.total} pct={sp.pct} />
                </Link>
              );
            })}
          </div>
        </Surface>
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Upcoming</h2>
          {remaining.length === 0 ? (
            <p className="text-sm text-muted-foreground">Caught up.</p>
          ) : (
            <ul className="space-y-2">
              {remaining.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{l.title}</span>
                  <StatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
      <Surface className="mt-4">
        <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recent.map((a) => (
              <li key={a.id}>{a.text}</li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  );
}
