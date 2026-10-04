import { randomUUID } from "node:crypto";
import { Schema, type SchemaDefinition, model } from "mongoose";
export type FieldMap = Record<string, unknown>;
export function defineModelA<T>(name: string, collection: string, fields: FieldMap) {
  const definition = { _id: { type: String, required: true, default: () => randomUUID() }, ...fields } as SchemaDefinition;
  return model<T>(name, new Schema(definition, { collection, versionKey: false }));
}