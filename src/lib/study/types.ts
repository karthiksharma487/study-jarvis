export type ISODate = string;
export type ID = string;
export type DayKey = string; // YYYY-MM-DD

export type AcademicLevel =
  | "class_11"
  | "1st_pu"
  | "class_12"
  | "2nd_pu"
  | "dropper"
  | "university"
  | "other";

export type ItemStatus = "not_started" | "in_progress" | "completed";
export type ChapterStatus =
  | "not_started"
  | "in_progress"
  | "strong"
  | "needs_revision"
  | "completed";
export type Priority = "low" | "medium" | "high" | "critical";
export type GoalHorizon = "long_term" | "medium_term" | "short_term";
export type ResourceKind =
  | "pdf"
  | "notes"
  | "link"
  | "video"
  | "document"
  | "reference"
  | "formula_sheet"
  | "question_sheet";
export type TaskKind =
  | "lecture"
  | "assignment"
  | "practice"
  | "revision"
  | "reading"
  | "test"
  | "test_analysis"
  | "college"
  | "other";
export type ActivityKind =
  | "lecture"
  | "practice"
  | "revision"
  | "reading"
  | "assignment"
  | "test"
  | "test_analysis"
  | "other";
export type ExamKind =
  | "jee_main"
  | "jee_advanced"
  | "puc"
  | "chapter_test"
  | "mock"
  | "other";
export type Strength = "weak" | "developing" | "good" | "strong";
export type MistakeCategory =
  | "concept"
  | "formula"
  | "calculation"
  | "silly"
  | "time"
  | "interpretation"
  | "memory"
  | "strategy";
export type LectureKind = "live" | "recorded" | "marathon" | "basics" | "normal" | "other";
export type DayPart = "morning" | "afternoon" | "evening" | "night";
export type ThemeMode = "dark" | "light" | "system";
export type ChapterKind = "basics" | "marathon" | "normal" | "other";
export type MistakeStatus = "open" | "reviewed" | "mastered";
export type GoalMetric = "lectures" | "resources" | "practice" | "hours" | "custom";

export interface Profile {
  name: string;
  academicLevel: AcademicLevel;
  primaryGoals: string[];
  onboarded: boolean;
  onboardedAt?: ISODate;
}

export interface Settings {
  theme: ThemeMode;
  weekStartsOn: 0 | 1;
}

export interface ClassSlot {
  id: ID;
  label: string;
  time: string;
  endTime?: string;
  days: number[];
  enabled: boolean;
}

export interface Course {
  id: ID;
  name: string;
  description: string;
  archived: boolean;
  createdAt: ISODate;
}

export interface Subject {
  id: ID;
  name: string;
  short: string;
  courseIds: ID[];
  createdAt: ISODate;
}

export interface Chapter {
  id: ID;
  name: string;
  subjectId: ID;
  courseId: ID;
  order: number;
  kind: ChapterKind;
  notes: string;
  createdAt: ISODate;
}

export interface Topic {
  id: ID;
  name: string;
  chapterId: ID;
  order: number;
  status: ItemStatus;
}

export interface Lecture {
  id: ID;
  title: string;
  courseId: ID;
  subjectId: ID;
  chapterId?: ID;
  topicId?: ID;
  kind: LectureKind;
  durationMin?: number;
  status: ItemStatus;
  plannedDate?: DayKey;
  startedAt?: ISODate;
  completedAt?: ISODate;
  watchMin?: number;
  playbackSpeed?: number;
  notes: string;
  order: number;
}

export interface Resource {
  id: ID;
  title: string;
  kind: ResourceKind;
  courseId?: ID;
  subjectId?: ID;
  chapterId?: ID;
  lectureId?: ID;
  url: string;
  status: ItemStatus;
  notes: string;
  createdAt: ISODate;
}

export interface Task {
  id: ID;
  title: string;
  kind: TaskKind;
  subjectId?: ID;
  courseId?: ID;
  chapterId?: ID;
  lectureId?: ID;
  priority: Priority;
  dueDate?: DayKey;
  status: ItemStatus;
  estimatedMin?: number;
  actualMin?: number;
  notes: string;
  createdAt: ISODate;
  completedAt?: ISODate;
}

export interface StudySession {
  id: ID;
  date: DayKey;
  start?: string;
  end?: string;
  durationMin: number;
  courseId?: ID;
  subjectId?: ID;
  chapterId?: ID;
  activity: ActivityKind;
  notes: string;
  createdAt: ISODate;
}

export interface PracticeSession {
  id: ID;
  date: DayKey;
  subjectId: ID;
  chapterId?: ID;
  topicId?: ID;
  source: string;
  examKind: ExamKind;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeMin: number;
  notes: string;
  createdAt: ISODate;
}

export interface RevisionItem {
  id: ID;
  subjectId: ID;
  chapterId?: ID;
  topicId?: ID;
  title: string;
  firstStudied: ISODate;
  lastRevised: ISODate;
  nextRevision: DayKey;
  count: number;
  strength: Strength;
}

export interface TestRecord {
  id: ID;
  name: string;
  kind: ExamKind;
  date: DayKey;
  courseId?: ID;
  subjectId?: ID;
  chapterIds: ID[];
  maxMarks: number;
  marks: number;
  timeMin?: number;
  accuracy?: number;
  analysis: string;
  createdAt: ISODate;
}

export interface Mistake {
  id: ID;
  category: MistakeCategory;
  question: string;
  correctConcept: string;
  why: string;
  subjectId?: ID;
  chapterId?: ID;
  testId?: ID;
  source: string;
  status: MistakeStatus;
  reattempt: "correct" | "incorrect" | "pending";
  createdAt: ISODate;
}

export interface Goal {
  id: ID;
  title: string;
  horizon: GoalHorizon;
  description: string;
  metric?: GoalMetric;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: DayKey;
  courseId?: ID;
  subjectId?: ID;
  status: ItemStatus;
  createdAt: ISODate;
}

export interface Exam {
  id: ID;
  type?: string;
  pattern?: string;
  name: string;
  date?: DayKey;
  subjectIds: ID[];
  portion: string;
  priority: Priority;
  readinessNotes: string;
  createdAt: ISODate;
}

export interface StudyBlock {
  id: ID;
  date: DayKey;
  dayPart: DayPart;
  start?: string;
  end?: string;
  title: string;
  activity: ActivityKind;
  subjectId?: ID;
  chapterId?: ID;
  lectureId?: ID;
  taskId?: ID;
  status: ItemStatus;
  notes: string;
}

export interface CalendarEvent {
  id: ID;
  title: string;
  date: DayKey;
  start?: string;
  end?: string;
  kind: "session" | "deadline" | "test" | "exam" | "lecture" | "revision" | "other";
  refType?: string;
  refId?: ID;
  notes: string;
}

export interface ActivityEvent {
  id: ID;
  at: ISODate;
  text: string;
  kind: string;
  refType?: string;
  refId?: ID;
}

export interface JarvisMessage {
  id: ID;
  role: "user" | "assistant";
  content: string;
  at: ISODate;
}

export interface StudyData {
  lastKnownPlannerDate?: DayKey;
  legacyPlannerResourceProgress?: Record<string, Pick<Resource, "status" | "notes" | "url">>;
  legacyPlannerProgress?: Record<string, Pick<Lecture, "status" | "notes" | "startedAt" | "completedAt" | "watchMin">>;
  profile: Profile;
  settings: Settings;
  classSchedule: ClassSlot[];
  courses: Course[];
  subjects: Subject[];
  chapters: Chapter[];
  topics: Topic[];
  lectures: Lecture[];
  resources: Resource[];
  tasks: Task[];
  sessions: StudySession[];
  practice: PracticeSession[];
  revisions: RevisionItem[];
  tests: TestRecord[];
  mistakes: Mistake[];
  goals: Goal[];
  exams: Exam[];
  blocks: StudyBlock[];
  events: CalendarEvent[];
  activities: ActivityEvent[];
  jarvis: JarvisMessage[];
}

export const ACADEMIC_LEVELS: { value: AcademicLevel; label: string }[] = [
  { value: "1st_pu", label: "Karnataka 1st PU" },
  { value: "class_11", label: "Class 11" },
  { value: "2nd_pu", label: "Karnataka 2nd PU" },
  { value: "class_12", label: "Class 12" },
  { value: "dropper", label: "Dropper / Repeater" },
  { value: "university", label: "University" },
  { value: "other", label: "Other" },
];

export const TASK_KINDS: { value: TaskKind; label: string }[] = [
  { value: "lecture", label: "Lecture" },
  { value: "assignment", label: "Assignment" },
  { value: "practice", label: "Practice" },
  { value: "revision", label: "Revision" },
  { value: "reading", label: "Reading" },
  { value: "test", label: "Test" },
  { value: "test_analysis", label: "Test analysis" },
  { value: "college", label: "College work" },
  { value: "other", label: "Other" },
];

export const RESOURCE_KINDS: { value: ResourceKind; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "notes", label: "Notes" },
  { value: "link", label: "Link" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
  { value: "reference", label: "Reference" },
  { value: "formula_sheet", label: "Formula sheet" },
  { value: "question_sheet", label: "Question sheet" },
];

export const ACTIVITY_KINDS: { value: ActivityKind; label: string }[] = [
  { value: "lecture", label: "Lecture" },
  { value: "practice", label: "Practice" },
  { value: "revision", label: "Revision" },
  { value: "reading", label: "Reading" },
  { value: "assignment", label: "Assignment" },
  { value: "test", label: "Test" },
  { value: "test_analysis", label: "Test analysis" },
  { value: "other", label: "Other" },
];

export const EXAM_KINDS: { value: ExamKind; label: string }[] = [
  { value: "jee_main", label: "JEE Main" },
  { value: "jee_advanced", label: "JEE Advanced" },
  { value: "puc", label: "PUC" },
  { value: "chapter_test", label: "Chapter test" },
  { value: "mock", label: "Mock test" },
  { value: "other", label: "Other" },
];

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const STRENGTHS: { value: Strength; label: string }[] = [
  { value: "weak", label: "Weak" },
  { value: "developing", label: "Developing" },
  { value: "good", label: "Good" },
  { value: "strong", label: "Strong" },
];

export const MISTAKE_CATEGORIES: { value: MistakeCategory; label: string }[] = [
  { value: "concept", label: "Concept" },
  { value: "formula", label: "Formula" },
  { value: "calculation", label: "Calculation" },
  { value: "silly", label: "Silly mistake" },
  { value: "time", label: "Time management" },
  { value: "interpretation", label: "Question interpretation" },
  { value: "memory", label: "Memory" },
  { value: "strategy", label: "Strategy" },
];

export const DAY_PARTS: { value: DayPart; label: string; hint: string }[] = [
  { value: "morning", label: "Morning", hint: "Before noon" },
  { value: "afternoon", label: "Afternoon", hint: "Noon – 5" },
  { value: "evening", label: "Evening", hint: "5 – 9" },
  { value: "night", label: "Night", hint: "After 9" },
];

export const LECTURE_KINDS: { value: LectureKind; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "basics", label: "Basics" },
  { value: "marathon", label: "Marathon" },
  { value: "live", label: "Live" },
  { value: "recorded", label: "Recorded" },
  { value: "other", label: "Other" },
];
