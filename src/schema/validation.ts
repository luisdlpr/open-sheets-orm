/**
 * @file Schema definition validation logic.
 * @module open-sheets-orm/schema
 */

import type { FieldBuilder } from './FieldBuilder';

/**
 * Validates a schema definition and throws on any violation.
 *
 * @param definitions - Raw model definitions from user code.
 * @throws {SchemaValidationError} When a validation rule is violated.
 */
export function validateSchema(
  definitions: Record<string, Record<string, FieldBuilder>>,
): void {
  // Validation implementation pending
}
