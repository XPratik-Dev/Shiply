import Link from "next/link";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { normalizePlan } from "@/lib/plans";

const checks = [
  ["GitHub token", "GITHUB_TOKEN"],
  ["Anthropic", "ANTHROPIC_API_KEY"],
  ["Stripe", "STRIPE_SECRET_KEY"],
  ["Resend", "RESEND_API_KEY"],
  ["Upstash Redis", "UPSTASH_REDIS_REST_URL"],
];

export default async function SettingsPage() {
  const user = await requireUser();
  const plan = normalizePlan(user.plan);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan }} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Badge tone="green">{plan}</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">Settings</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Demo auth is active. Add service keys in `.env.local` to switch individual
          features from fallback mode to live integrations.
        </p>

        <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Workspace</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Name</dt>
              <dd className="mt-1 font-medium text-neutral-950 dark:text-neutral-50">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-neutral-500 dark:text-neutral-400">Email</dt>
              <dd className="mt-1 font-medium text-neutral-950 dark:text-neutral-50">{user.email}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <Link href="/settings/billing" className={buttonClasses({ variant: "outline" })}>
              Manage billing
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">Integration status</h2>
          <div className="mt-4 grid gap-3">
            {checks.map(([label, env]) => {
              const configured = Boolean(process.env[env]);
              return (
                <div
                  key={env}
                  className="flex items-center justify-between gap-4 rounded-md border border-neutral-200 px-4 py-3 dark:border-neutral-800"
                >
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">{label}</span>
                  <span className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                    {configured ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                    ) : (
                      <CircleDashed className="h-4 w-4 text-amber-600" aria-hidden />
                    )}
                    {configured ? "Configured" : "Demo fallback"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
