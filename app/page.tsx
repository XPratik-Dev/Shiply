import Link from "next/link";
import { ArrowRight, GitBranch, GitFork, Sparkles, WandSparkles } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";

export default async function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main>
        <section className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:px-8">
            <div className="flex flex-col justify-center">
              <Badge tone="green">Full-stack demo included</Badge>
              <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-normal text-neutral-950 dark:text-neutral-50 sm:text-6xl">
                AI changelogs from real GitHub commits.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                Import a repository, fetch commits, generate release notes, edit the result,
                publish a shareable page, and manage billing from one Next.js app.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/api/auth/demo"
                  className={buttonClasses({ variant: "primary", size: "lg" })}
                >
                  <Sparkles className="h-5 w-5" aria-hidden />
                  Start demo workspace
                </Link>
                <Link
                  href="/changelog/openai-node-demo-release"
                  className={buttonClasses({ variant: "outline", size: "lg" })}
                >
                  View public page
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </Link>
              </div>
              <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                {[
                  ["GitHub", "Repo import and commit fetch"],
                  ["Claude", "AI generation with local fallback"],
                  ["Stripe", "Billing routes and demo upgrades"],
                ].map(([label, text]) => (
                  <div key={label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="font-semibold text-neutral-950 dark:text-neutral-50">{label}</p>
                    <p className="mt-1 text-sm leading-5 text-neutral-500 dark:text-neutral-400">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full rounded-lg border border-neutral-200 bg-neutral-950 p-3 shadow-2xl shadow-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none">
                <div className="rounded-md bg-white p-4 dark:bg-neutral-950">
                  <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
                    <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Repository</p>
                      <p className="mt-1 font-semibold text-neutral-950 dark:text-neutral-50">openai/openai-node</p>
                    </div>
                    <Badge tone="cyan">Generating</Badge>
                  </div>
                  <div className="mt-4 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <WandSparkles className="h-5 w-5 text-emerald-600" aria-hidden />
                      <h2 className="font-semibold text-neutral-950 dark:text-neutral-50">SDK Quality Release</h2>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                      This release improves developer ergonomics around streaming,
                      error reporting, and generated type coverage.
                    </p>
                    <div className="mt-4 space-y-3">
                      {[
                        ["FEATURE", "Add streamed response helpers"],
                        ["FIX", "Improve error messages for failed requests"],
                        ["DOCS", "Refresh usage examples"],
                      ].map(([type, title]) => (
                        <div
                          key={title}
                          className="flex items-start gap-3 rounded-md bg-neutral-50 p-3 dark:bg-neutral-900"
                        >
                          <GitBranch className="mt-0.5 h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden />
                          <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{type}</p>
                            <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    <span className="inline-flex items-center gap-2">
                      <GitFork className="h-4 w-4" aria-hidden />
                      30 commits analyzed
                    </span>
                    <span>Public URL ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Import", "Paste a GitHub repo URL and store it with plan-aware limits."],
              ["Generate", "Fetch commits and use Claude when configured, or local rules in demo mode."],
              ["Publish", "Edit entries, publish SEO-friendly changelog pages, and notify by email."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{title}</h2>
                <p className="mt-2 leading-7 text-neutral-600 dark:text-neutral-300">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
