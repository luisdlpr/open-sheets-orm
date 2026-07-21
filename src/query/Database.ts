/**
 * @file High-level query engine for open-sheets-orm.
 * @module query/Database
 */

import type { SchemaMetadata } from '../schema';
import type { SheetsAdapter } from '../adapters/SheetsAdapter';
import type { WhereClause } from './types';

/**
 * High-level query engine that translates ORM-style operations into
 * adapter-level spreadsheet operations.
 *
 * @example
 * ```ts
 * const db = new Database(schema, adapter);
 * const users = await db.findMany('User');
 * const user = await db.findUnique('User', { id: '1' });
 * ```
 */
export class Database {
  private schema: SchemaMetadata;
  private adapter: SheetsAdapter;

  /**
   * @param schema - The compiled schema definition containing model metadata.
   * @param adapter - The sheets adapter used for low-level spreadsheet I/O.
   */
  constructor(schema: SchemaMetadata, adapter: SheetsAdapter) {
    this.schema = schema;
    this.adapter = adapter;
  }

  /**
   * Retrieves all records for the given model.
   *
   * @param modelName - The name of the model to query.
   * @returns An array of record objects keyed by field names.
   */
  async findMany(modelName: string): Promise<Record<string, unknown>[]> {
    void modelName;
    throw new Error('Not implemented');
  }

  /**
   * Finds a single record matching the given where clause.
   *
   * @param modelName - The name of the model to query.
   * @param where - Field-value pairs identifying the record.
   * @returns The matching record.
   * @throws {RecordNotFoundError} If no record matches the where clause.
   */
  async findUnique(
    modelName: string,
    where: WhereClause,
  ): Promise<Record<string, unknown>> {
    void modelName;
    void where;
    throw new Error('Not implemented');
  }

  /**
   * Creates a new record in the given model.
   *
   * @param modelName - The name of the model to insert into.
   * @param data - The field values for the new record.
   * @returns The created record with any applied defaults.
   */
  async create(
    modelName: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    void modelName;
    void data;
    throw new Error('Not implemented');
  }

  /**
   * Updates a record matching the given where clause.
   *
   * @param modelName - The name of the model to update.
   * @param where - Field-value pairs identifying the record.
   * @param data - The field values to update.
   * @returns The updated record.
   * @throws {RecordNotFoundError} If no record matches the where clause.
   */
  async update(
    modelName: string,
    where: WhereClause,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    void modelName;
    void where;
    void data;
    throw new Error('Not implemented');
  }

  /**
   * Deletes a record matching the given where clause.
   *
   * @param modelName - The name of the model to delete from.
   * @param where - Field-value pairs identifying the record.
   * @throws {RecordNotFoundError} If no record matches the where clause.
   */
  async delete(modelName: string, where: WhereClause): Promise<void> {
    void modelName;
    void where;
    throw new Error('Not implemented');
  }
}
