import { z } from "zod";

// MongoDB ObjectId validation regex (24 hex characters)
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z
  .string()
  .trim()
  .regex(OBJECT_ID_REGEX, "Must be a valid 24-character hex MongoDB ObjectId");

export const optionalObjectIdSchema = z
  .string()
  .trim()
  .regex(OBJECT_ID_REGEX, "Must be a valid 24-character hex MongoDB ObjectId")
  .optional()
  .nullable();

export const coordinatesSchema = z.object({
  lat: z
    .number()
    .min(-90, "Latitude must be >= -90")
    .max(90, "Latitude must be <= 90"),
  lon: z
    .number()
    .min(-180, "Longitude must be >= -180")
    .max(180, "Longitude must be <= 180"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});
