import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  ACTIVITY_KINDS,
  EXAM_KINDS,
  LECTURE_KINDS,
  PRIORITIES,
  RESOURCE_KINDS,
  STRENGTHS,
  TASK_KINDS,
} from "@/lib/study/types";
import type { ActivityKind, ExamKind, LectureKind, Priority, ResourceKind, Strength, TaskKind } from "@/lib/study/types";
import { useStudyStore } from "@/lib/study/store";
import { todayKey } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FilterPills, FormGrid } from "./shared";

export type QuickKind = "lecture" | "task" | "session" | "resource" | "practice" | "revision" | "test";

const KINDS: { value: QuickKind; label: string }[] = [
  { value: "lecture", label: "Lecture" },
  { value: "task", label: "Task" },
  { value: "session", label: "Session" },
  { value: "resource", label: "Resource" },
  { value: "practice", label: "Practice" },
  { value: "revision", label: "Revision" },
  { value: "test", label: "Test" },
];

export function QuickAddDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: QuickKind;
}) {
  const subjects = useStudyStore((s) => s.subjects);
  const courses = useStudyStore((s) => s.courses);
  const chapters = useStudyStore((s) => s.chapters);
  const addLecture = useStudyStore((s) => s.addLecture);
  const addTask = useStudyStore((s) => s.addTask);
  const addSession = useStudyStore((s) => s.addSession);
  const addResource = useStudyStore((s) => s.addResource);
  const addPractice = useStudyStore((s) => s.addPractice);
  const addRevision = useStudyStore((s) => s.addRevision);
  const addTest = useStudyStore((s) => s.addTest);

  const [kind, setKind] = useState<QuickKind>(initial ?? "task");
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [taskKind, setTaskKind] = useState<TaskKind>("lecture");
  const [dueDate, setDueDate] = useState(todayKey());
  const [duration, setDuration] = useState("60");
  const [activity, setActivity] = useState<ActivityKind>("lecture");
  const [resKind, setResKind] = useState<ResourceKind>("pdf");
  const [url, setUrl] = useState("");
  const [lecKind, setLecKind] = useState<LectureKind>("normal");
  const [attempted, setAttempted] = useState("10");
  const [correct, setCorrect] = useState("7");
  const [incorrect, setIncorrect] = useState("2");
  const [skipped, setSkipped] = useState("1");
  const [examKind, setExamKind] = useState<ExamKind>("jee_main");
  const [source, setSource] = useState("");
  const [strength, setStrength] = useState<Strength>("developing");
  const [maxMarks, setMaxMarks] = useState("300");
  const [marks, setMarks] = useState("");

  useEffect(() => {
    if (open) {
      setKind(initial ?? "task");
      setTitle("");
      setNotes("");
      setUrl("");
      setSource("");
      setMarks("");
      setDueDate(todayKey());
      if (!courseId && courses[0]) setCourseId(courses[0].id);
      if (!subjectId && subjects[0]) setSubjectId(subjects[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const chapterOptions = useMemo(
    () => chapters.filter((c) => !subjectId || c.subjectId === subjectId),
    [chapters, subjectId],
  );

  function submit(e: FormEvent) {
    e.preventDefault();
    const dur = Number(duration) || 0;
    if (kind === "lecture") {
      if (!title.trim() || !subjectId || !courseId) return toast.error("Title, course, and subject are required.");
      addLecture({
        title: title.trim(),
        courseId,
        subjectId,
        chapterId: chapterId || undefined,
        kind: lecKind,
        notes,
      });
      toast.success("Lecture added");
    } else if (kind === "task") {
      if (!title.trim()) return toast.error("Give the task a name.");
      addTask({
        title: title.trim(),
        kind: taskKind,
        subjectId: subjectId || undefined,
        courseId: courseId || undefined,
        chapterId: chapterId || undefined,
        priority,
        dueDate: dueDate || undefined,
        estimatedMin: dur || undefined,
        notes,
      });
      toast.success("Task added");
    } else if (kind === "session") {
      if (!dur) return toast.error("Enter a duration in minutes.");
      addSession({
        date: dueDate || todayKey(),
        durationMin: dur,
        activity,
        subjectId: subjectId || undefined,
        chapterId: chapterId || undefined,
        courseId: courseId || undefined,
        notes,
      });
      toast.success("Session logged");
    } else if (kind === "resource") {
      if (!title.trim()) return toast.error("Give the resource a title.");
      addResource({
        title: title.trim(),
        kind: resKind,
        courseId: courseId || undefined,
        subjectId: subjectId || undefined,
        chapterId: chapterId || undefined,
        url,
        notes,
      });
      toast.success("Resource added");
    } else if (kind === "practice") {
      if (!subjectId) return toast.error("Pick a subject.");
      const a = Number(attempted) || 0;
      const c = Number(correct) || 0;
      const i = Number(incorrect) || 0;
      const sk = Number(skipped) || 0;
      addPractice({
        date: dueDate || todayKey(),
        subjectId,
        chapterId: chapterId || undefined,
        source,
        examKind,
        attempted: a,
        correct: c,
        incorrect: i,
        skipped: sk,
        timeMin: dur,
        notes,
      });
      toast.success("Practice logged");
    } else if (kind === "revision") {
      if (!title.trim() || !subjectId) return toast.error("Title and subject are required.");
      addRevision({
        title: title.trim(),
        subjectId,
        chapterId: chapterId || undefined,
        strength,
      });
      toast.success("Revision item added");
    } else if (kind === "test") {
      if (!title.trim()) return toast.error("Name the test.");
      const max = Number(maxMarks) || 0;
      const got = Number(marks) || 0;
      if (!max) return toast.error("Enter maximum marks.");
      addTest({
        name: title.trim(),
        kind: examKind,
        date: dueDate || todayKey(),
        courseId: courseId || undefined,
        subjectId: subjectId || undefined,
        chapterIds: chapterId ? [chapterId] : [],
        maxMarks: max,
        marks: got,
        timeMin: dur || undefined,
        analysis: notes,
      });
      toast.success("Test logged");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick add</DialogTitle>
          <DialogDescription>Capture something in a few taps, then get back to studying.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FilterPills value={kind} onChange={setKind} options={KINDS} />
          {kind !== "session" && kind !== "practice" ? (
            <Field label={kind === "test" ? "Test name" : "Title"}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Name" autoFocus />
            </Field>
          ) : null}
          <FormGrid>
            <Field label="Subject">
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {kind !== "practice" && kind !== "revision" ? (
              <Field label="Course">
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field label="Chapter">
                <Select value={chapterId || "none"} onValueChange={(v) => setChapterId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {chapterOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FormGrid>
          {kind === "lecture" ? (
            <Field label="Type">
              <Select value={lecKind} onValueChange={(v) => setLecKind(v as LectureKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LECTURE_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          {kind === "task" ? (
            <FormGrid>
              <Field label="Type">
                <Select value={taskKind} onValueChange={(v) => setTaskKind(v as TaskKind)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FormGrid>
          ) : null}
          {kind === "resource" ? (
            <>
              <Field label="Type">
                <Select value={resKind} onValueChange={(v) => setResKind(v as ResourceKind)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="URL">
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
              </Field>
            </>
          ) : null}
          {kind === "session" || kind === "practice" || kind === "task" || kind === "test" ? (
            <FormGrid>
              <Field label={kind === "task" || kind === "test" || kind === "practice" ? "Date" : "Date"}>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
              <Field label={kind === "session" || kind === "practice" || kind === "test" ? "Minutes" : "Estimate (min)"}>
                <Input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </Field>
            </FormGrid>
          ) : null}
          {kind === "session" ? (
            <Field label="Activity">
              <Select value={activity} onValueChange={(v) => setActivity(v as ActivityKind)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_KINDS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          {kind === "practice" ? (
            <>
              <FormGrid>
                <Field label="Attempted">
                  <Input inputMode="numeric" value={attempted} onChange={(e) => setAttempted(e.target.value)} />
                </Field>
                <Field label="Correct">
                  <Input inputMode="numeric" value={correct} onChange={(e) => setCorrect(e.target.value)} />
                </Field>
                <Field label="Incorrect">
                  <Input inputMode="numeric" value={incorrect} onChange={(e) => setIncorrect(e.target.value)} />
                </Field>
                <Field label="Skipped">
                  <Input inputMode="numeric" value={skipped} onChange={(e) => setSkipped(e.target.value)} />
                </Field>
              </FormGrid>
              <FormGrid>
                <Field label="Exam type">
                  <Select value={examKind} onValueChange={(v) => setExamKind(v as ExamKind)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_KINDS.map((k) => (
                        <SelectItem key={k.value} value={k.value}>
                          {k.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Source">
                  <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Module, PYQ, sheet…" />
                </Field>
              </FormGrid>
            </>
          ) : null}
          {kind === "revision" ? (
            <Field label="Strength">
              <Select value={strength} onValueChange={(v) => setStrength(v as Strength)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRENGTHS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
          {kind === "test" ? (
            <FormGrid>
              <Field label="Maximum marks">
                <Input inputMode="numeric" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
              </Field>
              <Field label="Marks obtained">
                <Input inputMode="numeric" value={marks} onChange={(e) => setMarks(e.target.value)} />
              </Field>
              <Field label="Exam type">
                <Select value={examKind} onValueChange={(v) => setExamKind(v as ExamKind)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAM_KINDS.map((k) => (
                      <SelectItem key={k.value} value={k.value}>
                        {k.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FormGrid>
          ) : null}
          {kind !== "session" && kind !== "lecture" && kind !== "resource" && kind !== "practice" && kind !== "test" && kind !== "task" ? null : (
            (kind as QuickKind) !== "revision" ? (
              <Field label="Notes">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </Field>
            ) : null
          )}
          {kind === "revision" || kind === "lecture" ? (
            <Field label="Notes">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </Field>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
