import type { SchemaMetadata } from '../schema/types';

function getPrimaryKeyField(model: {
  fields: Record<string, { primaryKey: boolean }>;
}): string {
  for (const [name, field] of Object.entries(model.fields)) {
    if (field.primaryKey) return name;
  }
  return 'id';
}

function getFieldTsType(type: string): string {
  switch (type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'Date';
    case 'json':
      return 'unknown';
    default:
      return 'string';
  }
}

export function generateDelegates(schema: SchemaMetadata): string {
  const models = Object.values(schema.models);
  if (models.length === 0) return '';

  return models.map(generateDelegate).join('\n\n');
}

function generateDelegate(model: {
  name: string;
  fields: Record<
    string,
    { type: string; optional: boolean; primaryKey: boolean }
  >;
}): string {
  const pk = getPrimaryKeyField(model);
  const name = model.name;
  const pkField = model.fields[pk];
  const pkTsType = pkField ? getFieldTsType(pkField.type) : 'string';

  return `export class ${name}Delegate {
  constructor(private db: Database) {}

  async findMany(opts?: { where?: Partial<${name}>; skip?: number; limit?: number }): Promise<${name}[]> {
    return this.db.findMany<${name}>('${name}', opts);
  }

  async findUnique(where: { ${pk}: string }): Promise<${name} | null> {
    return this.db.findUnique<${name}>('${name}', where);
  }

  async create(args: { data: Omit<${name}, '${pk}'> & { ${pk}?: ${pkTsType} } }): Promise<${name}> {
    return this.db.create<${name}>('${name}', args.data);
  }

  async update(args: { where: { ${pk}: string }; data: Partial<${name}> }): Promise<${name}> {
    return this.db.update<${name}>('${name}', args.where, args.data);
  }

  async delete(where: { ${pk}: string }): Promise<void> {
    return this.db.delete('${name}', where);
  }
}`;
}
