import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Database,
  ModelNotFoundError,
  RecordNotFoundError,
} from '../src/query';
import type { SchemaMetadata, FieldMetadata } from '../src/schema';
import type { SheetsAdapter } from '../src/adapters/SheetsAdapter';

/**
 * Builds a FieldMetadata quickly for test schemas.
 */
function field(
  type: FieldMetadata['type'],
  overrides: Partial<FieldMetadata> = {},
): FieldMetadata {
  return {
    type,
    primaryKey: false,
    unique: false,
    optional: false,
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

function mockAdapter(): SheetsAdapter {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    getSpreadsheet: vi.fn(),
    createSheet: vi.fn(),
    deleteSheet: vi.fn(),
    getHeaders: vi.fn(),
    writeHeaders: vi.fn(),
    readSheet: vi.fn(),
    appendRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn(),
  } as unknown as SheetsAdapter;
}

describe('Database', () => {
  it('constructs without error', () => {
    expect(() => new Database({ models: {} }, mockAdapter())).not.toThrow();
  });

  it('has findMany method', () => {
    const db = new Database({ models: {} }, mockAdapter());
    expect(typeof db.findMany).toBe('function');
  });

  it('has findUnique method', () => {
    const db = new Database({ models: {} }, mockAdapter());
    expect(typeof db.findUnique).toBe('function');
  });

  it('has create method', () => {
    const db = new Database({ models: {} }, mockAdapter());
    expect(typeof db.create).toBe('function');
  });

  it('has update method', () => {
    const db = new Database({ models: {} }, mockAdapter());
    expect(typeof db.update).toBe('function');
  });

  it('has delete method', () => {
    const db = new Database({ models: {} }, mockAdapter());
    expect(typeof db.delete).toBe('function');
  });
});

describe('Database - findMany', () => {
  let adapter: SheetsAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = mockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('throws ModelNotFoundError when the model does not exist in schema', async () => {
    await expect(db.findMany('UnknownModel')).rejects.toThrow(
      ModelNotFoundError,
    );
  });

  it('calls adapter.readSheet with the model name as the sheet name', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await db.findMany('User');
    expect(adapter.readSheet).toHaveBeenCalledWith('User');
  });

  it('returns an empty array when the sheet has no data rows', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const result = await db.findMany('User');
    expect(result).toEqual([]);
  });

  it('parses string fields as strings', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Alice' },
    ]);
    const result = await db.findMany('User');
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Alice');
  });

  it('parses number fields as numbers', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Alice', age: '30' },
    ]);
    const result = await db.findMany('User');
    expect(result[0].age).toBe(30);
  });

  it('parses boolean fields as booleans', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Alice', active: 'true' },
    ]);
    const result = await db.findMany('User');
    expect(result[0].active).toBe(true);
  });

  it('parses date fields as Date objects', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Alice', joined: '2024-01-15' },
    ]);
    const result = await db.findMany('User');
    expect(result[0].joined).toBeInstanceOf(Date);
  });

  it('parses json fields via JSON.parse', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Alice', metadata: '{"role":"admin"}' },
    ]);
    const result = await db.findMany('User');
    expect(result[0].metadata).toEqual({ role: 'admin' });
  });

  it('parses all rows in the result set', async () => {
    (adapter.readSheet as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: '1', name: 'Alice', age: '30' },
      { id: '2', name: 'Bob', age: '25' },
    ]);
    const result = await db.findMany('User');
    expect(result).toHaveLength(2);
    expect(result[0].age).toBe(30);
    expect(result[1].age).toBe(25);
  });
});

describe('ModelNotFoundError', () => {
  it('formats the error message with model name', () => {
    const error = new ModelNotFoundError('User');
    expect(error.message).toBe('Model "User" not found');
  });

  it('has correct name', () => {
    const error = new ModelNotFoundError('User');
    expect(error.name).toBe('ModelNotFoundError');
  });

  it('is an instance of SheetsError', async () => {
    const { SheetsError } = await import('../src/errors');
    expect(new ModelNotFoundError('User')).toBeInstanceOf(SheetsError);
  });
});

describe('RecordNotFoundError', () => {
  it('formats the error message with model name and where clause', () => {
    const error = new RecordNotFoundError('User', { id: '1' });
    expect(error.message).toBe('Record not found in "User" matching { id: 1 }');
  });

  it('handles multiple where conditions', () => {
    const error = new RecordNotFoundError('User', {
      id: '1',
      name: 'Alice',
    });
    expect(error.message).toContain('Record not found in "User" matching {');
    expect(error.message).toContain('id: 1');
    expect(error.message).toContain('name: Alice');
  });

  it('has correct name', () => {
    const error = new RecordNotFoundError('User', { id: '1' });
    expect(error.name).toBe('RecordNotFoundError');
  });

  it('is an instance of SheetsError', async () => {
    const { SheetsError } = await import('../src/errors');
    expect(new RecordNotFoundError('User', { id: '1' })).toBeInstanceOf(
      SheetsError,
    );
  });
});
