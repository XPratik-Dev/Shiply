import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatCompactDate } from "@/lib/utils";
import type { EntryType, PublicChangelogData } from "@/types";

const entryTone: Record<EntryType, "green" | "rose" | "amber" | "cyan" | "neutral" | "violet"> = {
  FEATURE: "green",
  FIX: "rose",
  BREAKING: "amber",
  PERFORMANCE: "cyan",
  DOCS: "violet",
  CHORE: "neutral",
  SECURITY: "amber",
};

export function PublicChangelog({
  changelog,
  showChrome = true,
}: {
  changelog: PublicChangelogData;
  showChrome?: boolean;
}) {
  return (
    <main className={showChrome ? "min-h-screen bg-neutral-50 dark:bg-neutral-950" : ""}>
      <section className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {showChrome ? (
            <div className="mb-6 flex justify-end">
              <ThemeToggle />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            {changelog.version ? <Badge tone="green">{changelog.version}</Badge> : null}
            <Badge tone={changelog.generatedBy === "claude" ? "cyan" : "neutral"}>
              {changelog.generatedBy === "claude" ? "Claude generated" : "Demo generated"}
            </Badge>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {formatCompactDate(changelog.createdAt)}
            </span>
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-normal text-neutral-950 dark:text-neutral-50 sm:text-5xl">
            {changelog.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
            {changelog.aiSummary}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={changelog.repo.htmlUrl || `https://github.com/${changelog.repo.fullName}`}
              className={buttonClasses({ variant: "outline" })}
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              {changelog.repo.fullName}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {changelog.entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={entryTone[entry.type]}>{entry.type}</Badge>
                <h2 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50">{entry.title}</h2>
              </div>
              {entry.description ? (
                <p className="mt-3 leading-7 text-neutral-600 dark:text-neutral-300">{entry.description}</p>
              ) : null}
              {entry.commits.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.commits.slice(0, 6).map((sha) => (
                    <code
                      key={sha}
                      className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {sha.slice(0, 7)}
                    </code>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
