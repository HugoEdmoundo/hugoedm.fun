import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { SiteConfigModel } from "../models/index.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { DUMMY_HASH, hashAccessCode, isHashed, verifyAccessCode } from "../utils/access-code.js";

export const authRouter = Router();

const credentials = z.object({ code: z.string().min(1) });

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT ?? 8),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" },
  skipSuccessfulRequests: true,
});

authRouter.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { code } = credentials.parse(req.body);
    const trimmed = code.trim();
    const doc = await SiteConfigModel.findOne().sort({ updated_at: -1 });

    if (!doc) {
      await bcrypt.compare(trimmed, DUMMY_HASH);
      res.status(401).json({ error: "Invalid access code" });
      return;
    }

    const { ok, legacy } = await verifyAccessCode(doc.admin_code, trimmed);
    if (!ok) {
      res.status(401).json({ error: "Invalid access code" });
      return;
    }

    // Migrasi malas: code lama yang masih plaintext langsung di-upgrade saat login sukses.
    if (legacy) {
      await SiteConfigModel.findByIdAndUpdate(doc._id, {
        admin_code: await hashAccessCode(trimmed),
        updated_at: new Date(),
      });
      console.log("[auth] access code di-migrate ke bcrypt hash");
    }

    res.json({
      token: signToken({ sub: "admin", role: "admin" }),
      user: { role: "admin", site_name: doc.site_name },
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: { role: req.auth?.role ?? "admin" } });
});

/** Code asli tidak pernah dikirim lagi; hanya status hash-nya. */
authRouter.get("/code", requireAuth, async (_req, res, next) => {
  try {
    const doc = await SiteConfigModel.findOne().sort({ updated_at: -1 });
    res.json({ configured: Boolean(doc?.admin_code), hashed: isHashed(doc?.admin_code ?? "") });
  } catch (err) {
    next(err);
  }
});

authRouter.put("/code", requireAuth, async (req, res, next) => {
  try {
    const { code } = credentials.parse(req.body);
    const trimmed = code.trim();
    const existing = await SiteConfigModel.findOne().sort({ updated_at: -1 });

    if (!existing) {
      res.status(400).json({ error: "site_config not initialised" });
      return;
    }

    if (trimmed.length < 8) {
      res.status(400).json({ error: "Access code minimal 8 karakter" });
      return;
    }

    await SiteConfigModel.findByIdAndUpdate(existing._id, {
      admin_code: await hashAccessCode(trimmed),
      updated_at: new Date(),
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
