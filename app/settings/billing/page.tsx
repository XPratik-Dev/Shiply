import { Navbar } from "@/components/shared/Navbar";
import { PricingTable } from "@/components/shared/PricingTable";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { normalizePlan } from "@/lib/plans";

export default async function BillingPage() {
  const user = await requireUser();
  const plan = normalizePlan(user.plan);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar user={{ name: user.name, plan }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Badge tone="green">Billing</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-neutral-950 dark:text-neutral-50">Plans</h1>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-neutral-300">
          Stripe checkout is used when keys and price IDs are configured. Without
          credentials, upgrades apply in demo mode so the workflow remains testable.
        </p>
        <div className="mt-6">
          <PricingTable currentPlan={plan} />
        </div>
      </main>
    </div>
  );
}
