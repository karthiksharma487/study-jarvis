import { Button } from "@/components/ui/button";
import type { ItemStatus } from "@/lib/study/types";
import { STATUS_LABEL } from "@/lib/study/labels";

export function nextStatus(s: ItemStatus): ItemStatus {
  if (s === "not_started") return "in_progress";
  if (s === "in_progress") return "completed";
  return "not_started";
}

export function StatusCycle({
  status,
  onChange,
  completeLabel = "Mark complete",
}: {
  status: ItemStatus;
  onChange: (s: ItemStatus) => void;
  completeLabel?: string;
}) {
  const label =
    status === "not_started" ? "Start" : status === "in_progress" ? completeLabel : "Undo";
  return (
    <Button
      size="sm"
      variant={status === "completed" ? "secondary" : status === "in_progress" ? "default" : "outline"}
      onClick={() => onChange(nextStatus(status))}
      aria-label={`${STATUS_LABEL[status]}. ${label}`}
    >
      {label}
    </Button>
  );
}
