import "dotenv/config";
import { connectDb, disconnectDb } from "../src/db.js";
import mongoose from "mongoose";

const collections = [
  "site_config",
  "projects",
  "skills",
  "gallery",
  "tasks",
  "education",
  "experience",
  "social_links",
];

async function main(): Promise<void> {
  await connectDb();
  const names = new Set((await mongoose.connection.db!.listCollections().toArray()).map((c) => c.name));
  for (const name of collections) {
    if (!names.has(name)) {
      console.log(`${name.padEnd(14)} (tidak ada)`);
      continue;
    }
    const count = await mongoose.connection.db!.collection(name).countDocuments();
    const sample = await mongoose.connection.db!.collection(name).findOne({});
    console.log(`${name.padEnd(14)} count=${String(count).padEnd(4)} _id=${JSON.stringify(sample?._id)}`);
  }
  await disconnectDb();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb().catch(() => undefined);
  process.exit(1);
});
