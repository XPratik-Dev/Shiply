import { PrismaClient } from "@prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "production" ? "file:/tmp/shiply.db" : "file:./dev.db");

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  sqliteSchemaReady?: boolean;
  sqliteSchemaPromise?: Promise<void>;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const sqliteSchemaStatements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "githubId" TEXT,
    "githubToken" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_githubId_key" ON "User"("githubId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeCustomerId_key" ON "User"("stripeCustomerId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId")`,
  `CREATE TABLE IF NOT EXISTS "Repo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "githubRepoId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "htmlUrl" TEXT,
    "webhookId" TEXT,
    "lastSyncedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Repo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Repo_userId_githubRepoId_key" ON "Repo"("userId", "githubRepoId")`,
  `CREATE INDEX IF NOT EXISTS "Repo_userId_idx" ON "Repo"("userId")`,
  `CREATE TABLE IF NOT EXISTS "Changelog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "fromCommit" TEXT,
    "toCommit" TEXT,
    "fromDate" DATETIME,
    "toDate" DATETIME,
    "rawCommits" TEXT NOT NULL DEFAULT '[]',
    "aiSummary" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL DEFAULT 'local',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Changelog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Changelog_repoId_fkey" FOREIGN KEY ("repoId") REFERENCES "Repo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Changelog_slug_key" ON "Changelog"("slug")`,
  `CREATE INDEX IF NOT EXISTS "Changelog_userId_idx" ON "Changelog"("userId")`,
  `CREATE INDEX IF NOT EXISTS "Changelog_repoId_idx" ON "Changelog"("repoId")`,
  `CREATE INDEX IF NOT EXISTS "Changelog_slug_idx" ON "Changelog"("slug")`,
  `CREATE TABLE IF NOT EXISTS "ChangelogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changelogId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CHORE',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "commits" TEXT NOT NULL DEFAULT '[]',
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "ChangelogEntry_changelogId_fkey" FOREIGN KEY ("changelogId") REFERENCES "Changelog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "ChangelogEntry_changelogId_idx" ON "ChangelogEntry"("changelogId")`,
  `CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`,
  `CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`,
];

export async function ensureSqliteSchema() {
  if (!databaseUrl.startsWith("file:")) return;
  if (globalForPrisma.sqliteSchemaReady) return;

  if (!globalForPrisma.sqliteSchemaPromise) {
    globalForPrisma.sqliteSchemaPromise = (async () => {
      for (const statement of sqliteSchemaStatements) {
        await prisma.$executeRawUnsafe(statement);
      }
      globalForPrisma.sqliteSchemaReady = true;
    })();
  }

  await globalForPrisma.sqliteSchemaPromise;
}
