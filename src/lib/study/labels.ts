import type {
  AcademicLevel,
  ActivityKind,
  ChapterStatus,
  ExamKind,
  ItemStatus,
  LectureKind,
  MistakeCategory,
  Priority,
  ResourceKind,
  Strength,
  TaskKind,
} from "./types";

export const STATUS_LABEL: Record<ItemStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export const CHAPTER_STATUS_LABEL: Record<ChapterStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  strong: "Strong",
  needs_revision: "Needs revision",
  completed: "Completed",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const LEVEL_LABEL: Record<AcademicLevel, string> = {
  class_11: "Class 11",
  "1st_pu": "Karnataka 1st PU",
  class_12: "Class 12",
  "2nd_pu": "Karnataka 2nd PU",
  dropper: "Dropper",
  university: "University",
  other: "Other",
};

export function titleCase(s: string): string {
  return s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function kindLabel(
  k: TaskKind | ActivityKind | ResourceKind | ExamKind | LectureKind | MistakeCategory | Strength,
): string {
  const map: Record<string, string> = {
    lecture: "Lecture",
    assignment: "Assignment",
    practice: "Practice",
    revision: "Revision",
    reading: "Reading",
    test: "Test",
    test_analysis: "Test analysis",
    college: "College work",
    other: "Other",
    pdf: "PDF",
    notes: "Notes",
    link: "Link",
    video: "Video",
    document: "Document",
    reference: "Reference",
    formula_sheet: "Formula sheet",
    question_sheet: "Question sheet",
    jee_main: "JEE Main",
    jee_advanced: "JEE Advanced",
    puc: "PUC",
    chapter_test: "Chapter test",
    mock: "Mock test",
    live: "Live",
    recorded: "Recorded",
    marathon: "Marathon",
    basics: "Basics",
    normal: "Normal",
    concept: "Concept",
    formula: "Formula",
    calculation: "Calculation",
    silly: "Silly mistake",
    time: "Time management",
    interpretation: "Interpretation",
    memory: "Memory",
    strategy: "Strategy",
    weak: "Weak",
    developing: "Developing",
    good: "Good",
    strong: "Strong",
  };
  return map[k] ?? titleCase(k);
}
