import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { addDays, formatDuration, formatPct, todayKey } from "@/lib/utils";
import { useStudyStore } from "@/lib/study/store";
import {
  backlogCounts,
  overallProgress,
  practiceAccuracy,
  subjectProgress,
  taskCompletion,
} from "@/lib/study/progress";
import { PageHeader, ProgressRow, Surface } from "@/components/app/shared";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });

function AnalyticsPage() {
  const data = useStudyStore();
  const days = Array.from({ length: 14 }, (_, i) => todayKey(addDays(new Date(), i - 13)));
  const timeSeries = days.map((d) => ({
    d: d.slice(5),
    minutes: data.sessions.filter((s) => s.date === d).reduce((a, s) => a + s.durationMin, 0),
  }));
  const hasTime = timeSeries.some((x) => x.minutes > 0);
  const overall = overallProgress(data);
  const backlog = backlogCounts(data);
  const tasks = taskCompletion(data);
  const acc = practiceAccuracy(data.practice);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Review"
        title="Analytics"
        description="Every figure is derived from lectures, resources, sessions, practice, and tasks. Empty charts stay empty."
      />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Overall</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatPct(overall.pct)}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Lecture backlog</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">
            {backlog.lectures.done}/{backlog.lectures.total}
          </p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Task completion</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatPct(tasks.pct)}</p>
        </Surface>
        <Surface>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Practice accuracy</p>
          <p className="mt-1 font-mono text-2xl tabular-nums">{formatPct(acc)}</p>
        </Surface>
      </div>
      <Surface className="mb-4">
        <h2 className="mb-1 text-sm font-semibold">Study time · last 14 days</h2>
        <p className="mb-4 text-xs text-muted-foreground">Answers: when did I actually sit down?</p>
        {hasTime ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries}>
                <XAxis dataKey="d" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.45} />
                <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.45} width={32} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ payload, label }) => {
                    const v = payload?.[0]?.value;
                    if (v === undefined) return null;
                    return (
                      <div className="rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-[var(--shadow-border)]">
                        {label}: {formatDuration(Number(v))}
                      </div>
                    );
                  }}
                />
                <Bar dataKey="minutes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Log sessions to see a time trend.</p>
        )}
      </Surface>
      <div className="grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Subject progress</h2>
          <div className="space-y-4">
            {data.subjects.map((s) => {
              const p = subjectProgress(data, s.id);
              return <ProgressRow key={s.id} label={s.name} done={p.done} total={p.total} pct={p.pct} />;
            })}
          </div>
        </Surface>
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Volume</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span>Lectures completed</span>
              <span className="font-mono tabular-nums">
                {data.lectures.filter((l) => l.status === "completed").length}/{data.lectures.length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>PDFs completed</span>
              <span className="font-mono tabular-nums">
                {data.resources.filter((r) => r.status === "completed").length}/{data.resources.length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Practice questions</span>
              <span className="font-mono tabular-nums">{data.practice.reduce((a, p) => a + p.attempted, 0)}</span>
            </li>
            <li className="flex justify-between">
              <span>Revisions due</span>
              <span className="font-mono tabular-nums">
                {data.revisions.filter((r) => r.nextRevision <= todayKey()).length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Open mistakes</span>
              <span className="font-mono tabular-nums">{data.mistakes.filter((m) => m.status === "open").length}</span>
            </li>
          </ul>
        </Surface>
      </div>
    </div>
  );
}
