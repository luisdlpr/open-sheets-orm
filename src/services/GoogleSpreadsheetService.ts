/**
 * @file Service for retrieving spreadsheet-level metadata.
 * @module services/GoogleSpreadsheetService
 */

import type { sheets_v4 } from 'googleapis';
import type { SpreadsheetInfo } from '../types';
import { GOOGLE_SHEETS_BASE_URL } from '../constants';

/**
 * Fetches metadata about a Google Sheets spreadsheet.
 *
 * Translates the raw Google API response into the adapter's
 * {@link SpreadsheetInfo} type.
 *
 * @example
 * ```ts
 * const service = new GoogleSpreadsheetService(sheetsClient);
 * const info = await service.get('spreadsheet-id');
 * console.log(info.sheets);
 * ```
 */
export class GoogleSpreadsheetService {
  constructor(private readonly sheets: sheets_v4.Sheets) {}

  /**
   * Retrieves metadata for the given spreadsheet.
   *
   * @param spreadsheetId - The unique ID of the spreadsheet.
   * @returns The spreadsheet's title, URL, and sheet summaries.
   */
  async get(spreadsheetId: string): Promise<SpreadsheetInfo> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
    });

    const { spreadsheetId: id, properties, sheets } = response.data;

    return {
      id: id!,
      title: properties!.title!,
      url: `${GOOGLE_SHEETS_BASE_URL}${id}`,
      sheets: sheets!.map((sheet) => ({
        id: sheet.properties!.sheetId!,
        title: sheet.properties!.title!,
        rowCount: sheet.properties!.gridProperties!.rowCount!,
        columnCount: sheet.properties!.gridProperties!.columnCount!,
      })),
    };
  }
}
