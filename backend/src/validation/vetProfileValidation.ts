import { z } from "zod";
import { objectIdSchema } from "./commonValidation";

export const verificationStatusEnum = z.enum(["pending", "verified", "rejected"]);

export const saveVetProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters long"),
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Veterinary registration number is required"),
  qualification: z
    .string()
    .trim()
    .min(1, "Qualification is required (e.g. B.V.Sc & A.H., M.V.Sc)"),
  specialization: z
    .string()
    .trim()
    .min(1, "Specialization is required"),
  yearsOfExperience: z.coerce
    .number()
    .min(0, "Years of experience cannot be negative"),
  contactNumber: z
    .string()
    .trim()
    .min(1, "Contact number is required")
    .min(5, "Contact number is too short"),
  clinicName: z.string().trim().optional().default(""),
  clinicAddress: z.string().trim().optional().default(""),
  serviceLocation: z.string().trim().optional().default(""),
  bio: z.string().trim().optional().default(""),
  profilePhoto: z.string().trim().optional().default(""),
  certificates: z.array(z.string()).optional().default([]),
});

export const updateVetVerificationStatusSchema = z.object({
  status: verificationStatusEnum,
  rejectionReason: z.string().trim().optional(),
});

export type SaveVetProfileInput = z.infer<typeof saveVetProfileSchema>;
export type UpdateVetVerificationStatusInput = z.infer<
  typeof updateVetVerificationStatusSchema
>;
