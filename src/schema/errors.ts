/**
 * @file Error classes for the schema compiler.
 * @module open-sheets-orm/schema
 */

export class SchemaValidationError extends Error {
  override name = 'SchemaValidationError' as const;

  constructor(message: string) {
    super(message);
  }
}
