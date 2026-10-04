import { Router } from "express";
import { SiteConfigModel } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { pickSchemaFields } from "./crud.js";

export const siteConfigRouter = Router();

const withoutAdminCode = (doc: object | null) => {
  if (!doc) return null;
  const { admin_code: _hidden, ...rest } = doc as Record<string, unknown>;
  return rest;
};

siteConfigRouter.get("/", async (_req, res, next) => {
  try {
    const doc = await SiteConfigModel.findOne().sort({ updated_at: -1 });
    res.json(withoutAdminCode(doc?.toObject() ?? null));
  } catch (err) {
    next(err);
  }
});

siteConfigRouter.put("/", requireAuth, async (req, res, next) => {
  try {
    const payload = pickSchemaFields(SiteConfigModel, req.body);
    delete payload._id;
    payload.updated_at = new Date();

    const existing = await SiteConfigModel.findOne().sort({ updated_at: -1 });
    const saved = existing
      ? await SiteConfigModel.findByIdAndUpdate(existing._id, payload, { new: true, runValidators: true })
      : await SiteConfigModel.create(payload);

    if (!saved) {
      res.status(500).json({ error: "Gagal menyimpan konfigurasi" });
      return;
    }

    res.json(withoutAdminCode(saved.toObject()));
  } catch (err) {
    next(err);
  }
});
