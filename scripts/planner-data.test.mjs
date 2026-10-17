import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createServer } from "vite";

const server = await createServer({ configFile: false, cacheDir: "node_modules/.vite-planner-tests", server: { middlewareMode: true }, appType: "custom" });
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
} finally {
  await server.close();
}
