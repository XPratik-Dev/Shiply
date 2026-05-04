import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateChangelog } from "@/lib/ai";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";
import { getCommits } from "@/lib/github";
import { toSlug } from "@/lib/utils";
import { nanoid } from "nanoid";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ repoId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { repoId } = await params;

  const repo = await prisma.repo.findFirst({
    where: { id: repoId, userId: user.id },
  });
  if (!repo) return new Response("Repo not found", { status: 404 });

  const body = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send("status", { message: "Fetching commits from GitHub" });
        const commits = await getCommits(repo.owner, repo.name, {
          since: body.since || undefined,
          until: body.until || undefined,
          sha: body.branch || repo.defaultBranch,
          per_page: Number(body.limit || 50),
          token: user.githubToken,
        });

        send("status", { message: `Analyzing ${commits.length} commits` });
        const generated = await generateChangelog(commits, repo.fullName, {
          fromDate: body.since || undefined,
          toDate: body.until || undefined,
          customInstructions: body.customInstructions || undefined,
        });

        const changelog = await prisma.changelog.create({
          data: {
            userId: user.id,
            repoId: repo.id,
            slug: `${toSlug(repo.name)}-${nanoid(8)}`,
            title: generated.title,
            version: generated.version || undefined,
            aiSummary: generated.summary,
            rawCommits: JSON.stringify(commits),
            generatedBy: generated.generatedBy,
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

        send("done", { changelog: serializeChangelog(changelog) });
      } catch (error) {
        send("error", {
          message:
            error instanceof Error ? error.message : "Unable to generate changelog.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
