import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleWorksheetService } from '../src/services/GoogleWorksheetService';
import {
  HEADER_ROW_RANGE,
  VALUE_INPUT_OPTION_RAW,
  FIELDS_PROPERTIES,
} from '../src/constants';
import { SheetNotFoundError } from '../src/errors';
import type { sheets_v4 } from 'googleapis';

function createMockSheets() {
  return {
    spreadsheets: {
      get: vi.fn(),
      batchUpdate: vi.fn(),
      values: {
        get: vi.fn(),
        update: vi.fn(),
      },
    },
  } as unknown as sheets_v4.Sheets;
}

describe('GoogleWorksheetService', () => {
  let mock: ReturnType<typeof createMockSheets>;
  let service: GoogleWorksheetService;

  beforeEach(() => {
    mock = createMockSheets();
    service = new GoogleWorksheetService(mock);
  });

  describe('create', () => {
    it('sends an addSheet request and returns SheetInfo', async () => {
      vi.mocked(mock.spreadsheets.batchUpdate).mockResolvedValue({
        data: {
          replies: [
            {
              addSheet: {
                properties: {
                  sheetId: 42,
                  title: 'New Sheet',
                  gridProperties: { rowCount: 1000, columnCount: 26 },
                },
              },
            },
          ],
        },
      } as never);

      const result = await service.create('spread-id', 'New Sheet');

      expect(mock.spreadsheets.batchUpdate).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        requestBody: {
          requests: [{ addSheet: { properties: { title: 'New Sheet' } } }],
        },
      });

      expect(result).toEqual({
        id: 42,
        title: 'New Sheet',
        rowCount: 1000,
        columnCount: 26,
      });
    });
  });

  describe('delete', () => {
    it('sends a deleteSheet request via batchUpdate', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: {
          sheets: [
            {
              properties: {
                sheetId: 5,
                title: 'Sheet1',
              },
            },
            {
              properties: {
                sheetId: 7,
                title: 'Data',
              },
            },
          ],
        },
      } as never);

      vi.mocked(mock.spreadsheets.batchUpdate).mockResolvedValue({} as never);

      await service.delete('spread-id', 'Sheet1');

      expect(mock.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        fields: FIELDS_PROPERTIES,
      });

      expect(mock.spreadsheets.batchUpdate).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        requestBody: {
          requests: [{ deleteSheet: { sheetId: 5 } }],
        },
      });
    });

    it('throws SheetNotFoundError when the sheet does not exist', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: {
          sheets: [
            {
              properties: {
                sheetId: 5,
                title: 'Sheet1',
              },
            },
          ],
        },
      } as never);

      await expect(service.delete('spread-id', 'NonExistent')).rejects.toThrow(
        SheetNotFoundError,
      );

      expect(mock.spreadsheets.batchUpdate).not.toHaveBeenCalled();
    });
  });

  describe('getHeaders', () => {
    it('reads row 1 and returns header values', async () => {
      vi.mocked(mock.spreadsheets.values.get).mockResolvedValue({
        data: { values: [['Name', 'Email', 'Age']] },
      } as never);

      const result = await service.getHeaders('spread-id', 'Users');

      expect(mock.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        range: 'Users!1:1',
      });

      expect(result).toEqual(['Name', 'Email', 'Age']);
    });

    it('omits sheet name prefix when sheetName is undefined', async () => {
      vi.mocked(mock.spreadsheets.values.get).mockResolvedValue({
        data: { values: [['A', 'B']] },
      } as never);

      await service.getHeaders('spread-id');

      expect(mock.spreadsheets.values.get).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        range: HEADER_ROW_RANGE,
      });
    });

    it('returns empty array when no headers exist', async () => {
      vi.mocked(mock.spreadsheets.values.get).mockResolvedValue({
        data: {},
      } as never);

      const result = await service.getHeaders('spread-id');

      expect(result).toEqual([]);
    });
  });

  describe('writeHeaders', () => {
    it('updates row 1 with the given headers', async () => {
      vi.mocked(mock.spreadsheets.values.update).mockResolvedValue({} as never);

      await service.writeHeaders('spread-id', ['A', 'B'], 'Sheet1');

      expect(mock.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        range: 'Sheet1!1:1',
        valueInputOption: VALUE_INPUT_OPTION_RAW,
        requestBody: { values: [['A', 'B']] },
      });
    });

    it('omits sheet name prefix when sheetName is undefined', async () => {
      vi.mocked(mock.spreadsheets.values.update).mockResolvedValue({} as never);

      await service.writeHeaders('spread-id', ['X']);

      expect(mock.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({ range: HEADER_ROW_RANGE }),
      );
    });
  });
});
