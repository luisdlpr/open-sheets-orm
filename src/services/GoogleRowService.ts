/**
 * @file Service for row-level CRUD operations on Google Sheets data.
 * @module services/GoogleRowService
 */

import type { sheets_v4 } from 'googleapis';
import { SheetNotFoundError, RowNotFoundError } from '../errors';
import {
  HEADER_ROW_RANGE,
  DATA_START_RANGE,
  FULL_COLUMN_RANGE,
  VALUE_INPUT_OPTION_RAW,
  INSERT_DATA_OPTION_INSERT_ROWS,
  DIMENSION_ROWS,
  FIELDS_SHEET_TITLES,
  FIELDS_PROPERTIES,
} from '../constants';

/**
 * Handles row-level read, create, update, and delete operations
 * within a Google Sheets spreadsheet.
 *
 * When no sheet name is provided, the first sheet in the spreadsheet
 * is used by default.
 *
 * @example
 * ```ts
 * const service = new GoogleRowService(sheetsClient);
 * const rows = await service.read('spreadsheet-id', 'Users');
 * await service.append('spreadsheet-id', ['Alice', 'alice@example.com'], 'Users');
 * ```
 */
export class GoogleRowService {
  constructor(private readonly sheets: sheets_v4.Sheets) {}

  /**
   * Builds a range string, optionally prefixed with a sheet name.
   *
   * @param base - The cell range (e.g. `'1:1'`, `'A2:ZZ'`).
   * @param sheetName - Optional sheet name to prefix the range.
   * @returns A range string like `'Sheet1!A2:ZZ'` or `'A2:ZZ'`.
   */
  private range(base: string, sheetName?: string): string {
    return sheetName ? `${sheetName}!${base}` : base;
  }

  /**
   * Resolves the target sheet name, falling back to the first sheet
   * when no name is provided.
   *
   * @param spreadsheetId - The spreadsheet to query.
   * @param sheetName - The explicit sheet name, or `undefined` to
   *   use the first sheet.
   * @returns The resolved sheet name.
   * @throws {SheetNotFoundError} If no sheets exist in the spreadsheet.
   */
  private async resolveSheetName(
    spreadsheetId: string,
    sheetName?: string,
  ): Promise<string> {
    if (sheetName) return sheetName;

    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: FIELDS_SHEET_TITLES,
    });

    const first = response.data.sheets?.[0]?.properties?.title;
    if (!first) throw new SheetNotFoundError('(default)');

    return first;
  }

  /**
   * Reads all data rows from the specified sheet, mapped to objects
   * keyed by header values.
   *
   * @typeParam TRow - The shape of each returned row object.
   * @param spreadsheetId - The spreadsheet to read from.
   * @param sheetName - The sheet to read from. When omitted, the
   *   first sheet is used.
   * @returns An array of row objects keyed by header values.
   * @throws {SheetNotFoundError} If the sheet does not exist.
   */
  async read<T extends Record<string, string> = Record<string, string>>(
    spreadsheetId: string,
    sheetName?: string,
  ): Promise<T[]> {
    const resolved = await this.resolveSheetName(spreadsheetId, sheetName);

    const headersResponse = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${resolved}!${HEADER_ROW_RANGE}`,
    });
    const headers: string[] = headersResponse.data.values?.[0] ?? [];

    const dataResponse = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${resolved}!${DATA_START_RANGE}`,
    });
    const rows = dataResponse.data.values ?? [];

    return rows.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      return obj as T;
    });
  }

  /**
   * Appends a new row after the last existing row in the sheet.
   *
   * @param spreadsheetId - The spreadsheet to append to.
   * @param row - The cell values for the new row.
   * @param sheetName - The target sheet. When omitted, the first
   *   sheet is used.
   */
  async append(
    spreadsheetId: string,
    row: unknown[],
    sheetName?: string,
  ): Promise<void> {
    const resolved = await this.resolveSheetName(spreadsheetId, sheetName);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${resolved}!${FULL_COLUMN_RANGE}`,
      valueInputOption: VALUE_INPUT_OPTION_RAW,
      insertDataOption: INSERT_DATA_OPTION_INSERT_ROWS,
      requestBody: { values: [row] },
    });
  }

  /**
   * Updates an existing row by its zero-based data index.
   *
   * Index 0 corresponds to the first data row (row 2 in the sheet,
   * immediately after the header row).
   *
   * @param spreadsheetId - The spreadsheet containing the row.
   * @param rowIndex - Zero-based index of the row to update.
   * @param row - The new cell values for the row.
   * @param sheetName - The target sheet. When omitted, the first
   *   sheet is used.
   */
  async update(
    spreadsheetId: string,
    rowIndex: number,
    row: unknown[],
    sheetName?: string,
  ): Promise<void> {
    const resolved = await this.resolveSheetName(spreadsheetId, sheetName);
    const sheetRow = rowIndex + 2;

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${resolved}!A${sheetRow}:ZZ${sheetRow}`,
      valueInputOption: VALUE_INPUT_OPTION_RAW,
      requestBody: { values: [row] },
    });
  }

  /**
   * Deletes a row by its zero-based data index.
   *
   * Validates that the target row exists before performing the delete.
   * Rows below the deleted row shift up.
   *
   * @param spreadsheetId - The spreadsheet containing the row.
   * @param rowIndex - Zero-based index of the row to delete.
   * @param sheetName - The target sheet. When omitted, the first
   *   sheet is used.
   * @throws {SheetNotFoundError} If the sheet cannot be found.
   * @throws {RowNotFoundError} If the row at the given index is empty.
   */
  async delete(
    spreadsheetId: string,
    rowIndex: number,
    sheetName?: string,
  ): Promise<void> {
    const resolved = await this.resolveSheetName(spreadsheetId, sheetName);

    const sheetResponse = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: FIELDS_PROPERTIES,
    });

    const sheet = sheetResponse.data.sheets?.find(
      (s) => s.properties?.title === resolved,
    );

    if (!sheet) throw new SheetNotFoundError(resolved);

    const sheetId = sheet.properties!.sheetId!;
    const startIndex = rowIndex + 1;
    const endIndex = startIndex + 1;

    const rowCheck = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${resolved}!A${startIndex + 1}:ZZ${startIndex + 1}`,
    });

    if (!rowCheck.data.values?.[0]) {
      throw new RowNotFoundError(rowIndex);
    }

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: DIMENSION_ROWS,
                startIndex,
                endIndex,
              },
            },
          },
        ],
      },
    });
  }
}
