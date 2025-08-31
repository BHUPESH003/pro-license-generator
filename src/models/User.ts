// models/User.ts

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ILicense } from "./License"; // Import to type populate

export interface UserAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  license?: ILicense | mongoose.Types.ObjectId; // Reference to License
  name?: string;
  phone?: string;
  address?: UserAddress;
  stripeCustomerId?: string;
  // New admin fields
  role?: "admin";
  lastSeenAt?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  license: { type: Schema.Types.ObjectId, ref: "License" }, // Reference field
  name: { type: String },
  phone: { type: String },
  address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postal_code: { type: String },
    country: { type: String },
  },
  stripeCustomerId: { type: String },
  // Admin fields
  role: { type: String, enum: ["admin"], required: false },
  lastSeenAt: { type: Date },
});

// Add indexes for admin query optimization
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ lastSeenAt: -1 });
UserSchema.index({ stripeCustomerId: 1 });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// In dev, Next.js HMR can retain an older compiled model without new fields.
// If a model already exists, ensure its schema has the new optional fields.
const ExistingUserModel = mongoose.models.User as
  | mongoose.Model<IUser>
  | undefined;
if (ExistingUserModel) {
  const paths = ExistingUserModel.schema.paths as any;
  if (!paths.name) ExistingUserModel.schema.add({ name: { type: String } });
  if (!paths.phone) ExistingUserModel.schema.add({ phone: { type: String } });
  if (!paths.address) {
    ExistingUserModel.schema.add({
      address: {
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        postal_code: { type: String },
        country: { type: String },
      },
    });
  }
  if (!paths.stripeCustomerId)
    ExistingUserModel.schema.add({ stripeCustomerId: { type: String } });
  if (!paths.role)
    ExistingUserModel.schema.add({
      role: { type: String, enum: ["admin"], required: false },
    });
  if (!paths.lastSeenAt)
    ExistingUserModel.schema.add({ lastSeenAt: { type: Date } });
}

export default ExistingUserModel || mongoose.model<IUser>("User", UserSchema);
