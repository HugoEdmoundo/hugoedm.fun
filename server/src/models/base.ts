import { randomUUID } from "node:crypto";
import { Schema, type Model, type SchemaDefinition, model } from "mongoose";

/**
 * Longgar (= unknown) dengan sengaja: `SchemaDefinitionProperty` membuat TypeScript
 * expand union raksasa sampai kehabisan memori. Validasi tetap jalan runtime oleh Mongoose.
 */
export type FieldMap = Record<string, unknown>;

export type IndexMap = Record<string, 1 | -1>;

/**
 * Index dipasang lewat cast `unknown`, bukan `schema.index(...)` langsung.
 * Menyimpan hasil `new Schema()` di variabel memaksa TS meng-instantiate tipe
 * `Schema<...>` yang ukurannya sangat besar dan membuat `tsc` OOM.
 */
function applyIndexes<T>(target: T, indexes: IndexMap[]): T {
  if (!indexes.length) return target;
  const m = target as unknown as { schema: { index: (spec: IndexMap) => void } };
  for (const index of indexes) m.schema.index(index);
  return target;
}

export function defineModel<T>(name: string, collection: string, fields: FieldMap, indexes: IndexMap[] = []) {
  const definition = {
    _id: { type: String, required: true, default: () => randomUUID() },
    ...fields,
  } as SchemaDefinition;

  return applyIndexes(model<T>(name, new Schema(definition, { collection, versionKey: false })), indexes);
}

export type Infer<T> = T extends Model<infer U> ? U : never;
