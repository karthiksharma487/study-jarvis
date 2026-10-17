import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { subjectProgress } from "@/lib/study/progress";
import { EmptyState, Field, PageHeader, ProgressRow, Surface } from "@/components/app/shared";
import { SUBJECT_PRESETS } from "@/lib/study/seed";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { subjectKey } from "@/lib/utils";

export const Route = createFileRoute("/subjects/")({ component: SubjectsPage });

function SubjectsPage() {
  const data = useStudyStore();
  const addSubject = useStudyStore((s) => s.addSubject);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [short, setShort] = useState("");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Learn"
        title="Subjects"
        description="Each subject is a mini command center: chapters, lectures, practice, revision, and time."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            Add subject
          </Button>
        }
      />
      {data.subjects.length === 0 ? (
        <EmptyState title="No subjects" description="Add Physics, Chemistry, or anything you study." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.subjects.map((s) => {
            const p = subjectProgress(data, s.id);
            const hours = data.sessions.filter((x) => x.subjectId === s.id).reduce((a, x) => a + x.durationMin, 0);
            return (
              <Link key={s.id} to="/subjects/$subjectId" params={{ subjectId: s.id }} className="block">
                <Surface className="h-full">
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: `var(--subject-${subjectKey(s.name)})` }}
                    />
                    <h2 className="text-lg font-semibold tracking-tight">{s.name}</h2>
                  </div>
                  <ProgressRow label="Progress" done={p.done} total={p.total} pct={p.pct} />
                  <p className="mt-3 text-xs text-muted-foreground">
                    {data.chapters.filter((c) => c.subjectId === s.id).length} chapters · {Math.round(hours / 60)}h logged
                  </p>
                </Surface>
              </Link>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add subject</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {SUBJECT_PRESETS.map((p) => (
              <Button
                key={p.name}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setName(p.name);
                  setShort(p.short);
                }}
              >
                {p.name}
              </Button>
            ))}
          </div>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addSubject({
                name: name.trim(),
                short: short.trim() || name.slice(0, 3).toUpperCase(),
                courseIds: data.courses[0] ? [data.courses[0].id] : [],
              });
              setOpen(false);
              setName("");
              setShort("");
            }}
          >
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Short code">
              <Input value={short} onChange={(e) => setShort(e.target.value)} placeholder="PHY" />
            </Field>
            <DialogFooter>
              <Button type="submit">Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
