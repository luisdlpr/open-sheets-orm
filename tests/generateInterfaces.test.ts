import { describe, it, expect } from 'vitest';
import { generateInterfaces } from '../src/generator/generateInterfaces';
import type { SchemaMetadata, FieldMetadata } from '../src/schema/types';

function field(
  type: FieldMetadata['type'],
  overrides?: Partial<FieldMetadata>,
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

describe('generateInterfaces', () => {
  it('returns a string', () => {
    const schema: SchemaMetadata = { models: {} };
    expect(typeof generateInterfaces(schema)).toBe('string');
  });

  it('returns empty string for an empty schema', () => {
    const schema: SchemaMetadata = { models: {} };
    expect(generateInterfaces(schema)).toBe('');
  });

  describe('single model', () => {
    it('generates an interface for a model with one field', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toBe(`export interface User {
  id: string;
}`);
    });

    it('generates fields with correct type mappings', () => {
      const schema: SchemaMetadata = {
        models: {
          Product: {
            name: 'Product',
            fields: {
              name: field('string'),
              price: field('number'),
              inStock: field('boolean'),
              createdAt: field('date'),
              metadata: field('json'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toBe(`export interface Product {
  name: string;
  price: number;
  inStock: boolean;
  createdAt: Date;
  metadata: unknown;
}`);
    });

    it('uses the model name as the interface name', () => {
      const schema: SchemaMetadata = {
        models: {
          Club: {
            name: 'Club',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toMatch(/^export interface Club /);
    });

    it('prefixes with "export" keyword', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toMatch(/^export interface/);
    });
  });

  describe('field type mapping', () => {
    it.each([
      ['string', 'string'],
      ['number', 'number'],
      ['boolean', 'boolean'],
      ['date', 'Date'],
      ['json', 'unknown'],
    ] as const)(
      'maps schema type "%s" to TypeScript type "%s"',
      (schemaType, tsType) => {
        const schema: SchemaMetadata = {
          models: {
            Item: {
              name: 'Item',
              fields: {
                value: field(schemaType),
              },
            },
          },
        };
        expect(generateInterfaces(schema)).toContain(`  value: ${tsType};`);
      },
    );
  });

  describe('optional fields', () => {
    it('marks optional fields with ?', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
              nickname: field('string', { optional: true }),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('  nickname?: string;');
    });

    it('does not add ? for required fields', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string', { optional: false }),
              name: field('string', { optional: false }),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toContain('  id: string;');
      expect(result).toContain('  name: string;');
      expect(result).not.toContain('id?:');
      expect(result).not.toContain('name?:');
    });

    it('marks fields with a default value as optional (?)', () => {
      const schema: SchemaMetadata = {
        models: {
          Post: {
            name: 'Post',
            fields: {
              id: field('string'),
              published: field('boolean', {
                hasDefault: true,
                defaultValue: false,
              }),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('  published?: boolean;');
    });

    it('marks field with falsy default 0 as optional', () => {
      const schema: SchemaMetadata = {
        models: {
          Item: {
            name: 'Item',
            fields: {
              count: field('number', { hasDefault: true, defaultValue: 0 }),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('  count?: number;');
    });

    it('marks field with empty-string default as optional', () => {
      const schema: SchemaMetadata = {
        models: {
          Item: {
            name: 'Item',
            fields: {
              label: field('string', { hasDefault: true, defaultValue: '' }),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('  label?: string;');
    });

    it('does not add ? for fields without a default that are not optional', () => {
      const schema: SchemaMetadata = {
        models: {
          Post: {
            name: 'Post',
            fields: {
              title: field('string', { hasDefault: false }),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('  title: string;');
      expect(generateInterfaces(schema)).not.toContain('title?:');
    });
  });

  describe('multiple models', () => {
    it('generates one interface per model', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
              name: field('string'),
            },
          },
          Club: {
            name: 'Club',
            fields: {
              id: field('string'),
              title: field('string'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toContain('export interface User');
      expect(result).toContain('export interface Club');
    });

    it('separates interfaces with a blank line', () => {
      const schema: SchemaMetadata = {
        models: {
          A: {
            name: 'A',
            fields: { id: field('string') },
          },
          B: {
            name: 'B',
            fields: { id: field('string') },
          },
        },
      };
      const result = generateInterfaces(schema);
      // Between the closing } of A and the export of B should be a blank line
      expect(result).toMatch(/}\n\nexport interface B/);
    });
  });

  describe('regardless of modifiers', () => {
    it('does not include primaryKey in the interface', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string', { primaryKey: true }),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).not.toContain('primaryKey');
    });

    it('does not include unique in the interface', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              email: field('string', { unique: true }),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).not.toContain('unique');
    });

    it('does not include defaultValue in the interface', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              name: field('string', { defaultValue: 'Alice' }),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).not.toContain('default');
    });
  });

  describe('formatting', () => {
    it('uses 2-space indentation', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toContain('  id: string;');
      expect(result).not.toContain('   id');
      expect(result).not.toContain('\tid');
    });

    it('uses semicolons after field declarations', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
              name: field('string'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toContain('  id: string;\n  name: string;');
    });

    it('places opening brace on the same line as interface name', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toMatch(/^export interface User \{/);
    });

    it('closes the interface brace on its own line', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      expect(result).toMatch(/^}/m);
    });
  });

  describe('model name formatting', () => {
    it('preserves PascalCase model names', () => {
      const schema: SchemaMetadata = {
        models: {
          MyModel: {
            name: 'MyModel',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('export interface MyModel');
    });

    it('preserves camelCase model names', () => {
      const schema: SchemaMetadata = {
        models: {
          myModel: {
            name: 'myModel',
            fields: {
              id: field('string'),
            },
          },
        },
      };
      expect(generateInterfaces(schema)).toContain('export interface myModel');
    });
  });

  describe('multiple fields', () => {
    it('generates fields in the order they are defined', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              firstName: field('string'),
              lastName: field('string'),
              age: field('number'),
            },
          },
        },
      };
      const result = generateInterfaces(schema);
      const lines = result.split('\n');
      const fieldLines = lines.filter((l) => l.trim().endsWith(';'));
      expect(fieldLines[0].trim()).toBe('firstName: string;');
      expect(fieldLines[1].trim()).toBe('lastName: string;');
      expect(fieldLines[2].trim()).toBe('age: number;');
    });
  });
});
