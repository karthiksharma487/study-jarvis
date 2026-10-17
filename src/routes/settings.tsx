import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStudyStore, exportCsv, exportStudyJson } from "@/lib/study/store";
import { ACADEMIC_LEVELS, type AcademicLevel, type ThemeMode } from "@/lib/study/types";
import { downloadBlob } from "@/lib/utils";
import { Field, PageHeader, Surface } from "@/components/app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const profile = useStudyStore((s) => s.profile);
  const settings = useStudyStore((s) => s.settings);
  const schedule = useStudyStore((s) => s.classSchedule);
  const setProfile = useStudyStore((s) => s.setProfile);
  const setSettings = useStudyStore((s) => s.setSettings);
  const setClassSchedule = useStudyStore((s) => s.setClassSchedule);
  const importData = useStudyStore((s) => s.importData);
  const resetToSeed = useStudyStore((s) => s.resetToSeed);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="System" title="Settings" description="Identity, theme, live class times, and your data." />

      <Surface className="mb-4 space-y-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <Field label="Name">
          <Input value={profile.name} onChange={(e) => setProfile({ name: e.target.value })} />
        </Field>
        <Field label="Academic level">
          <Select value={profile.academicLevel} onValueChange={(v) => setProfile({ academicLevel: v as AcademicLevel })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Primary goals (comma separated)">
          <Input
            value={profile.primaryGoals.join(", ")}
            onChange={(e) =>
              setProfile({
                primaryGoals: e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
          />
        </Field>
      </Surface>

      <Surface className="mb-4 space-y-4">
        <h2 className="text-sm font-semibold">Appearance</h2>
        <Field label="Theme">
          <Select value={settings.theme} onValueChange={(v) => setSettings({ theme: v as ThemeMode })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </Surface>

      <Surface className="mb-4 space-y-4">
        <h2 className="text-sm font-semibold">Live class times</h2>
        <p className="text-sm text-muted-foreground">
          Context for Mission JEE — not a permanent rule. Edit times or turn slots off when you return fully to live classes.
        </p>
        {schedule.map((slot, i) => (
          <div key={slot.id} className="flex flex-wrap items-center gap-3">
            <Input
              className="max-w-56"
              value={slot.label}
              onChange={(e) => {
                const next = schedule.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s));
                setClassSchedule(next);
              }}
            />
            <Input
              type="time"
              className="w-32"
              value={slot.time}
              onChange={(e) => {
                const next = schedule.map((s, idx) => (idx === i ? { ...s, time: e.target.value } : s));
                setClassSchedule(next);
              }}
            />
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={slot.enabled}
                onCheckedChange={(v) => {
                  const next = schedule.map((s, idx) => (idx === i ? { ...s, enabled: v } : s));
                  setClassSchedule(next);
                }}
              />
              On
            </label>
          </div>
        ))}
      </Surface>

      <Surface className="mb-4 space-y-3">
        <h2 className="text-sm font-semibold">Data</h2>
        <p className="text-sm text-muted-foreground">
          Everything lives on this device. Export JSON to back it up; CSV for lectures, tasks, or sessions. Importing keeps your current lecture checkboxes unchanged.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => downloadBlob(`study-jarvis-${new Date().toISOString().slice(0, 10)}.json`, exportStudyJson())}
          >
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => downloadBlob("lectures.csv", exportCsv("lectures"), "text/csv")}>
            Lectures CSV
          </Button>
          <Button variant="outline" onClick={() => downloadBlob("tasks.csv", exportCsv("tasks"), "text/csv")}>
            Tasks CSV
          </Button>
          <Button variant="outline" onClick={() => downloadBlob("sessions.csv", exportCsv("sessions"), "text/csv")}>
            Sessions CSV
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const parsed = JSON.parse(text) as { data?: unknown };
                const payload = (parsed.data ?? parsed) as Record<string, unknown>;
                const res = importData(payload);
                if (res.ok) toast.success("Imported");
                else toast.error(res.error);
              } catch {
                toast.error("Could not read that file.");
              }
              e.target.value = "";
            }}
          />
        </div>
      </Surface>

      <Surface className="space-y-3">
        <h2 className="text-sm font-semibold">Reset</h2>
        <p className="text-sm text-muted-foreground">
          Restores the original Mission JEE structure and keeps you onboarded. Lecture checkboxes stay unchanged; tick or untick each lecture individually.
        </p>
        {confirmReset ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => {
                resetToSeed();
                setConfirmReset(false);
                toast.success("Restored seed data");
              }}
            >
              Confirm reset
            </Button>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            Reset to Mission JEE seed
          </Button>
        )}
      </Surface>
    </div>
  );
}
