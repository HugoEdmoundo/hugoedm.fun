import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  mongodbUri: required("MONGODB_URI"),
  jwtSecret: required("JWT_SECRET", "dev-only-insecure-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
  port: Number(process.env.PORT ?? 4000),
  publicUrl: (process.env.PUBLIC_URL ?? "http://localhost:4000").replace(/\/+$/, ""),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:8990",
  uploadMaxBytes: Number(process.env.UPLOAD_MAX_MB ?? 10) * 1024 * 1024,
  /**
   * Token Vercel Blob. Keberadaannya menentukan strategi upload: object storage
   * (wajib di serverless) atau disk lokal (fallback development).
   */
  blobToken: process.env.BLOB_READ_WRITE_TOKEN ?? "",
};
