import mongoose, { Schema, Document } from "mongoose";

export interface IAudit extends Document {
  farmId: mongoose.Types.ObjectId;
  title: string;
  findings: string;
  riskLevel: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
}

const auditSchema = new Schema<IAudit>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    findings: {
      type: String,
      default: "",
      trim: true,
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAudit>("Audit", auditSchema);