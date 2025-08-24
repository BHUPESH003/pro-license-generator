import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const {
      plan,
      quantity,
      mode = "subscription",
      items,
      licenseId,
    } = await req.json();
    const userEmail = req.headers.get("x-user-email");
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build line items to support multiple plans or custom combos
    const lineItems: any[] = [];
    const addItem = (p: string, q: number) => {
      let priceId: string | undefined;
      if (mode === "payment") {
        // One-time price IDs
        priceId = process.env.STRIPE_MONTHLY_ONETIME_PRICE_ID;
        if (p === "quarterly")
          priceId = process.env.STRIPE_QUARTERLY_ONETIME_PRICE_ID;
        else if (p === "yearly")
          priceId = process.env.STRIPE_YEARLY_ONETIME_PRICE_ID;
      } else {
        // Subscription price IDs
        priceId = process.env.STRIPE_MONTHLY_PRICE_ID;
        if (p === "quarterly") priceId = process.env.STRIPE_QUARTERLY_PRICE_ID;
        else if (p === "yearly") priceId = process.env.STRIPE_YEARLY_PRICE_ID;
      }

      if (!priceId) {
        throw new Error(
          `Missing Stripe ${mode === "payment" ? "one-time" : "recurring"} price ID for plan: ${p}`
        );
      }
      const qty = Math.max(1, Number(q || 1));
      lineItems.push({ price: priceId, quantity: qty });
    };

    if (Array.isArray(items) && items.length > 0) {
      // Validate: all items must share the same billing interval for subscriptions
      if (mode === "subscription") {
        const plansSet = new Set(
          (items || []).map((it: any) => it?.plan || "monthly")
        );
        if (plansSet.size > 1) {
          return NextResponse.json(
            {
              error:
                "Checkout does not support multiple prices with different billing intervals. Group items by the same plan and checkout separately.",
            },
            { status: 400 }
          );
        }
      }
      for (const it of items) addItem(it.plan, it.quantity || 1);
    } else {
      addItem(plan || "monthly", quantity || 1);
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "No line items provided" },
        { status: 400 }
      );
    }

    // Validate price types match mode to avoid Stripe errors
    try {
      const uniquePriceIds = Array.from(
        new Set(lineItems.map((li: any) => li.price))
      );
      const prices = await Promise.all(
        uniquePriceIds.map((pid) => stripe.prices.retrieve(pid))
      );
      const anyRecurring = prices.some((p) => !!p.recurring);
      const anyOneTime = prices.some((p) => !p.recurring);
      if (mode === "payment" && anyRecurring) {
        return NextResponse.json(
          {
            error:
              "One-time payment requires one-time prices. Check STRIPE_*_ONETIME_PRICE_ID envs.",
            priceInfo: prices.map((p) => ({
              id: p.id,
              recurring: p.recurring || null,
            })),
            mode,
            plans:
              Array.isArray(items) && items.length > 0
                ? items.map((i: any) => i.plan)
                : [plan],
          },
          { status: 400 }
        );
      }
      if (mode === "subscription" && anyOneTime) {
        return NextResponse.json(
          {
            error:
              "Subscription requires recurring prices. Check STRIPE_*_PRICE_ID envs.",
            priceInfo: prices.map((p) => ({
              id: p.id,
              recurring: p.recurring || null,
            })),
            mode,
            plans:
              Array.isArray(items) && items.length > 0
                ? items.map((i: any) => i.plan)
                : [plan],
          },
          { status: 400 }
        );
      }
    } catch (e) {
      console.error("Price validation failed:", (e as any)?.message || e);
      return NextResponse.json(
        { error: "Price validation failed." },
        { status: 400 }
      );
    }

    // Prefill if we have user details
    let customer: string | undefined = undefined;
    try {
      // If you persist stripeCustomerId on user, you can fetch by email instead.
      // For now, rely on Checkout to create one via customer_creation.
    } catch {}

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      line_items: lineItems,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer_creation: "always",
      phone_number_collection: { enabled: true },
      customer_email: userEmail,
      // customer, // pass when available
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/licenses?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/licenses?canceled=1`,
      metadata: {
        mode,
        plan:
          Array.isArray(items) && items.length > 0
            ? items[0]?.plan || plan || "monthly"
            : plan,
        licenseId: licenseId || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(
      "Create checkout session error:",
      (error as any)?.message || error
    );
    const message =
      (error as any)?.message || "Failed to create checkout session.";
    const status = message.includes("Missing Stripe price ID") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
