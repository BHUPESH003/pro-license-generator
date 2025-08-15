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

  // checkout.session.completed — create licenses
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;
    const subscriptionId = session.subscription;
    const customerId = session.customer;
    const plan = session.metadata?.plan || "monthly";
    const quantity = session.metadata?.quantity
      ? parseInt(session.metadata.quantity)
      : 1;

    if (email && subscriptionId) {
      const user = await User.findOne({ email });
      if (user) {
        const { licenseKeys, expiryDate } = await createLicenses(
          user._id.toString(),
          subscriptionId.toString(),
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
          email: user.email,
          data: buildLicenseEmail({
            user,
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
          email: user.email,
          data: buildLicenseEmail({
            user,
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
        email: user.email,
        data: buildLicenseEmail({
          user,
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
