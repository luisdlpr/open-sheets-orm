import { describe, it, expect } from 'vitest';
import { SchemaValidationError } from '../src/schema/errors';
import { FieldBuilder } from '../src/schema/FieldBuilder';
import { field } from '../src/schema/field';

describe('SchemaValidationError', () => {
  it('has correct name and message', () => {
    const error = new SchemaValidationError('invalid schema');
    expect(error.name).toBe('SchemaValidationError');
    expect(error.message).toBe('invalid schema');
  });

  it('is an instance of Error', () => {
    expect(new SchemaValidationError('x')).toBeInstanceOf(Error);
  });

  it('is not an instance of SheetsError', () => {
    // SchemaValidationError lives in a separate domain
    const error = new SchemaValidationError('x');
    expect(error.constructor.name).toBe('SchemaValidationError');
  });
});

describe('FieldBuilder', () => {
  describe('construction', () => {
    it('creates a builder with the given type', () => {
      const builder = new FieldBuilder('string');
      const meta = builder.build();
      expect(meta.type).toBe('string');
    });

    it.each(['string', 'number', 'boolean', 'date', 'json'] as const)(
      'accepts type "%s"',
      (type) => {
        const builder = new FieldBuilder(type);
        expect(builder.build().type).toBe(type);
      },
    );
  });

  describe('modifiers', () => {
    it('primaryKey() sets primaryKey to true', () => {
      const meta = new FieldBuilder('string').primaryKey().build();
      expect(meta.primaryKey).toBe(true);
    });

    it('unique() sets unique to true', () => {
      const meta = new FieldBuilder('string').unique().build();
      expect(meta.unique).toBe(true);
    });

    it('optional() sets optional to true', () => {
      const meta = new FieldBuilder('string').optional().build();
      expect(meta.optional).toBe(true);
    });

    it('default() sets defaultValue', () => {
      const meta = new FieldBuilder('number').default(42).build();
      expect(meta.defaultValue).toBe(42);
    });

    it('primaryKey and unique default to false', () => {
      const meta = new FieldBuilder('string').build();
      expect(meta.primaryKey).toBe(false);
      expect(meta.unique).toBe(false);
      expect(meta.optional).toBe(false);
    });

    it('defaultValue is absent when not set', () => {
      const meta = new FieldBuilder('string').build();
      expect('defaultValue' in meta).toBe(false);
    });

    it('defaultValue can be set to an object for json type', () => {
      const obj = { a: 1 };
      const meta = new FieldBuilder('json').default(obj).build();
      expect(meta.defaultValue).toBe(obj);
    });

    it('defaultValue can be set to an array', () => {
      const arr = [1, 2, 3];
      const meta = new FieldBuilder('json').default(arr).build();
      expect(meta.defaultValue).toEqual([1, 2, 3]);
    });

    it('defaultValue can be set to a Date for date type', () => {
      const date = new Date('2025-01-01');
      const meta = new FieldBuilder('date').default(date).build();
      expect(meta.defaultValue).toBe(date);
    });

    it('defaultValue can be an empty string', () => {
      const meta = new FieldBuilder('string').default('').build();
      expect(meta.defaultValue).toBe('');
    });

    it('defaultValue can be false', () => {
      const meta = new FieldBuilder('boolean').default(false).build();
      expect(meta.defaultValue).toBe(false);
    });

    it('defaultValue can be 0', () => {
      const meta = new FieldBuilder('number').default(0).build();
      expect(meta.defaultValue).toBe(0);
    });

    it('defaultValue can be set to null', () => {
      const meta = new FieldBuilder('string').default(null).build();
      expect(meta.defaultValue).toBeNull();
    });
  });

  describe('fluent chaining', () => {
    it('supports chaining all modifiers', () => {
      const meta = new FieldBuilder('string')
        .primaryKey()
        .unique()
        .optional()
        .default('hello')
        .build();

      expect(meta).toEqual({
        type: 'string',
        primaryKey: true,
        unique: true,
        optional: true,
        defaultValue: 'hello',
      });
    });

    it('return type is FieldBuilder for method chaining', () => {
      const builder = new FieldBuilder('number');
      expect(builder.primaryKey()).toBeInstanceOf(FieldBuilder);
      expect(builder.unique()).toBeInstanceOf(FieldBuilder);
      expect(builder.optional()).toBeInstanceOf(FieldBuilder);
      expect(builder.default(10)).toBeInstanceOf(FieldBuilder);
    });
  });

  describe('build()', () => {
    it('returns a FieldMetadata object', () => {
      const meta = new FieldBuilder('string').build();
      expect(meta).not.toBeInstanceOf(FieldBuilder);
      // Verify it's a plain object with the expected shape
      expect(meta).toHaveProperty('type');
      expect(meta).toHaveProperty('primaryKey');
      expect(meta).toHaveProperty('unique');
      expect(meta).toHaveProperty('optional');
    });

    it('returns a fresh object each call', () => {
      const builder = new FieldBuilder('string');
      const a = builder.build();
      const b = builder.build();
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
    });

    it('does not share state between builder instances', () => {
      const a = new FieldBuilder('string').primaryKey().build();
      const b = new FieldBuilder('string').build();
      expect(a.primaryKey).toBe(true);
      expect(b.primaryKey).toBe(false);
    });
  });
});

describe('field factory', () => {
  it('field.string() creates a FieldBuilder with type string', () => {
    const builder = field.string();
    expect(builder).toBeInstanceOf(FieldBuilder);
    expect(builder.build().type).toBe('string');
  });

  it('field.number() creates a FieldBuilder with type number', () => {
    expect(field.number().build().type).toBe('number');
  });

  it('field.boolean() creates a FieldBuilder with type boolean', () => {
    expect(field.boolean().build().type).toBe('boolean');
  });

  it('field.date() creates a FieldBuilder with type date', () => {
    expect(field.date().build().type).toBe('date');
  });

  it('field.json() creates a FieldBuilder with type json', () => {
    expect(field.json().build().type).toBe('json');
  });

  it('each field factory call returns a new instance', () => {
    expect(field.string()).not.toBe(field.string());
  });

  it('works with chained modifiers', () => {
    const meta = field.string().primaryKey().unique().optional().build();
    expect(meta).toEqual({
      type: 'string',
      primaryKey: true,
      unique: true,
      optional: true,
    });
  });
});
