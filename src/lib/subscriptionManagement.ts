import stripe from "@/lib/stripe";
import dbConnect from "@/lib/db";
import User, { IUser } from "@/models/User";
import BillingSubscription, { IBillingSubscription } from "@/models/BillingSubscription";
import License, { ILicense } from "@/models/License";
import { calculateLicenseExpiry } from "@/lib/dateUtils";

export interface SubscriptionAction {
  action: 'cancel' | 'reactivate' | 'update_quantity' | 'pause' | 'resume';
  subscriptionId: string;
  userId: string;
  cancelAtPeriodEnd?: boolean;
  newQuantity?: number;
  pauseUntil?: Date;
}

export interface SubscriptionActionResult {
  success: boolean;
  action: string;
  subscriptionId: string;
  status: string;
  message?: string;
  licensesAffected?: number;
}

/**
 * Cancel a subscription
 * @param params - Cancellation parameters
 * @returns Result of the cancellation operation
 */
export async function cancelSubscription(params: {
  subscriptionId: string;
  userId: string;
  cancelAtPeriodEnd?: boolean;
}): Promise<SubscriptionActionResult> {
  const { subscriptionId, userId, cancelAtPeriodEnd = true } = params;

  try {
    await dbConnect();

    // Verify user and subscription ownership
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
      ...(cancelAtPeriodEnd ? {} : { cancel_at: Math.floor(Date.now() / 1000) })
    });

    // Update local subscription record
    await BillingSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status: stripeSubscription.status,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        current_period_end: (stripeSubscription as any).current_period_end 
          ? new Date((stripeSubscription as any).current_period_end * 1000) 
          : null
      }
    );

    let licensesAffected = 0;

    // If canceling immediately, deactivate licenses
    if (!cancelAtPeriodEnd) {
      const result = await License.updateMany(
        { stripeSubscriptionId: subscriptionId },
        { $set: { status: "inactive" } }
      );
      licensesAffected = result.modifiedCount;
    }

    return {
      success: true,
      action: 'cancel',
      subscriptionId,
      status: stripeSubscription.status,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be cancelled at the end of the current period'
        : 'Subscription cancelled immediately',
      licensesAffected
    };

  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

/**
 * Reactivate a cancelled subscription
 * @param params - Reactivation parameters
 * @returns Result of the reactivation operation
 */
export async function reactivateSubscription(params: {
  subscriptionId: string;
  userId: string;
}): Promise<SubscriptionActionResult> {
  const { subscriptionId, userId } = params;

  try {
    await dbConnect();

    // Verify user and subscription ownership
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Reactivate subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    // Update local subscription record
    await BillingSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status: stripeSubscription.status,
        cancel_at_period_end: false
      }
    );

    // Reactivate licenses
    const result = await License.updateMany(
      { stripeSubscriptionId: subscriptionId },
      { $set: { status: "active" } }
    );

    return {
      success: true,
      action: 'reactivate',
      subscriptionId,
      status: stripeSubscription.status,
      message: 'Subscription reactivated successfully',
      licensesAffected: result.modifiedCount
    };

  } catch (error) {
    console.error("Error reactivating subscription:", error);
    throw error;
  }
}

/**
 * Update subscription quantity
 * @param params - Quantity update parameters
 * @returns Result of the quantity update operation
 */
export async function updateSubscriptionQuantity(params: {
  subscriptionId: string;
  userId: string;
  newQuantity: number;
}): Promise<SubscriptionActionResult> {
  const { subscriptionId, userId, newQuantity } = params;

  try {
    await dbConnect();

    if (newQuantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    // Verify user and subscription ownership
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Update subscription quantity in Stripe
    const subscriptionItem = await stripe.subscriptionItems.list({
      subscription: subscriptionId,
      limit: 1
    });

    if (subscriptionItem.data.length === 0) {
      throw new Error("No subscription items found");
    }

    await stripe.subscriptionItems.update(subscriptionItem.data[0].id, {
      quantity: newQuantity
    });

    // Update local subscription record
    await BillingSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        "items.0.quantity": newQuantity
      }
    );

    // Handle license quantity changes
    const currentLicenses = await License.find({ 
      stripeSubscriptionId: subscriptionId,
      status: "active"
    });
    const currentQuantity = currentLicenses.length;
    const plan = currentLicenses[0]?.plan || "monthly";

    if (newQuantity > currentQuantity) {
      // Add more licenses
      const diff = newQuantity - currentQuantity;
      
      for (let i = 0; i < diff; i++) {
        const licenseKey = await generateUniqueLicenseKey();
        await License.create({
          licenseKey,
          userId: user._id,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: user.stripeCustomerId,
          status: "active",
          plan,
          planType: plan as 'monthly' | 'quarterly' | 'yearly',
          mode: 'subscription',
          purchaseDate: new Date(),
          expiryDate: calculateLicenseExpiry(plan)
        });
      }
    } else if (newQuantity < currentQuantity) {
      // Remove licenses (deactivate oldest ones)
      const diff = currentQuantity - newQuantity;
      const licensesToDeactivate = currentLicenses
        .sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime())
        .slice(0, diff);
      
      for (const license of licensesToDeactivate) {
        license.status = "inactive";
        await license.save();
      }
    }

    return {
      success: true,
      action: 'update_quantity',
      subscriptionId,
      status: subscription.status || "",
      message: `Subscription quantity updated to ${newQuantity}`,
      licensesAffected: Math.abs(newQuantity - currentQuantity)
    };

  } catch (error) {
    console.error("Error updating subscription quantity:", error);
    throw error;
  }
}

/**
 * Pause a subscription temporarily
 * @param params - Pause parameters
 * @returns Result of the pause operation
 */
export async function pauseSubscription(params: {
  subscriptionId: string;
  userId: string;
  pauseUntil: Date;
}): Promise<SubscriptionActionResult> {
  const { subscriptionId, userId, pauseUntil } = params;

  try {
    await dbConnect();

    // Verify user and subscription ownership
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Pause subscription in Stripe (set to cancel at specific date)
    const pauseTimestamp = Math.floor(pauseUntil.getTime() / 1000);
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at: pauseTimestamp
    });

    // Update local subscription record
    await BillingSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status: stripeSubscription.status,
        cancel_at_period_end: false,
        current_period_end: new Date(pauseTimestamp * 1000)
      }
    );

    return {
      success: true,
      action: 'pause',
      subscriptionId,
      status: stripeSubscription.status,
      message: `Subscription paused until ${pauseUntil.toLocaleDateString()}`,
      licensesAffected: 0
    };

  } catch (error) {
    console.error("Error pausing subscription:", error);
    throw error;
  }
}

/**
 * Resume a paused subscription
 * @param params - Resume parameters
 * @returns Result of the resume operation
 */
export async function resumeSubscription(params: {
  subscriptionId: string;
  userId: string;
}): Promise<SubscriptionActionResult> {
  const { subscriptionId, userId } = params;

  try {
    await dbConnect();

    // Verify user and subscription ownership
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const subscription = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Resume subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at: null
    });

    // Update local subscription record
    await BillingSubscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        status: stripeSubscription.status,
        cancel_at_period_end: false
      }
    );

    return {
      success: true,
      action: 'resume',
      subscriptionId,
      status: stripeSubscription.status,
      message: 'Subscription resumed successfully',
      licensesAffected: 0
    };

  } catch (error) {
    console.error("Error resuming subscription:", error);
    throw error;
  }
}

/**
 * Get subscription details with license information
 * @param params - Query parameters
 * @returns Subscription details with associated licenses
 */
export async function getSubscriptionDetails(params: {
  subscriptionId: string;
  userId: string;
}) {
  const { subscriptionId, userId } = params;

  try {
    await dbConnect();

    // Get subscription details
    const subscription = await BillingSubscription.findOne({
      stripeSubscriptionId: subscriptionId,
      userId: userId
    });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    // Get associated licenses
    const licenses = await License.find({
      stripeSubscriptionId: subscriptionId
    }).sort({ purchaseDate: -1 });

    // Get Stripe subscription details
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    return {
      subscription: {
        ...subscription.toObject(),
        stripeDetails: {
          status: stripeSubscription.status,
          current_period_start: (stripeSubscription as any).current_period_start 
            ? new Date((stripeSubscription as any).current_period_start * 1000) 
            : null,
          current_period_end: (stripeSubscription as any).current_period_end 
            ? new Date((stripeSubscription as any).current_period_end * 1000) 
            : null,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          cancel_at: (stripeSubscription as any).cancel_at 
            ? new Date((stripeSubscription as any).cancel_at * 1000) 
            : null
        }
      },
      licenses: {
        total: licenses.length,
        active: licenses.filter(l => l.status === 'active').length,
        inactive: licenses.filter(l => l.status === 'inactive').length,
        details: licenses
      }
    };

  } catch (error) {
    console.error("Error getting subscription details:", error);
    throw error;
  }
}

/**
 * Generate unique license key
 * @returns Unique license key string
 */
async function generateUniqueLicenseKey(): Promise<string> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `LIC-${timestamp}-${random}`.toUpperCase();
}
