import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
    farmId: mongoose.Types.ObjectId;
    name: string;
    purpose: string;
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
        purpose: {
            type: String,
            required: true,
            trim: true,
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