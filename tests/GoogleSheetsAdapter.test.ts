import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSpreadsheetService = {
  get: vi.fn(),
};

const mockWorksheetService = {
  create: vi.fn(),
  delete: vi.fn(),
  getHeaders: vi.fn(),
  writeHeaders: vi.fn(),
};

const mockRowService = {
  read: vi.fn(),
  append: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('../src/services/GoogleAuthService', () => ({
  GoogleAuthService: vi.fn().mockImplementation(function (this: {
    authenticate: ReturnType<typeof vi.fn>;
  }) {
    this.authenticate = vi.fn().mockResolvedValue({});
    return this;
  }),
}));

vi.mock('../src/services/GoogleSpreadsheetService', () => ({
  GoogleSpreadsheetService: vi.fn().mockImplementation(function (this: object) {
    return mockSpreadsheetService;
  }),
}));

vi.mock('../src/services/GoogleWorksheetService', () => ({
  GoogleWorksheetService: vi.fn().mockImplementation(function (this: object) {
    return mockWorksheetService;
  }),
}));

vi.mock('../src/services/GoogleRowService', () => ({
  GoogleRowService: vi.fn().mockImplementation(function (this: object) {
    return mockRowService;
  }),
}));

import { GoogleSheetsAdapter } from '../src/adapters/GoogleSheetsAdapter';

describe('GoogleSheetsAdapter', () => {
  const credentials = { type: 'service_account' } as never;
  const spreadsheetId = 'test-spreadsheet-id';

  let adapter: GoogleSheetsAdapter;

  beforeEach(async () => {
    vi.clearAllMocks();
    adapter = new GoogleSheetsAdapter(credentials, spreadsheetId, 'Sheet1');
    await adapter.connect();
  });

  describe('constructor', () => {
    it('stores spreadsheetId and sheetName in config', () => {
      expect(adapter['config']).toEqual({
        spreadsheetId,
        sheetName: 'Sheet1',
      });
    });

    it('omits sheetName when not provided', () => {
      const a = new GoogleSheetsAdapter(credentials, spreadsheetId);
      expect(a['config']).toEqual({ spreadsheetId });
    });
  });

  describe('getSpreadsheet', () => {
    it('delegates to SpreadsheetService.get with the spreadsheet ID', async () => {
      const info = { id: spreadsheetId, title: 'Test', url: '', sheets: [] };
      mockSpreadsheetService.get.mockResolvedValue(info);

      const result = await adapter.getSpreadsheet();

      expect(mockSpreadsheetService.get).toHaveBeenCalledWith(spreadsheetId);
      expect(result).toBe(info);
    });
  });

  describe('createSheet', () => {
    it('delegates to WorksheetService.create', async () => {
      const sheetInfo = { id: 1, title: 'New', rowCount: 100, columnCount: 26 };
      mockWorksheetService.create.mockResolvedValue(sheetInfo);

      const result = await adapter.createSheet('New');

      expect(mockWorksheetService.create).toHaveBeenCalledWith(
        spreadsheetId,
        'New',
      );
      expect(result).toBe(sheetInfo);
    });
  });

  describe('deleteSheet', () => {
    it('delegates to WorksheetService.delete', async () => {
      mockWorksheetService.delete.mockResolvedValue(undefined);

      await adapter.deleteSheet('Obsolete');

      expect(mockWorksheetService.delete).toHaveBeenCalledWith(
        spreadsheetId,
        'Obsolete',
      );
    });
  });

  describe('getHeaders', () => {
    it('delegates with explicit sheetName', async () => {
      mockWorksheetService.getHeaders.mockResolvedValue(['A', 'B']);

      const result = await adapter.getHeaders('Data');

      expect(mockWorksheetService.getHeaders).toHaveBeenCalledWith(
        spreadsheetId,
        'Data',
      );
      expect(result).toEqual(['A', 'B']);
    });

    it('falls back to config sheetName', async () => {
      mockWorksheetService.getHeaders.mockResolvedValue(['X']);

      await adapter.getHeaders();

      expect(mockWorksheetService.getHeaders).toHaveBeenCalledWith(
        spreadsheetId,
        'Sheet1',
      );
    });
  });

  describe('writeHeaders', () => {
    it('delegates with explicit sheetName', async () => {
      mockWorksheetService.writeHeaders.mockResolvedValue(undefined);

      await adapter.writeHeaders(['X', 'Y'], 'Other');

      expect(mockWorksheetService.writeHeaders).toHaveBeenCalledWith(
        spreadsheetId,
        ['X', 'Y'],
        'Other',
      );
    });

    it('falls back to config sheetName', async () => {
      await adapter.writeHeaders(['H']);

      expect(mockWorksheetService.writeHeaders).toHaveBeenCalledWith(
        spreadsheetId,
        ['H'],
        'Sheet1',
      );
    });
  });

  describe('readSheet', () => {
    it('delegates to RowService.read with correct params', async () => {
      const rows = [{ Name: 'Alice' }];
      mockRowService.read.mockResolvedValue(rows);

      const result = await adapter.readSheet('Users');

      expect(mockRowService.read).toHaveBeenCalledWith(spreadsheetId, 'Users');
      expect(result).toBe(rows);
    });

    it('falls back to config sheetName', async () => {
      mockRowService.read.mockResolvedValue([]);

      await adapter.readSheet();

      expect(mockRowService.read).toHaveBeenCalledWith(spreadsheetId, 'Sheet1');
    });
  });

  describe('appendRow', () => {
    it('delegates to RowService.append', async () => {
      mockRowService.append.mockResolvedValue(undefined);

      await adapter.appendRow(['Alice', 'a@test.com'], 'Users');

      expect(mockRowService.append).toHaveBeenCalledWith(
        spreadsheetId,
        ['Alice', 'a@test.com'],
        'Users',
      );
    });

    it('falls back to config sheetName', async () => {
      await adapter.appendRow(['data']);

      expect(mockRowService.append).toHaveBeenCalledWith(
        spreadsheetId,
        ['data'],
        'Sheet1',
      );
    });
  });

  describe('updateRow', () => {
    it('delegates to RowService.update', async () => {
      await adapter.updateRow(2, ['Bob'], 'Users');

      expect(mockRowService.update).toHaveBeenCalledWith(
        spreadsheetId,
        2,
        ['Bob'],
        'Users',
      );
    });

    it('falls back to config sheetName', async () => {
      await adapter.updateRow(0, ['x']);

      expect(mockRowService.update).toHaveBeenCalledWith(
        spreadsheetId,
        0,
        ['x'],
        'Sheet1',
      );
    });
  });

  describe('deleteRow', () => {
    it('delegates to RowService.delete', async () => {
      await adapter.deleteRow(1, 'Users');

      expect(mockRowService.delete).toHaveBeenCalledWith(
        spreadsheetId,
        1,
        'Users',
      );
    });

    it('falls back to config sheetName', async () => {
      await adapter.deleteRow(0);

      expect(mockRowService.delete).toHaveBeenCalledWith(
        spreadsheetId,
        0,
        'Sheet1',
      );
    });
  });
});
