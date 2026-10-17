import { addDays, pct, todayKey } from "@/lib/utils";
import type {
  Chapter,
  ChapterStatus,
  ItemStatus,
  Lecture,
  PracticeSession,
  Resource,
  RevisionItem,
  StudyData,
  TestRecord,
} from "./types";

export type CountProgress = {
  done: number;
  total: number;
  remaining: number;
  pct: number | null;
};

export function countProgress(
  items: { status: ItemStatus }[],
  pred?: (s: ItemStatus) => boolean,
): CountProgress {
  const total = items.length;
  const done = items.filter((i) => (pred ? pred(i.status) : i.status === "completed")).length;
  return { done, total, remaining: total - done, pct: pct(done, total) };
}

export function lecturesOf(data: StudyData, filter: Partial<Pick<Lecture, "subjectId" | "courseId" | "chapterId" | "kind">> = {}) {
  return data.lectures.filter((l) => {
    if (filter.subjectId && l.subjectId !== filter.subjectId) return false;
    if (filter.courseId && l.courseId !== filter.courseId) return false;
    if (filter.chapterId && l.chapterId !== filter.chapterId) return false;
    if (filter.kind && l.kind !== filter.kind) return false;
    return true;
  });
}

export function resourcesOf(data: StudyData, filter: Partial<Pick<Resource, "subjectId" | "courseId" | "chapterId">> = {}) {
  return data.resources.filter((r) => {
    if (filter.subjectId && r.subjectId !== filter.subjectId) return false;
    if (filter.courseId && r.courseId !== filter.courseId) return false;
    if (filter.chapterId && r.chapterId !== filter.chapterId) return false;
    return true;
  });
}

export function isDelivered(lecture: Lecture, today = todayKey()): boolean {
  return Boolean(lecture.plannedDate && lecture.plannedDate <= today);
}

export function isLectureChecked(data: StudyData, lecture: Lecture): boolean {
  return data.lectureTicks?.[lecture.id] === true;
}

export function lectureProgress(data: StudyData, lectures: Lecture[], today = todayKey()): CountProgress {
  return countProgress(lectures.filter((l) => isDelivered(l, today)).map((l) => ({
    status: isLectureChecked(data, l) ? "completed" as const : "not_started" as const,
  })));
}

export function chapterProgress(data: StudyData, chapterId: string, today = todayKey()): CountProgress {
  return lectureProgress(data, lecturesOf(data, { chapterId }), today);
}

export function deriveChapterStatus(data: StudyData, chapter: Chapter, today = todayKey()): ChapterStatus {
  const p = chapterProgress(data, chapter.id, today);
  if (p.total === 0 || p.done === 0) return "not_started";
  return p.done === p.total ? "completed" : "in_progress";
}

/** Only chapters containing at least one delivered lecture enter the denominator. */
export function completionSummary(data: StudyData, subjectId?: string, today = todayKey()) {
  const lectures = data.lectures.filter((l) => !subjectId || l.subjectId === subjectId);
  const deliveredChapterIds = new Set(lectures.filter((l) => isDelivered(l, today)).map((l) => l.chapterId).filter(Boolean));
  const chapters = data.chapters.filter((c) => deliveredChapterIds.has(c.id));
  return {
    lectures: lectureProgress(data, lectures, today),
    chapters: countProgress(chapters.map((c) => ({ status: deriveChapterStatus(data, c, today) === "completed" ? "completed" : "not_started" }))),
  };
}

export function subjectProgress(data: StudyData, subjectId: string): CountProgress {
  return lectureProgress(data, lecturesOf(data, { subjectId }));
}

export function courseProgress(data: StudyData, courseId: string): CountProgress {
  return lectureProgress(data, lecturesOf(data, { courseId }));
}

export function overallProgress(data: StudyData): CountProgress {
  return lectureProgress(data, data.lectures);
}

export function backlogCounts(data: StudyData, today = todayKey()) {
  const due = data.lectures.filter((l) => isDelivered(l, today));
  const upcoming = data.lectures.filter((l) => l.plannedDate && l.plannedDate > today);
  const pdfsDue = data.resources.filter(
    (r) => r.kind === "pdf" && due.some((l) => l.id === r.lectureId),
  );
  return {
    lectures: lectureProgress(data, due, today),
    upcoming: countProgress(upcoming.map((l) => ({ status: isLectureChecked(data, l) ? "completed" : "not_started" }))),
    pdfs: countProgress(pdfsDue),
    bySubject: (subjectId: string) => ({
      lectures: lectureProgress(data, due.filter((l) => l.subjectId === subjectId), today),
      pdfs: countProgress(pdfsDue.filter((r) => r.subjectId === subjectId)),
    }),
  };
}

export function studyMinutes(data: StudyData, fromDay: string, toDay: string): number {
  return data.sessions
    .filter((s) => s.date >= fromDay && s.date <= toDay)
    .reduce((a, s) => a + (s.durationMin || 0), 0);
}

export function practiceAccuracy(rows: PracticeSession[]): number | null {
  const attempted = rows.reduce((a, r) => a + r.attempted, 0);
  const correct = rows.reduce((a, r) => a + r.correct, 0);
  return pct(correct, attempted);
}

export function testPercentage(t: TestRecord): number | null {
  return pct(t.marks, t.maxMarks);
}

export function revisionDue(items: RevisionItem[], day = todayKey()) {
  const overdue = items.filter((r) => r.nextRevision < day);
  const today = items.filter((r) => r.nextRevision === day);
  const weekEnd = addDays(new Date(), 7);
  const y = weekEnd.getFullYear();
  const m = String(weekEnd.getMonth() + 1).padStart(2, "0");
  const d = String(weekEnd.getDate()).padStart(2, "0");
  const weekKey = `${y}-${m}-${d}`;
  const week = items.filter((r) => r.nextRevision > day && r.nextRevision <= weekKey);
  return { overdue, today, week };
}

export const SPACED_DAYS = [1, 3, 7, 14, 30];

export function nextRevisionDay(count: number, from = new Date()): string {
  const days = SPACED_DAYS[Math.min(count, SPACED_DAYS.length - 1)] ?? 30;
  const n = addDays(from, days);
  return todayKey(n);
}

export function taskCompletion(data: StudyData, day?: string): CountProgress {
  const tasks = day ? data.tasks.filter((t) => t.dueDate === day) : data.tasks;
  return countProgress(tasks);
}

export function currentPhase(data: StudyData, today = todayKey()): {
  key: "backlog" | "on_track" | "complete";
  label: string;
  detail: string;
} {
  const due = data.lectures.filter((l) => isDelivered(l, today));
  const dueLeft = due.filter((l) => !isLectureChecked(data, l));
  if (due.length === 0) {
    return { key: "complete", label: "No classes yet", detail: "Nothing scheduled up to today." };
  }
  if (dueLeft.length === 0) {
    return { key: "complete", label: "Fully caught up", detail: "Every class held so far has been watched." };
  }
  return {
    key: "backlog",
    label: "Backlog",
    detail: `${dueLeft.length} lecture${dueLeft.length === 1 ? "" : "s"} already delivered, not yet watched`,
  };
}
