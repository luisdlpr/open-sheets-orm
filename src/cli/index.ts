#!/usr/bin/env node

import { generateCommand } from './generate';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args[0] !== 'generate') {
    console.error(
      'Usage: open-sheets-orm generate [--schema <path>] [--output <path>]',
    );
    process.exit(1);
  }

  let schemaPath: string | undefined;
  let outputPath: string | undefined;

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--schema') {
      schemaPath = args[++i];
    } else if (arg === '--output') {
      outputPath = args[++i];
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  try {
    await generateCommand({ schemaPath, outputPath });
    console.log('✓ Client generated successfully');
  } catch (err: unknown) {
    console.error(
      '✗ Generate failed:',
      err instanceof Error ? err.message : err,
    );
    process.exit(1);
  }
}

main();
