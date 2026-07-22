import { describe, it, expect, beforeEach } from 'vitest';
import {
  Database,
  ModelNotFoundError,
  RecordNotFoundError,
  ValidationError,
} from '../src/query';
import type { SchemaMetadata, FieldMetadata } from '../src/schema';
import { MockAdapter } from './helpers/MockAdapter';

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

describe('Database', () => {
  it('constructs without error', () => {
    expect(() => new Database({ models: {} }, new MockAdapter())).not.toThrow();
  });

  it('has findMany method', () => {
    const db = new Database({ models: {} }, new MockAdapter());
    expect(typeof db.findMany).toBe('function');
  });

  it('has findUnique method', () => {
    const db = new Database({ models: {} }, new MockAdapter());
    expect(typeof db.findUnique).toBe('function');
  });

  it('has create method', () => {
    const db = new Database({ models: {} }, new MockAdapter());
    expect(typeof db.create).toBe('function');
  });

  it('has update method', () => {
    const db = new Database({ models: {} }, new MockAdapter());
    expect(typeof db.update).toBe('function');
  });

  it('has delete method', () => {
    const db = new Database({ models: {} }, new MockAdapter());
    expect(typeof db.delete).toBe('function');
  });
});

describe('Database - findMany', () => {
  let adapter: MockAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = new MockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('throws ModelNotFoundError when the model does not exist in schema', async () => {
    await expect(db.findMany('UnknownModel')).rejects.toThrow(
      ModelNotFoundError,
    );
  });

  it('returns an empty array when the sheet has no data rows', async () => {
    adapter.setData('User', ['id', 'name'], []);
    const result = await db.findMany('User');
    expect(result).toEqual([]);
  });

  it('returns all rows from the sheet', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'age'],
      [
        ['1', 'Alice', '30'],
        ['2', 'Bob', '25'],
      ],
    );
    const result = await db.findMany('User');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Alice');
    expect(result[1].name).toBe('Bob');
  });

  it('parses string fields as strings', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    const result = await db.findMany('User');
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Alice');
  });

  it('parses number fields as numbers', async () => {
    adapter.setData('User', ['id', 'name', 'age'], [['1', 'Alice', '30']]);
    const result = await db.findMany('User');
    expect(result[0].age).toBe(30);
  });

  it('parses boolean fields as booleans', async () => {
    adapter.setData('User', ['id', 'name', 'active'], [['1', 'Alice', 'true']]);
    const result = await db.findMany('User');
    expect(result[0].active).toBe(true);
  });

  it('parses date fields as Date objects', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'joined'],
      [['1', 'Alice', '2024-01-15']],
    );
    const result = await db.findMany('User');
    expect(result[0].joined).toBeInstanceOf(Date);
  });

  it('parses json fields via JSON.parse', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'metadata'],
      [['1', 'Alice', '{"role":"admin"}']],
    );
    const result = await db.findMany('User');
    expect(result[0].metadata).toEqual({ role: 'admin' });
  });

  it('reads from the correct sheet when multiple exist', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    adapter.setData('Admin', ['id', 'name'], [['1', 'Bob']]);
    const result = await db.findMany('User');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Alice');
  });
});

describe('Database - findUnique', () => {
  let adapter: MockAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = new MockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('throws ModelNotFoundError when the model does not exist in schema', async () => {
    await expect(db.findUnique('UnknownModel', { id: '1' })).rejects.toThrow(
      ModelNotFoundError,
    );
  });

  it('returns the matching record when a record matches the where clause', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'age'],
      [
        ['1', 'Alice', '30'],
        ['2', 'Bob', '25'],
      ],
    );
    const result = await db.findUnique('User', { id: '1' });
    expect(result.name).toBe('Alice');
    expect(result.age).toBe(30);
  });

  it('throws RecordNotFoundError when no record matches the where clause', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    await expect(db.findUnique('User', { id: '99' })).rejects.toThrow(
      RecordNotFoundError,
    );
  });

  it('matches on number fields in the where clause', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'age'],
      [
        ['1', 'Alice', '30'],
        ['2', 'Bob', '25'],
      ],
    );
    const result = await db.findUnique('User', { age: 30 });
    expect(result.name).toBe('Alice');
  });

  it('matches only when ALL where conditions are satisfied', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'age'],
      [
        ['1', 'Alice', '30'],
        ['2', 'Alice', '25'],
      ],
    );
    const result = await db.findUnique('User', { name: 'Alice', age: 25 });
    expect(result.id).toBe('2');
  });

  it('throws RecordNotFoundError when the sheet has no data', async () => {
    adapter.setData('User', ['id', 'name'], []);
    await expect(db.findUnique('User', { id: '1' })).rejects.toThrow(
      RecordNotFoundError,
    );
  });

  it('reads from the correct sheet when multiple exist', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    adapter.setData('Admin', ['id', 'name'], [['1', 'Bob']]);
    await expect(db.findUnique('User', { id: '1' })).resolves.toMatchObject({
      name: 'Alice',
    });
  });
});

describe('Database - create', () => {
  let adapter: MockAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = new MockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('throws ModelNotFoundError when the model does not exist in schema', async () => {
    await expect(db.create('UnknownModel', { name: 'test' })).rejects.toThrow(
      ModelNotFoundError,
    );
  });

  it('appends a new row that can be read back', async () => {
    adapter.setData('User', ['id', 'name', 'age'], []);
    await db.create('User', { name: 'Alice', age: 30 });
    const users = await db.findMany('User');
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Alice');
    expect(users[0].age).toBe(30);
  });

  it('does not include unprovided fields without defaults in the row', async () => {
    adapter.setData('User', ['id', 'name', 'age'], []);
    await db.create('User', { name: 'Alice' });
    const users = await db.findMany('User');
    expect(users[0].name).toBe('Alice');
    expect(users[0].id).toBeUndefined();
    expect(users[0].age).toBeUndefined();
  });

  it('applies default values for fields not provided in input', async () => {
    const schema: SchemaMetadata = {
      models: {
        Task: {
          name: 'Task',
          fields: {
            title: field('string'),
            done: field('boolean', { defaultValue: false }),
          },
        },
      },
    };
    const db2 = new Database(schema, adapter);
    adapter.setData('Task', ['title', 'done'], []);
    await db2.create('Task', { title: 'Test' });
    const tasks = await db2.findMany('Task');
    expect(tasks[0]).toMatchObject({ title: 'Test', done: false });
  });

  it('uses provided values over defaults', async () => {
    const schema: SchemaMetadata = {
      models: {
        Task: {
          name: 'Task',
          fields: {
            title: field('string'),
            done: field('boolean', { defaultValue: false }),
          },
        },
      },
    };
    const db2 = new Database(schema, adapter);
    adapter.setData('Task', ['title', 'done'], []);
    await db2.create('Task', { title: 'Test', done: true });
    const tasks = await db2.findMany('Task');
    expect(tasks[0]).toMatchObject({ title: 'Test', done: true });
  });

  it('returns the created record with applied defaults', async () => {
    const schema: SchemaMetadata = {
      models: {
        Task: {
          name: 'Task',
          fields: {
            title: field('string'),
            done: field('boolean', { defaultValue: false }),
          },
        },
      },
    };
    const db2 = new Database(schema, adapter);
    adapter.setData('Task', ['title', 'done'], []);
    const result = await db2.create('Task', { title: 'Test' });
    expect(result).toMatchObject({ title: 'Test', done: false });
  });

  it('throws ValidationError when a required field is missing', async () => {
    adapter.setData('User', ['id', 'name', 'age'], []);
    await expect(db.create('User', { age: 30 })).rejects.toThrow(
      ValidationError,
    );
  });

  it('throws ValidationError when a field has the wrong type', async () => {
    adapter.setData('User', ['id', 'name', 'age'], []);
    await expect(
      db.create('User', { name: 'Alice', age: 'abc' }),
    ).rejects.toThrow(ValidationError);
  });
});

describe('Database - update', () => {
  let adapter: MockAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = new MockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('throws ModelNotFoundError when the model does not exist in schema', async () => {
    await expect(
      db.update('UnknownModel', { id: '1' }, { name: 'New' }),
    ).rejects.toThrow(ModelNotFoundError);
  });

  it('updates a record and persists the changes', async () => {
    adapter.setData('User', ['id', 'name', 'age'], [['1', 'Alice', '30']]);
    await db.update('User', { id: '1' }, { name: 'Updated' });
    const users = await db.findMany('User');
    expect(users[0]).toMatchObject({ id: '1', name: 'Updated', age: 30 });
  });

  it('throws RecordNotFoundError when no record matches the where clause', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    await expect(
      db.update('User', { id: '99' }, { name: 'New' }),
    ).rejects.toThrow(RecordNotFoundError);
  });

  it('updates only the matching record', async () => {
    adapter.setData(
      'User',
      ['id', 'name', 'age'],
      [
        ['1', 'Alice', '30'],
        ['2', 'Bob', '25'],
      ],
    );
    await db.update('User', { id: '2' }, { name: 'Robert', age: 26 });
    const users = await db.findMany('User');
    expect(users[0]).toMatchObject({ id: '1', name: 'Alice', age: 30 });
    expect(users[1]).toMatchObject({ id: '2', name: 'Robert', age: 26 });
  });

  it('throws ValidationError when a field has the wrong type', async () => {
    adapter.setData('User', ['id', 'name', 'age'], [['1', 'Alice', '30']]);
    await expect(
      db.update('User', { id: '1' }, { age: 'abc' }),
    ).rejects.toThrow(ValidationError);
  });

  it('allows partial update with valid data', async () => {
    adapter.setData('User', ['id', 'name', 'age'], [['1', 'Alice', '30']]);
    await expect(
      db.update('User', { id: '1' }, { name: 'Bob' }),
    ).resolves.toBeDefined();
  });
});

describe('Database - delete', () => {
  let adapter: MockAdapter;
  let db: Database;

  beforeEach(() => {
    adapter = new MockAdapter();
    db = new Database(userSchema, adapter);
  });

  it('throws ModelNotFoundError when the model does not exist in schema', async () => {
    await expect(db.delete('UnknownModel', { id: '1' })).rejects.toThrow(
      ModelNotFoundError,
    );
  });

  it('removes a record so it no longer appears', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    await db.delete('User', { id: '1' });
    const users = await db.findMany('User');
    expect(users).toHaveLength(0);
  });

  it('throws RecordNotFoundError when no record matches the where clause', async () => {
    adapter.setData('User', ['id', 'name'], [['1', 'Alice']]);
    await expect(db.delete('User', { id: '99' })).rejects.toThrow(
      RecordNotFoundError,
    );
  });

  it('removes only the matching record', async () => {
    adapter.setData(
      'User',
      ['id', 'name'],
      [
        ['1', 'Alice'],
        ['2', 'Bob'],
      ],
    );
    await db.delete('User', { id: '1' });
    const users = await db.findMany('User');
    expect(users).toHaveLength(1);
    expect(users[0].id).toBe('2');
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
