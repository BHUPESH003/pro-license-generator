import "dotenv/config";
import stripe from "@/lib/stripe";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BillingSubscription from "@/models/BillingSubscription";
import BillingInvoice from "@/models/BillingInvoice";

async function backfill() {
  await dbConnect();
  const users = await User.find({ stripeCustomerId: { $exists: true, $ne: null } }).lean();
  for (const user of users) {
    const customerId = user.stripeCustomerId as string;
    // Subscriptions
    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", expand: ["data.items.data.price", "data.latest_invoice"], limit: 100 });
    for (const s of subs.data as Stripe.Subscription[]) {
      const sp = s as unknown as { current_period_start?: number; current_period_end?: number };
      await BillingSubscription.findOneAndUpdate(
        { stripeSubscriptionId: s.id },
        {
          userId: user._id,
          status: s.status,
          cancel_at_period_end: s.cancel_at_period_end,
          current_period_start: sp.current_period_start ? new Date(sp.current_period_start * 1000) : null,
          current_period_end: sp.current_period_end ? new Date(sp.current_period_end * 1000) : null,
          created: s.created ? new Date(s.created * 1000) : null,
          items: s.items.data.map((it: Stripe.SubscriptionItem) => ({
            priceId: it.price?.id,
            product: (it.price as Stripe.Price | undefined)?.product as string | undefined,
            unit_amount: (it.price as Stripe.Price | undefined)?.unit_amount as number | undefined,
            currency: (it.price as Stripe.Price | undefined)?.currency,
            interval: (it.price as Stripe.Price | undefined)?.recurring?.interval,
          })),
          latest_invoice_url:
            typeof s.latest_invoice === "string"
              ? null
              : (s.latest_invoice as Stripe.Invoice | null)?.hosted_invoice_url || null,
        },
        { upsert: true }
      );
    }

    // Invoices
    const invoices = await stripe.invoices.list({ customer: customerId, limit: 100, expand: ["data.charge"] });
    for (const inv of invoices.data as Stripe.Invoice[]) {
      await BillingInvoice.findOneAndUpdate(
        { stripeInvoiceId: inv.id },
        {
          userId: user._id,
          status: inv.status || undefined,
          amount_due: inv.amount_due || 0,
          amount_paid: inv.amount_paid || 0,
          amount_remaining: inv.amount_remaining || 0,
          currency: inv.currency || undefined,
          number: inv.number || undefined,
          hosted_invoice_url: inv.hosted_invoice_url || null,
          invoice_pdf: inv.invoice_pdf || null,
          receipt_url: ((inv as any).charge as any)?.receipt_url || null,
          created: inv.created ? new Date(inv.created * 1000) : null,
          period_start: inv.period_start ? new Date(inv.period_start * 1000) : null,
          period_end: inv.period_end ? new Date(inv.period_end * 1000) : null,
          subscription: (inv as any).subscription || null,
        },
        { upsert: true }
      );
    }
  }
  console.log("Backfill complete");
}

backfill().catch((e) => {
  console.error(e);
  process.exit(1);
});


