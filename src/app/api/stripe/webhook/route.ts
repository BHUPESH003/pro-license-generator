import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import License, { ILicense } from "@/models/License";
import { sendEmailToSQS } from "@/lib/sqsService";
import {
  createLicenses,
  updateLicensesExpiry,
  deactivateLicenses,
} from "@/lib/licenseService";
import { buildLicenseEmail } from "@/lib/licenseEmailService";
import Stripe from "stripe";

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) return Buffer.from("");
  let chunks = [];
  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    if (value) chunks.push(value);
    done = doneReading;
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req as any);
    event = stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret!);
  } catch (err) {
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  await dbConnect();

  let emailPayload: { email: string; data: any } | null = null;

  // checkout.session.completed — create licenses or renew one-time
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;
    const subscriptionId = session.subscription;
    const customerId = session.customer;
    const plan = (session.metadata as any)?.plan || "monthly";
    const mode =
      (session as any).mode ||
      (session.metadata as any)?.mode ||
      "subscription";
    const licenseId = (session.metadata as any)?.licenseId;
    const quantity = (session.metadata as any)?.quantity
      ? parseInt((session.metadata as any).quantity)
      : 1;

    if (email && mode === "subscription" && subscriptionId) {
      const user = await User.findOne({ email });
      if (user) {
        // Retrieve subscription to determine each item (plan and quantity)
        const sub = await stripe.subscriptions.retrieve(
          subscriptionId as string,
          {
            expand: ["items.data.price"],
          }
        );

        const allCreatedKeys: string[] = [];
        let lastExpiry: Date | undefined = undefined;

        for (const item of sub.items.data) {
          const itemQuantity = item.quantity || 1;
          const itemPlan = item.price?.nickname || plan || "monthly";
          const { licenseKeys, expiryDate } = await createLicenses(
            user._id as any,
            sub.id,
            sub.customer as any,
            itemPlan,
            itemQuantity
          );
          allCreatedKeys.push(...licenseKeys);
          lastExpiry = expiryDate;
        }
        emailPayload = {
          email,
          data: buildLicenseEmail({
            user,
            licenseKeys: allCreatedKeys,
            status: "active",
            plan,
            expiryDate: lastExpiry as Date,
            action: "created",
          }),
        };
      }
    }

    // One-time payment to renew a specific license
    if (email && mode === "payment" && licenseId) {
      const license = await License.findById(licenseId);
      if (license) {
        // Extend expiry and mark active
        license.status = "active";
        const now = new Date();
        const base =
          license.expiryDate && license.expiryDate > now
            ? license.expiryDate
            : now;
        // naive extend by plan
        if (plan === "yearly") {
          base.setFullYear(base.getFullYear() + 1);
        } else if (plan === "quarterly") {
          base.setMonth(base.getMonth() + 3);
        } else {
          base.setMonth(base.getMonth() + 1);
        }
        license.expiryDate = new Date(base);
        await license.save();
        const user = await User.findById(license.userId);
        emailPayload = {
          email: user?.email || email!,
          data: buildLicenseEmail({
            user: user as any,
            licenseKeys: [license.licenseKey],
            status: license.status,
            plan: license.plan,
            expiryDate: license.expiryDate,
            action: "reactivated",
          }),
        };
      }
    }

    // One-time purchase (first-time) — create new licenses without subscription
    if (email && mode === "payment" && !licenseId) {
      const user = await User.findOne({ email });
      if (user) {
        const { licenseKeys, expiryDate } = await createLicenses(
          user._id as any,
          null,
          customerId as Stripe.Customer,
          plan,
          quantity
        );
        emailPayload = {
          email,
          data: buildLicenseEmail({
            user,
            licenseKeys,
            status: "active",
            plan,
            expiryDate,
            action: "created",
          }),
        };
      }
    }
  }

  // invoice.paid — reactivate licenses & extend
  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId) {
      const licenses = await License.find({
        stripeSubscriptionId: subscriptionId,
      });
      await updateLicensesExpiry(licenses);
      if (licenses.length > 0) {
        const user = await User.findById(licenses[0].userId);
        emailPayload = {
          email: user?.email || "",
          data: buildLicenseEmail({
            user: user as any,
            licenseKeys: licenses.map((l) => l.licenseKey),
            status: "active",
            plan: licenses[0].plan,
            expiryDate: licenses[0].expiryDate,
            action: "reactivated",
          }),
        };
      }
    }
  }

  // invoice.payment_failed & subscription.deleted
  if (
    event.type === "invoice.payment_failed" ||
    event.type === "customer.subscription.deleted"
  ) {
    const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
    const subscriptionId = (obj as any).subscription || obj.id;
    if (subscriptionId) {
      const licenses = await License.find({
        stripeSubscriptionId: subscriptionId,
      });
      await deactivateLicenses(subscriptionId);
      if (licenses.length > 0) {
        const user = await User.findById(licenses[0].userId);
        emailPayload = {
          email: user?.email || "",
          data: buildLicenseEmail({
            user: user as any,
            licenseKeys: licenses.map((l) => l.licenseKey),
            status: "inactive",
            plan: licenses[0].plan,
            expiryDate: licenses[0].expiryDate,
            action: "deactivated",
          }),
        };
      }
    }
  }

  // subscription.updated — update license count
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const newQuantity = subscription.items.data[0].quantity;
    const plan = subscription.items.data[0].price.nickname || "monthly";

    const licenses = await License.find({
      stripeSubscriptionId: subscriptionId,
    });
    const diff = (newQuantity || 0) - licenses.length;

    if (diff > 0) {
      await createLicenses(
        licenses?.[0].userId,
        subscriptionId,
        subscription.customer as Stripe.Customer,
        plan,
        diff
      );
    } else if (diff < 0) {
      const toDeactivate = licenses
        .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime())
        .slice(diff);
      for (const lic of toDeactivate) {
        lic.status = "inactive";
        await lic.save();
      }
    }

    const updatedLicenses = await License.find({
      stripeSubscriptionId: subscriptionId,
    });
    if (updatedLicenses.length > 0) {
      const user = await User.findById(updatedLicenses[0].userId);
      emailPayload = {
        email: user?.email || "",
        data: buildLicenseEmail({
          user: user as any,
          licenseKeys: updatedLicenses.map((l) => l.licenseKey),
          status: updatedLicenses[0].status,
          plan: updatedLicenses[0].plan,
          expiryDate: updatedLicenses[0].expiryDate,
          action: "updated",
        }),
      };
    }
  }

  // Send email at the end (only once per event)
  if (emailPayload) {
    await sendEmailToSQS({
      email: emailPayload.email,
      template: "renderLicenseKeyTemplate",
      data: emailPayload.data,
    });
  }

  return NextResponse.json({ received: true });
}
