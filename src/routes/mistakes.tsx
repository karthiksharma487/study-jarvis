import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { MISTAKE_CATEGORIES, type MistakeCategory, type MistakeStatus } from "@/lib/study/types";
import { EmptyState, Field, FilterPills, PageHeader, Surface } from "@/components/app/shared";
import { kindLabel } from "@/lib/study/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/mistakes")({ component: MistakesPage });

function MistakesPage() {
  const data = useStudyStore();
  const addMistake = useStudyStore((s) => s.addMistake);
  const updateMistake = useStudyStore((s) => s.updateMistake);
  const deleteMistake = useStudyStore((s) => s.deleteMistake);
  const [filter, setFilter] = useState<"open" | "all" | MistakeStatus>("open");
  const [question, setQuestion] = useState("");
  const [concept, setConcept] = useState("");
  const [why, setWhy] = useState("");
  const [category, setCategory] = useState<MistakeCategory>("concept");
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id ?? "");

  const rows = data.mistakes.filter((m) => (filter === "all" ? true : filter === "open" ? m.status === "open" : m.status === filter));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Work"
        title="Mistake book"
        description="Learn from errors — concept, formula, calculation, silly, time, interpretation, memory, strategy."
      />
      <Surface className="mb-4">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!question.trim()) return;
            addMistake({
              category,
              question: question.trim(),
              correctConcept: concept,
              why,
              subjectId: subjectId || undefined,
              source: "",
            });
            setQuestion("");
            setConcept("");
            setWhy("");
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Question / prompt">
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} />
            </Field>
            <Field label="Correct concept">
              <Input value={concept} onChange={(e) => setConcept(e.target.value)} />
            </Field>
            <Field label="Category">
              <Select value={category} onValueChange={(v) => setCategory(v as MistakeCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MISTAKE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Subject">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Why it happened">
            <Textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={2} />
          </Field>
          <Button type="submit">Add mistake</Button>
        </form>
      </Surface>
      <div className="mb-4">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "Open" },
            { value: "reviewed", label: "Reviewed" },
            { value: "mastered", label: "Mastered" },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No items in this view" description="Capture a mistake while the question is still warm." />
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <Surface key={m.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{kindLabel(m.category)}</Badge>
                <Badge variant={m.status === "mastered" ? "success" : m.status === "open" ? "warning" : "outline"}>
                  {m.status}
                </Badge>
                {m.subjectId ? (
                  <span className="text-xs text-muted-foreground">
                    {data.subjects.find((s) => s.id === m.subjectId)?.name}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm font-medium">{m.question}</p>
              {m.correctConcept ? <p className="mt-1 text-sm text-muted-foreground">Concept: {m.correctConcept}</p> : null}
              {m.why ? <p className="mt-1 text-sm text-muted-foreground">Why: {m.why}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => updateMistake(m.id, { status: "reviewed" })}>
                  Reviewed
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateMistake(m.id, { status: "mastered", reattempt: "correct" })}>
                  Mastered
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMistake(m.id)}>
                  Remove
                </Button>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}
