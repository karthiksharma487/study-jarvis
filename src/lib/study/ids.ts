export const IDS = {
  courseJee: "course-mission-jee",
  physics: "subject-physics",
  chemistry: "subject-chemistry",
  mathematics: "subject-mathematics",
  goalBacklog: "goal-clear-backlog",
  goalBasics: "goal-complete-basics",
  live1: "class-live-1",
  live2: "class-live-2",
} as const;

export function chapterId(subject: string, kind: "basics" | "marathon-1" | "marathon-2" | "normal") {
  return `chapter-${subject}-${kind}`;
}

export function lectureId(
  subject: string,
  kind: "basics" | "marathon-1" | "marathon-2" | "normal",
  n?: number,
) {
  if (kind === "normal") return `lecture-${subject}-normal-${n}`;
  return `lecture-${subject}-${kind}`;
}

export function pdfId(subject: string, n: number) {
  return `resource-${subject}-pdf-${n}`;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function realChapterId(subject: string, chapterName: string) {
  return `chapter-${subject}-${slugify(chapterName)}`;
}

export function realLectureId(subject: string, date: string, index: number) {
  return `lecture-${subject}-${date}-${index}`;
}

export function realResourceId(subject: string, date: string, index: number) {
  return `resource-${subject}-${date}-${index}`;
}

export function realExamId(date: string, name: string) {
  return `exam-${date}-${slugify(name)}`;
}
