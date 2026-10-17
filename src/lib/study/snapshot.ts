import { formatDuration, todayKey, startOfWeek } from "@/lib/utils";
import type { StudyData } from "./types";
import {
  backlogCounts,
  currentPhase,
  overallProgress,
  practiceAccuracy,
  revisionDue,
  studyMinutes,
  subjectProgress,
} from "./progress";
import { recommendNext } from "./next-action";
import { buildInsights } from "./insights";

export function academicSnapshot(data: StudyData): string {
  const today = todayKey();
  const weekStart = todayKey(startOfWeek(new Date(), data.settings.weekStartsOn));
  const backlog = backlogCounts(data);
  const next = recommendNext(data);
  const phase = currentPhase(data);
  const due = revisionDue(data.revisions, today);
  const subjects = data.subjects.map((s) => {
    const p = subjectProgress(data, s.id);
    return `${s.name}: ${p.done}/${p.total} items complete`;
  });
  const recent = data.activities.slice(0, 8).map((a) => a.text);
  const todayTasks = data.tasks.filter((t) => t.dueDate === today);
  return JSON.stringify(
    {
      plannerAccurateThrough: data.lastKnownPlannerDate,
      student: data.profile.name || "Student",
      level: data.profile.academicLevel,
      goals: data.profile.primaryGoals,
      phase: phase.label,
      nextAction: next.title,
      overall: overallProgress(data),
      backlogLectures: `${backlog.lectures.done}/${backlog.lectures.total} done, ${backlog.lectures.remaining} remaining`,
      backlogPdfs: `${backlog.pdfs.done}/${backlog.pdfs.total} done`,
      backlogBySubject: data.subjects.map((s) => {
        const b = backlog.bySubject(s.id);
        return `${s.name}: ${b.lectures.remaining} lecture(s) delivered but not yet watched`;
      }),
      upcomingLectures: `${backlog.upcoming.total} scheduled ahead`,
      subjects,
      studyThisWeek: formatDuration(studyMinutes(data, weekStart, today)),
      studyToday: formatDuration(studyMinutes(data, today, today)),
      revisionsDueToday: due.today.map((r) => r.title),
      revisionsOverdue: due.overdue.map((r) => r.title),
      todayTasks: todayTasks.map((t) => `${t.title} [${t.status}]`),
      practiceAccuracy: practiceAccuracy(data.practice),
      tests: data.tests.slice(-5).map((t) => `${t.name}: ${t.marks}/${t.maxMarks}`),
      openMistakes: data.mistakes.filter((m) => m.status === "open").length,
      insights: buildInsights(data).map((i) => i.text),
      recentActivity: recent,
      liveClasses: data.classSchedule
        .filter((c) => c.enabled)
        .map((c) => `${c.label} at ${c.time}${c.endTime ? `–${c.endTime}` : ""}`),
      exams: data.exams.map((e) => `${e.name}${e.date ? ` on ${e.date}` : " (no date)"}${e.type ? ` · ${e.type}` : ""}${e.pattern ? ` · ${e.pattern}` : ""}`),
      note: "Do not invent deadlines, scores, or chapter names. If a number is missing, say so.",
    },
    null,
    2,
  );
}
