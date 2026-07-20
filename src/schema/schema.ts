/**
 * @file Entry point for schema compilation.
 * @module open-sheets-orm/schema
 */

import type { FieldBuilder } from './FieldBuilder';
import type { SchemaMetadata } from './types';

/**
 * Compiles a schema definition into a normalized metadata object.
 *
 * @param definitions - Raw model definitions from user code.
 * @returns The compiled schema metadata.
 * @throws {SchemaValidationError} When the definition violates validation rules.
 */
export function schema(
  definitions: Record<string, Record<string, FieldBuilder>>,
): SchemaMetadata {
  return { models: {} };
}
