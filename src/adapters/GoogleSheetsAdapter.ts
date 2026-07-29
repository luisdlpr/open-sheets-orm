/**
 * @file Google Sheets adapter implementation.
 * @module adapters/GoogleSheetsAdapter
 */

import type { Auth } from 'googleapis';
import { SheetsAdapter } from './SheetsAdapter';
import { GoogleAuthService } from '../services/GoogleAuthService';
import { GoogleSpreadsheetService } from '../services/GoogleSpreadsheetService';
import { GoogleWorksheetService } from '../services/GoogleWorksheetService';
import { GoogleRowService } from '../services/GoogleRowService';
import type { SpreadsheetInfo, SheetInfo } from '../types';

/**
 * Google Sheets implementation of the {@link SheetsAdapter} contract.
 *
 * Delegates to four internal services — authentication, spreadsheet
 * metadata, worksheet management, and row operations — each
 * responsible for a focused area of the Google Sheets API.
 *
 * @example
 * ```ts
 * import { GoogleSheetsAdapter } from 'open-sheets-orm';
 *
 * const adapter = new GoogleSheetsAdapter(credentials, 'spreadsheet-id');
 * await adapter.connect();
 *
 * const info = await adapter.getSpreadsheet();
 * const rows = await adapter.readSheet();
 *
 * await adapter.disconnect();
 * ```
 */
export class GoogleSheetsAdapter extends SheetsAdapter {
  private authService: GoogleAuthService;
  private spreadsheetService!: GoogleSpreadsheetService;
  private worksheetService!: GoogleWorksheetService;
  private rowService!: GoogleRowService;

  /**
   * @param credentials - Google service account credentials (JWT) or
   *   external account credentials.
   * @param spreadsheetId - The unique ID of the target spreadsheet.
   * @param sheetName - The default sheet to operate on. When omitted,
   *   the first sheet is used.
   */
  constructor(
    credentials: Auth.JWTInput,
    spreadsheetId: string,
    sheetName?: string,
  ) {
    super({ spreadsheetId, sheetName });
    this.authService = new GoogleAuthService(credentials);
  }

  /**
   * Authenticates and initializes all internal services.
   *
   * Must be called before any other adapter method.
   */
  async connect(): Promise<void> {
    const client = await this.authService.authenticate();
    this.spreadsheetService = new GoogleSpreadsheetService(client);
    this.worksheetService = new GoogleWorksheetService(client);
    this.rowService = new GoogleRowService(client);
    this._connected = true;
  }

  /**
   * Releases resources held by this adapter.
   *
   * The Google Sheets API does not require explicit cleanup.
   * Service references are preserved for reuse on next connect.
   */
  async disconnect(): Promise<void> {
    this._connected = false;
  }

  /**
   * Retrieves metadata for the configured spreadsheet.
   *
   * @returns The spreadsheet's title, URL, and contained sheet summaries.
   */
  async getSpreadsheet(): Promise<SpreadsheetInfo> {
    this.ensureConnected('getSpreadsheet');
    return this.spreadsheetService.get(this.config.spreadsheetId);
  }

  /**
   * Creates a new sheet (tab) within the configured spreadsheet.
   *
   * @param title - The title for the new sheet.
   * @returns Metadata for the newly created sheet.
   */
  async createSheet(title: string): Promise<SheetInfo> {
    this.ensureConnected('createSheet');
    return this.worksheetService.create(this.config.spreadsheetId, title);
  }

  /**
   * Ensures a sheet exists, creating it if missing.
   *
   * @param sheetName - The title of the sheet to ensure exists.
   * @returns Metadata for the sheet.
   */
  async ensureSheet(sheetName: string): Promise<SheetInfo> {
    this.ensureConnected('ensureSheet');
    return this.worksheetService.ensure(this.config.spreadsheetId, sheetName);
  }

  /**
   * Deletes a sheet (tab) from the configured spreadsheet.
   *
   * @param sheetName - The title of the sheet to delete.
   */
  async deleteSheet(sheetName: string): Promise<void> {
    this.ensureConnected('deleteSheet');
    return this.worksheetService.delete(this.config.spreadsheetId, sheetName);
  }

  /**
   * Reads the header row from the specified (or default) sheet.
   *
   * @param sheetName - The sheet to read from. Falls back to the
   *   sheet name provided at construction time.
   * @returns An array of header cell values.
   */
  async getHeaders(sheetName?: string): Promise<string[]> {
    this.ensureConnected('getHeaders');
    return this.worksheetService.getHeaders(
      this.config.spreadsheetId,
      sheetName ?? this.config.sheetName,
    );
  }

  /**
   * Writes header values to row 1 of the specified (or default) sheet.
   *
   * @param headers - The header values to write.
   * @param sheetName - The target sheet. Falls back to the sheet
   *   name provided at construction time.
   */
  async writeHeaders(headers: string[], sheetName?: string): Promise<void> {
    this.ensureConnected('writeHeaders');
    return this.worksheetService.writeHeaders(
      this.config.spreadsheetId,
      headers,
      sheetName ?? this.config.sheetName,
    );
  }

  /**
   * Reads all data rows from the specified (or default) sheet,
   * mapped to objects keyed by header values.
   *
   * @typeParam TRow - The shape of each returned row object.
   * @param sheetName - The sheet to read from. Falls back to the
   *   sheet name provided at construction time.
   * @returns An array of row objects keyed by header values.
   */
  async readSheet<T extends Record<string, string> = Record<string, string>>(
    sheetName?: string,
  ): Promise<T[]> {
    this.ensureConnected('readSheet');
    return this.rowService.read<T>(
      this.config.spreadsheetId,
      sheetName ?? this.config.sheetName,
    );
  }

  /**
   * Appends a new row after the last existing row in the sheet.
   *
   * @param row - The cell values for the new row.
   * @param sheetName - The target sheet. Falls back to the sheet
   *   name provided at construction time.
   */
  async appendRow(row: unknown[], sheetName?: string): Promise<void> {
    this.ensureConnected('appendRow');
    return this.rowService.append(
      this.config.spreadsheetId,
      row,
      sheetName ?? this.config.sheetName,
    );
  }

  /**
   * Updates an existing row by its zero-based data index.
   *
   * @param rowIndex - Zero-based index of the row to update.
   * @param row - The new cell values for the row.
   * @param sheetName - The target sheet. Falls back to the sheet
   *   name provided at construction time.
   */
  async updateRow(
    rowIndex: number,
    row: unknown[],
    sheetName?: string,
  ): Promise<void> {
    this.ensureConnected('updateRow');
    return this.rowService.update(
      this.config.spreadsheetId,
      rowIndex,
      row,
      sheetName ?? this.config.sheetName,
    );
  }

  /**
   * Deletes a row by its zero-based data index.
   *
   * @param rowIndex - Zero-based index of the row to delete.
   * @param sheetName - The target sheet. Falls back to the sheet
   *   name provided at construction time.
   */
  async deleteRow(rowIndex: number, sheetName?: string): Promise<void> {
    this.ensureConnected('deleteRow');
    return this.rowService.delete(
      this.config.spreadsheetId,
      rowIndex,
      sheetName ?? this.config.sheetName,
    );
  }
}
