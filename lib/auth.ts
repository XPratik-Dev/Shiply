import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ensureSqliteSchema, prisma } from "@/lib/db";
import { DEMO_USER_ID, SESSION_COOKIE } from "@/lib/session";

export { DEMO_USER_ID, SESSION_COOKIE };

export async function ensureDemoUser(seed = false) {
  await ensureSqliteSchema();
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { email: "demo@shiply.local" },
    create: {
      id: DEMO_USER_ID,
      email: "demo@shiply.local",
      name: "Demo Maintainer",
      githubId: "demo",
      githubToken: process.env.GITHUB_TOKEN || null,
      plan: "PRO",
    },
  });

  if (seed) {
    await seedDemoData(user.id);
  }

  return user;
}

async function seedDemoData(userId: string) {
  const existingRepo = await prisma.repo.findFirst({ where: { userId } });
  if (existingRepo) return;

  const repo = await prisma.repo.create({
    data: {
      userId,
      githubRepoId: "demo-openai-node",
      owner: "openai",
      name: "openai-node",
      fullName: "openai/openai-node",
      description: "Official JavaScript and TypeScript library for the OpenAI API.",
      defaultBranch: "master",
      htmlUrl: "https://github.com/openai/openai-node",
      lastSyncedAt: new Date(),
    },
  });

  await prisma.changelog.create({
    data: {
      userId,
      repoId: repo.id,
      slug: "openai-node-demo-release",
      title: "SDK Quality Release",
      version: "v1.4.0",
      aiSummary:
        "This release improves developer ergonomics around streaming, error reporting, and generated type coverage. It also tightens the maintenance workflow so future API additions are easier to ship.",
      rawCommits: JSON.stringify([
        {
          sha: "a1b2c3d4",
          message: "feat: add streamed response helpers",
          author: "Demo",
          date: new Date().toISOString(),
          url: "https://github.com/openai/openai-node",
        },
      ]),
      generatedBy: "local-demo",
      isPublished: true,
      entries: {
        create: [
          {
            type: "FEATURE",
            title: "Add streamed response helpers",
            description:
              "New helpers make it easier to consume streamed API responses without hand-rolling event parsing.",
            commits: JSON.stringify(["a1b2c3d4"]),
            orderIndex: 0,
          },
          {
            type: "FIX",
            title: "Improve error messages for failed requests",
            description:
              "Request failures now surface clearer status and response context for faster debugging.",
            commits: JSON.stringify(["e5f6g7h8"]),
            orderIndex: 1,
          },
          {
            type: "DOCS",
            title: "Refresh usage examples",
            description:
              "Documentation examples were updated to match the latest client patterns.",
            commits: JSON.stringify(["i9j0k1l2"]),
            orderIndex: 2,
          },
        ],
      },
    },
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  if (session !== DEMO_USER_ID) return null;

  await ensureSqliteSchema();
  return prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return user;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
