"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

export function RepoImportForm() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("https://github.com/openai/openai-node");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoUrl }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Unable to import repository.");
      return;
    }

    router.push(`/repos/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2 text-neutral-950 dark:text-neutral-50">
        <GitFork className="h-5 w-5" aria-hidden />
        <h2 className="text-base font-semibold">Add GitHub repository</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="repoUrl">Repository URL</Label>
          <Input
            id="repoUrl"
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            placeholder="https://github.com/owner/repo"
            className="mt-2"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          Import
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
    </form>
  );
}
