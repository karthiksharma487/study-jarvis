import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatDay(key: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseDay(key).toLocaleDateString(undefined, opts ?? {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(hhmm?: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function formatDuration(min: number): string {
  if (!min || min <= 0) return "0m";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function clampPct(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function pct(done: number, total: number): number | null {
  if (!total) return null;
  return clampPct((done / total) * 100);
}

export function formatPct(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${value}%`;
}

export function startOfWeek(d = new Date(), weekStartsOn: 0 | 1 = 1): Date {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? 6 : day - 1) : day;
  date.setDate(date.getDate() - diff);
  return date;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(target);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function downloadBlob(filename: string, content: string, type = "application/json"): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function subjectKey(name: string): string {
  const n = name.trim().toLowerCase();
  if (n.includes("phys")) return "physics";
  if (n.includes("chem")) return "chemistry";
  if (n.includes("math")) return "mathematics";
  if (n.includes("computer") || n === "cs" || n.includes("coding")) return "cs";
  if (n.includes("english")) return "english";
  if (n.includes("hindi")) return "hindi";
  return "default";
}
