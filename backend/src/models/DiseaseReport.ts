import mongoose, { Schema, Document } from "mongoose";

export interface IDiseaseReport extends Document {
  farmId: mongoose.Types.ObjectId;
  diseaseName: string;
  animalType: "pig" | "poultry";
  symptoms: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "reported" | "investigating" | "resolved";
  location: string;
  speciesAffected: string;
  coordinates: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

const diseaseReportSchema = new Schema<IDiseaseReport>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    diseaseName: {
      type: String,
      default: "Unspecified Vector Outbreak",
      trim: true,
    },
    animalType: {
      type: String,
      enum: ["pig", "poultry"],
      default: "poultry",
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
    location: {
      type: String,
      default: "",
      trim: true,
    },
    speciesAffected: {
      type: String,
      default: "",
      trim: true,
    },
    coordinates: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IDiseaseReport>(
  "DiseaseReport",
  diseaseReportSchema
);