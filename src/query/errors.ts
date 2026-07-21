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
