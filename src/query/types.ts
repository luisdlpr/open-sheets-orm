/**
 * @file Type definitions for the query engine.
 * @module query/types
 */

/**
 * A set of field-value pairs used to identify records in query operations.
 * Each key is a field name and the value is the value to match against.
 */
export type WhereClause = Record<string, unknown>;
