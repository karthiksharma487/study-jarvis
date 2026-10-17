import { createSeedData } from "./seed";
import { IDS } from "./ids";
import type { Lecture, Resource, StudyData } from "./types";

// Keep user work while refreshing planner-owned content, including old backups.
export function reconcilePlanner(saved: Partial<StudyData>): StudyData {
  const seed = createSeedData();
  const data = { ...seed, ...saved };
  const aliases = new Map<string, string>();
  const oldLectures = saved.lectures ?? [];
  const oldResources = saved.resources ?? [];
  const generatedLecture = (id: string) => /^lecture-(physics|chemistry|mathematics)-/.test(id);
  const generatedResource = (id: string) => /^resource-(physics|chemistry|mathematics)-/.test(id);
  const lectureById = new Map(oldLectures.map((l) => [l.id, l]));
  const resourceById = new Map(oldResources.map((r) => [r.id, r]));
  const matched = new Set<string>();
  const matchedResources = new Set<string>();

  const lectures = seed.lectures.map((lecture): Lecture => {
    const subject = lecture.subjectId.replace("subject-", "");
    const legacyId = `lecture-${subject}-normal-${lecture.order + 1}`;
    const old = lectureById.get(lecture.id) ?? lectureById.get(legacyId);
    if (!old) return lecture;
    aliases.set(old.id, lecture.id);
    matched.add(old.id);
    return {
      ...lecture,
      status: old.status,
      notes: old.notes,
      startedAt: old.startedAt,
      completedAt: old.completedAt,
      watchMin: old.watchMin,
      playbackSpeed: old.playbackSpeed,
      durationMin: old.durationMin,
    };
  });
  const resources = seed.resources.map((resource): Resource => {
    const lecture = seed.lectures.find((l) => l.id === resource.lectureId)!;
    const subject = lecture.subjectId.replace("subject-", "");
    const legacyId = `resource-${subject}-pdf-${lecture.order + 1}`;
    const old = resourceById.get(resource.id) ?? resourceById.get(legacyId);
    if (!old) return resource;
    aliases.set(old.id, resource.id);
    matchedResources.add(old.id);
    return { ...resource, status: old.status, notes: old.notes, url: old.url };
  });

  // Special legacy placeholders have no equivalent in the supplied planner.
  // Retain their progress for recovery without assigning it to an unrelated topic.
  const unmatched = oldLectures.filter((l) => generatedLecture(l.id) && !matched.has(l.id));
  data.legacyPlannerProgress = {
    ...saved.legacyPlannerProgress,
    ...Object.fromEntries(unmatched.map(({ id, status, notes, startedAt, completedAt, watchMin }) =>
      [id, { status, notes, startedAt, completedAt, watchMin }],
    )),
  };
  data.lastKnownPlannerDate = seed.lastKnownPlannerDate;
  data.legacyPlannerResourceProgress = {
    ...saved.legacyPlannerResourceProgress,
    ...Object.fromEntries(oldResources.filter((r) => generatedResource(r.id) && !matchedResources.has(r.id))
      .map(({ id, status, notes, url }) => [id, { status, notes, url }])),
  };
  data.lectures = [...lectures, ...oldLectures.filter((l) => !generatedLecture(l.id))];
  data.resources = [...resources, ...oldResources.filter((r) => !generatedResource(r.id))];
  data.chapters = [
    ...seed.chapters.map((chapter) => ({ ...chapter, notes: saved.chapters?.find((c) => c.id === chapter.id)?.notes ?? chapter.notes })),
    ...(saved.chapters ?? []).filter((c) => c.courseId !== IDS.courseJee),
  ];
  data.classSchedule = seed.classSchedule.map((slot) => ({
    ...slot, enabled: saved.classSchedule?.find((s) => s.id === slot.id)?.enabled ?? slot.enabled,
  }));
  data.goals = data.goals.map((goal) => goal.id === IDS.goalBacklog
    ? { ...goal, target: seed.lectures.length } : goal);
  data.exams = [
    ...seed.exams.map((exam) => ({
      ...exam,
      priority: saved.exams?.find((e) => e.id === exam.id)?.priority ?? exam.priority,
      readinessNotes: saved.exams?.find((e) => e.id === exam.id)?.readinessNotes ?? "",
    })),
    ...(saved.exams ?? []).filter((e) => !e.id.startsWith("exam-")),
  ];
  data.courses = [...seed.courses, ...(saved.courses ?? []).filter((c) => c.id !== IDS.courseJee)];
  data.subjects = [...seed.subjects, ...(saved.subjects ?? []).filter((s) => !seed.subjects.some((x) => x.id === s.id))];

  // References held by tasks, study sessions, revisions, etc. follow renamed IDs.
  function remap(value: unknown, key = ""): unknown {
    if (typeof value === "string" && /^(lectureId|resourceId|refId)$/.test(key)) return aliases.get(value) ?? value;
    if (Array.isArray(value)) return value.map((v) => remap(v));
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remap(v, k)]));
    return value;
  }
  return remap(data) as StudyData;
}
