import { LectureCheckbox } from "@/components/app/lecture-checkbox";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { chapterProgress, deriveChapterStatus, lecturesOf, resourcesOf } from "@/lib/study/progress";
import { EmptyState, PageHeader, ProgressRow, StatusBadge, Surface, ChapterStatusBadge } from "@/components/app/shared";
import { StatusCycle } from "@/components/app/status-cycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/chapters/$chapterId")({ component: ChapterDetail });

function ChapterDetail() {
  const { chapterId } = Route.useParams();
  const data = useStudyStore();
  const updateChapter = useStudyStore((s) => s.updateChapter);
  const addTopic = useStudyStore((s) => s.addTopic);
  const updateTopic = useStudyStore((s) => s.updateTopic);
  const setResourceStatus = useStudyStore((s) => s.setResourceStatus);
  const chapter = data.chapters.find((c) => c.id === chapterId);
  const [topicName, setTopicName] = useState("");
  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState title="Chapter not found" description="Return to subjects." action={<Link to="/subjects">Subjects</Link>} />
      </div>
    );
  }
  const subject = data.subjects.find((s) => s.id === chapter.subjectId);
  const p = chapterProgress(data, chapter.id);
  const status = deriveChapterStatus(data, chapter);
  const lectures = lecturesOf(data, { chapterId: chapter.id });
  const resources = resourcesOf(data, { chapterId: chapter.id });
  const topics = data.topics.filter((t) => t.chapterId === chapter.id).sort((a, b) => a.order - b.order);
  const tests = data.tests.filter((t) => t.chapterIds.includes(chapter.id));
  const revs = data.revisions.filter((r) => r.chapterId === chapter.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow={subject?.name ?? "Chapter"}
        title={chapter.name}
        description={`Status is derived only from individually ticked, delivered lectures — currently ${status.replaceAll("_", " ")}.`}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ChapterStatusBadge status={status} />
        <span className="text-sm text-muted-foreground">
          {p.done}/{p.total} delivered lectures ticked
        </span>
      </div>
      <ProgressRow label="Chapter progress" done={p.done} total={p.total} pct={p.pct} />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Topics</h2>
          {topics.length === 0 ? (
            <p className="mb-3 text-sm text-muted-foreground">No topics yet. Add names as you learn them — nothing is invented here.</p>
          ) : (
            <ul className="mb-3 divide-y divide-border">
              {topics.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="text-sm">{t.name}</span>
                  <StatusCycle status={t.status} onChange={(st) => updateTopic(t.id, { status: st })} />
                </li>
              ))}
            </ul>
          )}
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!topicName.trim()) return;
              addTopic({ name: topicName.trim(), chapterId: chapter.id, order: topics.length, status: "not_started" });
              setTopicName("");
            }}
          >
            <Input value={topicName} onChange={(e) => setTopicName(e.target.value)} placeholder="Add a topic" />
            <Button type="submit" variant="secondary">
              Add
            </Button>
          </form>
        </Surface>
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Notes</h2>
          <Textarea
            value={chapter.notes}
            onChange={(e) => updateChapter(chapter.id, { notes: e.target.value })}
            rows={8}
            placeholder="Chapter notes"
          />
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Lectures</h2>
          <ul className="divide-y divide-border">
            {lectures.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <p className="text-sm">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.plannedDate ?? "Undated"}</p>
                  <StatusBadge status={l.status} />
                </div>
                <LectureCheckbox lecture={l} />
              </li>
            ))}
          </ul>
        </Surface>
        <Surface>
          <h2 className="mb-3 text-sm font-semibold">Resources</h2>
          {resources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No PDFs or notes linked yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {resources.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="text-sm">{r.title}</span>
                  <StatusCycle status={r.status} onChange={(st) => setResourceStatus(r.id, st)} />
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Surface>
          <h2 className="mb-2 text-sm font-semibold">Revision history</h2>
          {revs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Complete a lecture to start spaced reviews.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {revs.map((r) => (
                <li key={r.id}>
                  {r.title} · {r.count} pass{r.count === 1 ? "" : "es"} · next {r.nextRevision}
                </li>
              ))}
            </ul>
          )}
        </Surface>
        <Surface>
          <h2 className="mb-2 text-sm font-semibold">Tests</h2>
          {tests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tests tagged to this chapter.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {tests.map((t) => (
                <li key={t.id}>
                  {t.name} · {t.marks}/{t.maxMarks}
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </div>
  );
}
