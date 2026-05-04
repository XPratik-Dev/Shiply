export type EntryType =
  | "FEATURE"
  | "FIX"
  | "BREAKING"
  | "PERFORMANCE"
  | "DOCS"
  | "CHORE"
  | "SECURITY";

export type Plan = "FREE" | "PRO" | "TEAM";

export interface CommitData {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GeneratedChangelogEntry {
  type: EntryType;
  title: string;
  description: string;
  commits: string[];
}

export interface GeneratedChangelog {
  title: string;
  version?: string | null;
  summary: string;
  entries: GeneratedChangelogEntry[];
}

export interface PublicEntry {
  id: string;
  type: EntryType;
  title: string;
  description: string | null;
  commits: string[];
  orderIndex: number;
}

export interface PublicChangelogData {
  id: string;
  slug: string;
  title: string;
  version: string | null;
  aiSummary: string;
  isPublished: boolean;
  isPublic: boolean;
  generatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  repo: {
    id: string;
    fullName: string;
    owner: string;
    name: string;
    htmlUrl: string | null;
  };
  user?: {
    name: string | null;
    image: string | null;
  };
  entries: PublicEntry[];
}
