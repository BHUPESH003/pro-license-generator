import mongoose, { Schema, Document } from "mongoose";

export interface IProcessedWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  processedAt: Date;
  userId?: string;
  email?: string;
  subscriptionId?: string;
  customerId?: string;
  invoiceId?: string;
  createdAt: Date;
}

const ProcessedWebhookEventSchema = new Schema<IProcessedWebhookEvent>({
  eventId: { type: String, unique: true, index: true, required: true },
  eventType: { type: String, required: true, index: true },
  processedAt: { type: Date, default: () => new Date(), required: true },
  userId: { type: String, index: true },
  email: { type: String, index: true },
  subscriptionId: { type: String, index: true },
  customerId: { type: String, index: true },
  invoiceId: { type: String, index: true },
  createdAt: { type: Date, default: () => new Date() },
});

// Add compound indexes for efficient querying
ProcessedWebhookEventSchema.index({ eventType: 1, processedAt: -1 });
ProcessedWebhookEventSchema.index({ userId: 1, processedAt: -1 });
ProcessedWebhookEventSchema.index({ subscriptionId: 1, processedAt: -1 });

const Existing = (mongoose.models.ProcessedWebhookEvent as mongoose.Model<IProcessedWebhookEvent>) || undefined;
export default Existing || mongoose.model<IProcessedWebhookEvent>("ProcessedWebhookEvent", ProcessedWebhookEventSchema);


