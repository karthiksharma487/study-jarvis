import type { StudyData } from "./types";

export type SearchHit = {
  id: string;
  kind:
    | "course"
    | "subject"
    | "chapter"
    | "topic"
    | "lecture"
    | "resource"
    | "task"
    | "test"
    | "goal"
    | "exam";
  title: string;
  subtitle?: string;
  href: string;
};

function match(q: string, ...parts: (string | undefined)[]): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return false;
  return parts.some((p) => p && p.toLowerCase().includes(n));
}

export function searchAll(data: StudyData, q: string, limit = 20): SearchHit[] {
  const hits: SearchHit[] = [];
  if (!q.trim()) return hits;

  for (const c of data.courses) {
    if (match(q, c.name, c.description)) {
      hits.push({ id: c.id, kind: "course", title: c.name, subtitle: "Course", href: `/courses/${c.id}` });
    }
  }
  for (const s of data.subjects) {
    if (match(q, s.name, s.short)) {
      hits.push({ id: s.id, kind: "subject", title: s.name, subtitle: "Subject", href: `/subjects/${s.id}` });
    }
  }
  for (const c of data.chapters) {
    if (match(q, c.name, c.notes)) {
      const sub = data.subjects.find((s) => s.id === c.subjectId)?.name;
      hits.push({
        id: c.id,
        kind: "chapter",
        title: c.name,
        subtitle: sub ? `Chapter · ${sub}` : "Chapter",
        href: `/chapters/${c.id}`,
      });
    }
  }
  for (const t of data.topics) {
    if (match(q, t.name)) {
      hits.push({ id: t.id, kind: "topic", title: t.name, subtitle: "Topic", href: `/chapters/${t.chapterId}` });
    }
  }
  for (const l of data.lectures) {
    if (match(q, l.title, l.notes)) {
      const sub = data.subjects.find((s) => s.id === l.subjectId)?.name;
      hits.push({
        id: l.id,
        kind: "lecture",
        title: l.title,
        subtitle: sub ? `Lecture · ${sub}` : "Lecture",
        href: "/lectures",
      });
    }
  }
  for (const r of data.resources) {
    if (match(q, r.title, r.notes, r.url)) {
      hits.push({ id: r.id, kind: "resource", title: r.title, subtitle: "Resource", href: "/resources" });
    }
  }
  for (const t of data.tasks) {
    if (match(q, t.title, t.notes)) {
      hits.push({ id: t.id, kind: "task", title: t.title, subtitle: "Task", href: "/tasks" });
    }
  }
  for (const t of data.tests) {
    if (match(q, t.name, t.analysis)) {
      hits.push({ id: t.id, kind: "test", title: t.name, subtitle: "Test", href: "/tests" });
    }
  }
  for (const g of data.goals) {
    if (match(q, g.title, g.description)) {
      hits.push({ id: g.id, kind: "goal", title: g.title, subtitle: "Goal", href: "/goals" });
    }
  }
  for (const e of data.exams) {
    if (match(q, e.name, e.portion)) {
      hits.push({ id: e.id, kind: "exam", title: e.name, subtitle: "Exam", href: "/exams" });
    }
  }
  return hits.slice(0, limit);
}
