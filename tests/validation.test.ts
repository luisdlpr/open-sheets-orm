import { describe, it, expect } from 'vitest';
import { validateInput } from '../src/query/validation';
import { ValidationError } from '../src/query';
import type { FieldMetadata } from '../src/schema';

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

const fields = {
  name: field('string'),
  age: field('number', { optional: true }),
  active: field('boolean', { optional: true }),
  joined: field('date', { optional: true }),
  tags: field('json', { optional: true }),
};

describe('validateInput - create', () => {
  it('passes for valid input with all fields', () => {
    expect(() =>
      validateInput('create', fields, {
        name: 'Alice',
        age: 30,
        active: true,
        joined: new Date('2024-01-15'),
        tags: ['admin'],
      }),
    ).not.toThrow();
  });

  it('throws ValidationError when a required field is missing', () => {
    expect(() => validateInput('create', fields, { age: 30 })).toThrow(
      ValidationError,
    );
  });

  it('throws ValidationError when a string field receives a number', () => {
    expect(() => validateInput('create', fields, { name: 42 })).toThrow(
      ValidationError,
    );
  });

  it('throws ValidationError when a number field receives a string', () => {
    expect(() =>
      validateInput('create', fields, { name: 'Alice', age: 'abc' }),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when a boolean field receives a string', () => {
    expect(() =>
      validateInput('create', fields, { name: 'Alice', active: 'yes' }),
    ).toThrow(ValidationError);
  });

  it('passes when an optional field is omitted', () => {
    expect(() =>
      validateInput('create', fields, { name: 'Alice' }),
    ).not.toThrow();
  });

  it('includes the field name and expected type in the error message', () => {
    expect(() => validateInput('create', fields, { name: 42 })).toThrow(
      'Field "name" expected string, received number',
    );
  });
});

describe('validateInput - update', () => {
  it('passes for valid partial update', () => {
    expect(() =>
      validateInput('update', fields, { name: 'Bob' }),
    ).not.toThrow();
  });

  it('passes for empty update', () => {
    expect(() => validateInput('update', fields, {})).not.toThrow();
  });

  it('throws ValidationError for type mismatch on number field', () => {
    expect(() =>
      validateInput('update', fields, { name: 'Alice', age: 'abc' }),
    ).toThrow(ValidationError);
  });

  it('does not require missing fields on update', () => {
    expect(() => validateInput('update', fields, { age: 25 })).not.toThrow();
  });

  it('includes the field name and expected type in the error message', () => {
    expect(() => validateInput('update', fields, { age: 'abc' })).toThrow(
      'Field "age" expected number, received string',
    );
  });
});
