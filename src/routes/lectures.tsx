import { LectureCheckbox } from "@/components/app/lecture-checkbox";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { FilterPills, PageHeader, StatusBadge, Surface } from "@/components/app/shared";
import { Input } from "@/components/ui/input";
import { kindLabel } from "@/lib/study/labels";
import type { ItemStatus } from "@/lib/study/types";

export const Route = createFileRoute("/lectures")({ component: LecturesPage });

function LecturesPage() {
  const lectures = useStudyStore((s) => s.lectures);
  const subjects = useStudyStore((s) => s.subjects);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ItemStatus>("all");
  const [subjectId, setSubjectId] = useState("all");

  const rows = useMemo(() => {
    return lectures
      .filter((l) => (status === "all" ? true : l.status === status))
      .filter((l) => (subjectId === "all" ? true : l.subjectId === subjectId))
      .filter((l) => !q.trim() || l.title.toLowerCase().includes(q.toLowerCase()))
      .slice()
      .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  }, [lectures, q, status, subjectId]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Learn"
        title="Lectures"
        description="Track watch status. Completing a lecture updates course, subject, chapter, and backlog progress automatically."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter lectures" className="sm:max-w-xs" />
        <FilterPills
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All" },
            { value: "not_started", label: "Not started" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterPills
          value={subjectId}
          onChange={setSubjectId}
          options={[{ value: "all", label: "All subjects" }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
        />
      </div>
      {rows.length === 0 ? (
        <Surface>
          <p className="text-sm text-muted-foreground">No lectures match those filters.</p>
        </Surface>
      ) : (
        <Surface className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {rows.map((l) => (
              <li key={l.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{l.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {subjects.find((s) => s.id === l.subjectId)?.name} · {kindLabel(l.kind)}
                    {l.plannedDate ? ` · planned ${l.plannedDate}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={l.status} />
                  <LectureCheckbox lecture={l} />
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}
