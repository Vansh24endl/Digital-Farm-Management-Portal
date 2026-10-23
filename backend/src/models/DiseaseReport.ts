import mongoose, { Schema, Document } from "mongoose";

export interface IDiseaseReport extends Document {
  farmId: mongoose.Types.ObjectId;
  animalType: "pig" | "poultry";
  symptoms: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "reported" | "investigating" | "resolved";
}

const diseaseReportSchema = new Schema<IDiseaseReport>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    animalType: {
      type: String,
      enum: ["pig", "poultry"],
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["reported", "investigating", "resolved"],
      default: "reported",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDiseaseReport>(
  "DiseaseReport",
  diseaseReportSchema
);