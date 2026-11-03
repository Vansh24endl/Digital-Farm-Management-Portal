import { Request, Response, NextFunction } from "express";
import { ZodError, ZodTypeAny } from "zod";

export interface RequestValidationOptions {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Format Zod errors into a user-friendly array of field errors
 */
export const formatZodErrors = (error: ZodError) => {
  const issues = (error as any).issues || (error as any).errors || [];
  return issues.map((err: any) => ({
    field: Array.isArray(err.path) && err.path.length > 0 ? err.path.join(".") : "value",
    message: err.message || "Invalid value",
  }));
};

/**
 * Express middleware to validate req.body against a Zod schema.
 * Replaces req.body with the sanitized/parsed result.
 * 
 * Usage:
 *   router.post("/register", validate(registerSchema), handler);
 */
export const validate = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = formatZodErrors(result.error);
      res.status(400).json({
        success: false,
        message: formattedErrors[0]?.message || "Validation failed",
        errors: formattedErrors,
      });
      return;
    }

    // Overwrite req.body with parsed & sanitized data
    req.body = result.data;
    next();
  };
};

/**
 * Express middleware to validate req.body, req.query, and/or req.params simultaneously.
 * 
 * Usage:
 *   router.get("/farms", validateRequest({ query: paginationQuerySchema }), handler);
 */
export const validateRequest = (options: RequestValidationOptions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (options.body) {
        const bodyResult = options.body.safeParse(req.body);
        if (!bodyResult.success) {
          const errors = formatZodErrors(bodyResult.error);
          res.status(400).json({
            success: false,
            message: errors[0]?.message || "Invalid request body",
            errors,
          });
          return;
        }
        req.body = bodyResult.data;
      }

      if (options.query) {
        const queryResult = options.query.safeParse(req.query);
        if (!queryResult.success) {
          const errors = formatZodErrors(queryResult.error);
          res.status(400).json({
            success: false,
            message: errors[0]?.message || "Invalid query parameters",
            errors,
          });
          return;
        }
        req.query = queryResult.data as any;
      }

      if (options.params) {
        const paramsResult = options.params.safeParse(req.params);
        if (!paramsResult.success) {
          const errors = formatZodErrors(paramsResult.error);
          res.status(400).json({
            success: false,
            message: errors[0]?.message || "Invalid route parameters",
            errors,
          });
          return;
        }
        req.params = paramsResult.data as any;
      }

      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: "Internal validation exception",
        error: err.message,
      });
    }
  };
};
