import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLANS, getStripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const checkoutSchema = z.object({
  plan: z.enum(["PRO", "TEAM"]),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = checkoutSchema.parse(await req.json());
  const stripe = getStripe();
  const priceId = PLANS[plan].stripePriceId;

  if (!stripe || !priceId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan },
    });

    return NextResponse.json({
      mode: "demo",
      message: `${PLANS[plan].name} enabled in demo mode.`,
      url: "/settings/billing",
    });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: absoluteUrl("/dashboard?upgraded=true"),
    cancel_url: absoluteUrl("/settings/billing"),
    metadata: { userId: user.id, plan },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ mode: "stripe", url: checkoutSession.url });
}
