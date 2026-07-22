/**
 * @file Type definitions for the query engine.
 * @module query/types
 */

/**
 * A set of field-value pairs used to identify records in query operations.
 * Each key is a field name and the value is the value to match against.
 */
export type WhereClause = Record<string, unknown>;

/**
 * Options for the {@link Database.findMany} query.
 */
export interface FindManyOptions {
  /** Field-value pairs to filter records by (all conditions must match). */
  where?: WhereClause;

  /** Number of records to skip before returning results. */
  skip?: number;

  /** Maximum number of records to return. */
  limit?: number;
}
