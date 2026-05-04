import { promises as fs } from "fs";
import path from "path";

const ROOT = process.cwd();
const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  ".vscode",
  "dist",
  "build",
  "out",
  ".turbo",
  ".cache",
  "coverage",
]);
const ALLOWED_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".env",
  ".txt",
  ".md",
]);
const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const patterns = [
  { name: "Private key block", regex: /BEGIN (RSA |OPENSSH )?PRIVATE KEY/i },
  { name: "AWS access key", regex: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: "GitHub token", regex: /\b(ghp_[0-9A-Za-z]{36}|github_pat_[0-9A-Za-z_]{20,})\b/ },
  { name: "Google API key", regex: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: "OpenAI/secret key", regex: /\bsk-[0-9A-Za-z]{20,}\b/ },
  { name: "Stripe live key", regex: /\bsk_live_[0-9a-zA-Z]{20,}\b/ },
  { name: "Slack token", regex: /\bxox[baprs]-[0-9A-Za-z-]+\b/ },
  {
    name: "Generic secret assignment",
    regex:
      /\b(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|CLIENT_SECRET)\b\s*[:=]\s*["'`][^"'`]{8,}["'`]/i,
  },
];

function shouldScanFile(filePath) {
  const base = path.basename(filePath);
  if (base.startsWith(".env")) return true;
  return ALLOWED_EXT.has(path.extname(base));
}

function isExcludedDir(dirName) {
  return IGNORED_DIRS.has(dirName);
}

async function isProbablyText(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    if (buffer.includes(0)) return false;
    return true;
  } catch {
    return false;
  }
}

function lineHasRuntimeEnvAccess(line) {
  return (
    line.includes("process.env") ||
    line.includes("import.meta.env") ||
    line.includes("Deno.env")
  );
}

async function scanFile(filePath, matches) {
  const stat = await fs.stat(filePath);
  if (stat.size > MAX_FILE_SIZE) return;
  if (!(await isProbablyText(filePath))) return;

  const content = await fs.readFile(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line || lineHasRuntimeEnvAccess(line)) continue;

    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        matches.push({
          file: path.relative(ROOT, filePath),
          line: i + 1,
          reason: pattern.name,
        });
        break;
      }
    }
  }
}

async function walk(dir, matches) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (isExcludedDir(entry.name)) continue;
      await walk(path.join(dir, entry.name), matches);
      continue;
    }

    const filePath = path.join(dir, entry.name);
    if (shouldScanFile(filePath)) {
      await scanFile(filePath, matches);
    }
  }
}

async function main() {
  const matches = [];
  await walk(ROOT, matches);

  if (matches.length === 0) {
    console.log("No potential secrets found.");
    return;
  }

  console.log("Potential secrets found:");
  for (const match of matches) {
    console.log(`- ${match.file}:${match.line} (${match.reason})`);
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Secret scan failed:", error.message || error);
  process.exitCode = 1;
});
