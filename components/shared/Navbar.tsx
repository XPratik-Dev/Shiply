import Link from "next/link";
import { Bot, LogOut, Settings, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export function Navbar({
  user,
}: {
  user?: { name: string | null; plan?: string } | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-neutral-950 dark:text-neutral-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-950 text-white dark:bg-neutral-100 dark:text-neutral-950">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          Shiply
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link className={buttonClasses({ variant: "ghost", size: "sm" })} href="/dashboard">
            Dashboard
          </Link>
          <Link className={buttonClasses({ variant: "ghost", size: "sm" })} href="/repos">
            Repos
          </Link>
          <Link className={buttonClasses({ variant: "ghost", size: "sm" })} href="/changelogs">
            Changelogs
          </Link>
          <Link className={buttonClasses({ variant: "ghost", size: "sm" })} href="/settings/billing">
            Billing
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Badge tone="green">{user.plan || "DEMO"}</Badge>
              <Link
                href="/settings"
                className={buttonClasses({ variant: "outline", size: "icon" })}
                title="Settings"
              >
                <Settings className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/api/auth/signout"
                className={buttonClasses({ variant: "ghost", size: "icon" })}
                title="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </Link>
            </>
          ) : (
            <Link href="/api/auth/demo" className={buttonClasses({ variant: "primary", size: "sm" })}>
              <Sparkles className="h-4 w-4" aria-hidden />
              Start demo
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
