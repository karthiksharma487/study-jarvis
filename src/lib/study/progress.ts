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

export function chapterProgress(data: StudyData, chapterId: string): CountProgress {
  const lectures = lecturesOf(data, { chapterId });
  const resources = resourcesOf(data, { chapterId });
  const topics = data.topics.filter((t) => t.chapterId === chapterId);
  const items = [
    ...lectures.map((l) => ({ status: l.status })),
    ...resources.map((r) => ({ status: r.status })),
    ...topics.map((t) => ({ status: t.status })),
  ];
  return countProgress(items);
}

export function deriveChapterStatus(data: StudyData, chapter: Chapter): ChapterStatus {
  const p = chapterProgress(data, chapter.id);
  const revs = data.revisions.filter((r) => r.chapterId === chapter.id);
  const overdue = revs.some((r) => r.nextRevision < todayKey() && r.strength !== "strong");
  if (p.total === 0) return "not_started";
  if (p.done === 0) return "not_started";
  if (p.done === p.total) {
    if (overdue) return "needs_revision";
    const strong = revs.length > 0 && revs.every((r) => r.strength === "strong" || r.strength === "good");
    if (strong) return "strong";
    return "completed";
  }
  if (overdue) return "needs_revision";
  return "in_progress";
}

export function subjectProgress(data: StudyData, subjectId: string): CountProgress {
  return countProgress([
    ...lecturesOf(data, { subjectId }).map((l) => ({ status: l.status })),
    ...resourcesOf(data, { subjectId }).map((r) => ({ status: r.status })),
  ]);
}

export function courseProgress(data: StudyData, courseId: string): CountProgress {
  return countProgress([
    ...lecturesOf(data, { courseId }).map((l) => ({ status: l.status })),
    ...resourcesOf(data, { courseId }).map((r) => ({ status: r.status })),
  ]);
}

export function overallProgress(data: StudyData): CountProgress {
  return countProgress([
    ...data.lectures.map((l) => ({ status: l.status })),
    ...data.resources.map((r) => ({ status: r.status })),
    ...data.tasks.map((t) => ({ status: t.status })),
  ]);
}

/**
 * Backlog = every real, dated lecture whose class has already happened
 * (plannedDate <= today) but hasn't been marked watched yet. This mirrors
 * the actual Drona JEE 2.0 schedule rather than an invented phase system:
 * as each real class date passes, it automatically becomes part of the
 * backlog if not yet completed — no separate "add lecture" step needed.
 */
export function backlogCounts(data: StudyData, today = todayKey()) {
  const due = data.lectures.filter((l) => (l.plannedDate ?? "") <= today);
  const upcoming = data.lectures.filter((l) => (l.plannedDate ?? "") > today);
  const pdfsDue = data.resources.filter(
    (r) => r.kind === "pdf" && data.lectures.some((l) => l.id === r.lectureId && (l.plannedDate ?? "") <= today),
  );
  const bySubject = (subjectId: string) => {
    const n = due.filter((l) => l.subjectId === subjectId);
    const p = pdfsDue.filter((r) => r.subjectId === subjectId);
    return {
      lectures: countProgress(n),
      pdfs: countProgress(p.map((r) => ({ status: r.status }))),
    };
  };
  return {
    lectures: countProgress(due),
    upcoming: countProgress(upcoming),
    pdfs: countProgress(pdfsDue.map((r) => ({ status: r.status }))),
    bySubject,
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
  const due = data.lectures.filter((l) => (l.plannedDate ?? "") <= today);
  const dueLeft = due.filter((l) => l.status !== "completed");
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
