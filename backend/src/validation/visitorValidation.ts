import { z } from "zod";
import { objectIdSchema } from "./commonValidation";

export const createVisitorSchema = z.object({
  farmId: objectIdSchema,
  name: z
    .string()
    .trim()
    .min(1, "Visitor name is required")
    .min(2, "Visitor name must be at least 2 characters long")
    .max(100, "Visitor name cannot exceed 100 characters"),
  purpose: z
    .string()
    .trim()
    .min(1, "Purpose of visit is required")
    .min(2, "Purpose must be at least 2 characters long")
    .max(200, "Purpose cannot exceed 200 characters"),
  role: z.string().trim().default("Visitor"),
  company: z.string().trim().default("Independent"),
  phone: z.string().trim().optional(),
  temperature: z
    .string()
    .or(z.number())
    .transform((val) => String(val))
    .optional(),
  status: z.enum(["IN", "OUT"]).default("IN"),
});

export const updateVisitorStatusSchema = z.object({
  status: z.enum(["IN", "OUT"]),
});

export type CreateVisitorInput = z.infer<typeof createVisitorSchema>;
export type UpdateVisitorStatusInput = z.infer<typeof updateVisitorStatusSchema>;
