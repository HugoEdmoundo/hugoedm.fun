import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { connectDb, disconnectDb, ensureDb } from "./db.js";
import { env } from "./env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { apiRouter } from "./routes/index.js";
import { uploadsDir } from "./routes/upload.js";

const app = express();

// Di belakang reverse proxy/CDN (Cloudflare, Vercel, Nginx) agar req.ip_rate_limit akurat.
app.set("trust proxy", 1);

app.use(
  helmet({
    // Frontend dan API berada di origin berbeda; CORP default helmet akan memblokir /uploads.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: [env.clientOrigin, env.publicUrl], credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "7d",
    setHeaders: (res) => {
      // Berkas hasil upload tidak boleh jadi sumber skrip atau mereferensikan origin lain.
      res.setHeader("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'");
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

/**
 * Serverless (Vercel) tidak menjalankan `start()`, jadi koneksi DB tidak pernah
 * dibuat sebelum request masuk. Query pun akan ter-buffer sampai
 * `serverSelectionTimeoutMS` habis dan response menggantung. Middleware ini
 * memastikan koneksi siap tepat sebelum router dipanggil.
 */
app.use("/api", async (_req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

async function start(): Promise<void> {
  if (!process.env.JWT_SECRET) {
    console.warn("[api] JWT_SECRET belum diset — memakai fallback dev. WAJIB diset di production.");
  }
  await connectDb().catch((err) => {
    // Server tetap listen supaya `/api/health` masih bisa dipakai saat credentials salah.
    console.error("[api] gagal connect ke MongoDB:", err);
  });
  const server = app.listen(env.port, () => {
    console.log(`[api] listening on ${env.publicUrl} (db: ${env.mongodbUri.split("@")[1]})`);
  });

  const shutdown = (signal: string) => {
    console.log(`[api] ${signal} received, closing`);
    server.close(async () => {
      await disconnectDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

const entry = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === entry) {
  start().catch((err) => {
    console.error("[api] failed to start", err);
    process.exit(1);
  });
}

export { app };
