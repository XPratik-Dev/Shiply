import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAddRepo } from "@/lib/plans";
import { absoluteUrl } from "@/lib/utils";
import { getRepoMetadata, parseGitHubRepo, registerWebhook } from "@/lib/github";

const addRepoSchema = z.object({
  repoUrl: z.string().min(3).optional(),
  owner: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const repos = await prisma.repo.findMany({
    where: { userId: user.id },
    include: { _count: { select: { changelogs: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(repos);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = addRepoSchema.parse(await req.json());
  const parsed = body.repoUrl
    ? parseGitHubRepo(body.repoUrl)
    : body.owner && body.name
      ? { owner: body.owner, name: body.name }
      : null;

  if (!parsed) {
    return NextResponse.json({ error: "Provide a GitHub repo URL." }, { status: 400 });
  }

  const repoCount = await prisma.repo.count({ where: { userId: user.id } });
  if (!canAddRepo(user.plan, repoCount)) {
    return NextResponse.json(
      { error: "Repo limit reached. Upgrade your plan to add more repositories." },
      { status: 403 },
    );
  }

  try {
    const metadata = await getRepoMetadata(parsed.owner, parsed.name, user.githubToken);
    const existing = await prisma.repo.findUnique({
      where: {
        userId_githubRepoId: {
          userId: user.id,
          githubRepoId: metadata.githubRepoId,
        },
      },
    });

    if (existing) return NextResponse.json(existing);

    let webhookId: string | null = null;
    try {
      webhookId = await registerWebhook(
        metadata.owner,
        metadata.name,
        absoluteUrl(),
        user.githubToken,
      );
    } catch {
      webhookId = null;
    }

    const repo = await prisma.repo.create({
      data: {
        userId: user.id,
        githubRepoId: metadata.githubRepoId,
        owner: metadata.owner,
        name: metadata.name,
        fullName: metadata.fullName,
        description: metadata.description,
        isPrivate: metadata.isPrivate,
        defaultBranch: metadata.defaultBranch,
        htmlUrl: metadata.htmlUrl,
        webhookId,
      },
      include: { _count: { select: { changelogs: true } } },
    });

    return NextResponse.json(repo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import that GitHub repository.",
      },
      { status: 400 },
    );
  }
}
