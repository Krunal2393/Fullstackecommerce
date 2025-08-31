import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // attach validated data to req (optional)
      (req as any).validated = result;
      next();
    } catch (err: any) {
      return res.status(400).json({ error: err.errors || err.message });
    }
  };
