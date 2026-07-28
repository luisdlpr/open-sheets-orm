import { describe, it, expect } from 'vitest';
import { generateDelegates } from '../src/generator/generateDelegates';
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
    ...overrides,
  };
}

const pk = (type: FieldMetadata['type'] = 'string') =>
  field(type, { primaryKey: true });

describe('generateDelegates', () => {
  it('returns a string', () => {
    const schema: SchemaMetadata = { models: {} };
    expect(typeof generateDelegates(schema)).toBe('string');
  });

  it('returns empty string for an empty schema', () => {
    const schema: SchemaMetadata = { models: {} };
    expect(generateDelegates(schema)).toBe('');
  });

  describe('single model', () => {
    it('generates one delegate class with correct name', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toMatch(/^export class UserDelegate/);
    });

    it('exports the class', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      expect(generateDelegates(schema)).toMatch(/^export class/);
    });
  });

  describe('constructor', () => {
    it('accepts a Database instance as private property', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('constructor(private db: Database) {}');
    });
  });

  describe('findMany method', () => {
    it('has the findMany method', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('async findMany');
    });

    it('accepts optional where, skip, limit via Partial<User>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk(), name: field('string') },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain(
        'opts?: { where?: Partial<User>; skip?: number; limit?: number }',
      );
    });

    it('delegates to this.db.findMany with the model name', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain("return this.db.findMany<User>('User', opts);");
    });

    it('returns Promise<ModelType[]>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('): Promise<User[]> {');
    });
  });

  describe('findUnique method', () => {
    it('has the findUnique method', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('async findUnique');
    });

    it('accepts where with the primary key field', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('where: { id: string }');
    });

    it('returns Promise<ModelType | null>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('): Promise<User | null> {');
    });

    it('delegates to this.db.findUnique with the model name', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain(
        "return this.db.findUnique<User>('User', where);",
      );
    });
  });

  describe('create method', () => {
    it('has the create method', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('async create');
    });

    it('accepts a data object omitting the primary key', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk(), name: field('string') },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain(
        "args: { data: Omit<User, 'id'> & { id?: string } }",
      );
    });

    it('delegates to this.db.create with args.data', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain(
        "return this.db.create<User>('User', args.data);",
      );
    });

    it('returns Promise<ModelType>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('): Promise<User> {');
    });
  });

  describe('update method', () => {
    it('has the update method', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('async update');
    });

    it('accepts where with primary key and data as Partial<Model>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk(), name: field('string') },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain(
        'args: { where: { id: string }; data: Partial<User> }',
      );
    });

    it('delegates to this.db.update', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain(
        "return this.db.update<User>('User', args.where, args.data);",
      );
    });

    it('returns Promise<ModelType>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('): Promise<User> {');
    });
  });

  describe('delete method', () => {
    it('has the delete method', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('async delete');
    });

    it('accepts where with the primary key field', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('where: { id: string }');
    });

    it('returns Promise<void>', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('): Promise<void> {');
    });

    it('delegates to this.db.delete', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain("return this.db.delete('User', where);");
    });
  });

  describe('primary key field detection', () => {
    it('uses field with primaryKey: true for where clauses', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              userId: pk(),
              name: field('string'),
            },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('where: { userId: string }');
      expect(result).not.toContain('where: { id: string }');
    });

    it('omits the correct primary key from create data', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              userId: pk(),
              name: field('string'),
            },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain("Omit<User, 'userId'>");
      expect(result).not.toContain("Omit<User, 'id'>");
    });

    it('defaults to "id" when no field has primaryKey', () => {
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
      const result = generateDelegates(schema);
      expect(result).toContain('where: { id: string }');
      expect(result).toContain("Omit<User, 'id'>");
    });
  });

  describe('multiple models', () => {
    it('generates one delegate class per model', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
          Club: {
            name: 'Club',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('export class UserDelegate');
      expect(result).toContain('export class ClubDelegate');
    });

    it('separates delegates with a blank line', () => {
      const schema: SchemaMetadata = {
        models: {
          A: {
            name: 'A',
            fields: { id: pk() },
          },
          B: {
            name: 'B',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toMatch(/}\n\nexport class BDelegate/);
    });
  });

  describe('formatting', () => {
    it('uses 2-space indentation for method bodies', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toContain('  constructor');
      expect(result).toContain('    return');
    });

    it('places opening brace on the same line as class declaration', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      expect(generateDelegates(schema)).toMatch(
        /^export class UserDelegate \{/,
      );
    });

    it('closes the class brace on a new line', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      const lines = result.trimEnd().split('\n');
      expect(lines[lines.length - 1]).toBe('}');
    });

    it('generates async methods', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: { id: pk() },
          },
        },
      };
      const result = generateDelegates(schema);
      expect(result).toMatch(/async findMany/);
      expect(result).toMatch(/async findUnique/);
      expect(result).toMatch(/async create/);
      expect(result).toMatch(/async update/);
      expect(result).toMatch(/async delete/);
    });
  });

  describe('exact output shape', () => {
    it('matches the expected full output for a basic model', () => {
      const schema: SchemaMetadata = {
        models: {
          User: {
            name: 'User',
            fields: {
              id: pk(),
              name: field('string'),
              age: field('number'),
            },
          },
        },
      };
      expect(generateDelegates(schema)).toBe(`export class UserDelegate {
  constructor(private db: Database) {}

  async findMany(opts?: { where?: Partial<User>; skip?: number; limit?: number }): Promise<User[]> {
    return this.db.findMany<User>('User', opts);
  }

  async findUnique(where: { id: string }): Promise<User | null> {
    return this.db.findUnique<User>('User', where);
  }

  async create(args: { data: Omit<User, 'id'> & { id?: string } }): Promise<User> {
    return this.db.create<User>('User', args.data);
  }

  async update(args: { where: { id: string }; data: Partial<User> }): Promise<User> {
    return this.db.update<User>('User', args.where, args.data);
  }

  async delete(where: { id: string }): Promise<void> {
    return this.db.delete('User', where);
  }
}`);
    });
  });
});
