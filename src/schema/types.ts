/**
 * @file Metadata interfaces and type unions for the schema compiler.
 * @module open-sheets-orm/schema
 */

export type SupportedFieldType =
  'string' | 'number' | 'boolean' | 'date' | 'json';

export interface FieldMetadata {
  type: SupportedFieldType;
  primaryKey: boolean;
  unique: boolean;
  optional: boolean;
  defaultValue?: unknown;
}

export interface ModelMetadata {
  name: string;
  fields: Record<string, FieldMetadata>;
}

export interface SchemaMetadata {
  models: Record<string, ModelMetadata>;
}
