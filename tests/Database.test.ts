import { describe, it, expect } from 'vitest';
import {
  Database,
  ModelNotFoundError,
  RecordNotFoundError,
} from '../src/query';
import type { SchemaMetadata } from '../src/schema';
import type { SheetsAdapter } from '../src/adapters/SheetsAdapter';

describe('Database', () => {
  const mockSchema: SchemaMetadata = { models: {} };
  const mockAdapter = {} as unknown as SheetsAdapter;

  it('constructs without error', () => {
    expect(() => new Database(mockSchema, mockAdapter)).not.toThrow();
  });

  it('has findMany method', () => {
    const db = new Database(mockSchema, mockAdapter);
    expect(typeof db.findMany).toBe('function');
  });

  it('has findUnique method', () => {
    const db = new Database(mockSchema, mockAdapter);
    expect(typeof db.findUnique).toBe('function');
  });

  it('has create method', () => {
    const db = new Database(mockSchema, mockAdapter);
    expect(typeof db.create).toBe('function');
  });

  it('has update method', () => {
    const db = new Database(mockSchema, mockAdapter);
    expect(typeof db.update).toBe('function');
  });

  it('has delete method', () => {
    const db = new Database(mockSchema, mockAdapter);
    expect(typeof db.delete).toBe('function');
  });

  it('findMany returns a Promise', async () => {
    const db = new Database(mockSchema, mockAdapter);
    await expect(db.findMany('User')).rejects.toThrow('Not implemented');
  });

  it('findUnique returns a Promise', async () => {
    const db = new Database(mockSchema, mockAdapter);
    await expect(db.findUnique('User', { id: '1' })).rejects.toThrow(
      'Not implemented',
    );
  });

  it('create returns a Promise', async () => {
    const db = new Database(mockSchema, mockAdapter);
    await expect(db.create('User', { name: 'Alice' })).rejects.toThrow(
      'Not implemented',
    );
  });

  it('update returns a Promise', async () => {
    const db = new Database(mockSchema, mockAdapter);
    await expect(
      db.update('User', { id: '1' }, { name: 'Bob' }),
    ).rejects.toThrow('Not implemented');
  });

  it('delete returns a Promise', async () => {
    const db = new Database(mockSchema, mockAdapter);
    await expect(db.delete('User', { id: '1' })).rejects.toThrow(
      'Not implemented',
    );
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
