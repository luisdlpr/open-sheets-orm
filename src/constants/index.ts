/** Google Sheets API version used for all requests. */
export const GOOGLE_SHEETS_VERSION = 'v4' as const;

/** OAuth2 scopes required for full Google Sheets read/write access. */
export const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
] as const;

/** Base URL for constructing Google Sheets spreadsheet links. */
export const GOOGLE_SHEETS_BASE_URL =
  'https://docs.google.com/spreadsheets/d/' as const;

/** Input option indicating values should be stored as raw strings. */
export const VALUE_INPUT_OPTION_RAW = 'RAW' as const;

/** Insert data option that shifts existing rows down to make room. */
export const INSERT_DATA_OPTION_INSERT_ROWS = 'INSERT_ROWS' as const;

/** Dimension identifier for row-based operations. */
export const DIMENSION_ROWS = 'ROWS' as const;

/** Range string targeting row 1 (header row). */
export const HEADER_ROW_RANGE = '1:1' as const;

/** Range string targeting all data rows from row 2 onward. */
export const DATA_START_RANGE = 'A2:ZZ' as const;

/** Range string targeting all columns (no row constraint). */
export const FULL_COLUMN_RANGE = 'A:ZZ' as const;

/** Google Sheets API field mask for spreadsheet properties. */
export const FIELDS_PROPERTIES = 'sheets.properties' as const;

/** Google Sheets API field mask for sheet titles only. */
export const FIELDS_SHEET_TITLES = 'sheets.properties.title' as const;
