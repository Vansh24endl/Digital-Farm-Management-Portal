import mongoose, { Schema, Document } from "mongoose";

export interface IFarm extends Document {
  name: string;
  farmType: "pig" | "poultry" | "mixed";
  location: string;
  createdAt: Date;
}

const farmSchema = new Schema<IFarm>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    farmType: {
      type: String,
      enum: ["pig", "poultry", "mixed"],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFarm>("Farm", farmSchema);