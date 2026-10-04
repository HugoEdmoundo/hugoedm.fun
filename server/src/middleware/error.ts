import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", issues: err.issues });
    return;
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  const explicit = (err as { status?: unknown } | null)?.status;
  const status = typeof explicit === "number" && explicit >= 400 && explicit < 600
    ? explicit
    : /validation|Cast to|required/i.test(message)
      ? 400
      : 500;
  if (status === 500) console.error("[error]", err);
  res.status(status).json({ error: message });
}
