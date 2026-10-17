import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const server = await createServer({ configFile: false, resolve: { alias: { "@": new URL("../src", import.meta.url).pathname } }, cacheDir: "node_modules/.vite-planner-tests", server: { middlewareMode: true }, appType: "custom" });
const { createSeedData } = await server.ssrLoadModule("/src/lib/study/seed.ts");
const { reconcilePlanner } = await server.ssrLoadModule("/src/lib/study/planner.ts");
const plan = JSON.parse(readFileSync(new URL("../src/lib/study/data/mission-jee-plan.json", import.meta.url)));
try {
  test("planner content matches every source row and timetable slot", () => {
    const data = createSeedData();
    for (const subject of Object.keys(plan.chapters)) {
      assert.deepEqual(data.chapters.filter((c) => c.subjectId === `subject-${subject}`).map((c) => c.name), plan.chapters[subject]);
      assert.deepEqual(data.lectures.filter((l) => l.subjectId === `subject-${subject}`).map((l) => ({
        date: l.plannedDate, topic: l.title, chapter: data.chapters.find((c) => c.id === l.chapterId).name,
      })), plan.lectures[subject]);
    }
    assert.deepEqual(data.exams.map(({ date, name, type, pattern }) => ({ date, name, type, pattern })), plan.tests);
    assert.equal(new Set(data.lectures.map((l) => l.id)).size, data.lectures.length);
    for (const [day, slots] of Object.entries(plan.classSchedule.weeklyPattern)) {
      for (const slot of ["slot1", "slot2"]) {
        const actual = data.classSchedule.find((c) => c.id === `class-${day}-${slot}`);
        assert.equal(actual.time, plan.classSchedule[slot].time);
        assert.equal(actual.endTime, plan.classSchedule[slot].endTime);
        assert.deepEqual(actual.days, [Number(day)]);
        assert.ok(actual.label.toLowerCase().includes(slots[slot]));
      }
    }
    assert.equal(data.classSchedule.length, Object.keys(plan.classSchedule.weeklyPattern).length * 2);
  });
  test("refresh and backup import retain progress, custom records, and legacy references", () => {
    const saved = createSeedData();
    delete saved.lectureTicks; // Simulate a backup made before checkbox tracking.
    saved.profile.name = "Test student";
    const first = saved.lectures[0];
    first.id = "lecture-physics-normal-1";
    first.title = "Physics Lecture 1";
    first.status = "completed";
    first.notes = "Personal note";
    first.watchMin = 90;
    saved.sessions = [{ id: "sess_custom", lectureId: first.id }];
    saved.lectures.push({ ...first, id: "lecture-physics-basics" });
    saved.exams.push({ ...saved.exams[0], id: "exam_custom", name: "Personal exam" });
    saved.chapters[0].name = "Placeholder chapter";
    const next = reconcilePlanner(saved);
    assert.equal(next.lectures[0].title, plan.lectures.physics[0].topic);
    assert.equal(next.lectures[0].status, "completed");
    assert.equal(next.lectures[0].watchMin, 90);
    assert.equal(next.lectures[0].notes, "Personal note");
    assert.equal(next.sessions[0].lectureId, next.lectures[0].id);
    assert.equal(next.profile.name, saved.profile.name);
    assert.equal(next.legacyPlannerProgress["lecture-physics-basics"].status, "completed");
    assert.equal(next.exams.at(-1).name, "Personal exam");
    assert.equal(next.lectures.length, 405);
    assert.deepEqual(reconcilePlanner(next), next);
  });
  const { chapterProgress, deriveChapterStatus, completionSummary } = await server.ssrLoadModule("/src/lib/study/progress.ts");
  const { useStudyStore } = await server.ssrLoadModule("/src/lib/study/store.ts");
  const { tryLocalCommand } = await server.ssrLoadModule("/src/lib/study/commands.ts");
  test("chapter completion counts delivered ticks only and reverses on a middle untick", () => {
    const data = createSeedData();
    const chapter = data.chapters[0];
    data.lectures = data.lectures.filter((l) => l.chapterId === chapter.id).slice(0, 3);
    const [first, middle, future] = data.lectures;
    const today = middle.plannedDate;
    data.lectureTicks = { [first.id]: true, [middle.id]: true };
    data.revisions = [{ chapterId: chapter.id, nextRevision: "2000-01-01", strength: "weak" }];
    assert.equal(chapterProgress(data, chapter.id, today).total, 2);
    assert.equal(deriveChapterStatus(data, chapter, today), "completed");
    assert.equal(completionSummary(data, undefined, today).chapters.done, 1);
    assert.equal(completionSummary(data, chapter.subjectId, today).lectures.done, 2);
    assert.equal(deriveChapterStatus(data, chapter, future.plannedDate), "in_progress");
    data.lectureTicks[middle.id] = false;
    assert.equal(deriveChapterStatus(data, chapter, today), "in_progress");
    assert.equal(completionSummary(data, undefined, today).chapters.done, 0);
    assert.equal(completionSummary(data, undefined, "2000-01-01").chapters.total, 0);
    data.lectureTicks = { [future.id]: true };
    assert.equal(completionSummary(data, undefined, today).lectures.done, 0);
  });
  test("only individual checkbox action changes ticks; commands, import and reset cannot complete lectures", () => {
    useStudyStore.setState(createSeedData());
    const [first, second] = useStudyStore.getState().lectures;
    useStudyStore.getState().setLectureChecked(first.id, true);
    assert.equal(useStudyStore.getState().lectureTicks[first.id], true);
    assert.notEqual(useStudyStore.getState().lectureTicks[second.id], true);
    useStudyStore.getState().updateLecture(second.id, { status: "completed" });
    assert.equal(useStudyStore.getState().lectures[1].status, "not_started");
    tryLocalCommand(`complete ${second.title}`);
    assert.notEqual(useStudyStore.getState().lectureTicks[second.id], true);
    const backup = createSeedData();
    backup.lectureTicks = Object.fromEntries(backup.lectures.map((l) => [l.id, true]));
    useStudyStore.getState().importData(backup);
    assert.equal(Object.values(useStudyStore.getState().lectureTicks).filter(Boolean).length, 1);
    useStudyStore.getState().resetToSeed();
    assert.equal(useStudyStore.getState().lectureTicks[first.id], true);
    useStudyStore.getState().setLectureChecked(first.id, false);
    assert.equal(useStudyStore.getState().lectures[0].status, "not_started");
    assert.equal(useStudyStore.getState().lectureTicks[first.id], false);
  });
} finally {
  await server.close();
}
