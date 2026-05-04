import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getCommits } from "@/lib/github";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repoId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { repoId } = await params;

  const repo = await prisma.repo.findFirst({
    where: { id: repoId, userId: user.id },
  });
  if (!repo) return NextResponse.json({ error: "Repo not found" }, { status: 404 });

  const search = req.nextUrl.searchParams;
  try {
    const commits = await getCommits(repo.owner, repo.name, {
      since: search.get("since") || undefined,
      until: search.get("until") || undefined,
      sha: search.get("branch") || repo.defaultBranch,
      per_page: Number(search.get("limit") || 30),
      token: user.githubToken,
    });

    await prisma.repo.update({
      where: { id: repo.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({ commits });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to fetch commits from GitHub.",
      },
      { status: 400 },
    );
  }
}
