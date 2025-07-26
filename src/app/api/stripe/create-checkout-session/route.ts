import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { plan, quantity } = await req.json();
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Select priceId based on plan
    let priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
    if (plan === "quarterly") priceId = process.env.STRIPE_QUARTERLY_PRICE_ID;
    else if (plan === "yearly") priceId = process.env.STRIPE_YEARLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: quantity || 1,
        },
      ],
      customer_email: userEmail,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/licenses?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/licenses?canceled=1`,
      metadata: {
        plan: plan || "monthly",
        quantity: String(quantity || 1),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
