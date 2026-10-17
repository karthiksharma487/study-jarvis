import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { nid, nowIso, todayKey } from "@/lib/utils";
import type {
  ActivityEvent,
  ActivityKind,
  CalendarEvent,
  Chapter,
  ClassSlot,
  Course,
  Exam,
  Goal,
  ItemStatus,
  JarvisMessage,
  Lecture,
  Mistake,
  PracticeSession,
  Profile,
  Resource,
  RevisionItem,
  Settings,
  Strength,
  StudyBlock,
  StudyData,
  StudySession,
  Subject,
  Task,
  TestRecord,
  Topic,
} from "./types";
import { createSeedData } from "./seed";
import { reconcilePlanner } from "./planner";
import { nextRevisionDay } from "./progress";

export const STORAGE_KEY = "study-jarvis-v1";

function patchById<T extends { id: string }>(arr: T[], id: string, patch: Partial<T>): T[] {
  return arr.map((x) => (x.id === id ? { ...x, ...patch } : x));
}

function dropId<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((x) => x.id !== id);
}

function activity(text: string, kind: string, refType?: string, refId?: string): ActivityEvent {
  return { id: nid("act"), at: nowIso(), text, kind, refType, refId };
}

function pushActivity(list: ActivityEvent[], ev: ActivityEvent): ActivityEvent[] {
  return [ev, ...list].slice(0, 80);
}

type Updaters = {
  completeOnboarding: (profile: Pick<Profile, "name" | "academicLevel" | "primaryGoals">) => void;
  setProfile: (patch: Partial<Profile>) => void;
  setSettings: (patch: Partial<Settings>) => void;
  setClassSchedule: (slots: ClassSlot[]) => void;
  addCourse: (input: Pick<Course, "name" | "description">) => string;
  updateCourse: (id: string, patch: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addSubject: (input: Pick<Subject, "name" | "short"> & { courseIds?: string[] }) => string;
  updateSubject: (id: string, patch: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  addChapter: (input: Omit<Chapter, "id" | "createdAt">) => string;
  updateChapter: (id: string, patch: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  addTopic: (input: Omit<Topic, "id">) => string;
  updateTopic: (id: string, patch: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  addLecture: (input: Omit<Lecture, "id" | "status" | "notes" | "order"> & { notes?: string; order?: number; status?: ItemStatus }) => string;
  updateLecture: (id: string, patch: Partial<Lecture>) => void;
  setLectureStatus: (id: string, status: ItemStatus) => void;
  deleteLecture: (id: string) => void;
  addResource: (input: Omit<Resource, "id" | "createdAt" | "status" | "notes"> & { notes?: string; status?: ItemStatus }) => string;
  updateResource: (id: string, patch: Partial<Resource>) => void;
  setResourceStatus: (id: string, status: ItemStatus) => void;
  deleteResource: (id: string) => void;
  addTask: (input: Omit<Task, "id" | "createdAt" | "status"> & { status?: ItemStatus }) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  setTaskStatus: (id: string, status: ItemStatus) => void;
  deleteTask: (id: string) => void;
  addSession: (input: Omit<StudySession, "id" | "createdAt">) => string;
  updateSession: (id: string, patch: Partial<StudySession>) => void;
  deleteSession: (id: string) => void;
  addPractice: (input: Omit<PracticeSession, "id" | "createdAt">) => string;
  updatePractice: (id: string, patch: Partial<PracticeSession>) => void;
  deletePractice: (id: string) => void;
  addRevision: (input: Omit<RevisionItem, "id" | "count" | "firstStudied" | "lastRevised" | "nextRevision"> & Partial<Pick<RevisionItem, "count" | "firstStudied" | "lastRevised" | "nextRevision">>) => string;
  markRevised: (id: string, strength?: Strength) => void;
  updateRevision: (id: string, patch: Partial<RevisionItem>) => void;
  deleteRevision: (id: string) => void;
  addTest: (input: Omit<TestRecord, "id" | "createdAt">) => string;
  updateTest: (id: string, patch: Partial<TestRecord>) => void;
  deleteTest: (id: string) => void;
  addMistake: (input: Omit<Mistake, "id" | "createdAt" | "status" | "reattempt"> & Partial<Pick<Mistake, "status" | "reattempt">>) => string;
  updateMistake: (id: string, patch: Partial<Mistake>) => void;
  deleteMistake: (id: string) => void;
  addGoal: (input: Omit<Goal, "id" | "createdAt" | "status"> & { status?: ItemStatus }) => string;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addExam: (input: Omit<Exam, "id" | "createdAt">) => string;
  updateExam: (id: string, patch: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  addBlock: (input: Omit<StudyBlock, "id" | "status"> & { status?: ItemStatus }) => string;
  updateBlock: (id: string, patch: Partial<StudyBlock>) => void;
  deleteBlock: (id: string) => void;
  addEvent: (input: Omit<CalendarEvent, "id">) => string;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  addJarvisMessage: (msg: Omit<JarvisMessage, "id" | "at"> & { at?: string }) => void;
  clearJarvis: () => void;
  importData: (data: Partial<StudyData>) => { ok: true } | { ok: false; error: string };
  resetToSeed: () => void;
};

export type StudyStore = StudyData & Updaters;

const empty = createSeedData();

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      ...empty,

      completeOnboarding: (profile) =>
        set((s) => ({
          profile: {
            ...s.profile,
            ...profile,
            onboarded: true,
            onboardedAt: nowIso(),
          },
          activities: pushActivity(s.activities, activity(`Welcome, ${profile.name}.`, "onboarding")),
        })),

      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setClassSchedule: (slots) => set({ classSchedule: slots }),

      addCourse: (input) => {
        const id = nid("course");
        set((s) => ({
          courses: [
            ...s.courses,
            { id, name: input.name, description: input.description, archived: false, createdAt: nowIso() },
          ],
          activities: pushActivity(s.activities, activity(`Created course ${input.name}`, "course", "course", id)),
        }));
        return id;
      },
      updateCourse: (id, patch) => set((s) => ({ courses: patchById(s.courses, id, patch) })),
      deleteCourse: (id) =>
        set((s) => ({
          courses: dropId(s.courses, id),
          activities: pushActivity(s.activities, activity("Removed a course", "course")),
        })),

      addSubject: (input) => {
        const id = nid("subject");
        set((s) => ({
          subjects: [
            ...s.subjects,
            {
              id,
              name: input.name,
              short: input.short,
              courseIds: input.courseIds ?? [],
              createdAt: nowIso(),
            },
          ],
          activities: pushActivity(s.activities, activity(`Added subject ${input.name}`, "subject", "subject", id)),
        }));
        return id;
      },
      updateSubject: (id, patch) => set((s) => ({ subjects: patchById(s.subjects, id, patch) })),
      deleteSubject: (id) => set((s) => ({ subjects: dropId(s.subjects, id) })),

      addChapter: (input) => {
        const id = nid("chapter");
        set((s) => ({
          chapters: [...s.chapters, { ...input, id, createdAt: nowIso() }],
          activities: pushActivity(s.activities, activity(`Added chapter ${input.name}`, "chapter", "chapter", id)),
        }));
        return id;
      },
      updateChapter: (id, patch) => set((s) => ({ chapters: patchById(s.chapters, id, patch) })),
      deleteChapter: (id) =>
        set((s) => ({
          chapters: dropId(s.chapters, id),
          lectures: s.lectures.map((l) => (l.chapterId === id ? { ...l, chapterId: undefined } : l)),
        })),

      addTopic: (input) => {
        const id = nid("topic");
        set((s) => ({ topics: [...s.topics, { ...input, id }] }));
        return id;
      },
      updateTopic: (id, patch) => set((s) => ({ topics: patchById(s.topics, id, patch) })),
      deleteTopic: (id) => set((s) => ({ topics: dropId(s.topics, id) })),

      addLecture: (input) => {
        const id = nid("lecture");
        set((s) => {
          const order = input.order ?? s.lectures.length + 1;
          return {
            lectures: [
              ...s.lectures,
              { notes: "", status: "not_started", ...input, id, order },
            ],
            activities: pushActivity(s.activities, activity(`Added ${input.title}`, "lecture", "lecture", id)),
          };
        });
        return id;
      },
      updateLecture: (id, patch) => set((s) => ({ lectures: patchById(s.lectures, id, patch) })),
      setLectureStatus: (id, status) =>
        set((s) => {
          const lec = s.lectures.find((l) => l.id === id);
          if (!lec) return s;
          const completedAt = status === "completed" ? nowIso() : status === "not_started" ? undefined : lec.completedAt;
          const startedAt =
            status === "in_progress" && !lec.startedAt
              ? nowIso()
              : status === "not_started"
                ? undefined
                : lec.startedAt;
          let revisions = s.revisions;
          let activities = s.activities;
          if (status === "completed" && lec.status !== "completed") {
            activities = pushActivity(activities, activity(`Completed ${lec.title}`, "lecture", "lecture", id));
            const already = revisions.some(
              (r) => r.title === lec.title || (Boolean(lec.chapterId) && r.chapterId === lec.chapterId && r.title === lec.title),
            );
            if (!already) {
              revisions = [
                {
                  id: nid("rev"),
                  subjectId: lec.subjectId,
                  chapterId: lec.chapterId,
                  title: lec.title,
                  firstStudied: nowIso(),
                  lastRevised: nowIso(),
                  nextRevision: nextRevisionDay(1),
                  count: 1,
                  strength: "developing",
                },
                ...revisions,
              ];
            }
          } else if (status !== "completed" && lec.status === "completed") {
            activities = pushActivity(activities, activity(`Reopened ${lec.title}`, "lecture", "lecture", id));
          } else if (status === "in_progress" && lec.status === "not_started") {
            activities = pushActivity(activities, activity(`Started ${lec.title}`, "lecture", "lecture", id));
          }
          return {
            lectures: patchById(s.lectures, id, { status, completedAt, startedAt }),
            revisions,
            activities,
          };
        }),
      deleteLecture: (id) => set((s) => ({ lectures: dropId(s.lectures, id) })),

      addResource: (input) => {
        const id = nid("res");
        set((s) => ({
          resources: [
            ...s.resources,
            { notes: "", status: "not_started", ...input, id, createdAt: nowIso() },
          ],
          activities: pushActivity(s.activities, activity(`Added ${input.title}`, "resource", "resource", id)),
        }));
        return id;
      },
      updateResource: (id, patch) => set((s) => ({ resources: patchById(s.resources, id, patch) })),
      setResourceStatus: (id, status) =>
        set((s) => {
          const r = s.resources.find((x) => x.id === id);
          if (!r) return s;
          let activities = s.activities;
          if (status === "completed" && r.status !== "completed") {
            activities = pushActivity(activities, activity(`Completed ${r.title}`, "resource", "resource", id));
          }
          return { resources: patchById(s.resources, id, { status }), activities };
        }),
      deleteResource: (id) => set((s) => ({ resources: dropId(s.resources, id) })),

      addTask: (input) => {
        const id = nid("task");
        set((s) => ({
          tasks: [...s.tasks, { status: "not_started", ...input, id, createdAt: nowIso() }],
          activities: pushActivity(s.activities, activity(`Added task ${input.title}`, "task", "task", id)),
        }));
        return id;
      },
      updateTask: (id, patch) => set((s) => ({ tasks: patchById(s.tasks, id, patch) })),
      setTaskStatus: (id, status) =>
        set((s) => {
          const t = s.tasks.find((x) => x.id === id);
          if (!t) return s;
          const completedAt = status === "completed" ? nowIso() : undefined;
          let activities = s.activities;
          if (status === "completed" && t.status !== "completed") {
            activities = pushActivity(activities, activity(`Completed task ${t.title}`, "task", "task", id));
          }
          return { tasks: patchById(s.tasks, id, { status, completedAt }), activities };
        }),
      deleteTask: (id) => set((s) => ({ tasks: dropId(s.tasks, id) })),

      addSession: (input) => {
        const id = nid("sess");
        const sub = get().subjects.find((x) => x.id === input.subjectId)?.name;
        const label = sub ? `${input.durationMin}m ${sub} ${input.activity}` : `${input.durationMin}m ${input.activity}`;
        set((s) => ({
          sessions: [{ ...input, id, createdAt: nowIso() }, ...s.sessions],
          activities: pushActivity(s.activities, activity(`Logged ${label}`, "session", "session", id)),
        }));
        return id;
      },
      updateSession: (id, patch) => set((s) => ({ sessions: patchById(s.sessions, id, patch) })),
      deleteSession: (id) => set((s) => ({ sessions: dropId(s.sessions, id) })),

      addPractice: (input) => {
        const id = nid("prac");
        const acc = input.attempted ? Math.round((input.correct / input.attempted) * 100) : 0;
        set((s) => ({
          practice: [{ ...input, id, createdAt: nowIso() }, ...s.practice],
          activities: pushActivity(
            s.activities,
            activity(`Logged practice · ${input.correct}/${input.attempted} (${acc}%)`, "practice", "practice", id),
          ),
        }));
        return id;
      },
      updatePractice: (id, patch) => set((s) => ({ practice: patchById(s.practice, id, patch) })),
      deletePractice: (id) => set((s) => ({ practice: dropId(s.practice, id) })),

      addRevision: (input) => {
        const id = nid("rev");
        const now = nowIso();
        set((s) => ({
          revisions: [
            {
              count: 1,
              firstStudied: now,
              lastRevised: now,
              nextRevision: nextRevisionDay(1),
              ...input,
              id,
            },
            ...s.revisions,
          ],
        }));
        return id;
      },
      markRevised: (id, strength) =>
        set((s) => {
          const r = s.revisions.find((x) => x.id === id);
          if (!r) return s;
          const count = r.count + 1;
          return {
            revisions: patchById(s.revisions, id, {
              count,
              lastRevised: nowIso(),
              nextRevision: nextRevisionDay(count),
              strength: strength ?? r.strength,
            }),
            activities: pushActivity(s.activities, activity(`Revised ${r.title}`, "revision", "revision", id)),
          };
        }),
      updateRevision: (id, patch) => set((s) => ({ revisions: patchById(s.revisions, id, patch) })),
      deleteRevision: (id) => set((s) => ({ revisions: dropId(s.revisions, id) })),

      addTest: (input) => {
        const id = nid("test");
        set((s) => ({
          tests: [{ ...input, id, createdAt: nowIso() }, ...s.tests],
          activities: pushActivity(
            s.activities,
            activity(`Logged test ${input.name} · ${input.marks}/${input.maxMarks}`, "test", "test", id),
          ),
        }));
        return id;
      },
      updateTest: (id, patch) => set((s) => ({ tests: patchById(s.tests, id, patch) })),
      deleteTest: (id) => set((s) => ({ tests: dropId(s.tests, id) })),

      addMistake: (input) => {
        const id = nid("mis");
        set((s) => ({
          mistakes: [
            { status: "open", reattempt: "pending", ...input, id, createdAt: nowIso() },
            ...s.mistakes,
          ],
        }));
        return id;
      },
      updateMistake: (id, patch) => set((s) => ({ mistakes: patchById(s.mistakes, id, patch) })),
      deleteMistake: (id) => set((s) => ({ mistakes: dropId(s.mistakes, id) })),

      addGoal: (input) => {
        const id = nid("goal");
        set((s) => ({
          goals: [{ status: "not_started", ...input, id, createdAt: nowIso() }, ...s.goals],
        }));
        return id;
      },
      updateGoal: (id, patch) => set((s) => ({ goals: patchById(s.goals, id, patch) })),
      deleteGoal: (id) => set((s) => ({ goals: dropId(s.goals, id) })),

      addExam: (input) => {
        const id = nid("exam");
        set((s) => ({
          exams: [{ ...input, id, createdAt: nowIso() }, ...s.exams],
        }));
        return id;
      },
      updateExam: (id, patch) => set((s) => ({ exams: patchById(s.exams, id, patch) })),
      deleteExam: (id) => set((s) => ({ exams: dropId(s.exams, id) })),

      addBlock: (input) => {
        const id = nid("block");
        set((s) => ({
          blocks: [...s.blocks, { status: "not_started", ...input, id }],
        }));
        return id;
      },
      updateBlock: (id, patch) => set((s) => ({ blocks: patchById(s.blocks, id, patch) })),
      deleteBlock: (id) => set((s) => ({ blocks: dropId(s.blocks, id) })),

      addEvent: (input) => {
        const id = nid("evt");
        set((s) => ({ events: [...s.events, { ...input, id }] }));
        return id;
      },
      updateEvent: (id, patch) => set((s) => ({ events: patchById(s.events, id, patch) })),
      deleteEvent: (id) => set((s) => ({ events: dropId(s.events, id) })),

      addJarvisMessage: (msg) =>
        set((s) => ({
          jarvis: [...s.jarvis, { id: nid("jv"), at: nowIso(), ...msg }].slice(-60),
        })),
      clearJarvis: () => set({ jarvis: [] }),

      importData: (incoming) => {
        try {
          const seed = createSeedData();
          const next: StudyData = {
            ...seed,
            ...incoming,
            profile: { ...seed.profile, ...(incoming.profile ?? {}) },
            settings: { ...seed.settings, ...(incoming.settings ?? {}) },
          };
          if (!Array.isArray(next.lectures) || !Array.isArray(next.subjects)) {
            return { ok: false as const, error: "File is missing required academic collections." };
          }
          set({ ...reconcilePlanner(next) });
          return { ok: true as const };
        } catch {
          return { ok: false as const, error: "Could not read that file." };
        }
      },
      resetToSeed: () => set({ ...createSeedData(), profile: { ...createSeedData().profile, onboarded: true } }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      merge: (persisted, current) => ({ ...current, ...reconcilePlanner((persisted ?? {}) as Partial<StudyData>) }),
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const skip = new Set<string>([
          "completeOnboarding",
          "setProfile",
          "setSettings",
          "setClassSchedule",
          "addCourse",
          "updateCourse",
          "deleteCourse",
          "addSubject",
          "updateSubject",
          "deleteSubject",
          "addChapter",
          "updateChapter",
          "deleteChapter",
          "addTopic",
          "updateTopic",
          "deleteTopic",
          "addLecture",
          "updateLecture",
          "setLectureStatus",
          "deleteLecture",
          "addResource",
          "updateResource",
          "setResourceStatus",
          "deleteResource",
          "addTask",
          "updateTask",
          "setTaskStatus",
          "deleteTask",
          "addSession",
          "updateSession",
          "deleteSession",
          "addPractice",
          "updatePractice",
          "deletePractice",
          "addRevision",
          "markRevised",
          "updateRevision",
          "deleteRevision",
          "addTest",
          "updateTest",
          "deleteTest",
          "addMistake",
          "updateMistake",
          "deleteMistake",
          "addGoal",
          "updateGoal",
          "deleteGoal",
          "addExam",
          "updateExam",
          "deleteExam",
          "addBlock",
          "updateBlock",
          "deleteBlock",
          "addEvent",
          "updateEvent",
          "deleteEvent",
          "addJarvisMessage",
          "clearJarvis",
          "importData",
          "resetToSeed",
        ]);
        const data: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(s)) {
          if (!skip.has(k) && typeof v !== "function") data[k] = v;
        }
        return data as unknown as StudyData;
      },
    },
  ),
);

export function exportStudyJson(): string {
  const s = useStudyStore.getState();
  const { ...rest } = s;
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v !== "function") data[k] = v;
  }
  return JSON.stringify({ app: "study-jarvis", version: 1, exportedAt: nowIso(), data }, null, 2);
}

export function exportCsv(kind: "lectures" | "tasks" | "sessions"): string {
  const s = useStudyStore.getState();
  if (kind === "lectures") {
    const header = "title,subject,kind,status,plannedDate,completedAt";
    const rows = s.lectures.map((l) => {
      const sub = s.subjects.find((x) => x.id === l.subjectId)?.name ?? "";
      return [l.title, sub, l.kind, l.status, l.plannedDate ?? "", l.completedAt ?? ""]
        .map(csvCell)
        .join(",");
    });
    return [header, ...rows].join("\n");
  }
  if (kind === "tasks") {
    const header = "title,kind,priority,status,dueDate";
    const rows = s.tasks.map((t) => [t.title, t.kind, t.priority, t.status, t.dueDate ?? ""].map(csvCell).join(","));
    return [header, ...rows].join("\n");
  }
  const header = "date,durationMin,activity,subject,notes";
  const rows = s.sessions.map((x) => {
    const sub = s.subjects.find((s2) => s2.id === x.subjectId)?.name ?? "";
    return [x.date, String(x.durationMin), x.activity, sub, x.notes].map(csvCell).join(",");
  });
  return [header, ...rows].join("\n");
}

function csvCell(v: string): string {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replaceAll('"', '""')}"`;
  return v;
}

export function logQuickSession(opts: {
  durationMin: number;
  activity: ActivityKind;
  subjectId?: string;
  notes?: string;
}): void {
  useStudyStore.getState().addSession({
    date: todayKey(),
    durationMin: opts.durationMin,
    activity: opts.activity,
    subjectId: opts.subjectId,
    notes: opts.notes ?? "",
  });
}
