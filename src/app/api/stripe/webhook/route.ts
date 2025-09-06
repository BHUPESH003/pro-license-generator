import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import BillingSubscription, {
  IBillingSubscription,
} from "@/models/BillingSubscription";
import BillingInvoice, { IBillingInvoice } from "@/models/BillingInvoice";
import License, { ILicense } from "@/models/License";
import { sendEmailToSQS } from "@/lib/sqsService";
import { buildLicenseEmail } from "@/lib/licenseEmailService";
import Stripe from "stripe";
import ProcessedWebhookEvent from "@/models/ProcessedWebhookEvent";
import mongoose from "mongoose";

// 🆕 Import the canonical license service functions
import {
  createLicenses,
  updateLicensesExpiry,
  deactivateLicenses,
} from "@/lib/licenseService";
import { addMonths as addMonthsEOM, addQuarters as addQuartersEOM, addYears as addYearsEOM } from "@/lib/dateUtils";

export const config = {
  api: { bodyParser: false },
};

interface WebhookEventData {
  eventId: string;
  eventType: string;
  userId?: string;
  email?: string;
  subscriptionId?: string;
  customerId?: string;
  invoiceId?: string;
}

interface EmailPayload {
  email: string;
  data: ReturnType<typeof buildLicenseEmail>;
}

interface PaymentFailureEmailPayload {
  email: string;
  data: {
    user: IUser;
    action: string;
    invoice: {
      id: string;
      amount: number;
      currency: string;
      hosted_invoice_url?: string;
    };
  };
}

// Helper to add time intervals when we must approximate a period end
function addInterval(
  start: Date,
  interval: "day" | "week" | "month" | "year",
  count: number
): Date {
  const end = new Date(start.getTime());
  switch (interval) {
    case "day":
      end.setDate(end.getDate() + count);
      return end;
    case "week":
      end.setDate(end.getDate() + count * 7);
      return end;
    case "month":
      return addMonthsEOM(start, count);
    case "year":
      return addYearsEOM(start, count);
  }
  return end;
}

// Helper to safely get metadata keys
function safeMetadata(
  metadata: Stripe.Metadata | null | undefined,
  key: string,
  defaultValue: string | null = null
): string | null {
  if (!metadata || typeof metadata !== "object") return defaultValue;
  return metadata[key] ?? defaultValue;
}

// Get raw body for webhook signature verification (Node.js runtime)
async function getRawBody(req: NextRequest): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Enrich user profile with Stripe customer data
async function enrichUserProfile(
  user: IUser,
  customerId: string
): Promise<void> {
  try {
    const customer = (await stripe.customers.retrieve(customerId)) as
      | Stripe.Customer
      | Stripe.DeletedCustomer;
    if ("deleted" in customer && customer.deleted) return;

    const updateFields: Partial<IUser> = {};

    if ("phone" in customer && customer.phone && !user.phone) {
      updateFields.phone = customer.phone;
    }
    if (
      "address" in customer &&
      customer.address &&
      (!user.address || !user.address.line1)
    ) {
      const addr = customer.address;
      updateFields.address = {
        line1: addr?.line1 || undefined,
        line2: addr?.line2 || undefined,
        city: addr?.city || undefined,
        state: addr?.state || undefined,
        postal_code: addr?.postal_code || undefined,
        country: addr?.country || undefined,
      };
    }
    if ("name" in customer && customer.name && !user.name) {
      updateFields.name = customer.name;
    }
    if (Object.keys(updateFields).length > 0) {
      await User.updateOne({ _id: user._id }, { $set: updateFields });
      Object.assign(user, updateFields);
    }
  } catch (error) {
    console.error("Error enriching user profile:", error);
  }
}

async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: mongoose.Types.ObjectId
): Promise<void> {
  try {
    // Prefer Subscription current_period_*; fallback to expanded latest_invoice and invoice lines
    let cps = (subscription as any).current_period_start as number | undefined;
    let cpe = (subscription as any).current_period_end as number | undefined;

    let periodStart: Date | null = cps ? new Date(cps * 1000) : null;
    let periodEnd: Date | null = cpe ? new Date(cpe * 1000) : null;

    // Try latest_invoice from already-expanded object
    if ((!periodStart || !periodEnd) && subscription.latest_invoice && typeof subscription.latest_invoice !== "string") {
      const inv = subscription.latest_invoice as Stripe.Invoice;
      if (!periodStart && (inv as any).period_start) periodStart = new Date((inv as any).period_start * 1000);
      if (!periodEnd && (inv as any).period_end) periodEnd = new Date((inv as any).period_end * 1000);
      if ((!periodStart || !periodEnd) && inv.lines?.data?.length) {
        const first = inv.lines.data[0];
        if (!periodStart && (first as any).period?.start) periodStart = new Date((first as any).period.start * 1000);
        if (!periodEnd && (first as any).period?.end) periodEnd = new Date((first as any).period.end * 1000);
      }
    }

    // As a fallback, fetch an expanded subscription with latest_invoice and lines
    if (!periodStart || !periodEnd) {
      try {
        const expanded = await stripe.subscriptions.retrieve(subscription.id, {
          expand: ["items.data.price", "latest_invoice", "latest_invoice.lines.data"],
        });
        cps = (expanded as any).current_period_start as number | undefined;
        cpe = (expanded as any).current_period_end as number | undefined;
        if (!periodStart && cps) periodStart = new Date(cps * 1000);
        if (!periodEnd && cpe) periodEnd = new Date(cpe * 1000);
        const inv = expanded.latest_invoice && typeof expanded.latest_invoice !== "string" ? (expanded.latest_invoice as Stripe.Invoice) : null;
        if (inv) {
          if (!periodStart && (inv as any).period_start) periodStart = new Date((inv as any).period_start * 1000);
          if (!periodEnd && (inv as any).period_end) periodEnd = new Date((inv as any).period_end * 1000);
          if ((!periodStart || !periodEnd) && inv.lines?.data?.length) {
            const first = inv.lines.data[0];
            if (!periodStart && (first as any).period?.start) periodStart = new Date((first as any).period.start * 1000);
            if (!periodEnd && (first as any).period?.end) periodEnd = new Date((first as any).period.end * 1000);
          }
        }
        // Update reference to subscription so downstream fields (items) are consistent
        subscription = expanded as any;
      } catch {}
    }

    // Last resort: approximate using price interval if we have a start
    if (periodStart && !periodEnd) {
      const firstItem = subscription.items?.data?.[0];
      const recurring = (firstItem?.price as Stripe.Price)?.recurring;
      if (recurring?.interval) {
        periodEnd = addInterval(periodStart, recurring.interval as any, recurring.interval_count || 1);
      }
    }

    // If periodEnd is same as periodStart (observed for subscription_create invoices), compute using price interval
    if (periodStart && periodEnd && periodEnd.getTime() === periodStart.getTime()) {
      const firstItem = subscription.items?.data?.[0];
      const recurring = (firstItem?.price as Stripe.Price)?.recurring;
      if (recurring?.interval) {
        periodEnd = addInterval(periodStart, recurring.interval as any, recurring.interval_count || 1);
      }
    }

    const latestInvoiceUrl =
      subscription.latest_invoice && typeof subscription.latest_invoice !== "string"
        ? (subscription.latest_invoice as Stripe.Invoice).hosted_invoice_url || null
        : null;

    const subscriptionData: Partial<IBillingSubscription> = {
      userId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      created: subscription.created
        ? new Date(subscription.created * 1000)
        : null,
      items: subscription.items.data.map((item: Stripe.SubscriptionItem) => ({
        priceId: item.price?.id,
        product: (item.price as Stripe.Price)?.product as string,
        unit_amount: (item.price as Stripe.Price)?.unit_amount || undefined,
        currency: (item.price as Stripe.Price)?.currency,
        interval: (item.price as Stripe.Price)?.recurring?.interval,
        interval_count: (item.price as Stripe.Price)?.recurring?.interval_count,
        quantity: item.quantity,
      })),
      latest_invoice_url: latestInvoiceUrl,
    };

    await BillingSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      subscriptionData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error upserting subscription:", error);
    throw error;
  }
}

async function upsertInvoice(
  invoice: Stripe.Invoice,
  userId: mongoose.Types.ObjectId
): Promise<void> {
  try {
    // Ensure we have period start/end; derive from lines or fetch expanded invoice if missing
    let periodStart: Date | null = (invoice as any).period_start
      ? new Date((invoice as any).period_start * 1000)
      : null;
    let periodEnd: Date | null = (invoice as any).period_end
      ? new Date((invoice as any).period_end * 1000)
      : null;

    if ((!periodStart || !periodEnd) && (invoice as any).lines?.data?.length) {
      const first = (invoice as any).lines.data[0];
      if (!periodStart && first?.period?.start) periodStart = new Date(first.period.start * 1000);
      if (!periodEnd && first?.period?.end) periodEnd = new Date(first.period.end * 1000);
    }

    if (!periodStart || !periodEnd) {
      try {
        const expanded = await stripe.invoices.retrieve((invoice as any).id as string, {
          expand: ["lines.data", "subscription"],
        });
        if (!periodStart && (expanded as any).period_start)
          periodStart = new Date((expanded as any).period_start * 1000);
        if (!periodEnd && (expanded as any).period_end)
          periodEnd = new Date((expanded as any).period_end * 1000);
        if ((!periodStart || !periodEnd) && (expanded as any).lines?.data?.length) {
          const first = (expanded as any).lines.data[0];
          if (!periodStart && first?.period?.start) periodStart = new Date(first.period.start * 1000);
          if (!periodEnd && first?.period?.end) periodEnd = new Date(first.period.end * 1000);
        }

        // If still missing, try deriving from subscription current period
        if ((!periodStart || !periodEnd) && (expanded as any).subscription) {
          const subId = typeof (expanded as any).subscription === "string" ? (expanded as any).subscription : (expanded as any).subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId as string);
          const cps = (sub as any).current_period_start as number | undefined;
          const cpe = (sub as any).current_period_end as number | undefined;
          if (!periodStart && cps) periodStart = new Date(cps * 1000);
          if (!periodEnd && cpe) periodEnd = new Date(cpe * 1000);
        }

        // Update invoice reference for downstream fields
        invoice = expanded as any;
      } catch {}
    }

    // For initial subscription_create invoices where period bounds equal the created time, derive from subscription
    if (invoice.billing_reason === "subscription_create" && periodStart && periodEnd && periodEnd.getTime() === periodStart.getTime()) {
      try {
        const subId = (invoice as any).subscription as string | undefined;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId, { expand: ["items.data.price"] });
          const cps = (sub as any).current_period_start as number | undefined;
          const cpe = (sub as any).current_period_end as number | undefined;
          if (cps) periodStart = new Date(cps * 1000);
          if (cpe) periodEnd = new Date(cpe * 1000);
          // If still equal, compute via price interval
          if (periodStart && periodEnd && periodEnd.getTime() === periodStart.getTime()) {
            const firstItem = sub.items?.data?.[0];
            const recurring = (firstItem?.price as Stripe.Price | undefined)?.recurring;
            if (recurring?.interval) {
              periodEnd = addInterval(periodStart, recurring.interval as any, recurring.interval_count || 1);
            }
          }
        }
      } catch {}
    }

    // Stripe.Invoice does not have charge by default, so use optional chaining
    const charge = (invoice as any).charge as Stripe.Charge | undefined;
    const invoiceData: Partial<IBillingInvoice> = {
      userId,
      stripeInvoiceId: invoice.id,
      status: invoice?.status || undefined,
      amount_due: invoice.amount_due,
      amount_paid: invoice.amount_paid,
      amount_remaining: invoice.amount_remaining,
      currency: invoice.currency,
      number: invoice?.number || undefined,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      receipt_url: charge?.receipt_url,
      created: invoice.created ? new Date(invoice.created * 1000) : null,
      period_start: periodStart,
      period_end: periodEnd,
      subscription: (invoice as any).subscription as string,
    };

    await BillingInvoice.findOneAndUpdate(
      { stripeInvoiceId: invoice.id },
      invoiceData,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error upserting invoice:", error);
    throw error;
  }
}

// --- WEBHOOK HANDLERS ---

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<WebhookEventData> {
  const email = session.customer_details?.email || "";
  const subscriptionId = session.subscription as string | null;
  const customerId = session.customer as string;
  const mode =
    safeMetadata(session.metadata, "mode", session.mode) || "subscription";
  const plan = safeMetadata(session.metadata, "plan", "monthly")!;
  const licenseId = safeMetadata(session.metadata, "licenseId", null);
  let quantity = 1;
  if (mode === "subscription" && subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price", "latest_invoice"],
    });
    quantity = subscription.items.data[0]?.quantity || 1;
    // ...rest of your subscription logic...
  } else if (mode === "payment") {
    // Fetch line items for the session to get quantity
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    quantity = lineItems.data[0]?.quantity || 1;
    // ...rest of your payment logic...
  }
  const invoice = session.invoice as Stripe.Invoice | null;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      stripeCustomerId: customerId,
      name: session.customer_details?.name || undefined,
    });
  } else if (!user.stripeCustomerId && customerId) {
    user.stripeCustomerId = customerId;
    await user.save();
  }

  await enrichUserProfile(user, customerId);

  let licenseKeys: string[] = [];
  let expiryDate: Date = new Date();
  let action: "created" | "renewed" | "updated" = "created";
  let emailPayload: EmailPayload | null = null;

  if (mode === "subscription" && subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price", "latest_invoice"],
    });

    await upsertSubscription(subscription as Stripe.Subscription, user._id);

    // 🆕 Use canonical createLicenses
    const result = await createLicenses(
      user._id,
      subscriptionId,
      customerId,
      plan,
      quantity
    );
    licenseKeys = result.licenseKeys;
    expiryDate = result.expiryDate;

    emailPayload = {
      email,
      data: buildLicenseEmail({
        user,
        licenseKeys,
        status: "active",
        plan,
        expiryDate,
        action,
      }),
    };
  } else if (mode === "payment") {
    if (licenseId && licenseId.length > 0) {
      // For renewal, use createLicenses with licenseId as a single-item array
      const result = await createLicenses(
        user._id,
        null,
        customerId,
        plan,
        quantity
      );
      licenseKeys = result.licenseKeys;
      expiryDate = result.expiryDate;
    } else {
      const result = await createLicenses(
        user._id,
        null,
        customerId,
        plan,
        quantity
      );
      licenseKeys = result.licenseKeys;
      expiryDate = result.expiryDate;
    }

    // Create BillingInvoice for one-time payment
    try {
      if (session.invoice) {
        const stripeInvoice = await stripe.invoices.retrieve(
          session.invoice as string
        );
        await upsertInvoice(stripeInvoice as Stripe.Invoice, user._id);
      } else if (session.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(
          session.payment_intent as string
        );
        // List charges associated with this PaymentIntent to get receipt URL
        const chargeList = await stripe.charges.list({
          payment_intent: (pi as any).id,
          limit: 1,
        });
        const firstCharge = chargeList.data[0];
        await BillingInvoice.findOneAndUpdate(
          { stripeInvoiceId: (pi as any).id },
          {
            userId: user._id,
            status: (pi as any).status === "succeeded" ? "paid" : (pi as any).status,
            amount_due: typeof (pi as any).amount === "number" ? (pi as any).amount : 0,
            amount_paid:
              typeof (pi as any).amount_received === "number" ? (pi as any).amount_received : 0,
            amount_remaining:
              typeof (pi as any).amount === "number" && typeof (pi as any).amount_received === "number"
                ? Math.max(0, (pi as any).amount - (pi as any).amount_received)
                : 0,
            currency: (pi as any).currency,
            number: undefined,
            hosted_invoice_url: firstCharge?.receipt_url || undefined,
            invoice_pdf: undefined,
            receipt_url: firstCharge?.receipt_url || undefined,
            created:
              typeof (pi as any).created === "number"
                ? new Date((pi as any).created * 1000)
                : new Date(),
            period_start: null,
            period_end: null,
            subscription: null,
          },
          { upsert: true }
        );
      }
    } catch (err) {
      console.error("Error creating one-time payment invoice record:", err);
    }

    emailPayload = {
      email,
      data: buildLicenseEmail({
        user,
        licenseKeys,
        status: "active",
        plan,
        expiryDate,
        action,
      }),
    };
  }

  if (emailPayload) {
    await sendEmailToSQS({
      email: emailPayload.email,
      template: "renderLicenseKeyTemplate",
      data: emailPayload.data,
    });
  }

  return {
    eventId: session.id,
    eventType: "checkout.session.completed",
    userId: user._id.toString(),
    email,
    subscriptionId: subscriptionId || undefined,
    customerId,
  };
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice
): Promise<WebhookEventData> {
  // Only process renewal invoices, not initial subscription creation
  if (invoice.billing_reason === "subscription_create") {
    // Optionally log and skip
    return {
      eventId: invoice.id || "",
      eventType: "invoice.paid (initial, skipped)",
      customerId: invoice.customer as string,
      invoiceId: invoice.id,
    };
  }
  console.log("handleInvoicePaid", invoice);
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) {
    throw new Error("Invoice has no subscription");
  }

  const user = await User.findOne({
    stripeCustomerId: invoice.customer as string,
  });
  if (!user) {
    throw new Error("User not found for invoice");
  }
  // Ensure full invoice data for reliable period fields
  let fullInvoice = invoice;
  try {
    fullInvoice = (await stripe.invoices.retrieve((invoice as any).id as string, {
      expand: ["lines.data", "subscription"],
    })) as Stripe.Invoice;
  } catch {}
  await upsertInvoice(fullInvoice, user._id);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price", "latest_invoice", "latest_invoice.lines.data"],
  });
  await upsertSubscription(subscription as Stripe.Subscription, user._id);

  // 🆕 Use canonical updateLicensesExpiry
  const licenses = await License.find({ stripeSubscriptionId: subscriptionId });
  if (licenses.length > 0) {
    await updateLicensesExpiry(licenses);

    const plan = licenses[0].plan;
    const expiryDate = licenses[0].expiryDate;

    const emailPayload: EmailPayload = {
      email: user.email,
      data: buildLicenseEmail({
        user,
        licenseKeys: licenses.map((l) => l.licenseKey),
        status: "active",
        plan,
        expiryDate,
        action: "renewed",
      }),
    };

    await sendEmailToSQS({
      email: emailPayload.email,
      template: "renderLicenseKeyTemplate",
      data: emailPayload.data,
    });
  }

  return {
    eventId: invoice.id || "",
    eventType: "invoice.paid",
    userId: user._id.toString(),
    email: user.email,
    subscriptionId,
    customerId: invoice.customer as string,
    invoiceId: invoice.id,
  };
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<WebhookEventData> {
  const user = await User.findOne({
    stripeCustomerId: subscription.customer as string,
  });
  if (!user) {
    throw new Error("User not found for subscription");
  }

  await upsertSubscription(subscription, user._id);

  const currentQuantity = subscription.items.data[0]?.quantity || 0;
  const existingLicenses = await License.find({
    stripeSubscriptionId: subscription.id,
  });
  const currentLicenses = existingLicenses.length;
  const plan =
    (subscription.items.data[0]?.price?.nickname as string) || "monthly";

  if (currentQuantity > currentLicenses) {
    const diff = currentQuantity - currentLicenses;
    // 🆕 Use canonical createLicenses for adding more
    await createLicenses(
      user._id,
      subscription.id,
      subscription.customer as string,
      plan,
      diff
    );
  } else if (currentQuantity < currentLicenses) {
    const diff = currentLicenses - currentQuantity;
    const licensesToDeactivate = existingLicenses
      .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime())
      .slice(0, diff);

    for (const license of licensesToDeactivate) {
      license.status = "inactive";
      await license.save();
    }
  }

  const updatedLicenses = await License.find({
    stripeSubscriptionId: subscription.id,
    status: "active",
  });

  if (updatedLicenses.length > 0) {
    const emailPayload: EmailPayload = {
      email: user.email,
      data: buildLicenseEmail({
        user,
        licenseKeys: updatedLicenses.map((l) => l.licenseKey),
        status: "active",
        plan,
        expiryDate: updatedLicenses[0].expiryDate,
        action: "updated",
      }),
    };

    await sendEmailToSQS({
      email: emailPayload.email,
      template: "renderLicenseKeyTemplate",
      data: emailPayload.data,
    });
  }

  return {
    eventId: subscription.id,
    eventType: "customer.subscription.updated",
    userId: user._id.toString(),
    email: user.email,
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
  };
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<WebhookEventData> {
  const user = await User.findOne({
    stripeCustomerId: subscription.customer as string,
  });
  if (!user) {
    throw new Error("User not found for subscription");
  }

  await BillingSubscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    { status: "canceled" }
  );

  // 🆕 Use canonical deactivateLicenses
  await deactivateLicenses(subscription.id);

  const deactivatedLicenses = await License.find({
    stripeSubscriptionId: subscription.id,
  });

  if (deactivatedLicenses.length > 0) {
    const emailPayload: EmailPayload = {
      email: user.email,
      data: buildLicenseEmail({
        user,
        licenseKeys: deactivatedLicenses.map((l) => l.licenseKey),
        status: "inactive",
        plan: deactivatedLicenses[0].plan,
        expiryDate: deactivatedLicenses[0].expiryDate,
        action: "deactivated",
      }),
    };

    await sendEmailToSQS({
      email: emailPayload.email,
      template: "renderLicenseKeyTemplate",
      data: emailPayload.data,
    });
  }

  return {
    eventId: subscription.id,
    eventType: "customer.subscription.deleted",
    userId: user._id.toString(),
    email: user.email,
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
  };
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice
): Promise<WebhookEventData> {
  const user = await User.findOne({
    stripeCustomerId: invoice.customer as string,
  });
  if (!user) {
    throw new Error("User not found for invoice");
  }

  await upsertInvoice(invoice, user._id);

  const emailPayload: PaymentFailureEmailPayload = {
    email: user.email,
    data: {
      user,
      action: "payment_failed",
      invoice: {
        id: invoice.id || "",
        amount: invoice.amount_due,
        currency: invoice.currency,
        hosted_invoice_url: invoice.hosted_invoice_url || undefined,
      },
    },
  };

  await sendEmailToSQS({
    email: emailPayload.email,
    template: "paymentFailureTemplate",
    data: emailPayload.data,
  });

  return {
    eventId: invoice.id || "",
    eventType: "invoice.payment_failed",
    userId: user._id.toString(),
    email: user.email,
    customerId: invoice.customer as string,
    invoiceId: invoice.id,
  };
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing webhook signature or secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const existing = await ProcessedWebhookEvent.findOne({
      eventId: event.id,
    }).lean();

    if (existing) {
      return NextResponse.json({ received: true, deduped: true });
    }

    let eventData: WebhookEventData | null = null;

    console.log("Stripe webhook received:", event.type);
    console.log("Event data:", event.data.object);
    switch (event.type) {
      case "checkout.session.completed":
        eventData = await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "invoice.paid":
        eventData = await handleInvoicePaid(
          event.data.object as Stripe.Invoice
        );
        break;
      // Capture initial invoice at subscription creation
      case "invoice.finalized": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason === "subscription_create") {
          const invoiceUser = (await User.findOne({
            stripeCustomerId: invoice.customer as string,
          })) as IUser | null;
          if (invoiceUser) {
            await upsertInvoice(invoice, invoiceUser._id);
          }
        }
        const invoiceUser = (await User.findOne({
          stripeCustomerId: invoice.customer as string,
        })) as IUser | null;
        if (invoiceUser) {
          await upsertInvoice(invoice, invoiceUser._id);
        }
        break;
      }

      case "invoice.created": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceUser = (await User.findOne({
          stripeCustomerId: invoice.customer as string,
        })) as IUser | null;
        if (invoiceUser) {
          await upsertInvoice(invoice, invoiceUser._id);
        }
        break;
      }

      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const user = await User.findOne({
          stripeCustomerId: sub.customer as string,
        });
        if (user) {
          await upsertSubscription(sub, user._id);
          eventData = {
            eventId: sub.id,
            eventType: "customer.subscription.created",
            userId: user._id.toString(),
            email: user.email,
            subscriptionId: sub.id,
            customerId: sub.customer as string,
          };
        }
        break;
      }

      // Other events are logged above; add specific handlers as needed

      case "customer.subscription.updated":
        eventData = await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        eventData = await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        eventData = await handlePaymentFailed(
          event.data.object as Stripe.Invoice
        );
        break;

      case "invoice.created":
      case "invoice.finalized": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceUser = (await User.findOne({
          stripeCustomerId: invoice.customer as string,
        })) as IUser | null;
        if (invoiceUser) {
          await upsertInvoice(invoice, invoiceUser?._id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    await ProcessedWebhookEvent.create({
      eventId: event.id,
      processedAt: new Date(),
      eventType: event.type,
      ...(eventData || {}),
    });

    return NextResponse.json({
      received: true,
      processed: true,
      eventType: event.type,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return NextResponse.json({
      received: true,
      error: "Internal processing error",
      eventType:
        typeof event !== "undefined" && "type" in event
          ? (event as any).type
          : "unknown",
    });
  }
}
