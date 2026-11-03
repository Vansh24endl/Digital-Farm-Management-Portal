import { z } from "zod";
import { objectIdSchema } from "./commonValidation";

export const animalTypeEnum = z.enum(["pig", "poultry"]);
export const diseaseSeverityEnum = z.enum(["low", "medium", "high"]);
export const diseaseStatusEnum = z.enum(["reported", "investigating", "resolved"]);

export const createDiseaseReportSchema = z.object({
  farmId: objectIdSchema,
  diseaseName: z.string().trim().default("Unspecified Vector Outbreak"),
  animalType: animalTypeEnum.default("poultry"),
  symptoms: z
    .string()
    .trim()
    .min(1, "Observed symptoms are required")
    .min(3, "Symptoms description must be at least 3 characters long"),
  description: z.string().trim().default(""),
  severity: diseaseSeverityEnum.default("medium"),
  status: diseaseStatusEnum.default("reported"),
  location: z.string().trim().optional(),
  speciesAffected: z.string().trim().optional(),
  coordinates: z
    .object({
      x: z.number().default(0),
      y: z.number().default(0),
    })
    .optional(),
});

export const updateDiseaseReportSchema = createDiseaseReportSchema.partial();

export type CreateDiseaseReportInput = z.infer<typeof createDiseaseReportSchema>;
export type UpdateDiseaseReportInput = z.infer<typeof updateDiseaseReportSchema>;
