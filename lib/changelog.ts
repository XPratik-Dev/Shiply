import type { Changelog, ChangelogEntry, Repo, User } from "@prisma/client";
import type { EntryType, PublicChangelogData, PublicEntry } from "@/types";
import { parseJson } from "@/lib/utils";

type ChangelogWithRelations = Changelog & {
  entries: ChangelogEntry[];
  repo: Repo;
  user?: Pick<User, "name" | "image"> | null;
};

export function serializeEntry(entry: ChangelogEntry): PublicEntry {
  return {
    id: entry.id,
    type: normalizeEntryType(entry.type),
    title: entry.title,
    description: entry.description,
    commits: parseJson<string[]>(entry.commits, []),
    orderIndex: entry.orderIndex,
  };
}

function normalizeEntryType(type: string): EntryType {
  if (
    type === "FEATURE" ||
    type === "FIX" ||
    type === "BREAKING" ||
    type === "PERFORMANCE" ||
    type === "DOCS" ||
    type === "CHORE" ||
    type === "SECURITY"
  ) {
    return type;
  }

  return "CHORE";
}

export function serializeChangelog(changelog: ChangelogWithRelations): PublicChangelogData {
  return {
    id: changelog.id,
    slug: changelog.slug,
    title: changelog.title,
    version: changelog.version,
    aiSummary: changelog.aiSummary,
    isPublished: changelog.isPublished,
    isPublic: changelog.isPublic,
    generatedBy: changelog.generatedBy,
    createdAt: changelog.createdAt,
    updatedAt: changelog.updatedAt,
    repo: {
      id: changelog.repo.id,
      fullName: changelog.repo.fullName,
      owner: changelog.repo.owner,
      name: changelog.repo.name,
      htmlUrl: changelog.repo.htmlUrl,
    },
    user: changelog.user
      ? {
          name: changelog.user.name,
          image: changelog.user.image,
        }
      : undefined,
    entries: changelog.entries
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(serializeEntry),
  };
}
