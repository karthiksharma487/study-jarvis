import { formatDuration, startOfWeek, todayKey } from "@/lib/utils";
import type { StudyData } from "./types";
import { backlogCounts, practiceAccuracy, revisionDue, studyMinutes } from "./progress";

export type Insight = {
  id: string;
  text: string;
  tone: "neutral" | "good" | "attention";
};

export function buildInsights(data: StudyData): Insight[] {
  const out: Insight[] = [];
  const today = todayKey();
  const weekStart = todayKey(startOfWeek(new Date(), data.settings.weekStartsOn));
  const weekMin = studyMinutes(data, weekStart, today);
  const monthStart = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const monthMin = studyMinutes(data, monthStart, today);
  const todayMin = studyMinutes(data, today, today);

  if (weekMin > 0) {
    out.push({
      id: "week-time",
      text: `You studied ${formatDuration(weekMin)} this week.`,
      tone: weekMin >= 600 ? "good" : "neutral",
    });
  }
  if (todayMin > 0) {
    out.push({
      id: "today-time",
      text: `${formatDuration(todayMin)} logged today.`,
      tone: "neutral",
    });
  }
  if (monthMin > 0 && weekMin === 0) {
    out.push({
      id: "month-time",
      text: `${formatDuration(monthMin)} studied this month.`,
      tone: "neutral",
    });
  }

  const bySubject = new Map<string, number>();
  for (const s of data.sessions.filter((x) => x.date >= weekStart && x.date <= today)) {
    if (!s.subjectId) continue;
    bySubject.set(s.subjectId, (bySubject.get(s.subjectId) ?? 0) + s.durationMin);
  }
  if (bySubject.size >= 2) {
    const ranked = [...bySubject.entries()].sort((a, b) => b[1] - a[1]);
    const top = ranked[0];
    const bot = ranked[ranked.length - 1];
    if (top && bot && top[1] > 0 && bot[1] * 2 < top[1]) {
      const topName = data.subjects.find((s) => s.id === top[0])?.name;
      const botName = data.subjects.find((s) => s.id === bot[0])?.name;
      if (topName && botName) {
        out.push({
          id: "imbalance",
          text: `${botName} received less study time this week than ${topName}.`,
          tone: "attention",
        });
      }
    }
  }

  const thisWeekPractice = data.practice.filter((p) => p.date >= weekStart);
  const prevStart = todayKey(new Date(startOfWeek(new Date(), data.settings.weekStartsOn).getTime() - 7 * 86400000));
  const prevEnd = todayKey(new Date(startOfWeek(new Date(), data.settings.weekStartsOn).getTime() - 86400000));
  const prevPractice = data.practice.filter((p) => p.date >= prevStart && p.date <= prevEnd);
  if (thisWeekPractice.length > 0) {
    const acc = practiceAccuracy(thisWeekPractice);
    const prev = practiceAccuracy(prevPractice);
    if (acc !== null && prev !== null && acc > prev) {
      out.push({
        id: "acc-up",
        text: `Practice accuracy improved from ${prev}% to ${acc}%.`,
        tone: "good",
      });
    } else if (acc !== null) {
      out.push({
        id: "acc",
        text: `Practice accuracy this week is ${acc}%.`,
        tone: acc >= 70 ? "good" : "attention",
      });
    }
  }

  const due = revisionDue(data.revisions, today);
  if (due.overdue.length > 0) {
    out.push({
      id: "rev-overdue",
      text: `${due.overdue.length} revision${due.overdue.length === 1 ? "" : "s"} overdue.`,
      tone: "attention",
    });
  } else if (due.today.length > 0) {
    out.push({
      id: "rev-today",
      text: `${due.today.length} revision${due.today.length === 1 ? "" : "s"} due today.`,
      tone: "attention",
    });
  }

  const backlog = backlogCounts(data);
  if (backlog.lectures.done > 0) {
    out.push({
      id: "backlog",
      text: `JEE lecture backlog is ${backlog.lectures.remaining} of ${backlog.lectures.total} remaining.`,
      tone: backlog.lectures.remaining === 0 ? "good" : "neutral",
    });
  }

  const todayTasks = data.tasks.filter((t) => t.dueDate === today);
  const remaining = todayTasks.filter((t) => t.status !== "completed").length;
  if (todayTasks.length > 0) {
    out.push({
      id: "tasks-today",
      text:
        remaining === 0
          ? "All of today's tasks are complete."
          : `${remaining} task${remaining === 1 ? "" : "s"} remaining today.`,
      tone: remaining === 0 ? "good" : "attention",
    });
  }

  const openMistakes = data.mistakes.filter((m) => m.status === "open").length;
  if (openMistakes > 0) {
    out.push({
      id: "mistakes",
      text: `${openMistakes} open item${openMistakes === 1 ? "" : "s"} in the mistake book.`,
      tone: "attention",
    });
  }

  return out.slice(0, 6);
}
