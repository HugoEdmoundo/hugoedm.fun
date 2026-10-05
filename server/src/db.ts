import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

/**
 * Koneksi dijaga sebagai promise tunggal, bukan per-request. Di serverless tiap
 * invocation bisa berjalan paralel, jadi saat connect masih berjalan pemanggil
 * berikutnya ikut menunggu hasil yang sama.
 */
let connection: Promise<typeof mongoose> | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  connection ??= mongoose.connect(env.mongodbUri, {
    serverSelectionTimeoutMS: 10_000,
    bufferCommands: false,
  });
  try {
    return await connection;
  } catch (err) {
    // Clear supaya request berikutnya mencoba ulang, bukan menunggu promise yang sudah gagal.
    connection = null;
    throw err;
  }
}

export async function ensureDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await connectDb();
}

export async function disconnectDb(): Promise<void> {
  connection = null;
  await mongoose.disconnect();
}