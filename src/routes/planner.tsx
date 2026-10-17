import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { addDays, todayKey } from "@/lib/utils";
import { useStudyStore } from "@/lib/study/store";
import { DAY_PARTS, type ActivityKind, type DayPart } from "@/lib/study/types";
import { EmptyState, Field, FilterPills, PageHeader, StatusBadge, Surface } from "@/components/app/shared";
import { StatusCycle } from "@/components/app/status-cycle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_KINDS } from "@/lib/study/types";

export const Route = createFileRoute("/planner")({ component: PlannerPage });

function PlannerPage() {
  const data = useStudyStore();
  const addBlock = useStudyStore((s) => s.addBlock);
  const updateBlock = useStudyStore((s) => s.updateBlock);
  const deleteBlock = useStudyStore((s) => s.deleteBlock);
  const setLectureStatus = useStudyStore((s) => s.setLectureStatus);
  const setTaskStatus = useStudyStore((s) => s.setTaskStatus);
  const [day, setDay] = useState(todayKey());
  const [title, setTitle] = useState("");
  const [part, setPart] = useState<DayPart>("morning");
  const [activity, setActivity] = useState<ActivityKind>("lecture");
  const [subjectId, setSubjectId] = useState(data.subjects[0]?.id ?? "");
  const [view, setView] = useState<"day" | "week">("day");
  const [chapterId, setChapterId] = useState("");
  const [lectureId, setLectureId] = useState("");
  const [taskId, setTaskId] = useState("");

  const weekDays = useMemo(() => {
    const start = new Date(day + "T12:00:00");
    const mondayOffset = (start.getDay() + 6) % 7;
    const monday = addDays(start, -mondayOffset);
    return Array.from({ length: 7 }, (_, i) => todayKey(addDays(monday, i)));
  }, [day]);

  const days = view === "day" ? [day] : weekDays;
  const blocks = data.blocks.filter((b) => days.includes(b.date));
  const subjectChapters = data.chapters.filter((c) => !subjectId || c.subjectId === subjectId);
  const chapterLectures = data.lectures.filter((l) => (!subjectId || l.subjectId === subjectId) && (!chapterId || l.chapterId === chapterId));
  const subjectTasks = data.tasks.filter((t) => (!subjectId || t.subjectId === subjectId) && (!chapterId || t.chapterId === chapterId) && t.status !== "completed");
  const planned = blocks.length;
  const completed = blocks.filter((b) => b.status === "completed").length;
  const remaining = planned - completed;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Plan"
        title="Planner"
        description="Morning, afternoon, evening, night. Blocks can point at a lecture, task, or practice."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="w-auto" />
        <FilterPills
          value={view}
          onChange={setView}
          options={[
            { value: "day", label: "Day" },
            { value: "week", label: "Week" },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          {completed} completed · {remaining} remaining · {planned} planned
        </p>
      </div>
      <Surface className="mb-4">
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            addBlock({
              date: day,
              dayPart: part,
              title: title.trim(),
              notes: "",
              activity,
              subjectId: subjectId || undefined,
              chapterId: chapterId || undefined,
              lectureId: lectureId || undefined,
              taskId: taskId || undefined,
            });
            setTitle("");
            setChapterId("");
            setLectureId("");
            setTaskId("");
          }}
        >
          <Field label="Block">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Physics lecture" />
          </Field>
          <Field label="Part of day">
            <Select value={part} onValueChange={(v) => setPart(v as DayPart)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAY_PARTS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Activity">
            <Select value={activity} onValueChange={(v) => setActivity(v as ActivityKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_KINDS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
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
          <Field label="Chapter">
            <Select value={chapterId || "none"} onValueChange={(v) => { setChapterId(v === "none" ? "" : v); setLectureId(""); setTaskId(""); }}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No chapter</SelectItem>
                {subjectChapters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Link work">
            <Select value={lectureId || taskId || "none"} onValueChange={(v) => {
              if (v === "none") { setLectureId(""); setTaskId(""); }
              else if (v.startsWith("lecture:")) { setLectureId(v.slice(8)); setTaskId(""); }
              else { setTaskId(v.slice(5)); setLectureId(""); }
            }}>
              <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked work</SelectItem>
                {chapterLectures.map((l) => <SelectItem key={`lecture:${l.id}`} value={`lecture:${l.id}`}>Lecture · {l.title}</SelectItem>)}
                {subjectTasks.map((t) => <SelectItem key={`task:${t.id}`} value={`task:${t.id}`}>Task · {t.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Add block
            </Button>
          </div>
        </form>
      </Surface>

      {days.map((d) => (
        <div key={d} className="mb-6">
          <h2 className="mb-3 text-sm font-semibold tracking-tight">
            {new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {DAY_PARTS.map((partDef) => {
              const items = blocks.filter((b) => b.date === d && b.dayPart === partDef.value);
              return (
                <Surface key={partDef.value} className="min-h-40 p-4 sm:p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{partDef.label}</p>
                  <p className="mb-3 text-[11px] text-muted-foreground">{partDef.hint}</p>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Open</p>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((b) => (
                        <li key={b.id} className="rounded-md bg-muted/60 p-2">
                          <p className="text-sm font-medium">{b.title}</p>
                          {(b.lectureId || b.taskId || b.chapterId) ? (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {b.lectureId ? `Lecture · ${data.lectures.find((l) => l.id === b.lectureId)?.title ?? "linked"}` : b.taskId ? `Task · ${data.tasks.find((t) => t.id === b.taskId)?.title ?? "linked"}` : `Chapter · ${data.chapters.find((c) => c.id === b.chapterId)?.name ?? "linked"}`}
                            </p>
                          ) : null}
                          <div className="mt-1 flex items-center justify-between gap-2">
                            <StatusBadge status={b.status} />
                            <div className="flex gap-1">
                              <StatusCycle
                                status={b.status}
                                onChange={(st) => {
                                  updateBlock(b.id, { status: st });
                                  if (st === "completed") {
                                    if (b.lectureId) setLectureStatus(b.lectureId, "completed");
                                    if (b.taskId) setTaskStatus(b.taskId, "completed");
                                  }
                                }}
                              />
                              <Button size="sm" variant="ghost" onClick={() => deleteBlock(b.id)}>
                                ×
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Surface>
              );
            })}
          </div>
        </div>
      ))}
      {blocks.length === 0 ? (
        <EmptyState title="No blocks yet" description="Add a morning or evening block to give the day a shape." />
      ) : null}
    </div>
  );
}
