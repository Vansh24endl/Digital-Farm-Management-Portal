import mongoose, { Schema, Document } from "mongoose";

export interface IDailyLog extends Document {
  farmId: mongoose.Types.ObjectId;
  recordedBy: mongoose.Types.ObjectId;
  logDate: Date;
  dataSource: string;
  temperature: number; // in Celsius
  humidity: number; // in %
  animalCount: number; // total active population
  mortalityCount: number; // deaths today
  waterConsumptionLiters: number;
  feedConsumptionKg: number;
  cleaningDisinfectionDone: boolean;
  disinfectantUsed?: string;
  healthObservations?: string;
  symptomsObserved?: string;
  biosecurityNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dailyLogSchema = new Schema<IDailyLog>(
  {
    farmId: {
      type: Schema.Types.ObjectId,
      ref: "Farm",
      required: [true, "Farm association is required"],
      index: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User association is required"],
    },
    logDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    dataSource: {
      type: String,
      default: "Manual Farmer Observation (Non-IoT)",
      required: true,
    },
    temperature: {
      type: Number,
      required: [true, "Barn temperature reading is required"],
      min: [-10, "Temperature too low"],
      max: [60, "Temperature too high"],
    },
    humidity: {
      type: Number,
      required: [true, "Humidity reading is required"],
      min: [0, "Humidity must be at least 0%"],
      max: [100, "Humidity cannot exceed 100%"],
    },
    animalCount: {
      type: Number,
      required: [true, "Animal population count is required"],
      min: [0, "Animal count cannot be negative"],
    },
    mortalityCount: {
      type: Number,
      default: 0,
      min: [0, "Mortality count cannot be negative"],
    },
    waterConsumptionLiters: {
      type: Number,
      required: [true, "Water consumption is required"],
      min: [0, "Water consumption cannot be negative"],
    },
    feedConsumptionKg: {
      type: Number,
      required: [true, "Feed consumption is required"],
      min: [0, "Feed consumption cannot be negative"],
    },
    cleaningDisinfectionDone: {
      type: Boolean,
      default: true,
    },
    disinfectantUsed: {
      type: String,
      trim: true,
      default: "Virkon-S / Bleach Dip",
    },
    healthObservations: {
      type: String,
      trim: true,
      default: "Normal activity and appetite observed.",
    },
    symptomsObserved: {
      type: String,
      trim: true,
      default: "None",
    },
    biosecurityNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup per farm & date
dailyLogSchema.index({ farmId: 1, logDate: -1 });

export default mongoose.model<IDailyLog>("DailyLog", dailyLogSchema);

