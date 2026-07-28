/**
 * @file In-memory mock implementation of SheetsAdapter for testing.
 * @module tests/helpers/MockAdapter
 */

import { SheetsAdapter } from '../../src/adapters/SheetsAdapter';
import type { SheetConfig, SpreadsheetInfo, SheetInfo } from '../../src/types';

interface SheetData {
  headers: string[];
  rows: string[][];
}

/**
 * An in-memory mock adapter that stores sheet data as arrays of strings.
 *
 * Call {@link setData} before a test to seed the adapter with headers and
 * rows. After operations like `appendRow` / `updateRow` / `deleteRow` the
 * internal state is mutated, so you can assert final state via
 * {@link readSheet}.
 *
 * @example
 * ```ts
 * const adapter = new MockAdapter();
 * adapter.setData('Users', ['id', 'name'], [['1', 'Alice']]);
 * const rows = await adapter.readSheet('Users');
 * ```
 */
export class MockAdapter extends SheetsAdapter {
  private sheets: Record<string, SheetData> = {};

  constructor(config?: SheetConfig) {
    super(config ?? { spreadsheetId: 'mock-spreadsheet' });
  }

  /**
   * Seeds the adapter with headers and data rows for a sheet.
   *
   * @param sheetName - The name of the sheet to populate.
   * @param headers - The column header values (row 1).
   * @param rows - The data rows (each inner array is one row of cell values).
   */
  setData(sheetName: string, headers: string[], rows: string[][]): void {
    this.sheets[sheetName] = { headers, rows: rows.map((r) => [...r]) };
  }

  private sheet(name?: string): SheetData | undefined {
    return this.sheets[name ?? this.config.sheetName ?? 'Sheet1'];
  }

  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}

  async getSpreadsheet(): Promise<SpreadsheetInfo> {
    return {
      id: this.config.spreadsheetId,
      title: 'Mock Spreadsheet',
      url: 'https://example.com',
      sheets: Object.entries(this.sheets).map(([title], i) => ({
        id: i,
        title,
        rowCount: this.sheets[title].rows.length + 1,
        columnCount: this.sheets[title].headers.length,
      })),
    };
  }

  async createSheet(title: string): Promise<SheetInfo> {
    if (!this.sheets[title]) {
      this.sheets[title] = { headers: [], rows: [] };
    }
    return {
      id: Object.keys(this.sheets).length - 1,
      title,
      rowCount: 1,
      columnCount: 0,
    };
  }

  async ensureSheet(sheetName: string): Promise<SheetInfo> {
    if (this.sheets[sheetName]) {
      const s = this.sheets[sheetName];
      return {
        id: Object.keys(this.sheets).indexOf(sheetName),
        title: sheetName,
        rowCount: s.rows.length + 1,
        columnCount: s.headers.length,
      };
    }
    return this.createSheet(sheetName);
  }

  async deleteSheet(sheetName: string): Promise<void> {
    delete this.sheets[sheetName];
  }

  async getHeaders(sheetName?: string): Promise<string[]> {
    const s = this.sheet(sheetName);
    return s ? [...s.headers] : [];
  }

  async writeHeaders(headers: string[], sheetName?: string): Promise<void> {
    const name = sheetName ?? this.config.sheetName ?? 'Sheet1';
    if (!this.sheets[name]) {
      this.sheets[name] = { headers: [], rows: [] };
    }
    this.sheets[name].headers = [...headers];
  }

  async readSheet<T extends Record<string, string> = Record<string, string>>(
    sheetName?: string,
  ): Promise<T[]> {
    const s = this.sheet(sheetName);
    if (!s) return [];
    return s.rows.map((row) => {
      const obj: Record<string, string> = {};
      s.headers.forEach((header, i) => {
        obj[header] = row[i] ?? '';
      });
      return obj as T;
    });
  }

  async appendRow(row: unknown[], sheetName?: string): Promise<void> {
    const name = sheetName ?? this.config.sheetName ?? 'Sheet1';
    const s = this.sheets[name];
    if (s) {
      s.rows.push(row.map((v) => String(v)));
    }
  }

  async updateRow(
    rowIndex: number,
    row: unknown[],
    sheetName?: string,
  ): Promise<void> {
    const name = sheetName ?? this.config.sheetName ?? 'Sheet1';
    const s = this.sheets[name];
    if (s && rowIndex >= 0 && rowIndex < s.rows.length) {
      s.rows[rowIndex] = row.map((v) => String(v));
    }
  }

  async deleteRow(rowIndex: number, sheetName?: string): Promise<void> {
    const name = sheetName ?? this.config.sheetName ?? 'Sheet1';
    const s = this.sheets[name];
    if (s && rowIndex >= 0 && rowIndex < s.rows.length) {
      s.rows.splice(rowIndex, 1);
    }
  }
}
