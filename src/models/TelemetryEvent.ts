import mongoose, { Schema, Document } from "mongoose";

export interface ITelemetryEvent extends Document {
  userId: mongoose.Types.ObjectId;
  licenseId: mongoose.Types.ObjectId;
  deviceGuid: string;
  sessionId?: string;
  eventType: string;
  occurredAt: Date;
  appVersion?: string;
  os?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
}

const TelemetryEventSchema = new Schema<ITelemetryEvent>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  licenseId: { type: Schema.Types.ObjectId, ref: "License", required: true },
  deviceGuid: { type: String, required: true, index: true },
  sessionId: { type: String },
  eventType: { type: String, required: true, index: true },
  occurredAt: { type: Date, required: true, index: true },
  appVersion: { type: String },
  os: { type: String },
  metadata: { type: Schema.Types.Mixed },
  idempotencyKey: { type: String, unique: true, sparse: true },
});

TelemetryEventSchema.index({ userId: 1, occurredAt: -1 });
TelemetryEventSchema.index({ licenseId: 1, occurredAt: -1 });
TelemetryEventSchema.index({ deviceGuid: 1, occurredAt: -1 });

export default mongoose.models.TelemetryEvent ||
  mongoose.model<ITelemetryEvent>("TelemetryEvent", TelemetryEventSchema);


