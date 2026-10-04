/**
 * Generator registry ikon.
 *
 * Barber lucide-react meng-`import *` seluruh 3488 ikon, sehingga aplikasi yang
 * melakukan lookup ikon berdasarkan nama dari database ikut membawa semua ikon
 * (±670 KB). Script ini membuat allowlist berisi nama ikon yang benar-benar
 * dipakai di source/preset/data, divalidasi terhadap export resmi lucide-react.
 *
 * Jalankan ulang setiap kali preset ikon (AdminSkills / AdminSocialLinks) berubah:
 *   node scripts/gen-icon-registry.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lucideBarrel = resolve(root, "node_modules/lucide-react/dist/esm/lucide-react.js");

/** Nama ikon yang boleh dipakai walau belum muncul di preset/data. */
const EXTRA = ["Link", "Globe", "Star", "Heart", "Mail", "ArrowUpRight", "Store", "FileText", "Github", "Instagram", "Twitter", "Linkedin", "Facebook", "Youtube", "Twitch", "Rss", "ExternalLink"];

const sources = [
  { file: "src/components/admin/AdminSkills.tsx", pattern: /icon:\s*"([A-Za-z0-9_]+)"/g },
  { file: "src/components/admin/AdminSocialLinks.tsx", pattern: /"([A-Z][A-Za-z0-9_]*)"/g },
  { file: "portfolio-data.json", pattern: /"icon":\s*"([A-Za-z0-9_]+)"/g },
];

const wanted = new Set(EXTRA);
for (const { file, pattern } of sources) {
  let text;
  try {
    text = readFileSync(resolve(root, file), "utf8");
  } catch {
    console.warn(`[icons] lewati, file tidak ada: ${file}`);
    continue;
  }
  for (const match of text.matchAll(pattern)) wanted.add(match[1]);
}

const barrel = readFileSync(lucideBarrel, "utf8");
const exported = new Set([...barrel.matchAll(/default as ([A-Za-z0-9_]+)/g)].map((m) => m[1]));

const valid = [...wanted].filter((name) => exported.has(name)).sort();
const unknown = [...wanted].filter((name) => !exported.has(name)).sort();

if (unknown.length) console.warn(`[icons] nama tidak dikenal di lucide-react, dilewati:\n  ${unknown.join(", ")}`);
if (valid.length < 50) {
  console.error(`[icons] registry hanya ${valid.length} ikon — ekstraksi preset gagal, batal menulis.`);
  process.exit(1);
}

const lines = [];
lines.push("/**");
lines.push(" * AUTO-GENERATED oleh scripts/gen-icon-registry.mjs — jangan diedit manual.");
lines.push(" *");
lines.push(" * Hanya ikon yang dipakai preset CMS dan data yang di-bundle. Mengimpor");
lines.push(" * namespace `icons` dari lucide-react akan menarik seluruh 3488 ikon (±670 KB).");
lines.push(" */");
lines.push('import type { ComponentType } from "react";');
lines.push('import {');
for (const name of valid) lines.push(`  ${name},`);
lines.push('} from "lucide-react";');
lines.push("");
lines.push("export type IconComponent = ComponentType<{ className?: string }>;");
lines.push("");
lines.push(`export const ICON_NAMES = [${valid.map((n) => `"${n}"`).join(", ")}] as const;`);
lines.push("");
lines.push("const REGISTRY: Record<string, IconComponent> = {");
for (const name of valid) lines.push(`  ${name},`);
lines.push("};");
lines.push("");
lines.push("/** Resolve nama ikon dari database; null bila tidak ada di registry. */");
lines.push("export function resolveIcon(name?: string | null): IconComponent | null {");
lines.push("  if (!name) return null;");
lines.push("  return REGISTRY[name] ?? REGISTRY[name.replace(/[^A-Za-z0-9]/g, \"\")] ?? null;");
lines.push("}");
lines.push("");

const out = resolve(root, "src/lib/icons.ts");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(`[icons] ${valid.length} ikon ditulis ke src/lib/icons.ts`);
