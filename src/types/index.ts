/**
 * @file Type definitions for the sheets adapter layer.
 * @module types
 */

import type { Auth } from 'googleapis';

/** Configuration for initializing a sheets adapter instance. */
export interface SheetConfig {
  /** The unique identifier of the target spreadsheet. */
  spreadsheetId: string;

  /** The default sheet name to operate on. When omitted, the first sheet is used. */
  sheetName?: string;
}

/** Parameters for initializing the generated client with a Google Sheets provider. */
export interface ClientInitializerGoogle {
  /** Google service account credentials (JWT) or external account credentials. */
  credentials: Auth.JWTInput;

  /** The unique ID of the target spreadsheet. */
  sheetId: string;

  /** The spreadsheet provider identifier. Must be "google". */
  provider: 'google';
}

/** Metadata for a spreadsheet and its contained sheets. */
export interface SpreadsheetInfo {
  /** The unique identifier of the spreadsheet. */
  id: string;

  /** The human-readable title of the spreadsheet. */
  title: string;

  /** The full URL to open the spreadsheet in Google Sheets. */
  url: string;

  /** Metadata for each sheet (tab) within the spreadsheet. */
  sheets: SheetInfo[];
}

/** Metadata for an individual sheet (tab) within a spreadsheet. */
export interface SheetInfo {
  /** The numeric ID of the sheet. */
  id: number;

  /** The human-readable title of the sheet. */
  title: string;

  /** Total number of rows in the sheet. */
  rowCount: number;

  /** Total number of columns in the sheet. */
  columnCount: number;
}
