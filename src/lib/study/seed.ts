import type {
  Chapter,
  ClassSlot,
  Course,
  Exam,
  Goal,
  Lecture,
  Resource,
  StudyData,
  Subject,
} from "./types";
import { IDS, realChapterId, realExamId, realLectureId, realResourceId } from "./ids";
import planData from "./data/mission-jee-plan.json";

const CREATED = "2026-04-01T00:00:00.000Z";

type SubjectKey = "physics" | "chemistry" | "mathematics";

type PlanLecture = { date: string; chapter: string; topic: string };
type PlanExam = { date: string; name: string; type: string; pattern: string };

const PLAN = planData as {
  classSchedule: {
    slot1: { label: string; time: string; endTime: string };
    slot2: { label: string; time: string; endTime: string };
    weeklyPattern: Record<string, { slot1: SubjectKey; slot2: SubjectKey }>;
    sundayOff: boolean;
    weeklyTestDay: string;
  };
  chapters: Record<SubjectKey, string[]>;
  lectures: Record<SubjectKey, PlanLecture[]>;
  tests: PlanExam[];
  lastKnownPlannerDate: string;
};

const SUBJECTS: { id: string; name: string; short: string; key: SubjectKey }[] = [
  { id: IDS.physics, name: "Physics", short: "PHY", key: "physics" },
  { id: IDS.chemistry, name: "Chemistry", short: "CHM", key: "chemistry" },
  { id: IDS.mathematics, name: "Mathematics", short: "MTH", key: "mathematics" },
];

function course(): Course {
  return {
    id: IDS.courseJee,
    name: "Mission JEE — Drona JEE 2.0 (2027 Batch)",
    description:
      "Real batch schedule from the Drona JEE 2.0 Class 11th Lecture Planner and Test Planner: Physics, Chemistry and Mathematics for JEE Main & Advanced 2028, live online, six days a week.",
    archived: false,
    createdAt: CREATED,
  };
}

function subjects(): Subject[] {
  return SUBJECTS.map((s) => ({
    id: s.id,
    name: s.name,
    short: s.short,
    courseIds: [IDS.courseJee],
    createdAt: CREATED,
  }));
}

function chapters(): Chapter[] {
  const out: Chapter[] = [];
  for (const s of SUBJECTS) {
    const names = PLAN.chapters[s.key];
    names.forEach((name, order) => {
      out.push({
        id: realChapterId(s.key, name),
        name,
        subjectId: s.id,
        courseId: IDS.courseJee,
        order,
        kind: "normal",
        notes: "",
        createdAt: CREATED,
      });
    });
  }
  return out;
}

function lectures(): Lecture[] {
  const out: Lecture[] = [];
  for (const s of SUBJECTS) {
    const rows = PLAN.lectures[s.key];
    rows.forEach((row, i) => {
      out.push({
        id: realLectureId(s.key, row.date, i),
        title: row.topic,
        courseId: IDS.courseJee,
        subjectId: s.id,
        chapterId: realChapterId(s.key, row.chapter),
        kind: "normal",
        status: "not_started",
        plannedDate: row.date,
        notes: "",
        order: i,
      });
    });
  }
  return out;
}

function resources(): Resource[] {
  const out: Resource[] = [];
  for (const s of SUBJECTS) {
    const rows = PLAN.lectures[s.key];
    rows.forEach((row, i) => {
      out.push({
        id: realResourceId(s.key, row.date, i),
        title: `${row.chapter} — PDF Notes (${row.date})`,
        kind: "pdf",
        courseId: IDS.courseJee,
        subjectId: s.id,
        chapterId: realChapterId(s.key, row.chapter),
        lectureId: realLectureId(s.key, row.date, i),
        url: "",
        status: "not_started",
        notes: "Uploaded after the live class, per batch policy.",
        createdAt: CREATED,
      });
    });
  }
  return out;
}

function classSchedule(): ClassSlot[] {
  const out: ClassSlot[] = [];
  const subjectLabel: Record<SubjectKey, string> = {
    physics: "Physics",
    chemistry: "Chemistry",
    mathematics: "Mathematics",
  };
  for (const [weekday, pattern] of Object.entries(PLAN.classSchedule.weeklyPattern)) {
    const day = Number(weekday);
    out.push({
      id: `class-${day}-slot1`,
      label: `${subjectLabel[pattern.slot1]} — Live Class`,
      time: PLAN.classSchedule.slot1.time,
      endTime: PLAN.classSchedule.slot1.endTime,
      days: [day],
      enabled: true,
    });
    out.push({
      id: `class-${day}-slot2`,
      label: `${subjectLabel[pattern.slot2]} — Live Class`,
      time: PLAN.classSchedule.slot2.time,
      endTime: PLAN.classSchedule.slot2.endTime,
      days: [day],
      enabled: true,
    });
  }
  return out;
}

function exams(): Exam[] {
  return PLAN.tests.map((t) => ({
    id: realExamId(t.date, t.name),
    name: t.name,
    type: t.type,
    pattern: t.pattern,
    date: t.date,
    subjectIds: [IDS.physics, IDS.chemistry, IDS.mathematics],
    portion: `${t.type} · ${t.pattern}`,
    priority: t.pattern === "Full Test" ? "critical" : "high",
    readinessNotes: "",
    createdAt: CREATED,
  }));
}

function goals(): Goal[] {
  const allLectures = lectures();
  return [
    {
      id: IDS.goalBacklog,
      title: "Clear the Drona JEE 2.0 lecture backlog",
      horizon: "long_term",
      description: "Watch every live class that has already happened, across Physics, Chemistry and Mathematics.",
      metric: "lectures",
      target: allLectures.length,
      courseId: IDS.courseJee,
      status: "not_started",
      createdAt: CREATED,
    },
  ];
}

export function createSeedData(): StudyData {
  return {
    lastKnownPlannerDate: PLAN.lastKnownPlannerDate,
    lectureTicks: {},
    profile: {
      name: "",
      academicLevel: "class_11",
      primaryGoals: ["JEE Main 2028", "JEE Advanced 2028"],
      onboarded: false,
    },
    settings: {
      theme: "dark",
      weekStartsOn: 1,
    },
    classSchedule: classSchedule(),
    courses: [course()],
    subjects: subjects(),
    chapters: chapters(),
    topics: [],
    lectures: lectures(),
    resources: resources(),
    tasks: [],
    sessions: [],
    practice: [],
    revisions: [],
    tests: [],
    mistakes: [],
    goals: goals(),
    exams: exams(),
    blocks: [],
    events: [],
    activities: [],
    jarvis: [],
  };
}

export const SUBJECT_PRESETS = [
  { name: "Physics", short: "PHY" },
  { name: "Chemistry", short: "CHM" },
  { name: "Mathematics", short: "MTH" },
  { name: "Computer Science", short: "CS" },
  { name: "English", short: "ENG" },
  { name: "Hindi", short: "HIN" },
];
