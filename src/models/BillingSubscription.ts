import mongoose, { Schema, Document } from "mongoose";

export interface IBillingSubscriptionItem {
  priceId?: string;
  product?: string;
  unit_amount?: number;
  currency?: string;
  interval?: string;
  interval_count?: number;
}

export interface IBillingSubscription extends Document {
  userId: mongoose.Types.ObjectId;
  stripeSubscriptionId: string;
  status?: string;
  cancel_at_period_end?: boolean;
  current_period_start?: Date | null;
  current_period_end?: Date | null;
  created?: Date | null;
  items: IBillingSubscriptionItem[];
  latest_invoice_url?: string | null;
}

const BillingSubscriptionSchema = new Schema<IBillingSubscription>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  stripeSubscriptionId: { type: String, unique: true, required: true },
  status: { type: String },
  cancel_at_period_end: { type: Boolean, default: false },
  current_period_start: { type: Date },
  current_period_end: { type: Date },
  created: { type: Date },
  items: [
    {
      priceId: String,
      product: String,
      unit_amount: Number,
      currency: String,
      interval: String,
      interval_count: Number,
    },
  ],
  latest_invoice_url: { type: String },
});

BillingSubscriptionSchema.index({ userId: 1, stripeSubscriptionId: 1 });

const Existing = (mongoose.models.BillingSubscription as mongoose.Model<IBillingSubscription>) || undefined;
export default Existing || mongoose.model<IBillingSubscription>("BillingSubscription", BillingSubscriptionSchema);
