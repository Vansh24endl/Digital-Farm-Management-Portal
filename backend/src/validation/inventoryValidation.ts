import { z } from "zod";
import { objectIdSchema } from "./commonValidation";

export const inventoryCategoryEnum = z.enum([
  "disinfectant",
  "ppe",
  "medicine",
  "equipment",
  "other",
]);

export const createInventorySchema = z.object({
  farmId: objectIdSchema,
  itemName: z
    .string()
    .trim()
    .min(1, "Item name is required")
    .min(2, "Item name must be at least 2 characters long")
    .max(100, "Item name cannot exceed 100 characters"),
  category: inventoryCategoryEnum,
  quantity: z.coerce
    .number()
    .min(0, "Quantity cannot be negative"),
  unit: z
    .string()
    .trim()
    .min(1, "Unit (e.g. Liters, kg, boxes) is required"),
  minimumStock: z.coerce
    .number()
    .min(0, "Minimum stock threshold cannot be negative")
    .default(0),
});

export const updateInventorySchema = createInventorySchema.partial();

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
