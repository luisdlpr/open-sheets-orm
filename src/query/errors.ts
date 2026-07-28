/**
 * @file Custom error classes for the query engine layer.
 * @module query/errors
 */

import { SheetsError } from '../errors';

/**
 * Thrown when a referenced model does not exist in the compiled schema.
 */
export class ModelNotFoundError extends SheetsError {
  constructor(modelName: string) {
    super(`Model "${modelName}" not found`);
    this.name = 'ModelNotFoundError';
  }
}

/**
 * Thrown when input data fails schema validation during
 * create or update operations.
 */
export class ValidationError extends SheetsError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Thrown when a create or update operation would violate a uniqueness
 * constraint on a primary key or unique-flagged field.
 */
export class UniqueConstraintError extends SheetsError {
  constructor(modelName: string, fieldName: string, value: unknown) {
    super(
      `Unique constraint violation in "${modelName}": field "${fieldName}" already has value ${JSON.stringify(value)}`,
    );
    this.name = 'UniqueConstraintError';
  }
}

/**
 * Thrown when a query operation cannot find a record matching
 * the supplied where clause.
 */
export class RecordNotFoundError extends SheetsError {
  constructor(modelName: string, where: Record<string, unknown>) {
    const conditions = Object.entries(where)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');
    super(`Record not found in "${modelName}" matching { ${conditions} }`);
    this.name = 'RecordNotFoundError';
  }
}
