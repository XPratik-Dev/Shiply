import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { RepoImportForm } from "@/components/dashboard/RepoImportForm";
import { RepoCard } from "@/components/dashboard/RepoCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlan, planLimitLabel, PLANS } from "@/lib/plans";
import { formatCompactDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const userPlan = normalizePlan(user.plan);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [repos, totalRepos, changelogCount, publishedCount, generatedThisMonth, recent] =
    await Promise.all([
      prisma.repo.findMany({
        where: { userId: user.id },
        include: { _count: { select: { changelogs: true } } },
        orderBy: { updatedAt: "desc" },
        take: 3,
      }),
      prisma.repo.count({ where: { userId: user.id } }),
      prisma.changelog.count({ where: { userId: user.id } }),
      prisma.changelog.count({ where: { userId: user.id, isPublished: true } }),
      prisma.changelog.count({
        where: { userId: user.id, createdAt: { gte: monthStart } },
      }),
      prisma.changelog.findMany({
        where: { userId: user.id },
        include: { repo: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

  const plan = PLANS[userPlan];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan: userPlan }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge tone="green">{plan.name} workspace</Badge>
            <h1 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">Dashboard</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">
              Generate, edit, and publish changelogs from connected repositories.
            </p>
          </div>
          <Link href="/repos" className={buttonClasses({ variant: "primary" })}>
            <Plus className="h-4 w-4" aria-hidden />
            Add repo
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            label="Repositories"
            value={totalRepos}
            detail={`${planLimitLabel(plan.repos)} allowed on this plan`}
          />
          <StatsCard
            label="Changelogs"
            value={changelogCount}
            detail={`${generatedThisMonth} generated this month`}
          />
          <StatsCard label="Published" value={publishedCount} detail="Public pages available" />
          <StatsCard
            label="Monthly limit"
            value={planLimitLabel(plan.changelogs)}
            detail="AI generations per month"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            <RepoImportForm />
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Recent repositories</h2>
              <Link href="/repos" className="text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-50">
                View all
              </Link>
            </div>
            {repos.length > 0 ? (
              repos.map((repo) => <RepoCard key={repo.id} repo={repo} />)
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                Add a repository to generate your first changelog.
              </div>
            )}
          </section>

          <aside className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Recent changelogs</h2>
              <Link href="/changelogs" className="text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-50">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {recent.length > 0 ? (
                recent.map((changelog) => (
                  <Link
                    key={changelog.id}
                    href={`/changelogs/${changelog.id}/edit`}
                    className="block rounded-md border border-neutral-200 p-3 transition hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-950 dark:text-neutral-50">{changelog.title}</p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                          {changelog.repo.fullName} - {formatCompactDate(changelog.updatedAt)}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 text-neutral-400" aria-hidden />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No changelogs yet.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
