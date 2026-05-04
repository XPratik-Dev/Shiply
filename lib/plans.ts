import type { Plan } from "@/types";

export const PLANS: Record<
  Plan,
  {
    name: string;
    price: number;
    repos: number;
    changelogs: number;
    description: string;
    stripePriceId?: string;
  }
> = {
  FREE: {
    name: "Free",
    price: 0,
    repos: 3,
    changelogs: 10,
    description: "Best for trying the generator on personal projects.",
  },
  PRO: {
    name: "Pro",
    price: 19,
    repos: 20,
    changelogs: 100,
    description: "For product teams that publish regular release notes.",
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  TEAM: {
    name: "Team",
    price: 49,
    repos: -1,
    changelogs: -1,
    description: "Unlimited repos, higher limits, and team-ready publishing.",
    stripePriceId: process.env.STRIPE_TEAM_PRICE_ID,
  },
};

export function normalizePlan(plan: string | null | undefined): Plan {
  return plan === "PRO" || plan === "TEAM" || plan === "FREE" ? plan : "FREE";
}

export function canAddRepo(plan: Plan | string, currentRepoCount: number) {
  const limit = PLANS[normalizePlan(plan)].repos;
  return limit === -1 || currentRepoCount < limit;
}

export function canGenerateChangelog(plan: Plan | string, generatedThisMonth: number) {
  const limit = PLANS[normalizePlan(plan)].changelogs;
  return limit === -1 || generatedThisMonth < limit;
}

export function planLimitLabel(value: number) {
  return value === -1 ? "Unlimited" : String(value);
}
