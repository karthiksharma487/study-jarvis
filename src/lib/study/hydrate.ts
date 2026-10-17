import { useEffect, useState } from "react";
import { useStudyStore } from "./store";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useStudyStore.persist.onFinishHydration(() => setHydrated(true));
    void useStudyStore.persist.rehydrate();
    if (useStudyStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

export function useThemeSync(): void {
  const theme = useStudyStore((s) => s.settings.theme);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = theme === "dark" || (theme === "system" && prefersDark);
      root.classList.toggle("dark", dark);
      root.classList.toggle("light", !dark);
      root.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);
}
