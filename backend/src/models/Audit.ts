import mongoose, { Schema, Document } from "mongoose";

export interface IAuditItem {
  text: string;
  done: boolean;
}

export interface IAudit extends Document {
  farmId: mongoose.Types.ObjectId;
  title: string;
  findings: string;
  riskLevel: "low" | "medium" | "high";
  status: "pending" | "in-progress" | "completed";
  sector: string;
  dueDate: string;
  auditor: string;
  progress: number;
  items: IAuditItem[];
  createdAt: Date;
  updatedAt: Date;
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
    sector: {
      type: String,
      default: "General Sector",
      trim: true,
    },
    dueDate: {
      type: String,
      default: "In 3 days",
      trim: true,
    },
    auditor: {
      type: String,
      default: "Assigned Inspector",
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    items: [
      {
        text: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IAudit>("Audit", auditSchema);