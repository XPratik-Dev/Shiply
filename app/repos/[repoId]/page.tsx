import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { GenerateForm } from "@/components/dashboard/GenerateForm";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlan } from "@/lib/plans";
import { formatCompactDate } from "@/lib/utils";

export default async function RepoDetailPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = await params;
  const user = await requireUser();
  const repo = await prisma.repo.findFirst({
    where: { id: repoId, userId: user.id },
    include: {
      changelogs: { orderBy: { updatedAt: "desc" }, take: 8 },
      _count: { select: { changelogs: true } },
    },
  });

  if (!repo) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan: normalizePlan(user.plan) }} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={repo.isPrivate ? "amber" : "green"}>
                {repo.isPrivate ? "Private" : "Public"}
              </Badge>
              <Badge tone="neutral">{repo.defaultBranch}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">{repo.fullName}</h1>
            <p className="mt-2 max-w-3xl text-neutral-600 dark:text-neutral-300">
              {repo.description || "No repository description provided."}
            </p>
          </div>
          <Link
            href={repo.htmlUrl || `https://github.com/${repo.fullName}`}
            className={buttonClasses({ variant: "outline" })}
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            GitHub
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <GenerateForm repoId={repo.id} defaultBranch={repo.defaultBranch} />
          <aside className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">Repository status</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 dark:text-neutral-400">Changelogs</dt>
                <dd className="font-medium text-neutral-950 dark:text-neutral-50">{repo._count.changelogs}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 dark:text-neutral-400">Last synced</dt>
                <dd className="font-medium text-neutral-950 dark:text-neutral-50">{formatCompactDate(repo.lastSyncedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500 dark:text-neutral-400">Webhook</dt>
                <dd className="font-medium text-neutral-950 dark:text-neutral-50">{repo.webhookId ? "Registered" : "Optional"}</dd>
              </div>
            </dl>
          </aside>
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Changelogs</h2>
          <div className="mt-4 grid gap-3">
            {repo.changelogs.length > 0 ? (
              repo.changelogs.map((changelog) => (
                <Link
                  key={changelog.id}
                  href={`/changelogs/${changelog.id}/edit`}
                  className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-neutral-950 dark:text-neutral-50">{changelog.title}</p>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        {changelog.version || "No version"} - {formatCompactDate(changelog.updatedAt)}
                      </p>
                    </div>
                    <Badge tone={changelog.isPublished ? "green" : "amber"}>
                      {changelog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                Generate a changelog from this repository to see it here.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
