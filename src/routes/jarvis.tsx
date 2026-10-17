import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { askJarvis } from "@/lib/ai/ask-jarvis";
import { tryLocalCommand } from "@/lib/study/commands";
import { academicSnapshot } from "@/lib/study/snapshot";
import { useStudyStore } from "@/lib/study/store";
import { PageHeader, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { JarvisMark } from "@/components/brand/mark";

export const Route = createFileRoute("/jarvis")({ component: JarvisPage });

const SUGGESTIONS = [
  "What should I study now?",
  "How much JEE backlog do I have?",
  "What revision is due?",
  "Plan tomorrow for me.",
  "Show my progress.",
];

function JarvisPage() {
  const messages = useStudyStore((s) => s.jarvis);
  const add = useStudyStore((s) => s.addJarvisMessage);
  const clear = useStudyStore((s) => s.clearJarvis);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  async function send(raw: string) {
    const question = raw.trim();
    if (!question || pending) return;
    setText("");
    setError(null);
    add({ role: "user", content: question });
    const local = tryLocalCommand(question);
    if (local.ok) {
      add({ role: "assistant", content: local.message });
      return;
    }
    setPending(true);
    try {
      const snap = academicSnapshot(useStudyStore.getState());
      const res = await askJarvis({ data: { question, snapshot: snap } });
      if (!res.ok) {
        setError(res.error);
        add({
          role: "assistant",
          content:
            "I couldn't reach the model. Your academic data is still here — try a command like “log 2 hours of mathematics practice”.",
        });
      } else {
        add({ role: "assistant", content: res.text });
      }
    } catch {
      setError("Network error talking to Jarvis.");
      add({
        role: "assistant",
        content: "Something went wrong reaching the assistant. Local commands still work.",
      });
    } finally {
      setPending(false);
      requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight }));
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <PageHeader
        eyebrow="Assistant"
        title="Jarvis"
        description="Answers from your real study database. Completions and time logs run locally; questions use the model."
        actions={
          messages.length > 0 ? (
            <Button size="sm" variant="outline" onClick={() => clear()}>
              Clear
            </Button>
          ) : null
        }
      />
      <Surface className="flex min-h-[60vh] flex-col p-0 sm:p-0">
        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <JarvisMark size={40} />
              <p className="mt-4 max-w-sm text-sm text-muted-foreground">
                Ask what to do next, how the backlog looks, or log work in plain language.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => void send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "ml-8 text-right" : "mr-8"}>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {m.role === "user" ? "You" : "Jarvis"}
                </p>
                <div
                  className={
                    m.role === "user"
                      ? "mt-1 inline-block rounded-lg bg-foreground px-3 py-2 text-left text-sm text-background"
                      : "mt-1 rounded-lg bg-muted px-3 py-2 text-sm whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))
          )}
          {pending ? <p className="text-sm text-muted-foreground">Thinking…</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <form
          className="border-t border-border p-3 sm:p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send(text);
          }}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask Jarvis, or log your study progress"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(text);
              }
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={pending || !text.trim()}>
              Send
            </Button>
          </div>
        </form>
      </Surface>
    </div>
  );
}
