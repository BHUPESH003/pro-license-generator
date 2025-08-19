import mongoose, { Document, Schema } from "mongoose";

export interface IAdminAudit extends Document {
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const AdminAuditSchema = new Schema<IAdminAudit>({
  actorUserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  entityType: {
    type: String,
    required: true,
    index: true,
  },
  entityId: {
    type: String,
    index: true,
  },
  payload: {
    type: Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  success: {
    type: Boolean,
    required: true,
    default: true,
    index: true,
  },
  errorMessage: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound indexes for efficient querying
AdminAuditSchema.index({ actorUserId: 1, createdAt: -1 });
AdminAuditSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AdminAuditSchema.index({ action: 1, createdAt: -1 });
AdminAuditSchema.index({ success: 1, createdAt: -1 });

// TTL index for automatic cleanup (optional - can be configured)
AdminAuditSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 365 * 24 * 60 * 60 }
); // 1 year

export default mongoose.models.AdminAudit ||
  mongoose.model<IAdminAudit>("AdminAudit", AdminAuditSchema);
