import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useStudyStore } from "@/lib/study/store";
import { FilterPills, PageHeader, StatusBadge, Surface } from "@/components/app/shared";
import { StatusCycle } from "@/components/app/status-cycle";
import { Input } from "@/components/ui/input";
import { kindLabel } from "@/lib/study/labels";
import type { ItemStatus } from "@/lib/study/types";

export const Route = createFileRoute("/resources")({ component: ResourcesPage });

function ResourcesPage() {
  const resources = useStudyStore((s) => s.resources);
  const subjects = useStudyStore((s) => s.subjects);
  const setResourceStatus = useStudyStore((s) => s.setResourceStatus);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ItemStatus>("all");

  const rows = useMemo(
    () =>
      resources.filter((r) => {
        if (status !== "all" && r.status !== status) return false;
        if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [resources, q, status],
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Learn"
        title="Resources"
        description="PDFs, notes, links, and sheets. Status rolls into chapter and course progress."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter resources" className="sm:max-w-xs" />
        <FilterPills
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All" },
            { value: "not_started", label: "Unread" },
            { value: "in_progress", label: "In progress" },
            { value: "completed", label: "Completed" },
          ]}
        />
      </div>
      {rows.length === 0 ? (
        <Surface>
          <p className="text-sm text-muted-foreground">No resources match.</p>
        </Surface>
      ) : (
        <Surface className="p-0 sm:p-0">
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {kindLabel(r.kind)}
                    {r.subjectId ? ` · ${subjects.find((s) => s.id === r.subjectId)?.name}` : ""}
                    {r.url ? ` · ${r.url}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <StatusCycle
                    status={r.status}
                    onChange={(st) => setResourceStatus(r.id, st)}
                    completeLabel="Mark read"
                  />
                </div>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}
