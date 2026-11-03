import { z } from "zod";
import { objectIdSchema } from "./commonValidation";

export const createDailyLogSchema = z.object({
  farmId: objectIdSchema,
  logDate: z
    .string()
    .or(z.date())
    .optional(),
  temperature: z.coerce
    .number()
    .min(-15, "Temperature must be between -15°C and 60°C")
    .max(60, "Temperature must be between -15°C and 60°C"),
  humidity: z.coerce
    .number()
    .min(0, "Humidity must be between 0% and 100%")
    .max(100, "Humidity must be between 0% and 100%"),
  animalCount: z.coerce
    .number()
    .int("Animal count must be an integer")
    .min(0, "Animal count cannot be negative"),
  mortalityCount: z.coerce
    .number()
    .int("Mortality count must be an integer")
    .min(0, "Mortality count cannot be negative")
    .default(0),
  waterConsumptionLiters: z.coerce
    .number()
    .min(0, "Water consumption cannot be negative"),
  feedConsumptionKg: z.coerce
    .number()
    .min(0, "Feed consumption cannot be negative"),
  cleaningDisinfectionDone: z.coerce.boolean().default(false),
  disinfectantUsed: z.string().trim().optional(),
  symptomsObserved: z.string().trim().optional(),
  healthObservations: z.string().trim().optional(),
  biosecurityNotes: z.string().trim().optional(),
});

export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
