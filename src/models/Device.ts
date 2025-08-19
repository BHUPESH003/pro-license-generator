import mongoose, { Schema, Document } from "mongoose";
import { ILicense } from "./License";

export interface IDevice extends Document {
  name: string;
  os: string;
  deviceGuid?: string;
  licenseId: mongoose.Types.ObjectId | ILicense;
  userId: mongoose.Types.ObjectId;
  lastActivity: Date;
  // New admin field
  status?: "active" | "inactive";
}

const DeviceSchema = new Schema<IDevice>({
  name: { type: String, required: true },
  os: { type: String, required: true },
  deviceGuid: { type: String, unique: true, sparse: true },
  licenseId: { type: Schema.Types.ObjectId, ref: "License", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lastActivity: { type: Date, default: Date.now },
  // New admin field
  status: {
    type: String,
    enum: ["active", "inactive"],
    required: false,
    default: "active",
  },
});

// Add indexes for admin query optimization
DeviceSchema.index({ deviceGuid: 1 }, { unique: true, sparse: true });
DeviceSchema.index({ userId: 1 });
DeviceSchema.index({ licenseId: 1 });
DeviceSchema.index({ lastActivity: -1 });
DeviceSchema.index({ status: 1 });
DeviceSchema.index({ os: 1 });
DeviceSchema.index({ name: 1 });

// Compound indexes for efficient admin search and filtering
DeviceSchema.index({ status: 1, lastActivity: -1 });
DeviceSchema.index({ userId: 1, status: 1 });
DeviceSchema.index({ os: 1, status: 1 });

// In dev, Next.js HMR can retain an older compiled model without new fields.
// If a model already exists, ensure its schema has the new optional fields.
const ExistingDeviceModel = mongoose.models.Device as
  | mongoose.Model<IDevice>
  | undefined;
if (ExistingDeviceModel) {
  const paths = ExistingDeviceModel.schema.paths as any;
  if (!paths.status) {
    ExistingDeviceModel.schema.add({
      status: {
        type: String,
        enum: ["active", "inactive"],
        required: false,
        default: "active",
      },
    });
  }
}

export default ExistingDeviceModel ||
  mongoose.model<IDevice>("Device", DeviceSchema);
