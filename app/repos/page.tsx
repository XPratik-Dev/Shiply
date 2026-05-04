import { RepoImportForm } from "@/components/dashboard/RepoImportForm";
import { RepoCard } from "@/components/dashboard/RepoCard";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizePlan } from "@/lib/plans";

export default async function ReposPage() {
  const user = await requireUser();
  const repos = await prisma.repo.findMany({
    where: { userId: user.id },
    include: { _count: { select: { changelogs: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan: normalizePlan(user.plan) }} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Badge tone="green">{repos.length} connected</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">Repositories</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Add public GitHub repositories, fetch commits, and generate release notes.
        </p>
        <div className="mt-6">
          <RepoImportForm />
        </div>
        <div className="mt-6 space-y-4">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      </main>
    </div>
  );
}
