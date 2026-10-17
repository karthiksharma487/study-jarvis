import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { courseProgress } from "@/lib/study/progress";
import { daysUntil, formatPct } from "@/lib/utils";
import { EmptyState, Field, PageHeader, PriorityBadge, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Priority } from "@/lib/study/types";
import { PRIORITIES } from "@/lib/study/types";

export const Route = createFileRoute("/exams")({ component: ExamsPage });

function ExamsPage() {
  const data = useStudyStore();
  const addExam = useStudyStore((s) => s.addExam);
  const deleteExam = useStudyStore((s) => s.deleteExam);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [portion, setPortion] = useState("");
  const [priority, setPriority] = useState<Priority>("high");
  const jee = data.courses.find((c) => c.name.toLowerCase().includes("jee"));
  const prep = jee ? courseProgress(data, jee.id) : null;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Plan"
        title="Exams"
        description="Dates are optional. Preparation percent is taken from real course progress — never invented."
      />
      <Surface className="mb-4">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            addExam({
              name: name.trim(),
              date: date || undefined,
              subjectIds: data.subjects.map((s) => s.id),
              portion,
              priority,
              readinessNotes: "",
            });
            setName("");
            setDate("");
            setPortion("");
          }}
        >
          <Field label="Exam name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="JEE Main" />
          </Field>
          <Field label="Date (optional)">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Priority">
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Portion">
            <Textarea value={portion} onChange={(e) => setPortion(e.target.value)} rows={2} placeholder="Leave blank if unknown" />
          </Field>
          <Button type="submit">Add exam</Button>
        </form>
      </Surface>
      {data.exams.length === 0 ? (
        <EmptyState
          title="No exams on the calendar"
          description="Add JEE Main, Advanced, or a PU exam when you have a date — or without one."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.exams.map((e) => {
            const d = daysUntil(e.date);
            return (
              <Surface key={e.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">{e.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {e.date
                        ? d === null
                          ? e.date
                          : d === 0
                            ? `${e.date} · Today`
                            : d > 0
                              ? `${e.date} · ${d} days remaining`
                              : `${e.date} · ${Math.abs(d)} days ago`
                        : "No date set"}
                    </p>
                  </div>
                  <PriorityBadge priority={e.priority} />
                </div>
                {e.portion ? <p className="mt-3 text-sm">{e.portion}</p> : null}
                <p className="mt-3 text-sm text-muted-foreground">
                  Preparation {prep ? formatPct(prep.pct) : "—"} (from course completion, not a guess)
                </p>
                <Button className="mt-3" size="sm" variant="ghost" onClick={() => deleteExam(e.id)}>
                  Remove
                </Button>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
