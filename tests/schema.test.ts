import { describe, it, expect } from 'vitest';
import { SchemaValidationError } from '../src/schema/errors';
import { FieldBuilder } from '../src/schema/FieldBuilder';
import { field } from '../src/schema/field';
import { validateSchema } from '../src/schema/validation';
import { schema } from '../src/schema/schema';
import type { SchemaMetadata } from '../src/schema/types';

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

describe('validateSchema', () => {
  describe('model name', () => {
    it('throws for empty model name', () => {
      expect(() =>
        validateSchema({
          '': { id: field.string() },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws for empty model name with informative message', () => {
      expect(() =>
        validateSchema({
          '': { id: field.string() },
        }),
      ).toThrow(/model name/i);
    });

    it('accepts a valid model name', () => {
      expect(() =>
        validateSchema({
          User: { id: field.string() },
        }),
      ).not.toThrow();
    });
  });

  describe('field name', () => {
    it('throws for empty field name', () => {
      expect(() =>
        validateSchema({
          User: { '': field.string() },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws for empty field name with informative message', () => {
      expect(() =>
        validateSchema({
          User: { '': field.string() },
        }),
      ).toThrow(/field name/i);
    });

    it('accepts a valid field name', () => {
      expect(() =>
        validateSchema({
          User: { id: field.string() },
        }),
      ).not.toThrow();
    });
  });

  describe('model must have at least one field', () => {
    it('throws for a model with no fields', () => {
      expect(() =>
        validateSchema({
          User: {},
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws for empty model with informative message', () => {
      expect(() =>
        validateSchema({
          User: {},
        }),
      ).toThrow(/at least one field/i);
    });
  });

  describe('primary key uniqueness', () => {
    it('accepts a model with no primary key', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string(),
            email: field.string().unique(),
          },
        }),
      ).not.toThrow();
    });

    it('accepts a model with exactly one primary key', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey(),
            email: field.string().unique(),
          },
        }),
      ).not.toThrow();
    });

    it('throws for a model with multiple primary keys', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey(),
            email: field.string().primaryKey(),
          },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws for multiple primary keys with informative message', () => {
      expect(() =>
        validateSchema({
          User: {
            a: field.string().primaryKey(),
            b: field.string().primaryKey(),
          },
        }),
      ).toThrow(/multiple primary key/i);
    });

    it('throws for multiple primary keys across many fields', () => {
      expect(() =>
        validateSchema({
          User: {
            a: field.string().primaryKey(),
            b: field.string(),
            c: field.number().primaryKey(),
          },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws when a primary key is marked as optional', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey().optional(),
          },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws when primaryKey+optional with informative message', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey().optional(),
          },
        }),
      ).toThrow(/primary keys cannot be optional/i);
    });

    it('throws when a primary key is optional with additional modifiers', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey().unique().optional(),
          },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('accepts a primary key that is not optional', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey(),
          },
        }),
      ).not.toThrow();
    });

    it('accepts an optional field that is not a primary key', () => {
      expect(() =>
        validateSchema({
          User: {
            name: field.string().optional(),
          },
        }),
      ).not.toThrow();
    });
  });

  describe('default value type matching', () => {
    describe('string type', () => {
      it('accepts a string default', () => {
        expect(() =>
          validateSchema({
            User: { name: field.string().default('Alice') },
          }),
        ).not.toThrow();
      });

      it('rejects a number default', () => {
        expect(() =>
          validateSchema({
            User: { name: field.string().default(42) },
          }),
        ).toThrow(SchemaValidationError);
      });

      it('rejects a boolean default', () => {
        expect(() =>
          validateSchema({
            User: { name: field.string().default(true) },
          }),
        ).toThrow(SchemaValidationError);
      });
    });

    describe('number type', () => {
      it('accepts a number default', () => {
        expect(() =>
          validateSchema({
            User: { age: field.number().default(25) },
          }),
        ).not.toThrow();
      });

      it('accepts zero as a number default', () => {
        expect(() =>
          validateSchema({
            User: { count: field.number().default(0) },
          }),
        ).not.toThrow();
      });

      it('rejects a string default', () => {
        expect(() =>
          validateSchema({
            User: { age: field.number().default('twenty') },
          }),
        ).toThrow(SchemaValidationError);
      });

      it('rejects a boolean default', () => {
        expect(() =>
          validateSchema({
            User: { age: field.number().default(true) },
          }),
        ).toThrow(SchemaValidationError);
      });
    });

    describe('boolean type', () => {
      it('accepts a boolean default', () => {
        expect(() =>
          validateSchema({
            User: { active: field.boolean().default(true) },
          }),
        ).not.toThrow();
      });

      it('accepts false as a boolean default', () => {
        expect(() =>
          validateSchema({
            User: { active: field.boolean().default(false) },
          }),
        ).not.toThrow();
      });

      it('rejects a string default', () => {
        expect(() =>
          validateSchema({
            User: { active: field.boolean().default('yes') },
          }),
        ).toThrow(SchemaValidationError);
      });

      it('rejects a number default', () => {
        expect(() =>
          validateSchema({
            User: { active: field.boolean().default(1) },
          }),
        ).toThrow(SchemaValidationError);
      });
    });

    describe('date type', () => {
      it('accepts a Date instance as default', () => {
        expect(() =>
          validateSchema({
            User: { createdAt: field.date().default(new Date('2025-01-01')) },
          }),
        ).not.toThrow();
      });

      it('accepts an ISO date string as default', () => {
        expect(() =>
          validateSchema({
            User: { createdAt: field.date().default('2025-01-01') },
          }),
        ).not.toThrow();
      });

      it('rejects a number default', () => {
        expect(() =>
          validateSchema({
            User: { createdAt: field.date().default(123) },
          }),
        ).toThrow(SchemaValidationError);
      });

      it('rejects a boolean default', () => {
        expect(() =>
          validateSchema({
            User: { createdAt: field.date().default(true) },
          }),
        ).toThrow(SchemaValidationError);
      });
    });

    describe('json type', () => {
      it('accepts an object default', () => {
        expect(() =>
          validateSchema({
            User: { meta: field.json().default({ key: 'val' }) },
          }),
        ).not.toThrow();
      });

      it('accepts an array default', () => {
        expect(() =>
          validateSchema({
            User: { tags: field.json().default([1, 2, 3]) },
          }),
        ).not.toThrow();
      });

      it('accepts a string default', () => {
        expect(() =>
          validateSchema({
            User: { data: field.json().default('raw') },
          }),
        ).not.toThrow();
      });

      it('accepts a number default', () => {
        expect(() =>
          validateSchema({
            User: { data: field.json().default(42) },
          }),
        ).not.toThrow();
      });

      it('accepts a boolean default', () => {
        expect(() =>
          validateSchema({
            User: { data: field.json().default(false) },
          }),
        ).not.toThrow();
      });

      it('accepts null default', () => {
        expect(() =>
          validateSchema({
            User: { data: field.json().default(null) },
          }),
        ).not.toThrow();
      });
    });

    describe('error message clarity', () => {
      it('includes field name in default type mismatch error', () => {
        expect(() =>
          validateSchema({
            User: { age: field.string().default(42) },
          }),
        ).toThrow(/age/i);
      });

      it('includes model name in default type mismatch error', () => {
        expect(() =>
          validateSchema({
            Profile: { age: field.string().default(42) },
          }),
        ).toThrow(/Profile/i);
      });
    });
  });

  describe('multiple models', () => {
    it('validates all models and passes', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey(),
            name: field.string(),
          },
          Post: {
            id: field.string().primaryKey(),
            title: field.string().default('Untitled'),
            published: field.boolean().default(false),
          },
        }),
      ).not.toThrow();
    });

    it('reports error on the first invalid model', () => {
      expect(() =>
        validateSchema({
          User: {
            id: field.string().primaryKey(),
          },
          Post: {
            a: field.string().primaryKey(),
            b: field.string().primaryKey(),
          },
        }),
      ).toThrow(/Post/i);
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

describe('schema', () => {
  describe('smoke tests', () => {
    it('returns a SchemaMetadata object', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result).toHaveProperty('models');
    });

    it('returns an object containing the defined models', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result.models).toHaveProperty('User');
    });

    it('supports multiple models', () => {
      const result = schema({
        User: { id: field.string() },
        Post: { title: field.string() },
      });
      expect(Object.keys(result.models)).toEqual(['User', 'Post']);
    });
  });

  describe('model metadata shape', () => {
    it('includes name and fields on each model', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result.models.User).toHaveProperty('name');
      expect(result.models.User).toHaveProperty('fields');
    });

    it('sets model name to the definition key', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result.models.User.name).toBe('User');
    });
  });

  describe('field metadata shape', () => {
    it('includes type, primaryKey, unique, optional for each field', () => {
      const result = schema({ User: { id: field.string() } });
      const fieldMeta = result.models.User.fields.id;
      expect(fieldMeta).toHaveProperty('type');
      expect(fieldMeta).toHaveProperty('primaryKey');
      expect(fieldMeta).toHaveProperty('unique');
      expect(fieldMeta).toHaveProperty('optional');
    });

    it('sets correct type for field.string()', () => {
      const result = schema({ User: { name: field.string() } });
      expect(result.models.User.fields.name.type).toBe('string');
    });

    it('sets correct type for field.number()', () => {
      const result = schema({ User: { age: field.number() } });
      expect(result.models.User.fields.age.type).toBe('number');
    });

    it('sets correct type for field.boolean()', () => {
      const result = schema({ User: { active: field.boolean() } });
      expect(result.models.User.fields.active.type).toBe('boolean');
    });

    it('sets correct type for field.date()', () => {
      const result = schema({ User: { createdAt: field.date() } });
      expect(result.models.User.fields.createdAt.type).toBe('date');
    });

    it('sets correct type for field.json()', () => {
      const result = schema({ User: { meta: field.json() } });
      expect(result.models.User.fields.meta.type).toBe('json');
    });

    it('reflects primaryKey() modifier', () => {
      const result = schema({ User: { id: field.string().primaryKey() } });
      expect(result.models.User.fields.id.primaryKey).toBe(true);
    });

    it('reflects unique() modifier', () => {
      const result = schema({ User: { email: field.string().unique() } });
      expect(result.models.User.fields.email.unique).toBe(true);
    });

    it('reflects optional() modifier', () => {
      const result = schema({ User: { name: field.string().optional() } });
      expect(result.models.User.fields.name.optional).toBe(true);
    });

    it('reflects default() modifier', () => {
      const result = schema({
        User: { name: field.string().default('Alice') },
      });
      expect(result.models.User.fields.name.defaultValue).toBe('Alice');
    });

    it('omits defaultValue when not set', () => {
      const result = schema({ User: { name: field.string() } });
      expect('defaultValue' in result.models.User.fields.name).toBe(false);
    });

    it('primaryKey defaults to false', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result.models.User.fields.id.primaryKey).toBe(false);
    });

    it('unique defaults to false', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result.models.User.fields.id.unique).toBe(false);
    });

    it('optional defaults to false', () => {
      const result = schema({ User: { id: field.string() } });
      expect(result.models.User.fields.id.optional).toBe(false);
    });
  });

  describe('exact output shape', () => {
    it('matches the expected metadata structure', () => {
      const result = schema({
        User: {
          id: field.string().primaryKey(),
          email: field.string().unique(),
          name: field.string(),
          age: field.number(),
        },
      });

      const expected: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: {
                type: 'string',
                primaryKey: true,
                unique: false,
                optional: false,
              },
              email: {
                type: 'string',
                primaryKey: false,
                unique: true,
                optional: false,
              },
              name: {
                type: 'string',
                primaryKey: false,
                unique: false,
                optional: false,
              },
              age: {
                type: 'number',
                primaryKey: false,
                unique: false,
                optional: false,
              },
            },
          },
        },
      };

      expect(result).toEqual(expected);
    });

    it('includes all modifiers in the output when set', () => {
      const result = schema({
        Task: {
          id: field.string().primaryKey(),
          title: field.string().unique().default('Untitled'),
          count: field.number().optional().default(0),
          tags: field.json().optional().default([]),
          completed: field.boolean().default(false),
        },
      });

      expect(result.models.Task.fields.id).toEqual({
        type: 'string',
        primaryKey: true,
        unique: false,
        optional: false,
      });

      expect(result.models.Task.fields.title).toEqual({
        type: 'string',
        primaryKey: false,
        unique: true,
        optional: false,
        defaultValue: 'Untitled',
      });

      expect(result.models.Task.fields.count).toEqual({
        type: 'number',
        primaryKey: false,
        unique: false,
        optional: true,
        defaultValue: 0,
      });

      expect(result.models.Task.fields.tags).toEqual({
        type: 'json',
        primaryKey: false,
        unique: false,
        optional: true,
        defaultValue: [],
      });

      expect(result.models.Task.fields.completed).toEqual({
        type: 'boolean',
        primaryKey: false,
        unique: false,
        optional: false,
        defaultValue: false,
      });
    });
  });

  describe('validation integration', () => {
    it('throws SchemaValidationError for an empty model name', () => {
      expect(() => schema({ '': { id: field.string() } })).toThrow(
        SchemaValidationError,
      );
    });

    it('throws SchemaValidationError for a model with no fields', () => {
      expect(() => schema({ User: {} })).toThrow(SchemaValidationError);
    });

    it('throws SchemaValidationError for multiple primary keys', () => {
      expect(() =>
        schema({
          User: {
            a: field.string().primaryKey(),
            b: field.string().primaryKey(),
          },
        }),
      ).toThrow(SchemaValidationError);
    });

    it('throws SchemaValidationError for mismatched default type', () => {
      expect(() =>
        schema({ User: { age: field.string().default(42) } }),
      ).toThrow(SchemaValidationError);
    });
  });

  describe('immutability', () => {
    it('returns a fresh metadata object on each call', () => {
      const definitions = { User: { id: field.string() } };
      const a = schema(definitions);
      const b = schema(definitions);
      expect(a).toEqual(b);
      expect(a).not.toBe(b);
      expect(a.models).not.toBe(b.models);
    });
  });
});
