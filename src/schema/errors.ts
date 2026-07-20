/**
 * @file Error classes for the schema compiler.
 * @module open-sheets-orm/schema
 */

/**
 * Thrown when a schema definition violates a validation rule.
 *
 * Lives in a separate domain from `SheetsError` — schema validation
 * is a pure compile-time concern with no I/O.
 */
export class SchemaValidationError extends Error {
  override name = 'SchemaValidationError' as const;

  constructor(message: string) {
    super(message);
  }
}
