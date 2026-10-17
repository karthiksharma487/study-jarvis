import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  Moon,
  MoreHorizontal,
  Plus,
  Repeat,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Timer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudyStore } from "@/lib/study/store";
import { JarvisMark } from "@/components/brand/mark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CommandPalette } from "./command-palette";
import { QuickAddDialog, type QuickKind } from "./quick-add";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const PRIMARY: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/study", label: "My Study", icon: BookOpen },
  { to: "/jarvis", label: "Jarvis", icon: Sparkles },
];

const LEARN: NavItem[] = [
  { to: "/courses", label: "Courses", icon: GraduationCap },
  { to: "/subjects", label: "Subjects", icon: BookOpen },
  { to: "/lectures", label: "Lectures", icon: Timer },
  { to: "/resources", label: "Resources", icon: BookOpen },
];

const WORK: NavItem[] = [
  { to: "/backlog", label: "Backlog", icon: ClipboardList },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/revision", label: "Revision", icon: Repeat },
  { to: "/tests", label: "Tests", icon: Gauge },
  { to: "/mistakes", label: "Mistakes", icon: Gauge },
];

const PLAN: NavItem[] = [
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/exams", label: "Exams", icon: GraduationCap },
];

const TAIL: NavItem[] = [
  { to: "/analytics", label: "Analytics", icon: Gauge },
  { to: "/settings", label: "Settings", icon: Settings },
];

const MOBILE: NavItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/study", label: "Study", icon: BookOpen },
  { to: "/planner", label: "Plan", icon: CalendarDays },
  { to: "/jarvis", label: "Jarvis", icon: Sparkles },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
  return (
    <Link
      to={item.to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
        active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <item.icon className="size-4 shrink-0" strokeWidth={1.7} />
      {item.label}
    </Link>
  );
}

function Group({ label, items, onClick }: { label: string; items: NavItem[]; onClick?: () => void }) {
  return (
    <div className="mb-4">
      <p className="mb-1 px-2.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <div className="space-y-0.5">
        {items.map((i) => (
          <NavLink key={i.to} item={i} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <JarvisMark size={28} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">Study Jarvis</p>
          <p className="truncate text-[11px] text-muted-foreground">Academic OS</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Primary">
        <div className="mb-4 space-y-0.5">
          {PRIMARY.map((i) => (
            <NavLink key={i.to} item={i} onClick={onNavigate} />
          ))}
        </div>
        <Group label="Learn" items={LEARN} onClick={onNavigate} />
        <Group label="Work" items={WORK} onClick={onNavigate} />
        <Group label="Plan" items={PLAN} onClick={onNavigate} />
        <Group label="Review" items={TAIL} onClick={onNavigate} />
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const theme = useStudyStore((s) => s.settings.theme);
  const setSettings = useStudyStore((s) => s.setSettings);
  const name = useStudyStore((s) => s.profile.name);
  const [cmd, setCmd] = useState(false);
  const [quick, setQuick] = useState(false);
  const [quickKind, setQuickKind] = useState<QuickKind | undefined>();
  const [more, setMore] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmd((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const title = useMemo(() => {
    const all = [...PRIMARY, ...LEARN, ...WORK, ...PLAN, ...TAIL];
    const hit = all.find((i) => (i.to === "/" ? pathname === "/" : pathname === i.to || pathname.startsWith(`${i.to}/`)));
    return hit?.label ?? "Study Jarvis";
  }, [pathname]);

  function openQuick(kind?: QuickKind) {
    setQuickKind(kind);
    setQuick(true);
  }

  return (
    <div className="min-h-svh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-background lg:flex lg:flex-col">
        <SidebarBody />
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-sm sm:px-6">
          <p className="mr-auto truncate text-sm font-medium lg:hidden">{title}</p>
          <p className="mr-auto hidden truncate text-sm text-muted-foreground lg:block">
            {name ? `${name}` : "Study Jarvis"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="hidden h-9 min-w-48 justify-start gap-2 text-muted-foreground md:inline-flex"
            onClick={() => setCmd(true)}
          >
            <Search className="size-3.5" />
            Search
            <kbd className="ml-auto rounded border border-border px-1.5 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setCmd(true)} aria-label="Search">
            <Search className="size-4" />
          </Button>
          <Button size="sm" onClick={() => openQuick()} className="gap-1.5">
            <Plus className="size-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() => setSettings({ theme: theme === "dark" ? "light" : "dark" })}
          >
            {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>
        </header>

        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-10">{children ?? <Outlet />}</main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden"
        aria-label="Mobile"
      >
        <div className="grid grid-cols-5">
          {MOBILE.map((i) => {
            const active = i.to === "/" ? pathname === "/" : pathname === i.to || pathname.startsWith(`${i.to}/`);
            return (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <i.icon className="size-4" strokeWidth={1.7} />
                {i.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMore(true)}
            className="flex min-h-12 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
          >
            <MoreHorizontal className="size-4" />
            More
          </button>
        </div>
      </nav>

      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto pt-6">
          <div className="mb-3 flex items-center justify-between px-5">
            <p className="text-sm font-semibold">All areas</p>
            <Button variant="ghost" size="icon-sm" onClick={() => setMore(false)} aria-label="Close">
              <X className="size-4" />
            </Button>
          </div>
          <div className="px-3 pb-8">
            <SidebarBody onNavigate={() => setMore(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <CommandPalette open={cmd} onOpenChange={setCmd} onQuickAdd={openQuick} />
      <QuickAddDialog open={quick} onOpenChange={setQuick} initial={quickKind} />
    </div>
  );
}
