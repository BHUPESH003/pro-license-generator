import mongoose, { Document, Schema } from "mongoose";

export interface ILicense extends Document {
  licenseKey: string;
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  status: "active" | "inactive";
  purchaseDate: Date;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  expiryDate: Date;
  plan: string;
}

const LicenseSchema = new Schema<ILicense>({
  licenseKey: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String },
  status: { type: String, enum: ["active", "inactive"], required: true },
  purchaseDate: { type: Date, default: Date.now },
  stripeSubscriptionId: { type: String },
  stripeCustomerId: { type: String },
  expiryDate: { type: Date },
  plan: { type: String },
});

export default mongoose.models.License ||
  mongoose.model<ILicense>("License", LicenseSchema);
