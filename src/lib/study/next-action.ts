import { todayKey } from "@/lib/utils";
import type { StudyData } from "./types";
import { currentPhase, revisionDue } from "./progress";

export type NextAction = {
  title: string;
  detail: string;
  href: string;
  action?: { type: "open-lecture"; id: string } | { type: "open-revision"; id: string } | { type: "open-task"; id: string };
};

export function recommendNext(data: StudyData): NextAction {
  const today = todayKey();
  const due = revisionDue(data.revisions, today);
  if (due.overdue[0]) {
    const r = due.overdue[0];
    return {
      title: `Revision overdue: ${r.title}`,
      detail: "A spaced review has slipped. A short pass now protects the work you already did.",
      href: "/revision",
      action: { type: "open-revision", id: r.id },
    };
  }
  if (due.today[0]) {
    const r = due.today[0];
    return {
      title: `Revision due: ${r.title}`,
      detail: "Scheduled for today. Keep the streak of reviews intact.",
      href: "/revision",
      action: { type: "open-revision", id: r.id },
    };
  }

  const critical = data.tasks
    .filter((t) => t.status !== "completed" && t.dueDate && t.dueDate <= today)
    .sort((a, b) => {
      const rank = { critical: 0, high: 1, medium: 2, low: 3 };
      return rank[a.priority] - rank[b.priority];
    });
  if (critical[0]) {
    const t = critical[0];
    const overdue = t.dueDate && t.dueDate < today;
    return {
      title: t.title,
      detail: overdue ? "Overdue task" : "Due today",
      href: "/tasks",
      action: { type: "open-task", id: t.id },
    };
  }

  const planned = data.lectures.find(
    (l) => l.status !== "completed" && l.plannedDate === today,
  );
  if (planned) {
    return {
      title: `Today’s lecture: ${planned.title}`,
      detail: "On the plan for today.",
      href: "/lectures",
      action: { type: "open-lecture", id: planned.id },
    };
  }

  const inProgress = data.lectures.find((l) => l.status === "in_progress");
  if (inProgress) {
    return {
      title: `Continue ${inProgress.title}`,
      detail: "Already in progress — finish this before starting something new.",
      href: "/lectures",
      action: { type: "open-lecture", id: inProgress.id },
    };
  }

  const phase = currentPhase(data);
  if (phase.key === "backlog") {
    const due = data.lectures
      .filter((l) => l.status !== "completed" && (l.plannedDate ?? "") <= today)
      .sort((a, b) => (a.plannedDate ?? "").localeCompare(b.plannedDate ?? ""));
    const next = due[0];
    if (next) {
      return {
        title: `Catch up: ${next.title}`,
        detail: `Delivered ${next.plannedDate} — oldest lecture still in your backlog.`,
        href: "/backlog",
        action: { type: "open-lecture", id: next.id },
      };
    }
  }

  const remainingToday = data.tasks.filter((t) => t.dueDate === today && t.status !== "completed");
  if (remainingToday.length > 0) {
    return {
      title: `${remainingToday.length} task${remainingToday.length === 1 ? "" : "s"} remaining today`,
      detail: remainingToday[0]?.title ?? "Open the task list",
      href: "/tasks",
    };
  }

  const unreadPdf = data.resources.find((r) => r.status === "not_started" && r.kind === "pdf");
  if (unreadPdf) {
    return {
      title: `Read ${unreadPdf.title}`,
      detail: "Matching PDF still unread.",
      href: "/resources",
    };
  }

  return {
    title: "You’re clear",
    detail: "Nothing is due. Log a session, plan tomorrow, or add the next piece of work.",
    href: "/planner",
  };
}
