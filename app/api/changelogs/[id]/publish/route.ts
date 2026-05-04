import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { serializeChangelog } from "@/lib/changelog";
import { prisma } from "@/lib/db";
import { sendChangelogPublishedEmail } from "@/lib/resend";
import { absoluteUrl } from "@/lib/utils";

const publishSchema = z.object({
  isPublished: z.boolean().default(true),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = publishSchema.parse(await req.json().catch(() => ({})));
  const existing = await prisma.changelog.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Changelog not found" }, { status: 404 });

  const changelog = await prisma.changelog.update({
    where: { id: existing.id },
    data: { isPublished: body.isPublished, isPublic: true },
    include: {
      repo: true,
      user: { select: { name: true, image: true } },
      entries: { orderBy: { orderIndex: "asc" } },
    },
  });

  const publicUrl = absoluteUrl(`/changelog/${changelog.slug}`);
  const email =
    body.isPublished && user.email
      ? await sendChangelogPublishedEmail(user.email, changelog.title, publicUrl)
      : { sent: false };

  return NextResponse.json({
    changelog: serializeChangelog(changelog),
    publicUrl,
    email,
  });
}
