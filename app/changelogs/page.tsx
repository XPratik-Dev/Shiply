import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlan } from "@/lib/plans";
import { formatCompactDate } from "@/lib/utils";

export default async function ChangelogsPage() {
  const user = await requireUser();
  const changelogs = await prisma.changelog.findMany({
    where: { userId: user.id },
    include: { repo: true, entries: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan: normalizePlan(user.plan) }} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Badge tone="green">{changelogs.length} total</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">Changelogs</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Review drafts, edit generated entries, and open public release pages.
        </p>
        <div className="mt-6 space-y-4">
          {changelogs.map((changelog) => (
            <Link
              key={changelog.id}
              href={`/changelogs/${changelog.id}/edit`}
              className="block rounded-lg border border-neutral-200 bg-white p-5 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{changelog.title}</h2>
                    <Badge tone={changelog.isPublished ? "green" : "amber"}>
                      {changelog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {changelog.aiSummary}
                  </p>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 sm:text-right">
                  <p>{changelog.repo.fullName}</p>
                  <p className="mt-1">{changelog.entries.length} entries</p>
                  <p className="mt-1">{formatCompactDate(changelog.updatedAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
