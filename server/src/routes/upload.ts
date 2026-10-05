import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(here, "../../uploads");

/**
 * MIME -> extension dipetakan sendiri agar nama file tidak pernah bergantung pada
 * header kiriman client (bisa dipalsukan).
 */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

class UnsupportedFileType extends Error {
  readonly status = 400;
}

function makeFilename(mimetype: string): string {
  const ext = ALLOWED_TYPES[mimetype] ?? "";
  return `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
}

/**
 * Dual-mode. Function serverless (Vercel) tidak punya persistent disk, jadi file
 * harus keluar dari memory lewat object storage (Vercel Blob). Tanpa token,
 * fallback ke disk lokal supaya `npm run dev` tetap jalan tanpa setup.
 */
const useBlob = Boolean(env.blobToken);

const storage = useBlob
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        mkdirSync(uploadsDir, { recursive: true });
        cb(null, uploadsDir);
      },
      filename: (_req, file, cb) => cb(null, makeFilename(file.mimetype)),
    });

const upload = multer({
  storage,
  limits: { fileSize: env.uploadMaxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      cb(new UnsupportedFileType(`Tipe file tidak diizinkan: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    if (useBlob) {
      const { put } = await import("@vercel/blob");
      const buffer = (req.file as Express.Multer.File & { buffer: Buffer }).buffer;
      const blob = await put(makeFilename(req.file.mimetype), buffer, {
        access: "public",
        addRandomSuffix: false,
        token: env.blobToken,
      });
      res.status(201).json({ url: blob.url });
      return;
    }

    res.status(201).json({ url: `${env.publicUrl}/uploads/${req.file.filename}` });
  } catch (err) {
    next(err);
  }
});

uploadRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof UnsupportedFileType) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `File melebihi batas ${Math.round(env.uploadMaxBytes / 1024 / 1024)} MB`
        : `Upload ditolak: ${err.code}`;
    res.status(400).json({ error: message });
    return;
  }
  next(err);
});