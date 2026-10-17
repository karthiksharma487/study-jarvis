import { LectureCheckbox } from "@/components/app/lecture-checkbox";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { currentPhase, isDelivered, lecturesOf, studyMinutes, subjectProgress } from "@/lib/study/progress";
import { recommendNext } from "@/lib/study/next-action";
import { formatDuration, todayKey, startOfWeek } from "@/lib/utils";
import { PageHeader, ProgressRow, Stat, StatusBadge, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/study")({ component: MyStudy });

function MyStudy() {
  const data = useStudyStore();
  const addSession = useStudyStore((s) => s.addSession);
  const phase = currentPhase(data);
  const next = recommendNext(data);
  const today = todayKey();
  const weekStart = todayKey(startOfWeek(new Date(), data.settings.weekStartsOn));
  const [mins, setMins] = useState("60");
  const inProgress = data.lectures.filter((l) => l.status === "in_progress");
  const pipeline = data.lectures
    .filter((l) => l.status !== "completed" && isDelivered(l, today))
    .sort((a, b) => (a.plannedDate ?? "").localeCompare(b.plannedDate ?? ""))
    .slice(0, 8);
  const nextLectureId = next.action?.type === "open-lecture" ? next.action.id : undefined;
  const nextLecture = nextLectureId ? data.lectures.find((l) => l.id === nextLectureId) : undefined;
  const recentSessions = data.sessions.slice(0, 6);

  function log(durationMin: number) {
    addSession({
      date: today,
      durationMin,
      activity: "lecture",
      notes: "Quick log from My Study",
    });
    toast.success(`Logged ${durationMin} minutes`);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Workspace"
        title="My Study"
        description="The current path, the next lecture, and a fast way to log time — without a forced timer."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Surface className="lg:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{phase.label}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{next.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{next.detail}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {nextLecture ? (
              <LectureCheckbox lecture={nextLecture} />
            ) : (
              <Button asChild>
                <Link to={next.href}>Open</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to="/backlog">Backlog</Link>
            </Button>
          </div>
        </Surface>
        <Surface>
          <Stat label="Today" value={formatDuration(studyMinutes(data, today, today))} />
          <div className="mt-4">
            <Stat label="This week" value={formatDuration(studyMinutes(data, weekStart, today))} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[30, 60, 90, 120].map((m) => (
              <Button key={m} size="sm" variant="outline" onClick={() => log(m)}>
                +{m}m
              </Button>
            ))}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(mins);
              if (n > 0) log(n);
            }}
          >
            <Input value={mins} onChange={(e) => setMins(e.target.value)} inputMode="numeric" aria-label="Minutes" />
            <Button type="submit" variant="secondary">
              Log
            </Button>
          </form>
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">In this phase</h2>
          <ul className="divide-y divide-border">
            {pipeline.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{l.title}</p>
                  <StatusBadge status={l.status} />
                </div>
                <LectureCheckbox lecture={l} />
              </li>
            ))}
          </ul>
        </Surface>
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Subjects</h2>
          <div className="space-y-4">
            {data.subjects.map((s) => {
              const p = subjectProgress(data, s.id);
              const open = lecturesOf(data, { subjectId: s.id }).find((l) => l.status !== "completed");
              return (
                <div key={s.id}>
                  <ProgressRow label={s.name} done={p.done} total={p.total} pct={p.pct} />
                  {open ? <p className="mt-1 text-xs text-muted-foreground">Next: {open.title}</p> : null}
                </div>
              );
            })}
          </div>
          {inProgress.length > 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">
              {inProgress.length} lecture{inProgress.length === 1 ? "" : "s"} currently in progress.
            </p>
          ) : null}
        </Surface>
      </div>
      {recentSessions.length > 0 ? (
        <Surface className="mt-4">
          <h2 className="mb-3 text-sm font-semibold">Recent sessions</h2>
          <ul className="divide-y divide-border">
            {recentSessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  {s.date} · {s.activity}
                  {s.subjectId ? ` · ${data.subjects.find((x) => x.id === s.subjectId)?.name}` : ""}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">{s.durationMin}m</span>
              </li>
            ))}
          </ul>
        </Surface>
      ) : null}
    </div>
  );
}
