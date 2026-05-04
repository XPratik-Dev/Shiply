import Link from "next/link";
import { GitBranch, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { formatCompactDate } from "@/lib/utils";

export function RepoCard({
  repo,
}: {
  repo: {
    id: string;
    fullName: string;
    description: string | null;
    isPrivate: boolean;
    defaultBranch: string;
    lastSyncedAt: Date | null;
    _count?: { changelogs: number };
  };
}) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{repo.fullName}</h3>
            <Badge tone={repo.isPrivate ? "amber" : "green"}>
              {repo.isPrivate ? (
                <Lock className="mr-1 h-3 w-3" aria-hidden />
              ) : (
                <Unlock className="mr-1 h-3 w-3" aria-hidden />
              )}
              {repo.isPrivate ? "Private" : "Public"}
            </Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            {repo.description || "No repository description provided."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1">
              <GitBranch className="h-4 w-4" aria-hidden />
              {repo.defaultBranch}
            </span>
            <span>{repo._count?.changelogs ?? 0} changelogs</span>
            <span>Synced {formatCompactDate(repo.lastSyncedAt)}</span>
          </div>
        </div>
        <Link href={`/repos/${repo.id}`} className={buttonClasses({ variant: "outline" })}>
          Open
        </Link>
      </div>
    </article>
  );
}
