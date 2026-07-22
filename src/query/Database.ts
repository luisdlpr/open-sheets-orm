/**
 * @file High-level query engine for open-sheets-orm.
 * @module query/Database
 */

import type { SchemaMetadata, FieldMetadata } from '../schema';
import type { SheetsAdapter } from '../adapters/SheetsAdapter';
import type { WhereClause, FindManyOptions } from './types';
import { ModelNotFoundError, RecordNotFoundError } from './errors';
import { validateInput } from './validation';

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
   * Retrieves all records for the given model, with optional filtering
   * and pagination.
   *
   * @param modelName - The name of the model to query.
   * @param options - Optional filtering and pagination options.
   * @returns An array of record objects keyed by field names.
   * @throws {ModelNotFoundError} If the model does not exist in the schema.
   */
  async findMany(
    modelName: string,
    options?: FindManyOptions,
  ): Promise<Record<string, unknown>[]> {
    void options;
    const model = this.schema.models[modelName];
    if (!model) {
      throw new ModelNotFoundError(modelName);
    }

    const rawRows = await this.adapter.readSheet(modelName);
    return rawRows.map((rawRow) => this.parseRow(model.fields, rawRow));
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
    const model = this.schema.models[modelName];
    if (!model) {
      throw new ModelNotFoundError(modelName);
    }

    const rawRows = await this.adapter.readSheet(modelName);
    const parsedRows = rawRows.map((rawRow) =>
      this.parseRow(model.fields, rawRow),
    );

    const match = parsedRows.find((row) => this.matchesWhere(row, where));
    if (!match) {
      throw new RecordNotFoundError(modelName, where);
    }

    return match;
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
    const model = this.schema.models[modelName];
    if (!model) {
      throw new ModelNotFoundError(modelName);
    }

    validateInput('create', model.fields, data);

    const headers = await this.adapter.getHeaders(modelName);

    const row: unknown[] = headers.map((header) => {
      if (header in data) {
        return data[header];
      }
      const field = model.fields[header];
      if (field?.defaultValue !== undefined) {
        return field.defaultValue;
      }
      return '';
    });

    await this.adapter.appendRow(row, modelName);

    const record: Record<string, unknown> = { ...data };
    for (const [fieldName, field] of Object.entries(model.fields)) {
      if (!(fieldName in record) && field.defaultValue !== undefined) {
        record[fieldName] = field.defaultValue;
      }
    }
    return record;
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
    const model = this.schema.models[modelName];
    if (!model) {
      throw new ModelNotFoundError(modelName);
    }

    validateInput('update', model.fields, data);

    const rawRows = await this.adapter.readSheet(modelName);
    const indexedRows = rawRows.map((rawRow, i) => ({
      row: this.parseRow(model.fields, rawRow),
      rawData: rawRow,
      index: i,
    }));

    const match = indexedRows.find((r) => this.matchesWhere(r.row, where));
    if (!match) {
      throw new RecordNotFoundError(modelName, where);
    }

    const headers = await this.adapter.getHeaders(modelName);

    const mergedRow: unknown[] = headers.map((header) => {
      if (header in data) {
        return data[header];
      }
      return match.rawData[header] ?? '';
    });

    await this.adapter.updateRow(match.index, mergedRow, modelName);

    return { ...match.row, ...data };
  }

  /**
   * Deletes a record matching the given where clause.
   *
   * @param modelName - The name of the model to delete from.
   * @param where - Field-value pairs identifying the record.
   * @throws {RecordNotFoundError} If no record matches the where clause.
   */
  async delete(modelName: string, where: WhereClause): Promise<void> {
    const model = this.schema.models[modelName];
    if (!model) {
      throw new ModelNotFoundError(modelName);
    }

    const rawRows = await this.adapter.readSheet(modelName);
    const indexedRows = rawRows.map((rawRow, i) => ({
      row: this.parseRow(model.fields, rawRow),
      index: i,
    }));

    const match = indexedRows.find((r) => this.matchesWhere(r.row, where));
    if (!match) {
      throw new RecordNotFoundError(modelName, where);
    }

    await this.adapter.deleteRow(match.index, modelName);
  }

  /**
   * Converts a raw row of string values into typed values using
   * the model's field metadata. Fields not defined in the schema
   * are omitted.
   *
   * @param fields - The field metadata map for the model.
   * @param rawRow - The raw string-valued row from the adapter.
   * @returns The parsed row with type-converted values.
   */
  private parseRow(
    fields: Record<string, FieldMetadata>,
    rawRow: Record<string, string>,
  ): Record<string, unknown> {
    const parsed: Record<string, unknown> = {};
    for (const [fieldName, metadata] of Object.entries(fields)) {
      const rawValue = rawRow[fieldName];
      if (rawValue === undefined || rawValue === '') {
        continue;
      }
      parsed[fieldName] = this.parseValue(rawValue, metadata.type);
    }
    return parsed;
  }

  /**
   * Parses a raw string value into the target type.
   *
   * @param rawValue - The string value from the sheet cell.
   * @param type - The target field type.
   * @returns The parsed value.
   */
  private parseValue(rawValue: string, type: FieldMetadata['type']): unknown {
    switch (type) {
      case 'string':
        return rawValue;
      case 'number':
        return Number(rawValue);
      case 'boolean':
        return rawValue === 'true' || rawValue === 'TRUE' || rawValue === '1';
      case 'date':
        return new Date(rawValue);
      case 'json':
        return JSON.parse(rawValue);
    }
  }

  /**
   * Checks whether a parsed row satisfies all conditions in the where clause.
   *
   * @param row - The parsed row to test.
   * @param where - The conditions to match.
   * @returns True if all where conditions match the row.
   */
  private matchesWhere(
    row: Record<string, unknown>,
    where: WhereClause,
  ): boolean {
    return Object.entries(where).every(
      ([key, value]) => key in row && row[key] === value,
    );
  }
}
