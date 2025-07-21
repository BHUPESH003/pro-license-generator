import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { buffer } from "micro";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import License from "@/models/License";
import { generateLicenseKey } from "@/lib/utils";
import { sendEmailToSQS } from "@/lib/sqsService";

export const config = {
  api: {
    bodyParser: false,
  },
};

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function buildLicenseEmail({
  user,
  licenseKeys,
  status,
  plan,
  expiryDate,
  action,
}: {
  user: any;
  licenseKeys: string[];
  status: string;
  plan: string;
  expiryDate: Date;
  action: string;
}) {
  return {
    subject: `Your ProApp License Keys${action ? ` - ${action}` : ""}`,
    greeting: `Hi${user?.name ? " " + user.name : ""},`,
    message:
      action === "deactivated"
        ? `Your license(s) have been deactivated due to payment failure or subscription cancellation.`
        : action === "reactivated"
        ? `Your license(s) have been reactivated. Thank you for your continued subscription!`
        : `Thank you for your purchase! Here are your license keys:`,
    licenseKeys,
    plan,
    expiryDate: expiryDate ? expiryDate.toISOString().slice(0, 10) : undefined,
    instructions:
      action === "deactivated"
        ? "To reactivate, please update your payment method or renew your subscription."
        : "Enter these keys in your ProApp client to activate your software. If you need more devices, you can upgrade anytime.",
    support:
      "If you have any questions, reply to this email or contact support@mycleanone.com.",
    status,
  };
}

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
  let event;
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

  // Handle checkout.session.completed (create license(s))
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_email;
    const subscriptionId = session.subscription;
    const customerId = session.customer;
    const plan = session.metadata?.plan || "monthly";
    let expiryDate = addMonths(new Date(), 1);
    if (plan === "quarterly") expiryDate = addMonths(new Date(), 3);
    if (plan === "yearly") expiryDate = addYears(new Date(), 1);
    if (email && subscriptionId) {
      const user = await User.findOne({ email });
      if (user) {
        const numLicenses = session.metadata?.quantity
          ? parseInt(session.metadata.quantity)
          : 1;
        const licenseKeys: string[] = [];
        for (let i = 0; i < numLicenses; i++) {
          const licenseKey = generateLicenseKey();
          licenseKeys.push(licenseKey);
          await License.create({
            licenseKey,
            userId: user._id,
            status: "active",
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            plan,
            purchaseDate: new Date(),
            expiryDate, // always set
          });
        }
        // Send all license keys in the email
        await sendEmailToSQS({
          email,
          template: "renderLicenseKeyTemplate",
          data: buildLicenseEmail({
            user,
            licenseKeys,
            status: "active",
            plan,
            expiryDate,
            action: "created",
          }),
        });
      }
    }
  }

  // Handle invoice.paid (reactivate licenses and extend expiry)
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const subscriptionId = (invoice as any).subscription;
    if (subscriptionId) {
      // Find all licenses for this subscription
      const licenses = await License.find({
        stripeSubscriptionId: subscriptionId,
      });
      for (const lic of licenses) {
        lic.status = "active";
        // Extend expiry based on plan
        if (lic.plan === "yearly") {
          lic.expiryDate = addYears(new Date(), 1);
        } else if (lic.plan === "quarterly") {
          lic.expiryDate = addMonths(new Date(), 3);
        } else {
          lic.expiryDate = addMonths(new Date(), 1);
        }
        await lic.save();
      }
      // Send reactivation email
      if (licenses.length > 0) {
        const user = await User.findById(licenses[0].userId);
        const licenseKeys = licenses.map((l) => l.licenseKey);
        await sendEmailToSQS({
          email: user.email,
          template: "renderLicenseKeyTemplate",
          data: buildLicenseEmail({
            user,
            licenseKeys,
            status: "active",
            plan: licenses[0].plan,
            expiryDate: licenses[0].expiryDate,
            action: "reactivated",
          }),
        });
      }
    }
  }

  // Handle invoice.payment_failed and customer.subscription.deleted (deactivate licenses)
  if (
    event.type === "invoice.payment_failed" ||
    event.type === "customer.subscription.deleted"
  ) {
    const obj = event.data.object;
    const subscriptionId = (obj as any).subscription || (obj as any).id;
    if (subscriptionId) {
      const licenses = await License.find({
        stripeSubscriptionId: subscriptionId,
      });
      await License.updateMany(
        { stripeSubscriptionId: subscriptionId },
        { $set: { status: "inactive" } }
      );
      // Send deactivation email
      if (licenses.length > 0) {
        const user = await User.findById(licenses[0].userId);
        const licenseKeys = licenses.map((l) => l.licenseKey);
        await sendEmailToSQS({
          email: user.email,
          template: "renderLicenseKeyTemplate",
          data: buildLicenseEmail({
            user,
            licenseKeys,
            status: "inactive",
            plan: licenses[0].plan,
            expiryDate: licenses[0].expiryDate,
            action: "deactivated",
          }),
        });
      }
    }
  }

  // Handle customer.subscription.updated (quantity change)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const newQuantity = subscription.items.data[0].quantity;
    const plan = subscription.items.data[0].price.nickname || "monthly";
    // Find all licenses for this subscription
    const licenses = await License.find({
      stripeSubscriptionId: subscriptionId,
    });
    const diff = (newQuantity || 0) - licenses.length;
    if (diff > 0) {
      // Add new licenses
      for (let i = 0; i < diff; i++) {
        const licenseKey = generateLicenseKey();
        await License.create({
          licenseKey,
          userId: licenses[0]?.userId,
          status: "active",
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: subscription.customer,
          plan,
          purchaseDate: new Date(),
          expiryDate:
            plan === "yearly"
              ? addYears(new Date(), 1)
              : plan === "quarterly"
              ? addMonths(new Date(), 3)
              : addMonths(new Date(), 1),
        });
      }
    } else if (diff < 0) {
      // Deactivate extra licenses (oldest first)
      const toDeactivate = licenses.slice(diff);
      for (const lic of toDeactivate) {
        lic.status = "inactive";
        await lic.save();
      }
    }
    // Send updated license keys email
    const updatedLicenses = await License.find({
      stripeSubscriptionId: subscriptionId,
    });
    if (updatedLicenses.length > 0) {
      const user = await User.findById(updatedLicenses[0].userId);
      const licenseKeys = updatedLicenses.map((l) => l.licenseKey);
      await sendEmailToSQS({
        email: user.email,
        template: "renderLicenseKeyTemplate",
        data: buildLicenseEmail({
          user,
          licenseKeys,
          status: updatedLicenses[0].status,
          plan: updatedLicenses[0].plan,
          expiryDate: updatedLicenses[0].expiryDate,
          action: "updated",
        }),
      });
    }
  }

  return NextResponse.json({ received: true });
}
