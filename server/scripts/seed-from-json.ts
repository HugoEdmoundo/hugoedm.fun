import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
import type { Model } from "mongoose";
import { hashAccessCode } from "../src/utils/access-code.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceFile = path.resolve(here, "../../portfolio-data.json");
// Disimpan sebagai bcrypt hash, sama seperti yang dilakukan endpoint /auth/code.
const adminCode = await hashAccessCode(process.env.ADMIN_CODE ?? "?hl%3Did<26");

interface SeedFile {
  site_config: Record<string, unknown> | null;
  projects?: Record<string, unknown>[];
  skills?: Record<string, unknown>[];
  gallery?: Record<string, unknown>[];
  tasks?: Record<string, unknown>[];
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  social_links?: Record<string, unknown>[];
  fetched_at?: string;
}

/** kolom `id` dari JSON export dipindah ke `_id` MongoDB */
export function toMongoDoc(row: Record<string, unknown>): Record<string, unknown> {
  const { id, ...rest } = row;
  return { _id: typeof id === "string" && id ? id : randomUUID(), ...rest };
}

const MEDIA_FIELDS = ["screenshot_url", "logo_url", "image_url", "avatar_url", "icon_url"];

/** Kembalikan label + jumlah dokumen yang field medianya masih kosong (butuh upload ulang). */
function countMissingMedia(docs: Record<string, unknown>[]): string[] {
  const missing: string[] = [];
  for (const doc of docs) {
    for (const field of MEDIA_FIELDS) {
      const value = doc[field];
      if (field in doc && (value === "" || value === null || value === undefined)) {
        missing.push(`${String(doc.title ?? doc.name ?? doc._id)} (${field})`);
      }
    }
  }
  return missing;
}

async function seed(label: string, model: Model<any>, rows: Record<string, unknown>[] = []): Promise<string[]> {
  if (!rows.length) {
    console.log(`[seed] ${label}: 0 baris`);
    return [];
  }

  const docs = rows.map(toMongoDoc);
  const result = await model.bulkWrite(
    docs.map((doc) => ({ replaceOne: { filter: { _id: doc._id as string }, replacement: doc, upsert: true } })),
    { ordered: false },
  );

  const errors = (result as unknown as { writeErrors?: { message: string }[] }).writeErrors ?? [];
  const total = result.upsertedCount + result.matchedCount;
  console.log(
    `[seed] ${label}: ${rows.length} baris (upserted ${result.upsertedCount}, matched ${result.matchedCount}, updated ${result.modifiedCount})`,
  );

  for (const err of errors) console.warn(`[seed] ${label} error: ${err.message}`);
  if (!errors.length && total !== rows.length) {
    console.warn(`[seed] ${label}: tidak semua baris tersimpan (${total}/${rows.length})`);
  }

  return countMissingMedia(docs);
}

async function main(): Promise<void> {
  const parsed = JSON.parse(await readFile(sourceFile, "utf8")) as SeedFile;
  console.log(`[seed] sumber: ${sourceFile} (fetched_at: ${parsed.fetched_at ?? "?"})`);

  await connectDb();

  const config = toMongoDoc((parsed.site_config ?? {}) as Record<string, unknown>);
  await seed("site_config", SiteConfigModel, [{ ...config, admin_code: adminCode }]);

  const missingMedia = new Set<string>();
  for (const url of await seed("projects", ProjectModel, parsed.projects)) missingMedia.add(url);
  for (const url of await seed("skills", SkillModel, parsed.skills)) missingMedia.add(url);
  for (const url of await seed("gallery", GalleryModel, parsed.gallery)) missingMedia.add(url);
  for (const url of await seed("tasks", TaskModel, parsed.tasks)) missingMedia.add(url);
  for (const url of await seed("education", EducationModel, parsed.education)) missingMedia.add(url);
  for (const url of await seed("experience", ExperienceModel, parsed.experience)) missingMedia.add(url);
  for (const url of await seed("social_links", SocialLinkModel, parsed.social_links)) missingMedia.add(url);

  if (missingMedia.size) {
    console.log(`\n[seed] ${missingMedia.size} field media kosong, upload ulang lewat CMS:`);
    for (const item of missingMedia) console.log(`  - ${item}`);
  }

  await disconnectDb();
  console.log("[seed] selesai");
}

const isEntry = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isEntry) {
  main().catch(async (err) => {
    console.error("[seed] gagal:", err);
    await disconnectDb().catch(() => undefined);
    process.exit(1);
  });
}
