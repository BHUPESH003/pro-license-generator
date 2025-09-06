import mongoose, { Schema, Document } from "mongoose";

export interface IBillingInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  stripeInvoiceId: string;
  status?: string;
  amount_due?: number;
  amount_paid?: number;
  amount_remaining?: number;
  currency?: string;
  number?: string;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  receipt_url?: string | null;
  created?: Date | null;
  period_start?: Date | null;
  period_end?: Date | null;
  subscription?: string | null;
}

const BillingInvoiceSchema = new Schema<IBillingInvoice>({
  userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
  stripeInvoiceId: { type: String, unique: true, required: true },
  status: String,
  amount_due: Number,
  amount_paid: Number,
  amount_remaining: Number,
  currency: String,
  number: String,
  hosted_invoice_url: String,
  invoice_pdf: String,
  receipt_url: String,
  created: Date,
  period_start: Date,
  period_end: Date,
  subscription: String,
});

BillingInvoiceSchema.index({ userId: 1, created: -1 });

const Existing = (mongoose.models.BillingInvoice as mongoose.Model<IBillingInvoice>) || undefined;
export default Existing || mongoose.model<IBillingInvoice>("BillingInvoice", BillingInvoiceSchema);


