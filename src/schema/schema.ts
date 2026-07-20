/**
 * @file Entry point for schema compilation.
 * @module open-sheets-orm/schema
 */

import { FieldBuilder } from './FieldBuilder';
import type { FieldMetadata, SchemaMetadata } from './types';
import { validateSchema } from './validation';

/**
 * Compiles a schema definition into a normalized metadata object.
 *
 * @param definitions - Raw model definitions from user code.
 * @returns The compiled schema metadata.
 * @throws {SchemaValidationError} When the definition violates validation rules.
 *
 * @example
 * ```ts
 * const meta = schema({
 *   User: {
 *     id:    field.string().primaryKey(),
 *     email: field.string().unique(),
 *     name:  field.string().optional(),
 *     age:   field.number().optional().default(0),
 *   },
 * });
 * ```
 */
export function schema(
  definitions: Record<string, Record<string, FieldBuilder>>,
): SchemaMetadata {
  validateSchema(definitions);

  const models: Record<
    string,
    { name: string; fields: Record<string, FieldMetadata> }
  > = {};

  for (const [modelName, fieldBuilders] of Object.entries(definitions)) {
    const fields: Record<string, FieldMetadata> = {};

    for (const [fieldName, builder] of Object.entries(fieldBuilders)) {
      fields[fieldName] = builder.build();
    }

    models[modelName] = {
      name: modelName,
      fields,
    };
  }

  return { models };
}
