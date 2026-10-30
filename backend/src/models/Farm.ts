import mongoose, { Schema, Document } from "mongoose";

export interface IFarm extends Document {
  name: string;
  farmType: "pig" | "poultry" | "mixed";
  location: string;
  ownerId?: mongoose.Types.ObjectId;
  coordinates?: {
    lat: number;
    lon: number;
  };
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
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    coordinates: {
      lat: { type: Number },
      lon: { type: Number },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFarm>("Farm", farmSchema);
