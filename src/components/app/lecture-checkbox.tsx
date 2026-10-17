import { Checkbox } from "@/components/ui/checkbox";
import { useStudyStore } from "@/lib/study/store";
import type { Lecture } from "@/lib/study/types";

/** The sole UI control that changes an individual lecture's completion. */
export function LectureCheckbox({ lecture }: { lecture: Lecture }) {
  const checked = useStudyStore((s) => s.lectureTicks?.[lecture.id] === true);
  const setLectureChecked = useStudyStore((s) => s.setLectureChecked);
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
      <Checkbox
        checked={checked}
        aria-label={`Watched: ${lecture.plannedDate ?? "Undated"} · ${lecture.title}`}
        onCheckedChange={(value) => setLectureChecked(lecture.id, value === true)}
      />
      Watched
    </label>
  );
}
