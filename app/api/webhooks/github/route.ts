import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function verifyGitHubWebhook(payload: string, signature: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event") || "";

  if (!verifyGitHubWebhook(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body = JSON.parse(payload);
  if (event === "push" || event === "release") {
    const repoFullName = body.repository?.full_name;
    if (repoFullName) {
      await prisma.repo.updateMany({
        where: { fullName: repoFullName },
        data: { lastSyncedAt: new Date() },
      });
    }
  }

  return NextResponse.json({ ok: true, event });
}
