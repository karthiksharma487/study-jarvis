import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppShell } from "@/components/app/shell";
import { Onboarding } from "@/components/app/onboarding";
import { JarvisMark } from "@/components/brand/mark";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useHydrated, useThemeSync } from "@/lib/study/hydrate";
import { useStudyStore } from "@/lib/study/store";
import appCss from "../styles.css?url";

const APP_NAME = "Study Jarvis";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: "An operating system for academic life — lectures, backlog, practice, revision, and progress in one command center." },
      { name: "theme-color", content: "#0c0d0f" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <PreviewHostBridge />
        <AuthProvider>
          <TooltipProvider delayDuration={200}>
            <RootApp />
          </TooltipProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootApp() {
  const hydrated = useHydrated();
  useThemeSync();
  const onboarded = useStudyStore((s) => s.profile.onboarded);

  if (!hydrated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background text-foreground">
        <JarvisMark size={40} />
        <p className="text-sm text-muted-foreground">Loading your command center</p>
        <Toaster />
      </div>
    );
  }

  if (!onboarded) {
    return (
      <>
        <Onboarding />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AppShell>
        <Outlet />
      </AppShell>
      <Toaster />
    </>
  );
}
