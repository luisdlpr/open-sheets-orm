/**
 * @file Public API barrel export for open-sheets-orm.
 * @module open-sheets-orm
 */

export { SheetsAdapter } from './adapters/SheetsAdapter';
export { GoogleSheetsAdapter } from './adapters/GoogleSheetsAdapter';

export type { SheetConfig, SpreadsheetInfo, SheetInfo } from './types';

export {
  SheetsError,
  ConnectionError,
  SheetNotFoundError,
  RowNotFoundError,
} from './errors';

export {
  GOOGLE_SHEETS_VERSION,
  GOOGLE_SHEETS_SCOPES,
  GOOGLE_SHEETS_BASE_URL,
  VALUE_INPUT_OPTION_RAW,
  INSERT_DATA_OPTION_INSERT_ROWS,
  DIMENSION_ROWS,
  HEADER_ROW_RANGE,
  DATA_START_RANGE,
  FULL_COLUMN_RANGE,
  FIELDS_PROPERTIES,
  FIELDS_SHEET_TITLES,
} from './constants';
