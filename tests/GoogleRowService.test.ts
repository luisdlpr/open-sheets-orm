import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleRowService } from '../src/services/GoogleRowService';
import { SheetNotFoundError, RowNotFoundError } from '../src/errors';
import {
  VALUE_INPUT_OPTION_RAW,
  INSERT_DATA_OPTION_INSERT_ROWS,
  DIMENSION_ROWS,
  FIELDS_SHEET_TITLES,
} from '../src/constants';
import type { sheets_v4 } from 'googleapis';

function createMockSheets() {
  return {
    spreadsheets: {
      get: vi.fn(),
      batchUpdate: vi.fn(),
      values: {
        get: vi.fn(),
        update: vi.fn(),
        append: vi.fn(),
      },
    },
  } as unknown as sheets_v4.Sheets;
}

describe('GoogleRowService', () => {
  let mock: ReturnType<typeof createMockSheets>;
  let service: GoogleRowService;

  beforeEach(() => {
    mock = createMockSheets();
    service = new GoogleRowService(mock);
  });

  describe('read', () => {
    it('maps data rows to objects keyed by headers', async () => {
      const get = vi.mocked(mock.spreadsheets.get);
      const valuesGet = vi.mocked(mock.spreadsheets.values.get);

      get.mockResolvedValue({
        data: { sheets: [{ properties: { title: 'Sheet1' } }] },
      } as never);

      valuesGet
        .mockResolvedValueOnce({
          data: { values: [['Name', 'Email']] },
        } as never)
        .mockResolvedValueOnce({
          data: {
            values: [
              ['Alice', 'a@test.com'],
              ['Bob', 'b@test.com'],
            ],
          },
        } as never);

      const result = await service.read('spread-id');

      expect(result).toEqual([
        { Name: 'Alice', Email: 'a@test.com' },
        { Name: 'Bob', Email: 'b@test.com' },
      ]);
    });

    it('uses provided sheetName directly without querying', async () => {
      const get = vi.mocked(mock.spreadsheets.get);
      const valuesGet = vi.mocked(mock.spreadsheets.values.get);

      get.mockResolvedValue({ data: { sheets: [] } } as never);
      valuesGet
        .mockResolvedValueOnce({ data: { values: [['ID']] } } as never)
        .mockResolvedValueOnce({ data: { values: [['1'], ['2']] } } as never);

      await service.read('spread-id', 'Data');

      expect(get).not.toHaveBeenCalled();
      expect(valuesGet).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        range: 'Data!1:1',
      });
    });

    it('pads short rows with empty strings', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { title: 'S' } }] },
      } as never);

      vi.mocked(mock.spreadsheets.values.get)
        .mockResolvedValueOnce({ data: { values: [['A', 'B', 'C']] } } as never)
        .mockResolvedValueOnce({ data: { values: [['1']] } } as never);

      const result = await service.read('spread-id');

      expect(result).toEqual([{ A: '1', B: '', C: '' }]);
    });

    it('returns empty array when no data rows exist', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { title: 'S' } }] },
      } as never);

      vi.mocked(mock.spreadsheets.values.get)
        .mockResolvedValueOnce({ data: { values: [['X']] } } as never)
        .mockResolvedValueOnce({ data: {} } as never);

      const result = await service.read('spread-id');

      expect(result).toEqual([]);
    });
  });

  describe('append', () => {
    it('calls values.append with INSERT_ROWS option', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { title: 'Sheet1' } }] },
      } as never);
      vi.mocked(mock.spreadsheets.values.append).mockResolvedValue({} as never);

      await service.append('spread-id', ['Alice', 'a@test.com']);

      expect(mock.spreadsheets.values.append).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        range: 'Sheet1!A:ZZ',
        valueInputOption: VALUE_INPUT_OPTION_RAW,
        insertDataOption: INSERT_DATA_OPTION_INSERT_ROWS,
        requestBody: { values: [['Alice', 'a@test.com']] },
      });
    });

    it('uses provided sheetName', async () => {
      vi.mocked(mock.spreadsheets.values.append).mockResolvedValue({} as never);

      await service.append('spread-id', ['1'], 'Logs');

      expect(mock.spreadsheets.values.append).toHaveBeenCalledWith(
        expect.objectContaining({ range: 'Logs!A:ZZ' }),
      );
    });
  });

  describe('update', () => {
    it('computes sheet row as rowIndex + 2 and calls values.update', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { title: 'Sheet1' } }] },
      } as never);
      vi.mocked(mock.spreadsheets.values.update).mockResolvedValue({} as never);

      await service.update('spread-id', 0, ['Alice']);

      expect(mock.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        range: 'Sheet1!A2:ZZ2',
        valueInputOption: VALUE_INPUT_OPTION_RAW,
        requestBody: { values: [['Alice']] },
      });
    });

    it('offsets row index correctly for non-zero index', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { title: 'S' } }] },
      } as never);
      vi.mocked(mock.spreadsheets.values.update).mockResolvedValue({} as never);

      await service.update('spread-id', 5, ['value']);

      expect(mock.spreadsheets.values.update).toHaveBeenCalledWith(
        expect.objectContaining({ range: 'S!A7:ZZ7' }),
      );
    });
  });

  describe('delete', () => {
    it('validates row exists then calls batchUpdate with deleteDimension', async () => {
      const sheetList = {
        data: { sheets: [{ properties: { sheetId: 7, title: 'Sheet1' } }] },
      };
      vi.mocked(mock.spreadsheets.get).mockResolvedValue(sheetList as never);
      vi.mocked(mock.spreadsheets.values.get).mockResolvedValue({
        data: { values: [['exists']] },
      } as never);
      vi.mocked(mock.spreadsheets.batchUpdate).mockResolvedValue({} as never);

      await service.delete('spread-id', 0);

      expect(mock.spreadsheets.batchUpdate).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 7,
                  dimension: DIMENSION_ROWS,
                  startIndex: 1,
                  endIndex: 2,
                },
              },
            },
          ],
        },
      });
    });

    it('throws RowNotFoundError when row is empty', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { sheetId: 0, title: 'S' } }] },
      } as never);
      vi.mocked(mock.spreadsheets.values.get).mockResolvedValue({
        data: {},
      } as never);

      await expect(service.delete('spread-id', 3)).rejects.toThrow(
        RowNotFoundError,
      );
    });

    it('throws SheetNotFoundError when sheet is not found', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [] },
      } as never);

      await expect(service.delete('spread-id', 0, 'Missing')).rejects.toThrow(
        SheetNotFoundError,
      );
    });
  });

  describe('resolveSheetName', () => {
    it('queries first sheet when no name is provided', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [{ properties: { title: 'First' } }] },
      } as never);

      vi.mocked(mock.spreadsheets.values.get).mockResolvedValue({
        data: { values: [['H1']] },
      } as never);

      await service.read('spread-id');

      expect(mock.spreadsheets.get).toHaveBeenCalledWith({
        spreadsheetId: 'spread-id',
        fields: FIELDS_SHEET_TITLES,
      });
    });

    it('throws SheetNotFoundError when spreadsheet has no sheets', async () => {
      vi.mocked(mock.spreadsheets.get).mockResolvedValue({
        data: { sheets: [] },
      } as never);

      await expect(service.read('spread-id')).rejects.toThrow(
        SheetNotFoundError,
      );
    });
  });
});
