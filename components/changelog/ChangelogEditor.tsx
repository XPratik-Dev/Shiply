"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Plus, Save, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import type { EntryType, PublicChangelogData, PublicEntry } from "@/types";

const entryTypes: EntryType[] = [
  "FEATURE",
  "FIX",
  "BREAKING",
  "PERFORMANCE",
  "DOCS",
  "CHORE",
  "SECURITY",
];

export function ChangelogEditor({
  changelog,
  publicBaseUrl,
}: {
  changelog: PublicChangelogData;
  publicBaseUrl: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(changelog.title);
  const [version, setVersion] = useState(changelog.version || "");
  const [summary, setSummary] = useState(changelog.aiSummary);
  const [isPublic, setIsPublic] = useState(changelog.isPublic);
  const [entries, setEntries] = useState<PublicEntry[]>(changelog.entries);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const publicUrl = useMemo(
    () => `${publicBaseUrl.replace(/\/$/, "")}/changelog/${changelog.slug}`,
    [publicBaseUrl, changelog.slug],
  );

  function updateEntry(index: number, patch: Partial<PublicEntry>) {
    setEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
  }

  function addEntry() {
    setEntries((current) => [
      ...current,
      {
        id: `new-${Date.now()}`,
        type: "FEATURE",
        title: "New changelog entry",
        description: "",
        commits: [],
        orderIndex: current.length,
      },
    ]);
  }

  function removeEntry(index: number) {
    setEntries((current) => current.filter((_, entryIndex) => entryIndex !== index));
  }

  async function save(published?: boolean) {
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/changelogs/${changelog.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        version: version || null,
        aiSummary: summary,
        isPublic,
        entries: entries.map((entry) => ({
          type: entry.type,
          title: entry.title,
          description: entry.description,
          commits: entry.commits,
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setLoading(false);
      setMessage(data.error || "Unable to save changelog.");
      return null;
    }

    if (published !== undefined) {
      const publishResponse = await fetch(`/api/changelogs/${changelog.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: published }),
      });
      const publishData = await publishResponse.json();
      setMessage(
        publishResponse.ok
          ? published
            ? "Published and ready to share."
            : "Changelog moved back to draft."
          : publishData.error || "Unable to update publish state.",
      );
    } else {
      setMessage("Saved.");
    }

    setLoading(false);
    router.refresh();
    return true;
  }

  async function copyPublicUrl() {
    await navigator.clipboard.writeText(publicUrl);
    setMessage("Public URL copied.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-5">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge tone={changelog.isPublished ? "green" : "amber"}>
                {changelog.isPublished ? "Published" : "Draft"}
              </Badge>
              <h1 className="mt-3 text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
                Edit changelog
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => save()} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Save className="h-4 w-4" aria-hidden />
                )}
                Save
              </Button>
              <Button type="button" onClick={() => save(true)} disabled={loading}>
                <Send className="h-4 w-4" aria-hidden />
                Publish
              </Button>
            </div>
          </div>

          {message ? <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">{message}</p> : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px]">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                placeholder="v1.2.0"
                className="mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Entries</h2>
            <Button type="button" variant="outline" onClick={addEntry}>
              <Plus className="h-4 w-4" aria-hidden />
              Add entry
            </Button>
          </div>

          {entries.map((entry, index) => (
            <article key={entry.id} className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
              <div className="grid gap-4 sm:grid-cols-[160px_1fr_auto] sm:items-end">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={entry.type}
                    onChange={(event) =>
                      updateEntry(index, { type: event.target.value as EntryType })
                    }
                    className="mt-2"
                  >
                    {entryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={entry.title}
                    onChange={(event) => updateEntry(index, { title: event.target.value })}
                    className="mt-2"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(index)}
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <div className="mt-4">
                <Label>Description</Label>
                <Textarea
                  value={entry.description || ""}
                  onChange={(event) =>
                    updateEntry(index, { description: event.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div className="mt-4">
                <Label>Commit SHAs</Label>
                <Input
                  value={entry.commits.join(", ")}
                  onChange={(event) =>
                    updateEntry(index, {
                      commits: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                  className="mt-2"
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">Publishing</h2>
          <label className="mt-4 flex items-center justify-between gap-3 text-sm text-neutral-700 dark:text-neutral-300">
            Public page
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          <div className="mt-4 rounded-md bg-neutral-100 p-3 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {publicUrl}
          </div>
          <div className="mt-4 grid gap-2">
            <Button type="button" variant="outline" onClick={copyPublicUrl}>
              <Copy className="h-4 w-4" aria-hidden />
              Copy URL
            </Button>
            <Link
              href={`/changelog/${changelog.slug}`}
              className="text-center text-sm font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-neutral-50"
            >
              Open public page
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
