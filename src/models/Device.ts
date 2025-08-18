import mongoose, { Schema, Document } from "mongoose";
import { ILicense } from "./License";

export interface IDevice extends Document {
  name: string;
  os: string;
  deviceGuid?: string;
  licenseId: mongoose.Types.ObjectId | ILicense; // <- Update this
  userId: mongoose.Types.ObjectId;
  lastActivity: Date;
}

const DeviceSchema = new Schema<IDevice>({
  name: { type: String, required: true },
  os: { type: String, required: true },
  deviceGuid: { type: String, unique: true, sparse: true },
  licenseId: { type: Schema.Types.ObjectId, ref: "License", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  lastActivity: { type: Date, default: Date.now },
});

export default mongoose.models.Device ||
  mongoose.model<IDevice>("Device", DeviceSchema);
