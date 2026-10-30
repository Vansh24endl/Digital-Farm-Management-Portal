import mongoose, { Schema, Document } from "mongoose";

export type AlertType =
  | "inventory_low"
  | "disease_severity"
  | "outbreak_warning"
  | "system";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface IAlert extends Document {
  farmId?: mongoose.Types.ObjectId | null;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ["inventory_low", "disease_severity", "outbreak_warning", "system"],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Alert title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Alert message is required"],
      trim: true,
    },
    source: {
      type: String,
      required: true,
      trim: true,
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

alertSchema.index({ farmId: 1, isRead: 1, createdAt: -1 });
alertSchema.index({ type: 1, isRead: 1, createdAt: -1 });

export default mongoose.model<IAlert>("Alert", alertSchema);
