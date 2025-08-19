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
  // New admin fields
  mode?: "subscription" | "payment";
  planType?: "monthly" | "quarterly" | "yearly";
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
  // New admin fields
  mode: { type: String, enum: ["subscription", "payment"], required: false },
  planType: {
    type: String,
    enum: ["monthly", "quarterly", "yearly"],
    required: false,
  },
});

// Add indexes for admin query optimization
LicenseSchema.index({ licenseKey: 1 }, { unique: true });
LicenseSchema.index({ status: 1 });
LicenseSchema.index({ plan: 1 });
LicenseSchema.index({ mode: 1 });
LicenseSchema.index({ userId: 1 });
LicenseSchema.index({ purchaseDate: -1 });
LicenseSchema.index({ expiryDate: -1 });

// Compound indexes for efficient admin filtering and sorting
LicenseSchema.index({ status: 1, purchaseDate: -1 });
LicenseSchema.index({ plan: 1, mode: 1 });
LicenseSchema.index({ userId: 1, status: 1 });

// In dev, Next.js HMR can retain an older compiled model without new fields.
// If a model already exists, ensure its schema has the new optional fields.
const ExistingLicenseModel = mongoose.models.License as
  | mongoose.Model<ILicense>
  | undefined;
if (ExistingLicenseModel) {
  const paths = ExistingLicenseModel.schema.paths as any;
  if (!paths.mode) {
    ExistingLicenseModel.schema.add({
      mode: {
        type: String,
        enum: ["subscription", "payment"],
        required: false,
      },
    });
  }
  if (!paths.planType) {
    ExistingLicenseModel.schema.add({
      planType: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
        required: false,
      },
    });
  }
}

export default ExistingLicenseModel ||
  mongoose.model<ILicense>("License", LicenseSchema);
