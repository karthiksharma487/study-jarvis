import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { EmptyState, FilterPills, PageHeader, PriorityBadge, StatusBadge, Surface } from "@/components/app/shared";
import { StatusCycle } from "@/components/app/status-cycle";
import { kindLabel } from "@/lib/study/labels";
import { todayKey } from "@/lib/utils";
import type { ItemStatus } from "@/lib/study/types";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/tasks")({ component: TasksPage });

function TasksPage() {
  const tasks = useStudyStore((s) => s.tasks);
  const subjects = useStudyStore((s) => s.subjects);
  const setTaskStatus = useStudyStore((s) => s.setTaskStatus);
  const deleteTask = useStudyStore((s) => s.deleteTask);
  const [filter, setFilter] = useState<"open" | "today" | "all" | ItemStatus>("open");
  const today = todayKey();

  const rows = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "open") return t.status !== "completed";
      if (filter === "today") return t.dueDate === today;
      if (filter === "all") return true;
      return t.status === filter;
    });
  }, [tasks, filter, today]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Work"
        title="Tasks"
        description="Study-shaped work: lectures, practice, revision, college — not a generic project board. Use Add in the header."
      />
      <div className="mb-4">
        <FilterPills
          value={filter}
          onChange={setFilter}
          options={[
            { value: "open", label: "Open" },
            { value: "today", label: "Today" },
            { value: "completed", label: "Completed" },
            { value: "all", label: "All" },
          ]}
        />
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="No tasks here"
          description="Capture a lecture to watch, a problem set, or college work with the Add button."
        />
      ) : (
        <Surface className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {rows.map((t) => (
              <li key={t.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {kindLabel(t.kind)}
                    {t.subjectId ? ` · ${subjects.find((s) => s.id === t.subjectId)?.name}` : ""}
                    {t.dueDate ? ` · due ${t.dueDate}` : ""}
                    {t.estimatedMin ? ` · ${t.estimatedMin}m` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                  <StatusCycle status={t.status} onChange={(st) => setTaskStatus(t.id, st)} />
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(t.id)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}
