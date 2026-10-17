import { useState } from "react";
import { ACADEMIC_LEVELS, type AcademicLevel } from "@/lib/study/types";
import { useStudyStore } from "@/lib/study/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JarvisMark } from "@/components/brand/mark";
import { cn } from "@/lib/utils";

const GOALS = ["JEE Main", "JEE Advanced", "1st PU", "Boards", "NEET", "Other"];

export function Onboarding() {
  const complete = useStudyStore((s) => s.completeOnboarding);
  const lectures = useStudyStore((s) => s.lectures);
  const chapters = useStudyStore((s) => s.chapters);
  const exams = useStudyStore((s) => s.exams);
  const subjects = useStudyStore((s) => s.subjects);
  const plannerDate = useStudyStore((s) => s.lastKnownPlannerDate);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<AcademicLevel>("1st_pu");
  const [goals, setGoals] = useState<string[]>(["JEE Main", "JEE Advanced", "1st PU"]);

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function finish() {
    complete({
      name: name.trim() || "Student",
      academicLevel: level,
      primaryGoals: goals.length ? goals : ["JEE Main"],
    });
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-10 flex items-center gap-3">
          <JarvisMark size={36} />
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Study Jarvis</p>
            <p className="text-sm text-foreground">Academic operating system</p>
          </div>
        </div>

        {step === 0 ? (
          <div className="enter space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">What should I call you?</h1>
              <p className="mt-2 text-sm text-muted-foreground">This stays on this device. You can change it later.</p>
            </div>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              onKeyDown={(e) => {
                if (e.key === "Enter") setStep(1);
              }}
            />
            <div className="flex justify-end">
              <Button onClick={() => setStep(1)}>Continue</Button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="enter space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Your academic context</h1>
              <p className="mt-2 text-sm text-muted-foreground">Used to label the command center — not to lock you in.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ACADEMIC_LEVELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-left text-sm transition-colors",
                    level === l.value ? "bg-foreground text-background" : "bg-card text-foreground shadow-[var(--shadow-border)] hover:bg-muted",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Primary goals</p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => {
                  const on = goals.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGoal(g)}
                      className={cn(
                        "h-9 rounded-full px-3 text-xs font-medium",
                        on ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="enter space-y-6">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight">Mission JEE is ready</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your planner is loaded: {lectures.length} dated lectures, {chapters.length} chapters, and {exams.length} scheduled tests.
                Planner data is accurate through {plannerDate}.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {subjects.map((subject) => (
                <li key={subject.id} className="rounded-lg bg-card px-4 py-3 shadow-[var(--shadow-border)]">
                  {subject.name} — {lectures.filter((l) => l.subjectId === subject.id).length} lectures · {chapters.filter((c) => c.subjectId === subject.id).length} chapters
                </li>
              ))}
            </ul>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={finish}>Open the command center</Button>
            </div>
          </div>
        ) : null}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Step {step + 1} of 3 · Data stays on this device
        </p>
      </div>
    </div>
  );
}
