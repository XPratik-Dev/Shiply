import Anthropic from "@anthropic-ai/sdk";
import type { CommitData, EntryType, GeneratedChangelog } from "@/types";

const SYSTEM_PROMPT = `You are an expert technical writer who transforms raw git commits into beautiful, human-readable changelogs.

Rules:
- Group related commits into logical changelog entries.
- Write titles in present tense, user-facing language.
- Be concise but descriptive in descriptions.
- Classify entries as FEATURE, FIX, BREAKING, PERFORMANCE, DOCS, CHORE, or SECURITY.
- Skip pure merge commits, version bumps, and whitespace-only changes unless they matter.
- Generate a 2-3 sentence release summary.
- Respond with only valid JSON that matches this shape:
{
  "title": "string",
  "version": "string or null",
  "summary": "string",
  "entries": [
    {
      "type": "FEATURE|FIX|BREAKING|PERFORMANCE|DOCS|CHORE|SECURITY",
      "title": "string",
      "description": "string",
      "commits": ["sha1"]
    }
  ]
}`;

export async function generateChangelog(
  commits: CommitData[],
  repoName: string,
  options: {
    fromDate?: string;
    toDate?: string;
    existingVersion?: string;
    customInstructions?: string;
  } = {},
): Promise<GeneratedChangelog & { generatedBy: string }> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ...generateLocalChangelog(commits, repoName, options), generatedBy: "local" };
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const commitList = commits
    .map((commit) => {
      const firstLine = commit.message.split("\n")[0];
      return `[${commit.sha.slice(0, 7)}] ${firstLine} (by ${commit.author} on ${commit.date})`;
    })
    .join("\n");

  const userPrompt = `Repository: ${repoName}
${options.fromDate ? `Period: ${options.fromDate} to ${options.toDate || "now"}` : ""}
${options.existingVersion ? `Current version: ${options.existingVersion}` : ""}
${options.customInstructions ? `Special instructions: ${options.customInstructions}` : ""}

Commits to analyze (${commits.length} total):
${commitList}

Generate a beautiful changelog from these commits.`;

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const responseText = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");

  const generated = JSON.parse(cleanJson(responseText)) as GeneratedChangelog;
  return { ...generated, generatedBy: "claude" };
}

function cleanJson(value: string) {
  return value.replace(/```json\n?|\n?```/g, "").trim();
}

function generateLocalChangelog(
  commits: CommitData[],
  repoName: string,
  options: {
    fromDate?: string;
    toDate?: string;
    existingVersion?: string;
    customInstructions?: string;
  },
): GeneratedChangelog {
  const relevantCommits = commits
    .filter((commit) => !/^merge\b/i.test(commit.message.trim()))
    .slice(0, 80);

  const groups = new Map<EntryType, CommitData[]>();
  for (const commit of relevantCommits) {
    const type = classifyCommit(commit.message);
    groups.set(type, [...(groups.get(type) || []), commit]);
  }

  const entries = Array.from(groups.entries()).flatMap(([type, grouped]) => {
    const chunks = chunk(grouped, type === "CHORE" ? 4 : 3);
    return chunks.map((items) => ({
      type,
      title: entryTitle(type, items),
      description: entryDescription(type, items),
      commits: items.map((item) => item.sha),
    }));
  });

  const range = options.fromDate
    ? ` from ${options.fromDate}${options.toDate ? ` to ${options.toDate}` : ""}`
    : "";

  return {
    title:
      options.existingVersion ||
      `${new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date())} Release`,
    version: options.existingVersion || null,
    summary:
      entries.length > 0
        ? `${repoName} received ${entries.length} notable update${entries.length === 1 ? "" : "s"}${range}. The release focuses on ${summaryFocus(entries.map((entry) => entry.type))}, with details grouped from ${relevantCommits.length} commit${relevantCommits.length === 1 ? "" : "s"}.`
        : `${repoName} has no user-facing changes in the selected range. The selected commits were mostly maintenance or merge activity.`,
    entries:
      entries.length > 0
        ? entries
        : [
            {
              type: "CHORE",
              title: "Keep project maintenance current",
              description:
                "The selected commits are mostly internal maintenance, dependency, or merge activity.",
              commits: commits.slice(0, 3).map((commit) => commit.sha),
            },
          ],
  };
}

function classifyCommit(message: string): EntryType {
  const normalized = message.toLowerCase();
  if (normalized.includes("breaking change") || normalized.startsWith("breaking")) return "BREAKING";
  if (normalized.startsWith("feat") || normalized.includes(" add ")) return "FEATURE";
  if (normalized.startsWith("fix") || normalized.includes("bug") || normalized.includes("resolve")) return "FIX";
  if (normalized.startsWith("perf") || normalized.includes("performance") || normalized.includes("speed")) return "PERFORMANCE";
  if (normalized.startsWith("docs") || normalized.includes("readme")) return "DOCS";
  if (normalized.includes("security") || normalized.includes("vulnerab") || normalized.includes("cve")) return "SECURITY";
  return "CHORE";
}

function entryTitle(type: EntryType, commits: CommitData[]) {
  if (commits.length === 1) return humanizeCommit(commits[0].message);

  const titles: Record<EntryType, string> = {
    FEATURE: "Add product improvements",
    FIX: "Fix reliability issues",
    BREAKING: "Introduce breaking changes",
    PERFORMANCE: "Improve runtime performance",
    DOCS: "Refresh documentation",
    CHORE: "Update project maintenance",
    SECURITY: "Strengthen security posture",
  };

  return titles[type];
}

function entryDescription(type: EntryType, commits: CommitData[]) {
  const examples = commits
    .slice(0, 2)
    .map((commit) => humanizeCommit(commit.message).replace(/\.$/, ""))
    .join("; ");

  const suffix = commits.length > 2 ? ` and ${commits.length - 2} more related change${commits.length - 2 === 1 ? "" : "s"}` : "";

  const context: Record<EntryType, string> = {
    FEATURE: "Users get new capabilities and workflow improvements.",
    FIX: "This release removes bugs and smooths out broken behavior.",
    BREAKING: "Review migration notes before upgrading because behavior may change.",
    PERFORMANCE: "The code path should feel faster or use fewer resources.",
    DOCS: "Project guidance and examples are clearer for implementers.",
    CHORE: "Internal maintenance keeps the project easier to evolve.",
    SECURITY: "Security-sensitive behavior was tightened.",
  };

  return `${context[type]} Related commits include ${examples}${suffix}.`;
}

function humanizeCommit(message: string) {
  const firstLine = message.split("\n")[0].trim();
  const withoutPrefix = firstLine
    .replace(/^(feat|fix|docs|chore|refactor|perf|test|build|ci|security)(\(.+\))?!?:\s*/i, "")
    .replace(/^[-*]\s*/, "");
  return `${withoutPrefix.charAt(0).toUpperCase()}${withoutPrefix.slice(1)}`;
}

function summaryFocus(types: EntryType[]) {
  const unique = Array.from(new Set(types));
  const labels: Record<EntryType, string> = {
    FEATURE: "new functionality",
    FIX: "bug fixes",
    BREAKING: "upgrade-sensitive changes",
    PERFORMANCE: "performance",
    DOCS: "documentation",
    CHORE: "maintenance",
    SECURITY: "security",
  };

  return unique.slice(0, 3).map((type) => labels[type]).join(", ");
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}
