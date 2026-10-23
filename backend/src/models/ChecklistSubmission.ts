
import mongoose, { Document, Schema } from "mongoose";

const checklistItemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["passed", "warning", "critical"],
      required: true,
    },
  },
  { _id: false }
);

const checklistSubmissionSchema = new Schema(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    zone: { type: String, required: true, trim: true },
    submittedAt: { type: Date, default: Date.now },
    items: { type: [checklistItemSchema], required: true },
    summary: {
      total: { type: Number, required: true },
      passed: { type: Number, required: true },
      warning: { type: Number, required: true },
      critical: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ChecklistSubmission",
  checklistSubmissionSchema
);