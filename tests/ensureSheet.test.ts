import { describe, it, expect, beforeEach } from 'vitest';
import { MockAdapter } from './helpers/MockAdapter';
import { Database, ModelNotFoundError, ValidationError } from '../src/query';
import type { SchemaMetadata, FieldMetadata } from '../src/schema';

function field(
  type: FieldMetadata['type'],
  overrides: Partial<FieldMetadata> = {},
): FieldMetadata {
  return {
    type,
    primaryKey: false,
    unique: false,
    optional: false,
    hasDefault: false,
    ...overrides,
  };
}

const userSchema: SchemaMetadata = {
  models: {
    User: {
      name: 'User',
      fields: {
        id: field('string', { primaryKey: true, unique: true }),
        name: field('string'),
        age: field('number', { optional: true }),
        active: field('boolean', { optional: true }),
        joined: field('date', { optional: true }),
        metadata: field('json', { optional: true }),
      },
    },
  },
};

describe('MockAdapter - ensureSheet', () => {
  let adapter: MockAdapter;

  beforeEach(() => {
    adapter = new MockAdapter();
  });

  it('creates a sheet when it does not exist', async () => {
    const info = await adapter.ensureSheet('NewSheet');

    expect(info.title).toBe('NewSheet');
    expect(info.rowCount).toBe(1);
    expect(info.columnCount).toBe(0);
  });

  it('returns existing sheet metadata without modifying it', async () => {
    adapter.setData('Existing', ['id', 'name'], [['1', 'Alice']]);
    const info = await adapter.ensureSheet('Existing');

    expect(info.title).toBe('Existing');

    const headers = await adapter.getHeaders('Existing');
    expect(headers).toEqual(['id', 'name']);

    const rows = await adapter.readSheet('Existing');
    expect(rows).toHaveLength(1);
  });

  it('is idempotent when called multiple times', async () => {
    await adapter.ensureSheet('Test');
    await adapter.ensureSheet('Test');
    await adapter.ensureSheet('Test');

    const spreadsheet = await adapter.getSpreadsheet();
    expect(spreadsheet.sheets).toHaveLength(1);
  });

  it('returns SheetInfo matching the existing sheet', async () => {
    adapter.setData(
      'Users',
      ['col1', 'col2'],
      [
        ['a', 'b'],
        ['c', 'd'],
      ],
    );
    const info = await adapter.ensureSheet('Users');

    expect(info.title).toBe('Users');
    expect(info.rowCount).toBe(3);
    expect(info.columnCount).toBe(2);
  });
});

describe('Database - create (auto-creation)', () => {
  let adapter: MockAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = new MockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('auto-creates the sheet and writes headers from schema when sheet does not exist', async () => {
    expect(await adapter.getHeaders('User')).toEqual([]);

    await db.create('User', { id: '1', name: 'Alice', age: 30 });

    const headers = await adapter.getHeaders('User');
    expect(headers).toEqual([
      'id',
      'name',
      'age',
      'active',
      'joined',
      'metadata',
    ]);

    const users = await db.findMany('User');
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ id: '1', name: 'Alice', age: 30 });
  });

  it('reuses existing headers when the sheet already has data and headers', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);

    await db.create('User', { id: '2', name: 'Bob' });

    const headers = await adapter.getHeaders('User');
    expect(headers).toEqual(['id', 'name']);

    const users = await db.findMany('User');
    expect(users).toHaveLength(2);
  });

  it('writes schema headers when the sheet exists but has no headers', async () => {
    adapter.createSheet('User');

    await db.create('User', { id: '1', name: 'Alice' });

    const headers = await adapter.getHeaders('User');
    expect(headers).toEqual([
      'id',
      'name',
      'age',
      'active',
      'joined',
      'metadata',
    ]);

    const users = await db.findMany('User');
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Alice');
  });

  it('does not throw when called for a model whose sheet does not exist', async () => {
    await expect(
      db.create('User', { id: '1', name: 'Alice' }),
    ).resolves.toBeDefined();
  });

  it('still throws ModelNotFoundError for unknown models', async () => {
    await expect(db.create('Unknown', {})).rejects.toThrow(ModelNotFoundError);
  });

  it('still throws ValidationError for invalid data', async () => {
    await expect(db.create('User', { age: 'not-a-number' })).rejects.toThrow(
      ValidationError,
    );
  });

  it('creates separate sheets for different models', async () => {
    const schema: SchemaMetadata = {
      models: {
        A: {
          name: 'A',
          fields: { id: field('string') },
        },
        B: {
          name: 'B',
          fields: { name: field('string') },
        },
      },
    };
    const db2 = new Database(schema, adapter);

    await db2.create('A', { id: '1' });
    await db2.create('B', { name: 'test' });

    const aHeaders = await adapter.getHeaders('A');
    const bHeaders = await adapter.getHeaders('B');
    expect(aHeaders).toEqual(['id']);
    expect(bHeaders).toEqual(['name']);
  });

  it('applies defaults after auto-creating headers', async () => {
    const schema: SchemaMetadata = {
      models: {
        Task: {
          name: 'Task',
          fields: {
            title: field('string'),
            done: field('boolean', { defaultValue: false, hasDefault: true }),
          },
        },
      },
    };
    const db2 = new Database(schema, adapter);

    const result = await db2.create('Task', { title: 'Test' });

    expect(result).toMatchObject({ title: 'Test', done: false });

    const tasks = await db2.findMany('Task');
    expect(tasks[0]).toMatchObject({ title: 'Test', done: false });
  });
});
