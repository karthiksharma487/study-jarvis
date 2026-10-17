import { Toaster as Sonner } from "sonner";
import { useStudyStore } from "@/lib/study/store";

export function Toaster() {
  const theme = useStudyStore((s) => s.settings.theme);
  return (
    <Sonner
      theme={theme === "system" ? "system" : theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-card text-foreground border-border",
        },
      }}
    />
  );
}
