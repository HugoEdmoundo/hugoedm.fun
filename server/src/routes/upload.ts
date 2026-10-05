import { randomUUID } from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { put } from "@vercel/blob";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

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

// Memory storage (aman untuk serverless)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: env.uploadMaxBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      cb(new UnsupportedFileType(Tipe file tidak diizinkan: ));
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
    const ext = ALLOWED_TYPES[req.file.mimetype] ?? "";
    const filename = ${Date.now()}-;
    const blob = await put(filename, req.file.buffer, { access: "public" });
    res.status(201).json({ url: blob.url });
  } catch (err) {
    next(err);
  }
});

uploadRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof UnsupportedFileType) {
    res.status(400).json({ error: err.message });
    return;
  }
  if ((err as any)?.name === "MulterError") {
    const multerErr = err as any;
    const message =
      multerErr.code === "LIMIT_FILE_SIZE"
        ? File melebihi batas  MB
        : Upload ditolak: ;
    res.status(400).json({ error: message });
    return;
  }
  next(err);
});
