import { describe, it, expect } from 'vitest';
import { schema, field } from '../src/schema';
import { generateClientCode } from '../src/generator/generateClient';

describe('generateClientCode — E2E pipeline', () => {
  it('produces a valid client file with interfaces, delegates, and SheetORMClient', () => {
    const meta = schema({
      User: {
        id: field.string().primaryKey(),
        name: field.string(),
        age: field.number().optional(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain(
      "import { Database, GoogleSheetsAdapter } from 'open-sheets-orm';",
    );
    expect(code).toContain(
      "import type { ClientInitializerGoogle } from 'open-sheets-orm';",
    );
    expect(code).toContain('export interface User');
    expect(code).toContain('  id: string;');
    expect(code).toContain('  name: string;');
    expect(code).toContain('  age?: number;');
    expect(code).toContain('export class UserDelegate');
    expect(code).toContain('export class SheetORMClient');
    expect(code).toContain('public user!: UserDelegate;');
  });

  it('maps all field types correctly', () => {
    const meta = schema({
      Product: {
        id: field.string().primaryKey(),
        price: field.number(),
        inStock: field.boolean(),
        createdAt: field.date(),
        metadata: field.json(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain('  price: number;');
    expect(code).toContain('  inStock: boolean;');
    expect(code).toContain('  createdAt: Date;');
    expect(code).toContain('  metadata: unknown;');
  });

  it('generates delegates with correct primary key field', () => {
    const meta = schema({
      User: {
        userId: field.string().primaryKey(),
        name: field.string(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain('where: { userId: string }');
    expect(code).toContain("Omit<User, 'userId'>");
    expect(code).not.toContain('where: { id: string }');
  });

  it('defaults to id as primary key when none is marked', () => {
    const meta = schema({
      Item: {
        id: field.string(),
        label: field.string(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain('where: { id: string }');
    expect(code).toContain("Omit<Item, 'id'>");
  });

  it('handles multiple models with different primary keys', () => {
    const meta = schema({
      User: {
        userId: field.string().primaryKey(),
        name: field.string(),
      },
      Club: {
        id: field.string().primaryKey(),
        title: field.string(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain('public user!: UserDelegate;');
    expect(code).toContain('public club!: ClubDelegate;');
    expect(code).toContain('where: { userId: string }');
    expect(code).toContain('where: { id: string }');
  });

  it('makes optional fields nullable in the interface', () => {
    const meta = schema({
      Task: {
        id: field.string().primaryKey(),
        title: field.string().optional(),
        description: field.string().optional(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain('  title?: string;');
    expect(code).toContain('  description?: string;');
    expect(code).toContain('  id: string;');
  });

  it('excludes defaultValue, primaryKey, and unique metadata from interfaces', () => {
    const meta = schema({
      User: {
        id: field.string().primaryKey(),
        email: field.string().unique(),
        name: field.string().default('Anonymous'),
      },
    });

    const code = generateClientCode(meta);

    // The schema constant includes metadata keys like primaryKey,
    // but the TypeScript interfaces and delegates must not
    const interfaceSection = code.slice(code.indexOf('export interface'));
    expect(interfaceSection).not.toContain('primaryKey');
    expect(interfaceSection).not.toContain('defaultValue');
    expect(interfaceSection).not.toContain('Anonymous');
  });

  it('generates delegates with all five CRUD methods', () => {
    const meta = schema({
      User: {
        id: field.string().primaryKey(),
        name: field.string(),
      },
    });

    const code = generateClientCode(meta);

    expect(code).toContain('async findMany');
    expect(code).toContain('async findUnique');
    expect(code).toContain('async create');
    expect(code).toContain('async update');
    expect(code).toContain('async delete');
  });

  it('returns empty string for an empty schema', () => {
    const meta = schema({});
    const code = generateClientCode(meta);
    expect(code).toBe('');
  });
});
