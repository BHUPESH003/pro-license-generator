import License, { ILicense } from "@/models/License";
import { generateUniqueLicenseKey } from "@/lib/utils";
import { addMonths, addYears, addQuarters } from "@/lib/dateUtils";
import mongoose from "mongoose";
import Stripe from "stripe";

export interface CreateLicensesResult {
  licenseKeys: string[];
  expiryDate: Date;
}

/**
 * Create multiple licenses for a user
 * @param userId - The MongoDB ObjectId of the user
 * @param subscriptionId - The Stripe subscription ID
 * @param customerId - The Stripe customer ID
 * @param plan - "monthly" | "quarterly" | "yearly" etc.
 * @param qty - Number of licenses to create
 * @returns Object containing generated license keys and expiry date
 */
export async function createLicenses(
  userId: mongoose.Types.ObjectId,
  subscriptionId: string | null,
  customerId: string,
  plan: string,
  qty: number
): Promise<CreateLicensesResult> {
  const now = new Date();
  const expiryDate =
    plan === "yearly"
      ? addYears(now, 1)
      : plan === "quarterly"
        ? addQuarters(now, 1)
        : addMonths(now, 1);

  const licenseKeys = [];
  const licensesToInsert = [];

  for (let i = 0; i < qty; i++) {
    const licenseKey = await generateUniqueLicenseKey();
    licenseKeys.push(licenseKey);
    licensesToInsert.push({
      licenseKey,
      userId,
      stripeSubscriptionId: subscriptionId || undefined,
      stripeCustomerId: customerId,
      status: "active",
      plan,
      purchaseDate: new Date(),
      expiryDate,
    });
  }

  await License.insertMany(licensesToInsert);
  return { licenseKeys, expiryDate };
}

export async function updateLicensesExpiry(licenses: ILicense[]) {
  for (const lic of licenses) {
    lic.status = "active";
    const base = new Date();
    lic.expiryDate =
      lic.plan === "yearly"
        ? addYears(base, 1)
        : lic.plan === "quarterly"
          ? addQuarters(base, 1)
          : addMonths(base, 1);
    await lic.save();
  }
}

export async function deactivateLicenses(subscriptionId: string) {
  await License.updateMany(
    { stripeSubscriptionId: subscriptionId },
    { $set: { status: "inactive" } }
  );
}
