import { cn } from "@/lib/utils";

export function JarvisMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <circle cx="16" cy="16" r="10.5" className="stroke-background" strokeWidth="1.4" opacity="0.55" />
      <path
        d="M12 9.5h6.2c2.6 0 4.4 1.7 4.4 4.15 0 2.5-1.8 4.2-4.4 4.2H14.6V22.5"
        className="stroke-background"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
