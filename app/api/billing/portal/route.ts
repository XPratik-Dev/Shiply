import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe || !user.stripeCustomerId) {
    return NextResponse.json({
      mode: "demo",
      url: "/settings/billing",
      message: "Stripe portal is available after Stripe keys are configured.",
    });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl("/settings/billing"),
  });

  return NextResponse.json({ mode: "stripe", url: portal.url });
}
