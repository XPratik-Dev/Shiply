"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

export function GenerateForm({
  repoId,
  defaultBranch,
}: {
  repoId: string;
  defaultBranch: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branch, setBranch] = useState(defaultBranch);
  const [limit, setLimit] = useState(30);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [customInstructions, setCustomInstructions] = useState(
    "Write for product users. Keep internal chores concise.",
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/repos/${repoId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch,
        limit,
        since: since || undefined,
        until: until || undefined,
        customInstructions,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Unable to generate changelog.");
      return;
    }

    router.push(`/changelogs/${data.id}/edit`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-600" aria-hidden />
        <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">Generate changelog</h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="branch">Branch or tag</Label>
          <Input
            id="branch"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="limit">Commit limit</Label>
          <Input
            id="limit"
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="since" className="inline-flex items-center gap-1">
            <CalendarDays className="h-4 w-4" aria-hidden />
            Since
          </Label>
          <Input
            id="since"
            type="date"
            value={since}
            onChange={(event) => setSince(event.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="until">Until</Label>
          <Input
            id="until"
            type="date"
            value={until}
            onChange={(event) => setUntil(event.target.value)}
            className="mt-2"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="instructions">AI instructions</Label>
          <Textarea
            id="instructions"
            value={customInstructions}
            onChange={(event) => setCustomInstructions(event.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          Generate
        </Button>
      </div>
    </form>
  );
}
