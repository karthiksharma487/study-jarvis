import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Moon,
  Plus,
  Repeat,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Timer,
} from "lucide-react";
import { useStudyStore } from "@/lib/study/store";
import { searchAll } from "@/lib/study/search";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { QuickKind } from "./quick-add";

const ROUTES = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/study", label: "My Study", icon: BookOpen },
  { to: "/jarvis", label: "Jarvis", icon: Sparkles },
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/backlog", label: "Backlog", icon: ClipboardList },
  { to: "/lectures", label: "Lectures", icon: BookOpen },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/revision", label: "Revision", icon: Repeat },
  { to: "/tests", label: "Tests", icon: Gauge },
  { to: "/mistakes", label: "Mistake book", icon: Gauge },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/exams", label: "Exams", icon: GraduationCap },
  { to: "/analytics", label: "Analytics", icon: Gauge },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function CommandPalette({
  open,
  onOpenChange,
  onQuickAdd,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onQuickAdd: (kind?: QuickKind) => void;
}) {
  const navigate = useNavigate();
  const data = useStudyStore();
  const setSettings = useStudyStore((s) => s.setSettings);
  const [q, setQ] = useState("");
  const hits = q.trim().length > 1 ? searchAll(data, q, 8) : [];

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  function go(to: string) {
    onOpenChange(false);
    void navigate({ to });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or jump…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>Nothing matches.</CommandEmpty>
        {hits.length > 0 ? (
          <CommandGroup heading="Results">
            {hits.map((h) => (
              <CommandItem key={`${h.kind}-${h.id}`} onSelect={() => go(h.href)} value={`${h.kind} ${h.title}`}>
                <Search className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{h.title}</span>
                <span className="text-[11px] text-muted-foreground">{h.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}
        <CommandGroup heading="Create">
          <CommandItem onSelect={() => { onOpenChange(false); onQuickAdd("task"); }}>
            <Plus className="size-4" /> Create task
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); onQuickAdd("lecture"); }}>
            <Plus className="size-4" /> Add lecture
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); onQuickAdd("session"); }}>
            <Timer className="size-4" /> Log study session
          </CommandItem>
          <CommandItem onSelect={() => { onOpenChange(false); onQuickAdd("practice"); }}>
            <Plus className="size-4" /> Log practice
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Go to">
          {ROUTES.map((r) => (
            <CommandItem key={r.to} onSelect={() => go(r.to)} value={`go ${r.label}`}>
              <r.icon className="size-4 text-muted-foreground" />
              {r.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() => {
              setSettings({ theme: "dark" });
              onOpenChange(false);
            }}
          >
            <Moon className="size-4" /> Dark mode
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setSettings({ theme: "light" });
              onOpenChange(false);
            }}
          >
            <Sun className="size-4" /> Light mode
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
