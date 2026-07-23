import type { SchemaMetadata } from '../schema/types';

const TYPE_MAP: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  date: 'Date',
  json: 'unknown',
};

export function generateInterfaces(schema: SchemaMetadata): string {
  const models = Object.values(schema.models);
  if (models.length === 0) return '';

  return models.map(generateModelInterface).join('\n\n');
}

function generateModelInterface(model: {
  name: string;
  fields: Record<string, { type: string; optional: boolean }>;
}): string {
  const fields = Object.entries(model.fields).map(([name, field]) => {
    const opt = field.optional ? '?' : '';
    const tsType = TYPE_MAP[field.type] ?? 'unknown';
    return `  ${name}${opt}: ${tsType};`;
  });

  return `export interface ${model.name} {\n${fields.join('\n')}\n}`;
}
