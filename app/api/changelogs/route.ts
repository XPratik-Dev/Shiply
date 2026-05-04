import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";
import { toSlug } from "@/lib/utils";
import { nanoid } from "nanoid";

const manualChangelogSchema = z.object({
  repoId: z.string(),
  title: z.string().min(1),
  version: z.string().optional().nullable(),
  aiSummary: z.string().min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const changelogs = await prisma.changelog.findMany({
    where: { userId: user.id },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(changelogs.map(serializeChangelog));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = manualChangelogSchema.parse(await req.json());
  const repo = await prisma.repo.findFirst({
    where: { id: body.repoId, userId: user.id },
  });
  if (!repo) return NextResponse.json({ error: "Repo not found" }, { status: 404 });

  const changelog = await prisma.changelog.create({
    data: {
      userId: user.id,
      repoId: repo.id,
      slug: `${toSlug(repo.name)}-${nanoid(8)}`,
      title: body.title,
      version: body.version || undefined,
      aiSummary: body.aiSummary,
      generatedBy: "manual",
    },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(serializeChangelog(changelog), { status: 201 });
}
