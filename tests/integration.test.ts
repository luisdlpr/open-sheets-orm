import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { GoogleSheetsAdapter } from '../src/adapters/GoogleSheetsAdapter';

const spreadsheetId = process.env.GOOGLE_TEST_SPREADSHEET_ID;
const credentialsPath = process.env.GOOGLE_TEST_CREDENTIALS_PATH;
const run = Boolean(spreadsheetId && credentialsPath);

const describeSuite = run ? describe : describe.skip;

describeSuite('GoogleSheetsAdapter integration', () => {
  let adapter: GoogleSheetsAdapter;
  let testSheet: string;

  beforeAll(async () => {
    const credentials = JSON.parse(readFileSync(credentialsPath!, 'utf-8'));
    adapter = new GoogleSheetsAdapter(credentials, spreadsheetId!);
    await adapter.connect();
    testSheet = `IntegrationTest`;
    await adapter.deleteSheet(testSheet).catch(() => {});
    await adapter.createSheet(testSheet);
  });

  afterAll(async () => {
    await adapter.disconnect();
  });

  it(
    'full CRUD lifecycle',
    async () => {
      const headers = ['id', 'name', 'email'];
      await adapter.writeHeaders(headers, testSheet);

      const readHeaders = await adapter.getHeaders(testSheet);
      expect(readHeaders).toEqual(headers);

      await adapter.appendRow(['1', 'Alice', 'alice@test.com'], testSheet);
      await adapter.appendRow(['2', 'Bob', 'bob@test.com'], testSheet);

      let rows = await adapter.readSheet(testSheet);
      expect(rows).toEqual([
        { id: '1', name: 'Alice', email: 'alice@test.com' },
        { id: '2', name: 'Bob', email: 'bob@test.com' },
      ]);

      await adapter.updateRow(
        0,
        ['1', 'Alice Updated', 'alice@test.com'],
        testSheet,
      );

      rows = await adapter.readSheet(testSheet);
      expect(rows[0].name).toBe('Alice Updated');

      await adapter.deleteRow(0, testSheet);

      rows = await adapter.readSheet(testSheet);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toEqual({ id: '2', name: 'Bob', email: 'bob@test.com' });
    },
    Infinity,
  );
});
