import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleSpreadsheetService } from '../src/services/GoogleSpreadsheetService';
import { GOOGLE_SHEETS_BASE_URL } from '../src/constants';
import type { sheets_v4 } from 'googleapis';

function createMockSheets() {
  return {
    spreadsheets: {
      get: vi.fn(),
    },
  } as unknown as sheets_v4.Sheets;
}

describe('GoogleSpreadsheetService', () => {
  let mock: ReturnType<typeof createMockSheets>;
  let service: GoogleSpreadsheetService;

  beforeEach(() => {
    mock = createMockSheets();
    service = new GoogleSpreadsheetService(mock);
  });

  it('returns mapped SpreadsheetInfo from API response', async () => {
    const spreadsheetId = 'abc-123';

    vi.mocked(mock.spreadsheets.get).mockResolvedValue({
      data: {
        spreadsheetId,
        properties: { title: 'My Spreadsheet' },
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: 'Sheet1',
              gridProperties: { rowCount: 100, columnCount: 26 },
            },
          },
          {
            properties: {
              sheetId: 1,
              title: 'Data',
              gridProperties: { rowCount: 50, columnCount: 10 },
            },
          },
        ],
      },
    } as never);

    const result = await service.get(spreadsheetId);

    expect(result).toEqual({
      id: spreadsheetId,
      title: 'My Spreadsheet',
      url: `${GOOGLE_SHEETS_BASE_URL}${spreadsheetId}`,
      sheets: [
        { id: 0, title: 'Sheet1', rowCount: 100, columnCount: 26 },
        { id: 1, title: 'Data', rowCount: 50, columnCount: 10 },
      ],
    });
  });

  it('calls spreadsheets.get with the given ID', async () => {
    vi.mocked(mock.spreadsheets.get).mockResolvedValue({
      data: {
        spreadsheetId: 'x',
        properties: { title: 'T' },
        sheets: [],
      },
    } as never);

    await service.get('x');

    expect(mock.spreadsheets.get).toHaveBeenCalledWith({ spreadsheetId: 'x' });
  });
});
