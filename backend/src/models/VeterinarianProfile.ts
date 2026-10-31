import mongoose, { Schema, Document } from "mongoose";

export interface IVeterinarianProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  profilePhoto: string;
  registrationNumber: string;
  qualification: string;
  specialization: string;
  yearsOfExperience: number;
  contactNumber: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  serviceLocation: string;
  bio: string;
  verificationStatus: "pending" | "verified" | "rejected";
  certificates: string[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const vetProfileSchema = new Schema<IVeterinarianProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: "",
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, "Veterinary registration number is required"],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true,
    },
    specialization: {
      type: String,
      default: "",
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative"],
      default: 0,
    },
    contactNumber: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
    },
    clinicName: {
      type: String,
      default: "",
      trim: true,
    },
    clinicAddress: {
      type: String,
      default: "",
      trim: true,
    },
    serviceLocation: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    certificates: {
      type: [String],
      default: [],
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVeterinarianProfile>(
  "VeterinarianProfile",
  vetProfileSchema
);

