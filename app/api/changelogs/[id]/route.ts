import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";

const entrySchema = z.object({
  id: z.string().optional(),
  type: z.enum(["FEATURE", "FIX", "BREAKING", "PERFORMANCE", "DOCS", "CHORE", "SECURITY"]),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  commits: z.array(z.string()).default([]),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  version: z.string().optional().nullable(),
  aiSummary: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  entries: z.array(entrySchema).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const changelog = await prisma.changelog.findFirst({
    where: { id, userId: user.id },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!changelog) return NextResponse.json({ error: "Changelog not found" }, { status: 404 });
  return NextResponse.json(serializeChangelog(changelog));
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = updateSchema.parse(await req.json());
  const existing = await prisma.changelog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Changelog not found" }, { status: 404 });

  if (body.entries) {
    await prisma.changelogEntry.deleteMany({ where: { changelogId: existing.id } });
  }

  const changelog = await prisma.changelog.update({
    where: { id: existing.id },
    data: {
      title: body.title,
      version: body.version,
      aiSummary: body.aiSummary,
      isPublic: body.isPublic,
      isPublished: body.isPublished,
      entries: body.entries
        ? {
            create: body.entries.map((entry, index) => ({
              type: entry.type,
              title: entry.title,
              description: entry.description,
              commits: JSON.stringify(entry.commits),
              orderIndex: index,
            })),
          }
        : undefined,
    },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
  });

  return NextResponse.json(serializeChangelog(changelog));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await prisma.changelog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Changelog not found" }, { status: 404 });

  await prisma.changelog.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
