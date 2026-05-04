"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PLANS, planLimitLabel } from "@/lib/plans";
import type { Plan } from "@/types";

const paidPlans: Plan[] = ["PRO", "TEAM"];

export function PricingTable({ currentPlan }: { currentPlan: Plan }) {
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [message, setMessage] = useState("");

  async function checkout(plan: Plan) {
    setLoadingPlan(plan);
    setMessage("");
    const response = await fetch("/api/billing/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await response.json();
    setLoadingPlan(null);

    if (!response.ok) {
      setMessage(data.error || "Unable to open checkout.");
      return;
    }

    if (data.url?.startsWith("http")) {
      window.location.href = data.url;
      return;
    }

    setMessage(data.message || "Plan updated in demo mode.");
    window.location.reload();
  }

  return (
    <div>
      {message ? (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          {message}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(PLANS) as Plan[]).map((plan) => {
          const details = PLANS[plan];
          const current = currentPlan === plan;
          return (
            <article
              key={plan}
              className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">{details.name}</h3>
                {current ? <Badge tone="green">Current</Badge> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{details.description}</p>
              <p className="mt-5 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
                ${details.price}
                <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">/mo</span>
              </p>
              <ul className="mt-5 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                  {planLimitLabel(details.repos)} repositories
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                  {planLimitLabel(details.changelogs)} changelogs monthly
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                  Public hosted changelog pages
                </li>
              </ul>
              <div className="mt-6">
                {plan === "FREE" ? (
                  <Button type="button" variant="outline" disabled className="w-full">
                    Included
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    variant={plan === "TEAM" ? "primary" : "secondary"}
                    disabled={current || loadingPlan !== null}
                    onClick={() => checkout(plan)}
                  >
                    {loadingPlan === plan ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : null}
                    {current ? "Active" : paidPlans.includes(plan) ? "Upgrade" : "Choose"}
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
