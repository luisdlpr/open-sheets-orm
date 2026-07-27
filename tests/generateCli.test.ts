import { describe, it, expect, afterAll } from 'vitest';
import {
  mkdtempSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';
import { rmSync } from 'fs';
import { generateCommand } from '../src/cli/generate';

const testDir = mkdtempSync(join(tmpdir(), 'osheets-cli-test-'));

afterAll(() => {
  rmSync(testDir, { recursive: true, force: true });
});

function writeSchema(dir: string, content: string): string {
  const schemaPath = join(dir, 'schema.js');
  writeFileSync(schemaPath, content, 'utf-8');
  return schemaPath;
}

const minimalSchema = `
export default {
  models: {
    User: {
      name: 'User',
      fields: {
        id: { type: 'string', primaryKey: true, unique: false, optional: false },
        name: { type: 'string', primaryKey: false, unique: false, optional: false },
      },
    },
  },
};
`;

describe('generateCommand', () => {
  it('is an async function', () => {
    expect(generateCommand).toBeInstanceOf(Function);
    expect(generateCommand.constructor.name).toBe('AsyncFunction');
  });

  describe('output file creation', () => {
    it('creates the output file at default path', async () => {
      const dir = join(testDir, 'default-output');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: join(dir, 'generated', 'client.ts'),
      });
      expect(existsSync(join(dir, 'generated', 'client.ts'))).toBe(true);
    });

    it('creates the output at a custom path', async () => {
      const dir = join(testDir, 'custom-output');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      const customOut = join(dir, 'custom', 'out.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: customOut,
      });
      expect(existsSync(customOut)).toBe(true);
    });

    it('creates intermediate directories for the output path', async () => {
      const dir = join(testDir, 'deep-output');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      const deepOut = join(dir, 'a', 'b', 'c', 'client.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: deepOut,
      });
      expect(existsSync(deepOut)).toBe(true);
    });
  });

  describe('generated file content', () => {
    it('includes the model interface in the output', async () => {
      const dir = join(testDir, 'content-check');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      const outPath = join(dir, 'client.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: outPath,
      });

      const content = readFileSync(outPath, 'utf-8');
      expect(content).toContain('export interface User');
    });

    it('includes the delegate class in the output', async () => {
      const dir = join(testDir, 'delegate-check');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      const outPath = join(dir, 'client.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: outPath,
      });

      const content = readFileSync(outPath, 'utf-8');
      expect(content).toContain('export class UserDelegate');
    });

    it('includes the SheetORMClient class in the output', async () => {
      const dir = join(testDir, 'client-check');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      const outPath = join(dir, 'client.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: outPath,
      });

      const content = readFileSync(outPath, 'utf-8');
      expect(content).toContain('export class SheetORMClient');
    });

    it('includes the Database import in the output', async () => {
      const dir = join(testDir, 'import-check');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, minimalSchema);

      const outPath = join(dir, 'client.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: outPath,
      });

      const content = readFileSync(outPath, 'utf-8');
      expect(content).toContain(
        "import { Database, type SheetsAdapter } from 'open-sheets-orm'",
      );
    });

    it('handles multiple models', async () => {
      const dir = join(testDir, 'multi-model');
      mkdirSync(dir, { recursive: true });

      writeSchema(
        dir,
        `
export default {
  models: {
    User: {
      name: 'User',
      fields: {
        id: { type: 'string', primaryKey: true, unique: false, optional: false },
      },
    },
    Club: {
      name: 'Club',
      fields: {
        id: { type: 'string', primaryKey: true, unique: false, optional: false },
        title: { type: 'string', primaryKey: false, unique: false, optional: false },
      },
    },
  },
};
`,
      );

      const outPath = join(dir, 'client.ts');
      await generateCommand({
        schemaPath: join(dir, 'schema.js'),
        outputPath: outPath,
      });

      const content = readFileSync(outPath, 'utf-8');
      expect(content).toContain('export interface User');
      expect(content).toContain('export interface Club');
      expect(content).toContain('export class UserDelegate');
      expect(content).toContain('export class ClubDelegate');
      expect(content).toContain('public user: UserDelegate');
      expect(content).toContain('public club: ClubDelegate');
    });
  });

  describe('error handling', () => {
    it('throws a descriptive error when the schema file does not exist', async () => {
      const dir = join(testDir, 'missing-schema');
      mkdirSync(dir, { recursive: true });

      const missingPath = join(dir, 'nonexistent.js');
      await expect(
        generateCommand({
          schemaPath: missingPath,
          outputPath: join(dir, 'client.ts'),
        }),
      ).rejects.toThrow(/schema/i);
    });

    it('throws when schema file has no default export', async () => {
      const dir = join(testDir, 'no-export');
      mkdirSync(dir, { recursive: true });
      writeSchema(dir, 'export const foo = 42;');

      await expect(
        generateCommand({
          schemaPath: join(dir, 'schema.js'),
          outputPath: join(dir, 'client.ts'),
        }),
      ).rejects.toThrow(/default export/i);
    });
  });
});

describe('CLI entry point', () => {
  it('has a shebang line in the entry file', async () => {
    const entryPath = resolve(__dirname, '../src/cli/index.ts');
    const content = readFileSync(entryPath, 'utf-8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });
});
