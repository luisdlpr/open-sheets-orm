import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { generateClientCode } from '../generator/generateClient';

export interface GenerateOptions {
  schemaPath?: string;
  outputPath?: string;
}

export async function generateCommand(
  opts: GenerateOptions = {},
): Promise<void> {
  const schemaPath = resolve(opts.schemaPath ?? 'schema.ts');
  const outputPath = resolve(opts.outputPath ?? 'generated/client.ts');

  if (!existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  let schemaModule: Record<string, unknown>;
  try {
    schemaModule = await import(schemaPath);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to load schema file "${schemaPath}": ${message}`, {
      cause: err,
    });
  }

  const schema = schemaModule.default;

  if (
    !schema ||
    typeof (schema as Record<string, unknown>).models !== 'object'
  ) {
    throw new Error(
      `Schema file "${schemaPath}" must have a default export that is a valid schema object with a "models" property`,
    );
  }

  const code = generateClientCode(
    schema as Parameters<typeof generateClientCode>[0],
  );

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, code, 'utf-8');
}
