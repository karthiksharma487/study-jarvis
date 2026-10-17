import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { addDays, cn, todayKey } from "@/lib/utils";
import { useStudyStore } from "@/lib/study/store";
import { FilterPills, PageHeader, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/calendar")({ component: CalendarPage });

type CalItem = { id: string; title: string; kind: string };

function itemsForDay(data: ReturnType<typeof useStudyStore.getState>, day: string): CalItem[] {
  const out: CalItem[] = [];
  for (const t of data.tasks) if (t.dueDate === day) out.push({ id: t.id, title: t.title, kind: "deadline" });
  for (const l of data.lectures) if (l.plannedDate === day) out.push({ id: l.id, title: l.title, kind: "lecture" });
  for (const t of data.tests) if (t.date === day) out.push({ id: t.id, title: t.name, kind: "test" });
  for (const e of data.exams) if (e.date === day) out.push({ id: e.id, title: e.name, kind: "exam" });
  for (const r of data.revisions) if (r.nextRevision === day) out.push({ id: r.id, title: `Revise ${r.title}`, kind: "revision" });
  for (const s of data.sessions) if (s.date === day) out.push({ id: s.id, title: `Study ${s.durationMin}m`, kind: "session" });
  for (const b of data.blocks) if (b.date === day) out.push({ id: b.id, title: b.title, kind: "session" });
  for (const e of data.events) if (e.date === day) out.push({ id: e.id, title: e.title, kind: e.kind });
  const wd = new Date(day + "T12:00:00").getDay();
  for (const c of data.classSchedule) {
    if (c.enabled && c.days.includes(wd)) out.push({ id: c.id + day, title: `${c.label} ${c.time}${c.endTime ? `–${c.endTime}` : ""}`, kind: "lecture" });
  }
  return out;
}

function CalendarPage() {
  const data = useStudyStore();
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selected, setSelected] = useState(todayKey());

  const monthGrid = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const start = addDays(first, -startOffset);
    return Array.from({ length: 42 }, (_, i) => todayKey(addDays(start, i)));
  }, [cursor]);

  const weekDays = useMemo(() => {
    const d = new Date(selected + "T12:00:00");
    const offset = (d.getDay() + 6) % 7;
    const monday = addDays(d, -offset);
    return Array.from({ length: 7 }, (_, i) => todayKey(addDays(monday, i)));
  }, [selected]);

  const days = view === "month" ? monthGrid : view === "week" ? weekDays : [selected];
  const selectedItems = itemsForDay(data, selected);
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Plan"
        title="Calendar"
        description="Deadlines, tests, planned lectures, revision, sessions, and live class times — linked to real records."
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          Prev
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          Next
        </Button>
        <p className="px-2 text-sm font-medium">{monthLabel}</p>
        <FilterPills
          value={view}
          onChange={setView}
          options={[
            { value: "month", label: "Month" },
            { value: "week", label: "Week" },
            { value: "day", label: "Day" },
          ]}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Surface className={view === "month" ? "lg:col-span-2 p-3 sm:p-4" : "lg:col-span-2"}>
          {view === "month" ? (
            <div className="grid grid-cols-7 gap-px">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="pb-2 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
              {days.map((d) => {
                const inMonth = d.slice(0, 7) === todayKey(new Date(cursor.getFullYear(), cursor.getMonth(), 1)).slice(0, 7);
                const items = itemsForDay(data, d);
                const isToday = d === todayKey();
                const isSel = d === selected;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelected(d)}
                    className={cn(
                      "min-h-20 rounded-md p-1.5 text-left align-top text-xs transition-colors",
                      isSel ? "bg-foreground text-background" : "hover:bg-muted",
                      !inMonth && !isSel && "opacity-40",
                    )}
                  >
                    <span className={cn("font-mono tabular-nums", isToday && !isSel && "text-primary")}>{Number(d.slice(8))}</span>
                    <div className="mt-1 space-y-0.5">
                      {items.slice(0, 3).map((it) => (
                        <p key={it.id} className={cn("truncate", isSel ? "text-background/80" : "text-muted-foreground")}>
                          {it.title}
                        </p>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelected(d)}
                  className={cn("w-full rounded-lg p-3 text-left", d === selected ? "bg-muted" : "hover:bg-muted/50")}
                >
                  <p className="text-sm font-medium">
                    {new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                    {itemsForDay(data, d).map((it) => (
                      <li key={it.id}>
                        {it.title} · {it.kind}
                      </li>
                    ))}
                    {itemsForDay(data, d).length === 0 ? <li>Nothing scheduled</li> : null}
                  </ul>
                </button>
              ))}
            </div>
          )}
        </Surface>
        <Surface>
          <h2 className="text-sm font-semibold">
            {new Date(selected + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h2>
          {selectedItems.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing on this day.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {selectedItems.map((it) => (
                <li key={it.id} className="flex justify-between gap-2">
                  <span>{it.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">{it.kind}</span>
                </li>
              ))}
            </ul>
          )}
        </Surface>
      </div>
    </div>
  );
}
