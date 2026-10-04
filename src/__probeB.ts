import { randomUUID } from "node:crypto";
import { Schema, type SchemaDefinition, model } from "mongoose";
export type FieldMap2 = Record<string, unknown>;
export type IndexMap2 = Record<string, 1 | -1>;
export function defineModelB<T>(name: string, collection: string, fields: FieldMap2, indexes: IndexMap2[] = []) {
  const definition = { _id: { type: String, required: true, default: () => randomUUID() }, ...fields } as SchemaDefinition;
  const schema = new Schema(definition, { collection, versionKey: false });
  const indexable = schema as unknown as { index: (spec: IndexMap2) => void };
  for (const index of indexes) indexable.index(index);
  return model<T>(name, schema);
}