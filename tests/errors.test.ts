import { describe, it, expect } from 'vitest';
import {
  SheetsError,
  ConnectionError,
  SheetNotFoundError,
  RowNotFoundError,
} from '../src/errors';

describe('SheetsError', () => {
  it('has correct name and message', () => {
    const error = new SheetsError('something failed');
    expect(error.name).toBe('SheetsError');
    expect(error.message).toBe('something failed');
  });

  it('is an instance of Error', () => {
    expect(new SheetsError('x')).toBeInstanceOf(Error);
  });

  it('supports cause chaining', () => {
    const cause = new Error('root');
    const error = new SheetsError('wrapped', { cause });
    expect(error.cause).toBe(cause);
  });
});

describe('ConnectionError', () => {
  it('has correct name and message', () => {
    const error = new ConnectionError('auth failed');
    expect(error.name).toBe('ConnectionError');
    expect(error.message).toBe('auth failed');
  });

  it('is an instance of SheetsError and Error', () => {
    const error = new ConnectionError('x');
    expect(error).toBeInstanceOf(SheetsError);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('SheetNotFoundError', () => {
  it('formats the sheet name in the message', () => {
    const error = new SheetNotFoundError('Users');
    expect(error.name).toBe('SheetNotFoundError');
    expect(error.message).toBe('Sheet "Users" not found');
  });

  it('is an instance of SheetsError', () => {
    expect(new SheetNotFoundError('x')).toBeInstanceOf(SheetsError);
  });
});

describe('RowNotFoundError', () => {
  it('formats the row index in the message', () => {
    const error = new RowNotFoundError(3);
    expect(error.name).toBe('RowNotFoundError');
    expect(error.message).toBe('Row at index 3 not found');
  });

  it('is an instance of SheetsError', () => {
    expect(new RowNotFoundError(0)).toBeInstanceOf(SheetsError);
  });
});
