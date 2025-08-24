import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const customerId = req.headers.get("x-stripe-customer-id");
    if (!customerId) {
      return NextResponse.json(
        { error: "Missing Stripe customer id" },
        { status: 400 }
      );
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/licenses`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
