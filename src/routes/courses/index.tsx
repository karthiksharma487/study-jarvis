import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { courseProgress } from "@/lib/study/progress";
import { EmptyState, PageHeader, ProgressRow, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/app/shared";
import { useState } from "react";

export const Route = createFileRoute("/courses/")({ component: CoursesPage });

function CoursesPage() {
  const data = useStudyStore();
  const addCourse = useStudyStore((s) => s.addCourse);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Learn"
        title="Courses"
        description="A course is a container: subjects, chapters, lectures, resources, and tests."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            New course
          </Button>
        }
      />
      {data.courses.length === 0 ? (
        <EmptyState title="No courses" description="Create a course to group your academic work." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.courses.map((c) => {
            const p = courseProgress(data, c.id);
            const subjects = data.subjects.filter((s) => s.courseIds.includes(c.id));
            return (
              <Link key={c.id} to="/courses/$courseId" params={{ courseId: c.id }} className="block">
                <Surface className="h-full transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]">
                  <h2 className="text-lg font-semibold tracking-tight">{c.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description || "No description"}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {subjects.map((s) => s.name).join(" · ") || "No subjects yet"}
                  </p>
                  <div className="mt-4">
                    <ProgressRow label="Progress" done={p.done} total={p.total} pct={p.pct} />
                  </div>
                </Surface>
              </Link>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New course</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addCourse({ name: name.trim(), description });
              setName("");
              setDescription("");
              setOpen(false);
            }}
          >
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label="Description">
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
