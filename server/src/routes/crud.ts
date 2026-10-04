import type { Model, SortOrder } from "mongoose";
import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";

type Doc = { _id?: string } & Record<string, unknown>;

export const MAX_PAGE_SIZE = 100;

interface CrudOptions {
  model: Model<any>;
  sort?: Record<string, SortOrder>;
  /** fields di-refresh setiap write */
  touch?: string[];
  /** fields yang tidak boleh bocor ke response anonim */
  hidden?: string[];
  /** GET / mengembalikan satu record, bukan list */
  single?: boolean;
}

const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
});

/**
 * Pagination bersifat opt-in: tanpa `?page`/`?limit` response tetap array (backward
 * compatible untuk frontend), dengan keduanya response dibungkus envelope.
 */
export function parseListQuery(query: unknown): { page?: number; limit?: number } {
  const parsed = listQuery.safeParse(query);
  if (!parsed.success) {
    const error = new Error(`Pagination validation failed: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
    (error as Error & { status: number }).status = 400;
    throw error;
  }
  const { page, limit } = parsed.data;
  return { page, limit };
}

/** hanya field yang benar-benar ada di schema yang diteruskan ke Mongoose */
export function pickSchemaFields(model: Model<any>, body: unknown): Doc {
  const source = (body ?? {}) as Record<string, unknown>;
  const allowed = new Set(Object.keys(model.schema.paths));
  const result: Doc = {};

  for (const [key, value] of Object.entries(source)) {
    if (!allowed.has(key) || value === undefined) continue;
    if (key === "_id") {
      if (typeof value === "string" && value) result._id = value;
      continue;
    }
    result[key] = value;
  }

  return result;
}

export function stripFields(doc: unknown, hidden: string[] = []): Record<string, unknown> {
  const clone = { ...(doc as Record<string, unknown>) };
  if (!clone) return {};
  for (const field of hidden) delete clone[field];
  return clone;
}

export function createCrudRouter(options: CrudOptions): Router {
  const { model, sort = { sort_order: 1, created_at: 1 }, touch = [], hidden = [], single = false } = options;
  const router = Router();

  router.get("/", async (req, res, next) => {
    try {
      if (single) {
        const doc = await model.findOne().sort(sort);
        res.json(stripFields(doc ? doc.toObject() : {}, hidden));
        return;
      }

      const { page, limit } = parseListQuery(req.query);

      if (page === undefined && limit === undefined) {
        const docs = await model.find({}, undefined, { sort });
        res.setHeader("X-Total-Count", String(docs.length));
        res.json(docs.map((doc: { toObject(): unknown }) => stripFields(doc.toObject(), hidden)));
        return;
      }

      const perPage = limit ?? 20;
      const current = page ?? 1;
      // Opsi skip/limit ditulis inline (bukan dirantai) supaya tipe Query Mongoose
      // tidak melebar sampai TypeScript kehabisan memori.
      const [docs, total] = await Promise.all([
        model.find({}, undefined, { sort, skip: (current - 1) * perPage, limit: perPage }),
        model.countDocuments(),
      ]);

      res.setHeader("X-Total-Count", String(total));
      res.json({
        items: docs.map((doc: { toObject(): unknown }) => stripFields(doc.toObject(), hidden)),
        page: current,
        limit: perPage,
        total,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const doc = await model.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(stripFields(doc.toObject(), hidden));
    } catch (err) {
      next(err);
    }
  });

  router.post("/", requireAuth, async (req, res, next) => {
    try {
      const payload = pickSchemaFields(model, req.body);
      if (!payload._id) delete payload._id;
      for (const field of touch) payload[field] = new Date();

      const created = await model.create(payload);
      res.status(201).json(stripFields(created.toObject(), hidden));
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", requireAuth, async (req, res, next) => {
    try {
      const payload = pickSchemaFields(model, req.body);
      delete payload._id;
      for (const field of touch) payload[field] = new Date();

      const updated = await model.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      });
      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(stripFields(updated.toObject(), hidden));
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await model.findByIdAndDelete(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
