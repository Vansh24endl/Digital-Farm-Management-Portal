import { z } from "zod";
import { objectIdSchema } from "./commonValidation";

export const auditRiskLevelEnum = z.enum(["low", "medium", "high"]);
export const auditStatusEnum = z.enum(["pending", "in-progress", "completed"]);

export const auditItemSchema = z.object({
  text: z.string().trim().min(1, "Checklist item text cannot be empty"),
  done: z.boolean().default(false),
});

export const createAuditSchema = z.object({
  farmId: objectIdSchema,
  title: z
    .string()
    .trim()
    .min(1, "Audit title is required")
    .min(3, "Title must be at least 3 characters long")
    .max(150, "Title cannot exceed 150 characters"),
  findings: z.string().trim().optional().default(""),
  riskLevel: auditRiskLevelEnum.default("low"),
  status: auditStatusEnum.default("pending"),
  sector: z.string().trim().default("General Facility"),
  dueDate: z.string().trim().optional(),
  auditor: z.string().trim().optional(),
  progress: z.coerce.number().min(0).max(100).default(0),
  items: z.array(auditItemSchema).optional().default([]),
});

export const updateAuditSchema = createAuditSchema.partial();

export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type UpdateAuditInput = z.infer<typeof updateAuditSchema>;
