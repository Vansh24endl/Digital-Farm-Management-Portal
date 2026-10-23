import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  farmId: mongoose.Types.ObjectId;
  itemName: string;
  category: "disinfectant" | "ppe" | "medicine" | "equipment" | "other";
  quantity: number;
  unit: string;
  minimumStock: number;
}

const inventorySchema = new Schema<IInventory>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["disinfectant", "ppe", "medicine", "equipment", "other"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInventory>("Inventory", inventorySchema);