import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { generateChangelog } from "@/lib/ai";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";
import { getCommits } from "@/lib/github";
import { canGenerateChangelog } from "@/lib/plans";
import { rateLimit } from "@/lib/redis";
import { toSlug } from "@/lib/utils";

const generateSchema = z.object({
  since: z.string().optional().nullable(),
  until: z.string().optional().nullable(),
  branch: z.string().optional().nullable(),
  customInstructions: z.string().optional().nullable(),
  existingVersion: z.string().optional().nullable(),
  limit: z.number().min(1).max(100).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ repoId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { repoId } = await params;

  const limit = await rateLimit(`generate:${user.id}`, 10, "1 h");
  if (!limit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 generations per hour." },
      { status: 429 },
    );
  }

  const repo = await prisma.repo.findFirst({
    where: { id: repoId, userId: user.id },
  });
  if (!repo) return NextResponse.json({ error: "Repo not found" }, { status: 404 });

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const generatedThisMonth = await prisma.changelog.count({
    where: { userId: user.id, createdAt: { gte: monthStart } },
  });
  if (!canGenerateChangelog(user.plan, generatedThisMonth)) {
    return NextResponse.json(
      { error: "Monthly changelog generation limit reached. Upgrade to continue." },
      { status: 403 },
    );
  }

  const body = generateSchema.parse(await req.json());

  try {
    const commits = await getCommits(repo.owner, repo.name, {
      since: body.since || undefined,
      until: body.until || undefined,
      sha: body.branch || repo.defaultBranch,
      per_page: body.limit ?? 50,
      token: user.githubToken,
    });

    if (commits.length === 0) {
      return NextResponse.json(
        { error: "No commits found in the selected range." },
        { status: 400 },
      );
    }

    const generated = await generateChangelog(commits, repo.fullName, {
      fromDate: body.since || undefined,
      toDate: body.until || undefined,
      existingVersion: body.existingVersion || undefined,
      customInstructions: body.customInstructions || undefined,
    });

    const slug = `${toSlug(repo.name)}-${nanoid(8)}`;
    const changelog = await prisma.changelog.create({
      data: {
        userId: user.id,
        repoId: repo.id,
        slug,
        title: generated.title,
        version: generated.version || undefined,
        aiSummary: generated.summary,
        rawCommits: JSON.stringify(commits),
        generatedBy: generated.generatedBy,
        fromDate: body.since ? new Date(body.since) : undefined,
        toDate: body.until ? new Date(body.until) : undefined,
        entries: {
          create: generated.entries.map((entry, index) => ({
            type: entry.type,
            title: entry.title,
            description: entry.description,
            commits: JSON.stringify(entry.commits),
            orderIndex: index,
          })),
        },
      },
      include: {
        repo: true,
        user: { select: { name: true, image: true } },
        entries: { orderBy: { orderIndex: "asc" } },
      },
    });

    await prisma.repo.update({
      where: { id: repo.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json(serializeChangelog(changelog));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate a changelog.",
      },
      { status: 400 },
    );
  }
}
