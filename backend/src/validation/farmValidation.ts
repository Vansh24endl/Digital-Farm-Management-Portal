import { z } from "zod";
import { coordinatesSchema } from "./commonValidation";

export const farmTypeEnum = z.enum(["pig", "poultry", "mixed"]);

export const createFarmSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Farm name is required")
    .min(2, "Farm name must be at least 2 characters long")
    .max(120, "Farm name cannot exceed 120 characters"),
  farmType: farmTypeEnum,
  location: z
    .string()
    .trim()
    .min(1, "Farm location is required")
    .min(2, "Location must be at least 2 characters long")
    .max(200, "Location cannot exceed 200 characters"),
  coordinates: coordinatesSchema.optional(),
});

export const updateFarmSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Farm name must be at least 2 characters long")
    .max(120, "Farm name cannot exceed 120 characters")
    .optional(),
  farmType: farmTypeEnum.optional(),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters long")
    .max(200, "Location cannot exceed 200 characters")
    .optional(),
  coordinates: coordinatesSchema.optional(),
});

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>;
