import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import BillingSubscription from "@/models/BillingSubscription";
import License from "@/models/License";
import { sendEmailToSQS } from "@/lib/sqsService";
import { buildLicenseEmail } from "@/lib/licenseEmailService";
import { calculateLicenseExpiry } from "@/lib/dateUtils";
import Stripe from "stripe";

interface SubscriptionActionRequest {
  action: "cancel" | "reactivate" | "update_quantity" | "pause" | "resume";
  subscriptionId: string;
  userId: string;
  cancelAtPeriodEnd?: boolean;
  newQuantity?: number;
  pauseUntil?: Date;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubscriptionActionRequest;
    const { action, subscriptionId, userId, cancelAtPeriodEnd = true, newQuantity } = body;

    if (!action || !subscriptionId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: action, subscriptionId, userId" },
        { status: 400 }
      );
    }

    // Explicitly disallow unsupported actions
    if (action === "reactivate") {
      return NextResponse.json(
        { error: "Reactivate is currently disabled." },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subDoc = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId,
    });

    if (!subDoc) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    let stripeSubscription: Stripe.Subscription | null = null;
    let emailPayload: { email: string; data: ReturnType<typeof buildLicenseEmail> } | null = null;

    switch (action) {
      case "cancel":
        if (cancelAtPeriodEnd) {
          stripeSubscription = await stripe.subscriptions.update(
            subscriptionId,
            { cancel_at_period_end: true }
          );
        } else {
          stripeSubscription = await stripe.subscriptions.cancel(subscriptionId);
        }

        await BillingSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscriptionId },
          {
            status: stripeSubscription.status,
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            current_period_end: (stripeSubscription as any).current_period_end
              ? new Date((stripeSubscription as any).current_period_end * 1000)
              : null,
          }
        );

        if (!cancelAtPeriodEnd) {
          await License.updateMany(
            { stripeSubscriptionId: subscriptionId },
            { $set: { status: "inactive" } }
          );

          const licenses = await License.find({ stripeSubscriptionId: subscriptionId });
          if (licenses.length > 0) {
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
        } else {
          emailPayload = {
            email: user.email,
            data: buildLicenseEmail({
              user,
              licenseKeys: [],
              status: "active",
              plan: subDoc.items?.[0]?.interval || "",
              expiryDate: new Date(),
              action: "subscription_cancelled",
            }),
          };
        }
        break;

      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (emailPayload) {
      await sendEmailToSQS({
        email: emailPayload.email,
        template: "renderLicenseKeyTemplate",
        data: emailPayload.data,
      });
    }

    const finalStatus = (await BillingSubscription.findOne({ stripeSubscriptionId: subscriptionId }))?.status || "";

    return NextResponse.json({
      success: true,
      action,
      subscriptionId,
      status: finalStatus,
    });
  } catch (error) {
    console.error("Subscription management error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

