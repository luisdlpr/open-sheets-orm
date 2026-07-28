/**
 * @file Service for managing sheets (tabs) and their headers.
 * @module services/GoogleWorksheetService
 */

import type { sheets_v4 } from 'googleapis';
import type { SheetInfo } from '../types';
import { SheetNotFoundError } from '../errors';
import {
  HEADER_ROW_RANGE,
  VALUE_INPUT_OPTION_RAW,
  FIELDS_PROPERTIES,
} from '../constants';

/**
 * Handles sheet-level operations within a Google Sheets spreadsheet,
 * including sheet creation and header row management.
 *
 * @example
 * ```ts
 * const service = new GoogleWorksheetService(sheetsClient);
 * const sheet = await service.create('spreadsheet-id', 'Users');
 * const headers = await service.getHeaders('spreadsheet-id', 'Users');
 * ```
 */
export class GoogleWorksheetService {
  constructor(private readonly sheets: sheets_v4.Sheets) {}

  /**
   * Builds a range string, optionally prefixed with a sheet name.
   *
   * @param base - The cell range (e.g. `'1:1'`, `'A1:Z10'`).
   * @param sheetName - Optional sheet name to prefix the range.
   * @returns A range string like `'Sheet1!1:1'` or `'1:1'`.
   */
  private range(base: string, sheetName?: string): string {
    return sheetName ? `${sheetName}!${base}` : base;
  }

  /**
   * Creates a new sheet (tab) within the spreadsheet.
   *
   * @param spreadsheetId - The spreadsheet to add the sheet to.
   * @param title - The title for the new sheet. Must be unique
   *   within the spreadsheet.
   * @returns Metadata for the newly created sheet.
   */
  async create(spreadsheetId: string, title: string): Promise<SheetInfo> {
    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });

    const props = response.data.replies![0].addSheet!.properties!;

    return {
      id: props.sheetId!,
      title: props.title!,
      rowCount: props.gridProperties!.rowCount!,
      columnCount: props.gridProperties!.columnCount!,
    };
  }

  /**
   * Ensures a sheet exists, creating it if missing.
   *
   * When the sheet already exists this is a no-op that returns its
   * metadata. When it does not exist, a new sheet (tab) is created.
   *
   * @param spreadsheetId - The spreadsheet to check or create in.
   * @param sheetName - The title of the sheet to ensure exists.
   * @returns Metadata for the sheet.
   */
  async ensure(spreadsheetId: string, sheetName: string): Promise<SheetInfo> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: FIELDS_PROPERTIES,
    });

    const existing = response.data.sheets?.find(
      (s) => s.properties?.title === sheetName,
    );

    if (existing) {
      const props = existing.properties!;
      return {
        id: props.sheetId!,
        title: props.title!,
        rowCount: props.gridProperties!.rowCount!,
        columnCount: props.gridProperties!.columnCount!,
      };
    }

    return this.create(spreadsheetId, sheetName);
  }

  /**
   * Deletes a sheet (tab) from the spreadsheet by its title.
   *
   * @param spreadsheetId - The spreadsheet containing the sheet.
   * @param sheetName - The title of the sheet to delete.
   * @throws {SheetNotFoundError} If a sheet with the given name
   *   does not exist.
   */
  async delete(spreadsheetId: string, sheetName: string): Promise<void> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: FIELDS_PROPERTIES,
    });

    const sheet = response.data.sheets?.find(
      (s) => s.properties?.title === sheetName,
    );

    if (!sheet) throw new SheetNotFoundError(sheetName);

    const sheetId = sheet.properties!.sheetId!;

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ deleteSheet: { sheetId } }],
      },
    });
  }

  /**
   * Reads the header row (row 1) from the specified sheet.
   *
   * @param spreadsheetId - The spreadsheet containing the sheet.
   * @param sheetName - The sheet to read from. When omitted,
   *   the API defaults to the first sheet.
   * @returns An array of header cell values.
   */
  async getHeaders(
    spreadsheetId: string,
    sheetName?: string,
  ): Promise<string[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: this.range(HEADER_ROW_RANGE, sheetName),
    });

    return response.data.values?.[0] ?? [];
  }

  /**
   * Writes header values to row 1 of the specified sheet.
   *
   * @param spreadsheetId - The spreadsheet containing the sheet.
   * @param headers - The header values to write.
   * @param sheetName - The target sheet. When omitted, the API
   *   defaults to the first sheet.
   */
  async writeHeaders(
    spreadsheetId: string,
    headers: string[],
    sheetName?: string,
  ): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: this.range(HEADER_ROW_RANGE, sheetName),
      valueInputOption: VALUE_INPUT_OPTION_RAW,
      requestBody: { values: [headers] },
    });
  }
}
