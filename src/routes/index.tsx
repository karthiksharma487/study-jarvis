import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import {
  daysUntil,
  formatDuration,
  greeting,
  startOfWeek,
  todayKey,
} from "@/lib/utils";
import { LEVEL_LABEL } from "@/lib/study/labels";
import { useStudyStore } from "@/lib/study/store";
import {
  backlogCounts,
  completionSummary,
  currentPhase,
  revisionDue,
  studyMinutes,
  taskCompletion,
} from "@/lib/study/progress";
import { recommendNext } from "@/lib/study/next-action";
import { buildInsights } from "@/lib/study/insights";
import { PageHeader, ProgressRow, Stat, StatusBadge, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const data = useStudyStore();
  const today = todayKey();
  const weekStart = todayKey(startOfWeek(new Date(), data.settings.weekStartsOn));
  const next = recommendNext(data);
  const insights = buildInsights(data);
  const phase = currentPhase(data);
  const completion = completionSummary(data, undefined, today);
  const tasksToday = data.tasks.filter((t) => t.dueDate === today);
  const lecturesToday = data.lectures.filter((l) => l.plannedDate === today);
  const blocksToday = data.blocks.filter((b) => b.date === today);
  const testsSoon = data.tests.filter((t) => t.date >= today).slice(0, 3);
  const exams = data.exams.filter((e) => e.date);
  const due = revisionDue(data.revisions, today);
  const weekMin = studyMinutes(data, weekStart, today);
  const todayMin = studyMinutes(data, today, today);
  const backlog = backlogCounts(data);
  const taskP = taskCompletion(data, today);
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const weekday = new Date().getDay();
  const liveToday = data.classSchedule.filter((c) => c.enabled && c.days.includes(weekday));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={greeting()}
        title={data.profile.name || "Student"}
        description={`${dateLabel} · ${LEVEL_LABEL[data.profile.academicLevel]}${
          data.profile.primaryGoals.length ? ` · ${data.profile.primaryGoals.join(" · ")}` : ""
        }`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Surface className="enter lg:col-span-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Next action</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">{next.title}</h2>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{next.detail}</p>
          <div className="mt-5">
            <Button asChild>
              <Link to={next.href}>
                Open
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Surface>
        <Surface className="enter-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Path</p>
          <p className="mt-2 text-lg font-semibold tracking-tight">{phase.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{phase.detail}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Lectures follow the batch planner’s chapter order and delivery dates. Planner data is accurate through {data.lastKnownPlannerDate}.
          </p>
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Surface>
          <Stat label="Today" value={formatDuration(todayMin)} hint="Logged study time" />
        </Surface>
        <Surface>
          <Stat label="This week" value={formatDuration(weekMin)} hint="All sessions" />
        </Surface>
        <Surface>
          <Stat
            label="Lectures"
            value={`${backlog.lectures.done}/${backlog.lectures.total}`}
            hint="Ticked / delivered so far"
          />
        </Surface>
        <Surface>
          <Stat label="Chapters complete" value={`${completion.chapters.done}/${completion.chapters.total}`} hint="Chapters with delivered lectures" />
        </Surface>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Surface className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Today</h2>
            <Link to="/planner" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Planner
            </Link>
          </div>
          <div className="space-y-4">
            {liveToday.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Live class context</p>
                <ul className="space-y-1.5 text-sm">
                  {liveToday.map((c) => (
                    <li key={c.id} className="flex justify-between gap-3">
                      <span>{c.label}</span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">{c.time}{c.endTime ? `–${c.endTime}` : ""}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-muted-foreground">Working through backlog before fully returning to live classes.</p>
              </div>
            ) : null}

            {due.overdue.length + due.today.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Revision</p>
                <ul className="space-y-1 text-sm">
                  {due.overdue.slice(0, 3).map((r) => (
                    <li key={r.id} className="flex justify-between gap-2">
                      <span>{r.title}</span>
                      <span className="text-xs text-warning">Overdue</span>
                    </li>
                  ))}
                  {due.today.slice(0, 3).map((r) => (
                    <li key={r.id}>{r.title}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {lecturesToday.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Planned lectures</p>
                <ul className="space-y-1 text-sm">
                  {lecturesToday.map((l) => (
                    <li key={l.id} className="flex items-center justify-between gap-2">
                      <span>{l.title}</span>
                      <StatusBadge status={l.status} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {tasksToday.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Tasks · {taskP.done}/{taskP.total}
                </p>
                <ul className="space-y-1 text-sm">
                  {tasksToday.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2">
                      <span>{t.title}</span>
                      <StatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {blocksToday.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Study blocks</p>
                <ul className="space-y-1 text-sm">
                  {blocksToday.map((b) => (
                    <li key={b.id} className="flex justify-between gap-2">
                      <span>{b.title}</span>
                      <span className="capitalize text-xs text-muted-foreground">{b.dayPart}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {testsSoon.length > 0 ? (
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Tests</p>
                <ul className="space-y-1 text-sm">
                  {testsSoon.map((t) => (
                    <li key={t.id}>
                      {t.name} · {t.date}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {exams.map((e) => {
              const d = daysUntil(e.date);
              if (d === null) return null;
              return (
                <div key={e.id}>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Exam</p>
                  <p className="text-sm">
                    {e.name} · {d === 0 ? "today" : d > 0 ? `${d} days remaining` : `${Math.abs(d)} days ago`}
                  </p>
                </div>
              );
            })}

            {!liveToday.length &&
            !due.today.length &&
            !due.overdue.length &&
            !lecturesToday.length &&
            !tasksToday.length &&
            !blocksToday.length &&
            !testsSoon.length &&
            exams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing is scheduled for today. Use the next action above, or add a study block.
              </p>
            ) : null}
          </div>
        </Surface>

        <Surface className="lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">Progress</h2>
          <div className="space-y-4">
            {[{ id: undefined, name: "Overall" }, ...data.subjects].map((s) => {
              const summary = completionSummary(data, s.id, today);
              return (
                <div key={s.id ?? "overall"} className="space-y-2">
                  <ProgressRow label={`${s.name} lectures ticked / delivered`} done={summary.lectures.done} total={summary.lectures.total} pct={summary.lectures.pct} />
                  <ProgressRow label={`${s.name} chapters complete / delivered`} done={summary.chapters.done} total={summary.chapters.total} pct={summary.chapters.pct} />
                </div>
              );
            })}
            <ProgressRow
              label="PDFs"
              done={backlog.pdfs.done}
              total={backlog.pdfs.total}
              pct={backlog.pdfs.pct}
            />
          </div>
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-3 text-sm font-semibold tracking-tight">Insights</h2>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Insights appear from real study time, practice, and completion. Log a session to start the picture.
            </p>
          ) : (
            <ul className="space-y-2">
              {insights.map((i) => (
                <li key={i.id} className="flex gap-2 text-sm">
                  <span
                    className={
                      i.tone === "attention"
                        ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-warning"
                        : i.tone === "good"
                          ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-success"
                          : "mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground"
                    }
                    aria-hidden
                  />
                  {i.text}
                </li>
              ))}
            </ul>
          )}
        </Surface>
        <Surface>
          <h2 className="mb-3 text-sm font-semibold tracking-tight">Recent activity</h2>
          {data.activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Completions, sessions, and logs will show up here.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.activities.slice(0, 8).map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                  <span>{a.text}</span>
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                    {new Date(a.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </div>
  );
}
