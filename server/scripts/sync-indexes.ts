import "dotenv/config";
import mongoose, { type Model } from "mongoose";
import { connectDb, disconnectDb } from "../src/db.js";
import {
  EducationModel,
  ExperienceModel,
  GalleryModel,
  ProjectModel,
  SiteConfigModel,
  SkillModel,
  SocialLinkModel,
  TaskModel,
} from "../src/models/index.js";

// Disosten eksplisit sebagai Model<any>[]: array model akan menjadi union dari
// 8 tipe model dan membuat TypeScript kehabisan memori saat memanggil method-nya.
const MODELS: Model<any>[] = [
  SiteConfigModel,
  ProjectModel,
  SkillModel,
  GalleryModel,
  TaskModel,
  EducationModel,
  ExperienceModel,
  SocialLinkModel,
];

async function main() {
  await connectDb();

  for (const model of MODELS) {
    // syncIndexes() sekaligus menghapus index yang sudah tidak dipakai model.
    const created = await model.syncIndexes();
    const existing: { name?: string; key: Record<string, unknown> }[] = await model.collection.indexes();
    console.log(`[indexes] ${model.collection.name}: ${created.length} dibuat, total ${existing.length}`);
    for (const index of existing.filter((i) => i.name && !i.name.startsWith("_id_"))) {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    }
  }

  await disconnectDb();
}

main().catch(async (err) => {
  console.error("[indexes] gagal:", err);
  if (mongoose.connection.readyState !== 0) await disconnectDb().catch(() => undefined);
  process.exit(1);
});
