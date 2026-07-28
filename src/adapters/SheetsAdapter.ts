/**
 * @file Abstract base class for sheets adapter implementations.
 * @module adapters/SheetsAdapter
 */

import type { SheetConfig, SpreadsheetInfo, SheetInfo } from '../types';
import { ConnectionError } from '../errors';

/**
 * Abstract base class defining the contract for sheets adapter implementations.
 *
 * Subclasses must implement all abstract methods to provide
 * concrete spreadsheet operations (connection, metadata, sheet management,
 * and row-level CRUD).
 *
 * @example
 * ```ts
 * const adapter = new GoogleSheetsAdapter(credentials, 'id');
 * await adapter.connect();
 * const data = await adapter.readSheet<MyRow>();
 * ```
 */
export abstract class SheetsAdapter {
  /** The spreadsheet configuration for this adapter instance. */
  protected config: SheetConfig;

  /**
   * Whether the adapter has been successfully connected.
   *
   * Set to `true` by {@link connect} and `false` by {@link disconnect}.
   * Checked in {@link ensureConnected} before every data operation.
   */
  protected _connected = false;

  /**
   * @param config - Configuration identifying the target spreadsheet
   *   and optional default sheet name.
   */
  constructor(config: SheetConfig) {
    this.config = config;
  }

  /**
   * Establishes a connection with the underlying spreadsheet API.
   *
   * Must be called before any other method. Implementations should
   * initialize authentication and any required API clients.
   */
  abstract connect(): Promise<void>;

  /**
   * Releases resources held by the adapter.
   *
   * After calling {@link disconnect}, subsequent operations may throw
   * until {@link connect} is called again.
   */
  abstract disconnect(): Promise<void>;

  /**
   * Guards data-access methods against being called before {@link connect}.
   *
   * @param methodName - The name of the calling method, included in
   *   the error message for diagnostic clarity.
   * @throws {ConnectionError} If the adapter has not been connected.
   */
  protected ensureConnected(methodName: string): void {
    if (!this._connected) {
      throw new ConnectionError(
        `Cannot call ${methodName} — you must await adapter.connect() first`,
      );
    }
  }

  /**
   * Retrieves metadata for the spreadsheet, including its title,
   * URL, and contained sheets.
   *
   * @returns The spreadsheet metadata including sheet summaries.
   */
  abstract getSpreadsheet(): Promise<SpreadsheetInfo>;

  /**
   * Creates a new sheet (tab) within the spreadsheet.
   *
   * @param title - The title for the new sheet. Must be unique within
   *   the spreadsheet.
   * @returns Metadata for the newly created sheet.
   */
  abstract createSheet(title: string): Promise<SheetInfo>;

  /**
   * Ensures a sheet exists, creating it if missing.
   *
   * When the sheet already exists this is a no-op that returns its
   * metadata. When it does not exist, a new sheet (tab) is created
   * with the given title.
   *
   * @param sheetName - The title of the sheet to ensure exists.
   * @returns Metadata for the sheet.
   */
  abstract ensureSheet(sheetName: string): Promise<SheetInfo>;

  /**
   * Deletes a sheet (tab) from the spreadsheet by its title.
   *
   * @param sheetName - The title of the sheet to delete.
   * @throws {SheetNotFoundError} If a sheet with the given name does
   *   not exist.
   */
  abstract deleteSheet(sheetName: string): Promise<void>;

  /**
   * Reads the header row (row 1) from the specified sheet.
   *
   * @param sheetName - The sheet to read headers from. When omitted,
   *   the default sheet from {@link SheetConfig} is used.
   * @returns An array of header cell values.
   */
  abstract getHeaders(sheetName?: string): Promise<string[]>;

  /**
   * Writes header values to row 1 of the specified sheet.
   *
   * Overwrites any existing content in the header row.
   *
   * @param headers - The header values to write.
   * @param sheetName - The target sheet. When omitted, the default
   *   sheet from {@link SheetConfig} is used.
   */
  abstract writeHeaders(headers: string[], sheetName?: string): Promise<void>;

  /**
   * Reads all data rows from the specified sheet, mapped to objects
   * using the header row as keys.
   *
   * @param sheetName - The sheet to read from. When omitted, the
   *   default sheet from {@link SheetConfig} is used.
   * @returns An array of row objects keyed by header values.
   */
  abstract readSheet<T extends Record<string, string> = Record<string, string>>(
    sheetName?: string,
  ): Promise<T[]>;

  /**
   * Appends a new row after the last existing row in the sheet.
   *
   * @param row - The cell values for the new row.
   * @param sheetName - The target sheet. When omitted, the default
   *   sheet from {@link SheetConfig} is used.
   */
  abstract appendRow(row: unknown[], sheetName?: string): Promise<void>;

  /**
   * Updates an existing row by its zero-based data index.
   *
   * Row index 0 refers to the first data row (the row immediately
   * after the header row).
   *
   * @param rowIndex - Zero-based index of the row to update.
   * @param row - The new cell values for the row.
   * @param sheetName - The target sheet. When omitted, the default
   *   sheet from {@link SheetConfig} is used.
   */
  abstract updateRow(
    rowIndex: number,
    row: unknown[],
    sheetName?: string,
  ): Promise<void>;

  /**
   * Deletes a row by its zero-based data index.
   *
   * Row index 0 refers to the first data row (the row immediately
   * after the header row). Rows below the deleted row shift up.
   *
   * @param rowIndex - Zero-based index of the row to delete.
   * @param sheetName - The target sheet. When omitted, the default
   *   sheet from {@link SheetConfig} is used.
   */
  abstract deleteRow(rowIndex: number, sheetName?: string): Promise<void>;
}
