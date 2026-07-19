/**
 * @file Custom error classes for the sheets adapter layer.
 * @module errors
 */

/**
 * Base error class for all sheets adapter errors.
 *
 * All domain-specific errors extend this class, allowing callers
 * to catch all adapter errors with a single `instanceof` check.
 */
export class SheetsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'SheetsError';
  }
}

/**
 * Thrown when the adapter fails to authenticate or establish a connection
 * with the underlying spreadsheet API.
 */
export class ConnectionError extends SheetsError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ConnectionError';
  }
}

/**
 * Thrown when a referenced sheet (tab) cannot be found in the spreadsheet.
 */
export class SheetNotFoundError extends SheetsError {
  constructor(sheetName: string) {
    super(`Sheet "${sheetName}" not found`);
    this.name = 'SheetNotFoundError';
  }
}

/**
 * Thrown when a row operation targets a row index that does not exist
 * or contains no data.
 */
export class RowNotFoundError extends SheetsError {
  constructor(rowIndex: number) {
    super(`Row at index ${rowIndex} not found`);
    this.name = 'RowNotFoundError';
  }
}
