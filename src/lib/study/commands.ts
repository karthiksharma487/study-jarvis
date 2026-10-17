import { todayKey } from "@/lib/utils";
import { useStudyStore } from "./store";
import type { ActivityKind } from "./types";

export type CommandResult = { ok: true; message: string } | { ok: false };

function subjectByName(name: string) {
  const n = name.toLowerCase();
  const subjects = useStudyStore.getState().subjects;
  return subjects.find((s) => s.name.toLowerCase().startsWith(n) || s.short.toLowerCase() === n);
}

function activityFrom(word: string): ActivityKind {
  const w = word.toLowerCase();
  if (w.startsWith("pract")) return "practice";
  if (w.startsWith("rev")) return "revision";
  if (w.startsWith("read")) return "reading";
  if (w.startsWith("assign")) return "assignment";
  if (w.startsWith("test")) return "test";
  if (w.startsWith("lect")) return "lecture";
  return "other";
}

export function tryLocalCommand(input: string): CommandResult {
  const text = input.trim();
  const store = useStudyStore.getState();

  const complete =
    text.match(/^(?:i\s+)?(?:completed|finished|done with)\s+(.+?)(?:\s+lecture\s+(\d+))?\.?$/i) ??
    text.match(/^(?:complete|finish|mark)\s+(.+?)(?:\s+lecture\s+(\d+))?\.?$/i);
  if (complete) {
    const raw = complete[1]?.trim() ?? "";
    const num = complete[2];
    const subject = subjectByName(raw.split(/\s+/)[0] ?? "");
    let lecture = store.lectures.find((l) => l.title.toLowerCase() === raw.toLowerCase());
    if (!lecture && subject && num) {
      lecture = store.lectures.find(
        (l) => l.subjectId === subject.id && l.kind === "normal" && l.title.endsWith(` ${num}`),
      );
    }
    if (!lecture && subject && /basics/i.test(raw)) {
      lecture = store.lectures.find((l) => l.subjectId === subject.id && l.kind === "basics");
    }
    if (!lecture) {
      lecture = store.lectures.find((l) => l.title.toLowerCase().includes(raw.toLowerCase()));
    }
    if (lecture) {
      store.setLectureStatus(lecture.id, "completed");
      return { ok: true, message: `Marked ${lecture.title} complete. Progress updated.` };
    }
  }

  const log =
    text.match(/^(?:log|logged|record)\s+(\d+(?:\.\d+)?)\s*(h|hr|hrs|hours|m|min|mins|minutes)?\s*(?:of\s+)?(.+)$/i);
  if (log) {
    const n = Number(log[1]);
    const unit = (log[2] ?? "h").toLowerCase();
    const rest = log[3] ?? "";
    const minutes = unit.startsWith("m") ? Math.round(n) : Math.round(n * 60);
    const words = rest.trim().split(/\s+/);
    const subject = subjectByName(words[0] ?? "");
    const activity = activityFrom(words[1] ?? words[0] ?? "other");
    store.addSession({
      date: todayKey(),
      durationMin: minutes,
      activity,
      subjectId: subject?.id,
      notes: rest,
    });
    const who = subject?.name ?? rest;
    return { ok: true, message: `Logged ${minutes} minutes of ${who}.` };
  }

  const start = text.match(/^(?:start|begin)\s+(.+)$/i);
  if (start) {
    const raw = start[1]?.trim() ?? "";
    const lecture = store.lectures.find((l) => l.title.toLowerCase().includes(raw.toLowerCase()));
    if (lecture) {
      store.setLectureStatus(lecture.id, "in_progress");
      return { ok: true, message: `Started ${lecture.title}.` };
    }
  }

  return { ok: false };
}
