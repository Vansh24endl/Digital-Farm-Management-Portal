import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
    farmId: mongoose.Types.ObjectId;
    name: string;
    role?: string;
    company?: string;
    phone?: string;
    purpose: string;
    temperature?: string;
    status: 'IN' | 'OUT';
    checkIn: Date;
    checkOut?: Date;
}

const visitorSchema = new Schema<IVisitor>(
    {
        farmId: {
            type: Schema.Types.ObjectId,
            ref: "Farm",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            default: "Visitor",
            trim: true,
        },
        company: {
            type: String,
            default: "Independent",
            trim: true,
        },
        phone: {
            type: String,
            default: "—",
            trim: true,
        },
        purpose: {
            type: String,
            required: true,
            trim: true,
        },
        temperature: {
            type: String,
            default: "36.5°C",
            trim: true,
        },
        status: {
            type: String,
            enum: ["IN", "OUT"],
            default: "IN",
        },
        checkIn: {
            type: Date,
            default: Date.now,
        },
        checkOut: Date,
    },
    { timestamps: true }
);

export default mongoose.model<IVisitor>("Visitor", visitorSchema);