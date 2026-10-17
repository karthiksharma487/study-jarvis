import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { formatPct, pct } from "@/lib/utils";
import { EmptyState, Field, PageHeader, ProgressRow, StatusBadge, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { GoalHorizon, GoalMetric, ItemStatus } from "@/lib/study/types";
import { StatusCycle } from "@/components/app/status-cycle";

export const Route = createFileRoute("/goals")({ component: GoalsPage });

function GoalsPage() {
  const data = useStudyStore();
  const addGoal = useStudyStore((s) => s.addGoal);
  const updateGoal = useStudyStore((s) => s.updateGoal);
  const deleteGoal = useStudyStore((s) => s.deleteGoal);
  const [title, setTitle] = useState("");
  const [horizon, setHorizon] = useState<GoalHorizon>("short_term");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [metric, setMetric] = useState<GoalMetric>("custom");

  function currentFor(g: (typeof data.goals)[number]): number | null {
    if (g.metric === "lectures") return data.lectures.filter((l) => l.status === "completed").length;
    if (g.metric === "resources") return data.resources.filter((r) => r.status === "completed").length;
    if (g.metric === "hours") return Math.round(data.sessions.reduce((a, s) => a + s.durationMin, 0) / 60);
    if (g.metric === "practice") return data.practice.reduce((a, p) => a + p.attempted, 0);
    return g.current ?? null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Plan"
        title="Goals"
        description="Long, medium, and short term. Targets are measurable. Deadlines are optional — none are invented."
      />
      <Surface className="mb-4">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            addGoal({
              title: title.trim(),
              horizon,
              description,
              metric,
              target: target ? Number(target) : undefined,
              unit: metric === "hours" ? "hours" : metric,
            });
            setTitle("");
            setDescription("");
            setTarget("");
          }}
        >
          <Field label="Goal">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Horizon">
            <Select value={horizon} onValueChange={(v) => setHorizon(v as GoalHorizon)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short_term">Short term</SelectItem>
                <SelectItem value="medium_term">Medium term</SelectItem>
                <SelectItem value="long_term">Long term</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Metric">
            <Select value={metric} onValueChange={(v) => setMetric(v as GoalMetric)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lectures">Lectures completed</SelectItem>
                <SelectItem value="resources">Resources completed</SelectItem>
                <SelectItem value="practice">Questions practiced</SelectItem>
                <SelectItem value="hours">Hours studied</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Target (optional)">
            <Input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field>
          </div>
          <Button type="submit">Add goal</Button>
        </form>
      </Surface>
      {data.goals.length === 0 ? (
        <EmptyState title="No goals" description="Set one measurable target. Leave the date blank if there isn’t one." />
      ) : (
        <div className="space-y-3">
          {data.goals.map((g) => {
            const cur = currentFor(g);
            const p = g.target && cur !== null ? pct(cur, g.target) : null;
            return (
              <Surface key={g.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                      {g.horizon.replaceAll("_", " ")}
                    </p>
                    <h2 className="mt-1 text-base font-semibold">{g.title}</h2>
                    {g.description ? <p className="mt-1 text-sm text-muted-foreground">{g.description}</p> : null}
                    {g.deadline ? <p className="mt-1 text-xs text-muted-foreground">Deadline {g.deadline}</p> : (
                      <p className="mt-1 text-xs text-muted-foreground">No deadline</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={g.status} />
                    <StatusCycle status={g.status} onChange={(st) => updateGoal(g.id, { status: st as ItemStatus })} />
                    <Button size="sm" variant="ghost" onClick={() => deleteGoal(g.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                {g.target ? (
                  <div className="mt-4">
                    <ProgressRow
                      label={`${cur ?? 0} / ${g.target} ${g.unit ?? ""} · ${formatPct(p)}`}
                      done={cur ?? 0}
                      total={g.target}
                      pct={p}
                    />
                  </div>
                ) : null}
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
