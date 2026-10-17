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

  if (/^(?:(?:i\s+)?(?:completed|finished|done with)|complete|finish|mark|start|begin)\s+/i.test(text)) {
    return { ok: true, message: "Tick or untick the individual lecture’s checkbox in Lectures or Backlog to change completion. Chat commands do not change lecture progress." };
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

  return { ok: false };
}
