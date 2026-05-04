import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicChangelog } from "@/components/changelog/PublicChangelog";
import { ensureDemoUser } from "@/lib/auth";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureDemoUser(true);
  const { slug } = await params;
  const changelog = await prisma.changelog.findUnique({
    where: { slug },
    include: { repo: true },
  });

  if (!changelog) return { title: "Changelog not found" };

  return {
    title: `${changelog.title} - ${changelog.repo.fullName}`,
    description: changelog.aiSummary,
    openGraph: {
      title: changelog.title,
      description: changelog.aiSummary,
      type: "article",
    },
  };
}

export default async function PublicChangelogPage({ params }: Props) {
  await ensureDemoUser(true);
  const { slug } = await params;
  const changelog = await prisma.changelog.findUnique({
    where: { slug },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!changelog || !changelog.isPublished || !changelog.isPublic) {
    notFound();
  }

  return <PublicChangelog changelog={serializeChangelog(changelog)} />;
}
