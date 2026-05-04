import { notFound } from "next/navigation";
import { ChangelogEditor } from "@/components/changelog/ChangelogEditor";
import { Navbar } from "@/components/shared/Navbar";
import { requireUser } from "@/lib/auth";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";
import { normalizePlan } from "@/lib/plans";
import { absoluteUrl } from "@/lib/utils";

export default async function EditChangelogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const changelog = await prisma.changelog.findFirst({
    where: { id, userId: user.id },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!changelog) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan: normalizePlan(user.plan) }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ChangelogEditor
          changelog={serializeChangelog(changelog)}
          publicBaseUrl={absoluteUrl("/").replace(/\/$/, "")}
        />
      </main>
    </div>
  );
}
