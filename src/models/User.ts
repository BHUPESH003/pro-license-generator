// models/User.ts

import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { ILicense } from "./License"; // Import to type populate

export interface IUser extends Document {
  email: string;
  password?: string;
  license?: ILicense | mongoose.Types.ObjectId; // Reference to License
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  license: { type: Schema.Types.ObjectId, ref: "License" }, // Reference field
});

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

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
