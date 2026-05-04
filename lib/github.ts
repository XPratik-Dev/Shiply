import { Octokit } from "octokit";
import type { CommitData } from "@/types";

export interface ParsedRepo {
  owner: string;
  name: string;
}

export function parseGitHubRepo(input: string): ParsedRepo {
  const trimmed = input.trim().replace(/\.git$/, "");
  const match =
    trimmed.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)/i) ||
    trimmed.match(/^git@github\.com:([^/\s]+)\/([^/\s#?]+)$/i) ||
    trimmed.match(/^([^/\s]+)\/([^/\s#?]+)$/);

  if (!match) {
    throw new Error("Enter a GitHub URL like https://github.com/owner/repo.");
  }

  return {
    owner: match[1],
    name: match[2],
  };
}

function getOctokit(token?: string | null) {
  return new Octokit({
    auth: token || process.env.GITHUB_TOKEN || undefined,
  });
}

export async function getRepoMetadata(owner: string, repo: string, token?: string | null) {
  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    githubRepoId: String(data.id),
    owner: data.owner.login,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    isPrivate: data.private,
    defaultBranch: data.default_branch || "main",
    htmlUrl: data.html_url,
  };
}

export async function getCommits(
  owner: string,
  repo: string,
  options: {
    since?: string;
    until?: string;
    sha?: string;
    per_page?: number;
    token?: string | null;
  } = {},
): Promise<CommitData[]> {
  const octokit = getOctokit(options.token);
  const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
    owner,
    repo,
    per_page: options.per_page ?? 50,
    since: options.since || undefined,
    until: options.until || undefined,
    sha: options.sha || undefined,
  });

  return commits.map((commit) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author:
      commit.commit.author?.name ||
      commit.author?.login ||
      commit.commit.committer?.name ||
      "Unknown",
    date:
      commit.commit.author?.date ||
      commit.commit.committer?.date ||
      new Date().toISOString(),
    url: commit.html_url || `https://github.com/${owner}/${repo}/commit/${commit.sha}`,
  }));
}

export async function registerWebhook(
  owner: string,
  repo: string,
  appUrl: string,
  token?: string | null,
) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return null;

  const octokit = getOctokit(token);
  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: `${appUrl.replace(/\/$/, "")}/api/webhooks/github`,
      content_type: "json",
      secret,
    },
    events: ["push", "release"],
    active: true,
  });

  return String(data.id);
}
